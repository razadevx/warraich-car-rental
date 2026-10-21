import { prisma } from "@/lib/db";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { FALLBACK_SETTINGS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  let settings: any = FALLBACK_SETTINGS;
  try {
    const dbSettings = await prisma.businessSettings.findFirst();
    if (dbSettings) settings = dbSettings;
  } catch {
    settings = FALLBACK_SETTINGS;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="border-b pb-6">
        <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
          Transparent Operations
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Rental Policies & Terms
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Effective for all self-drive and chauffeur-driven bookings at Warraich Motors Gujrat.
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Eligibility & Documents */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <span>1. Driver Eligibility & Required Verification</span>
          </h2>
          <p>
            {settings?.defaultRentalRules ||
              "All renters must be at least 21 years of age. A valid Pakistani driving license (or international driving permit) held for at least one year and an original CNIC or valid Passport are mandatory at the time of pickup."}
          </p>
        </section>

        {/* Booking Confirmation & Manual Approval */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <span>2. Booking Process & Confirmation</span>
          </h2>
          <p>
            {settings?.bookingPolicy ||
              "All online reservations are subject to manual verification by Warraich Motors staff. A booking is formally confirmed once vehicle availability, documentation, and handover schedules have been verified and communicated to the customer."}
          </p>
        </section>

        {/* Cancellation Policy */}
        <section id="cancellation" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <span>3. Cancellation & Refund Policy</span>
          </h2>
          <p>
            {settings?.cancellationPolicy ||
              "Customers may cancel their reservation free of charge up to 24 hours prior to the scheduled pickup time. Cancellations made within 24 hours of pickup may incur a 1-day reservation holding charge."}
          </p>
        </section>

        {/* Security Deposits & Payments */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <span>4. Security Deposit & Damage Policy</span>
          </h2>
          <p>
            A refundable security deposit is collected upon vehicle handover. The deposit is refunded immediately upon return of the vehicle in original condition, subject to deduction for traffic violations, fuel shortages, or unauthorized delays.
          </p>
        </section>

        {/* Fuel & Mileage Policy */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <span>5. Fuel & Handover Standards</span>
          </h2>
          <p>
            Vehicles operate on a &ldquo;same-to-same&rdquo; fuel policy: the vehicle is provided with a recorded fuel level and must be returned with the same amount. Cleanliness and mechanical status are noted on the digital rental agreement form.
          </p>
        </section>
      </div>
    </div>
  );
}
