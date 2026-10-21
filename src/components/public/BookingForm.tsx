"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculateBookingPrice, calculateRentalDays } from "@/lib/booking-engine/pricing";
import { formatCurrency } from "@/lib/utils";
import { submitPublicBookingAction } from "@/app/actions/bookings";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface BookingFormProps {
  car: {
    id: string;
    make: string;
    model: string;
    dailyRate: any;
    weeklyRate: any;
    monthlyRate: any;
    currency: string;
  };
  extras: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: any;
    priceType: string;
  }>;
  initialPickup?: string;
  initialReturn?: string;
}

export function BookingForm({ car, extras, initialPickup, initialReturn }: BookingFormProps) {
  const router = useRouter();

  const getDefaultPickup = () => {
    if (initialPickup) return new Date(initialPickup).toISOString().slice(0, 16);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getDefaultReturn = () => {
    if (initialReturn) return new Date(initialReturn).toISOString().slice(0, 16);
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [pickupDateTime, setPickupDateTime] = useState(getDefaultPickup());
  const [returnDateTime, setReturnDateTime] = useState(getDefaultReturn());
  const [pickupLocation, setPickupLocation] = useState("Warraich Motors Hub, GT Road Gujrat");
  const [returnLocation, setReturnLocation] = useState("Warraich Motors Hub, GT Road Gujrat");

  // Selected extras state: Record<extraId, boolean>
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});

  // Customer contact details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nationalIdOrPassport, setNationalIdOrPassport] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute pricing live
  const pricing = useMemo(() => {
    try {
      const days = calculateRentalDays(new Date(pickupDateTime), new Date(returnDateTime));
      const activeExtras = extras
        .filter((e) => selectedExtras[e.id])
        .map((e) => ({
          id: e.id,
          name: e.name,
          price: Number(e.price),
          priceType: e.priceType as "PER_DAY" | "FLAT",
          quantity: 1,
        }));

      return calculateBookingPrice(
        {
          dailyRate: car.dailyRate,
          weeklyRate: car.weeklyRate,
          monthlyRate: car.monthlyRate,
          currency: car.currency,
        },
        days,
        activeExtras,
        car.currency
      );
    } catch {
      return null;
    }
  }, [car, extras, pickupDateTime, returnDateTime, selectedExtras]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pricing) {
      setError("Please select valid pickup and return dates.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your full name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);

    const extrasPayload = extras
      .filter((e) => selectedExtras[e.id])
      .map((e) => ({ extraId: e.id, quantity: 1 }));

    const res = await submitPublicBookingAction({
      carId: car.id,
      pickupDateTime: new Date(pickupDateTime).toISOString(),
      returnDateTime: new Date(returnDateTime).toISOString(),
      pickupLocation,
      returnLocation,
      fullName,
      email,
      phone,
      address,
      nationalIdOrPassport,
      customerNotes,
      extras: extrasPayload,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Failed to submit reservation.");
      return;
    }

    // Redirect to customer booking confirmation/status page
    router.push(`/booking/${res.bookingReference}?email=${encodeURIComponent(email)}&new=true`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Reserve This Vehicle</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review pricing breakdown and submit your booking request for manual staff approval.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Dates & Location */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">1</span>
            Rental Period & Locations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Pickup Date & Time
              </label>
              <input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Return Date & Time
              </label>
              <input
                type="datetime-local"
                value={returnDateTime}
                onChange={(e) => setReturnDateTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Pickup Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Return Location
              </label>
              <input
                type="text"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 2: Extras & Packages */}
        {extras.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">2</span>
              Optional Packages & Add-ons
            </h3>
            <div className="space-y-2.5">
              {extras.map((extra) => {
                const isChecked = !!selectedExtras[extra.id];
                return (
                  <label
                    key={extra.id}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? "bg-red-50/70 border-red-300 ring-1 ring-red-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExtra(extra.id)}
                        className="mt-1 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{extra.name}</div>
                        {extra.description && (
                          <div className="text-xs text-slate-500 mt-0.5">{extra.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(extra.price, car.currency)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {extra.priceType === "PER_DAY" ? "per day" : "flat fee"}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Customer Information */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">3</span>
            Your Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                placeholder="e.g. 0313 6225135"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. warraichmotorsgujrat@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNIC or Passport Number
              </label>
              <input
                type="text"
                placeholder="e.g. 34201-1234567-1"
                value={nationalIdOrPassport}
                onChange={(e) => setNationalIdOrPassport(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential / Hotel Address
              </label>
              <input
                type="text"
                placeholder="e.g. Model Town, Gujrat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests or Notes (Flight number, pickup instructions)
              </label>
              <textarea
                rows={2}
                placeholder="Any special notes or requirements..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing Summary Breakdown */}
        {pricing && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Price Breakdown ({pricing.days} {pricing.days === 1 ? "day" : "days"})
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>
                Rental Base Rate ({pricing.rateApplied === "WEEKLY" ? "Weekly Package" : pricing.rateApplied === "MONTHLY" ? "Monthly Package" : "Daily Rate"}):
              </span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(pricing.rentalPrice, car.currency)}
              </span>
            </div>

            {pricing.extrasTotal > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Selected Add-ons & Extras:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pricing.extrasTotal, car.currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-600">
              <span>Refundable Security Deposit (Paid at pickup):</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(pricing.depositAmount, car.currency)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Total Rental Cost:</span>
              <span className="text-xl font-black text-red-600">
                {formatCurrency(pricing.totalAmount, car.currency)}
              </span>
            </div>
          </div>
        )}

        {/* Policy notice */}
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Manual Review Policy:</strong> No immediate credit card charge is required. Submitting creates a pending reservation. Our staff will confirm your booking via WhatsApp/call.
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !pricing}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying & Reserving...</span>
            </>
          ) : (
            <>
              <span>Submit Booking Request</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
