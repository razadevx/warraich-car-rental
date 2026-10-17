export type Role = "ADMIN" | "STAFF";

export type OperationalStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "POS" | "CHEQUE";

export type PaymentType = "RENTAL" | "DEPOSIT" | "REFUND" | "DAMAGE_CHARGE";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type MaintenanceStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PricingCalculationResult {
  days: number;
  rateApplied: "DAILY" | "WEEKLY" | "MONTHLY";
  baseDailyRate: number;
  discountPerDay: number;
  rentalPrice: number;
  extrasTotal: number;
  depositAmount: number;
  totalAmount: number;
  currency: string;
  extrasBreakdown: Array<{
    id: string;
    name: string;
    price: number;
    priceType: "PER_DAY" | "FLAT";
    quantity: number;
    subtotal: number;
  }>;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  carId: string;
  reason?: string;
  conflictingBookingReference?: string;
  conflictingMaintenanceId?: string;
}
