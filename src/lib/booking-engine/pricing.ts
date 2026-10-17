import { PricingCalculationResult } from "@/types";

export interface CarPricingInput {
  dailyRate: number | string | { toString: () => string };
  weeklyRate: number | string | { toString: () => string };
  monthlyRate: number | string | { toString: () => string };
  currency?: string;
}

export interface ExtraInput {
  id: string;
  name: string;
  price: number | string | { toString: () => string };
  priceType: "PER_DAY" | "FLAT";
  quantity?: number;
}

/**
 * Calculates rental duration in billable days.
 * Any fraction of a day past 1 hour is counted as a billable day.
 * Minimum duration is 1 day.
 */
export function calculateRentalDays(pickup: Date | string, returnDate: Date | string): number {
  const start = new Date(pickup).getTime();
  const end = new Date(returnDate).getTime();

  if (end <= start) {
    throw new Error("Return date must be strictly after pickup date");
  }

  const diffMs = end - start;
  const hours = diffMs / (1000 * 60 * 60);

  if (hours <= 24) return 1;

  // e.g. 25 hours is 2 days
  return Math.ceil(hours / 24);
}

/**
 * Calculates rental pricing using server-side business rules:
 * - If days >= 30: uses monthly package rate prorated per day (monthlyRate / 30 * days)
 * - If days >= 7: uses weekly package rate prorated per day (weeklyRate / 7 * days)
 * - Otherwise: uses daily rate * days
 * - Extras: calculated as either PER_DAY * days * quantity OR FLAT * quantity
 * - Security deposit: standard refundable deposit calculated as 20% of rental price or minimum 10,000 PKR / $100
 */
export function calculateBookingPrice(
  car: CarPricingInput,
  days: number,
  selectedExtras: ExtraInput[] = [],
  currency: string = "PKR"
): PricingCalculationResult {
  const daily = Number(car.dailyRate.toString());
  const weekly = Number(car.weeklyRate.toString());
  const monthly = Number(car.monthlyRate.toString());

  if (days < 1) throw new Error("Days must be at least 1");

  let rateApplied: "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY";
  let rentalPrice = 0;
  let discountPerDay = 0;

  if (days >= 30) {
    rateApplied = "MONTHLY";
    const dailyEquivalent = monthly / 30;
    rentalPrice = Math.round(dailyEquivalent * days);
    discountPerDay = Math.max(0, daily - dailyEquivalent);
  } else if (days >= 7) {
    rateApplied = "WEEKLY";
    const dailyEquivalent = weekly / 7;
    rentalPrice = Math.round(dailyEquivalent * days);
    discountPerDay = Math.max(0, daily - dailyEquivalent);
  } else {
    rateApplied = "DAILY";
    rentalPrice = Math.round(daily * days);
    discountPerDay = 0;
  }

  // Calculate extras
  let extrasTotal = 0;
  const extrasBreakdown = selectedExtras.map((extra) => {
    const unitPrice = Number(extra.price.toString());
    const qty = extra.quantity && extra.quantity > 0 ? extra.quantity : 1;
    const subtotal =
      extra.priceType === "PER_DAY"
        ? Math.round(unitPrice * days * qty)
        : Math.round(unitPrice * qty);

    extrasTotal += subtotal;

    return {
      id: extra.id,
      name: extra.name,
      price: unitPrice,
      priceType: extra.priceType,
      quantity: qty,
      subtotal,
    };
  });

  // Calculate standard refundable security deposit (20% of rental price or min 10000 PKR / $50)
  const depositAmount = currency === "PKR" ? Math.max(10000, Math.round(rentalPrice * 0.2)) : Math.max(100, Math.round(rentalPrice * 0.2));

  const totalAmount = rentalPrice + extrasTotal;

  return {
    days,
    rateApplied,
    baseDailyRate: daily,
    discountPerDay: Math.round(discountPerDay),
    rentalPrice,
    extrasTotal,
    depositAmount,
    totalAmount,
    currency,
    extrasBreakdown,
  };
}
