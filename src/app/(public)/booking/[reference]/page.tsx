import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface BookingStatusPageProps {
  params: { reference: string };
  searchParams: { email?: string; phone?: string; new?: string };
}

export default async function BookingStatusPage({
  params,
  searchParams,
}: BookingStatusPageProps) {
  const booking = await prisma.booking.findUnique({
    where: { bookingReference: params.reference },
    include: {
      car: {
        include: {
          images: { take: 1 },
        },
      },
      customer: true,
      extras: true,
      payments: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const settings = await prisma.businessSettings.findFirst();

  const statusConfig = {
    PENDING: {
      label: "Pending Manual Staff Review",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      description:
        "Your reservation request has been registered in our system. A staff member at Warraich Motors Gujrat is reviewing your dates and vehicle readiness, and will contact you shortly to confirm.",
      icon: Clock,
    },
    CONFIRMED: {
      label: "Confirmed & Scheduled",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      description:
        "Your reservation has been approved! The vehicle is reserved for your dates and is being prepared for handover.",
      icon: CheckCircle2,
    },
    ACTIVE: {
      label: "Rental Currently Active",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      description:
        "Vehicle is currently handed over to you. Safe driving! Contact our 24/7 hotline if you require any assistance.",
      icon: ShieldCheck,
    },
    COMPLETED: {
      label: "Completed & Returned",
      color: "bg-slate-100 text-slate-800 border-slate-300",
      description:
        "Vehicle returned and inspected. Security deposit settlement finalized. Thank you for choosing Warraich Motors Gujrat!",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "This reservation was cancelled.",
      icon: AlertTriangle,
    },
  }[booking.status];

  const StatusIcon = statusConfig.icon;

  const totalAmount = Number(booking.totalAmount);
  const amountPaid = Number(booking.amountPaid);
  const balanceRemaining = Math.max(0, totalAmount - amountPaid);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse More Cars</span>
        </Link>
        <span className="text-xs text-slate-400">
          Booking Reference: <strong className="text-slate-800">{booking.bookingReference}</strong>
        </span>
      </div>

      {searchParams.new === "true" && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800">
            <div className="font-bold">Booking Request Received!</div>
            <div>
              Your request for the <strong>{booking.car.make} {booking.car.model}</strong> has been logged under reference <strong>{booking.bookingReference}</strong>. Bookmark this page to check updates.
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${statusConfig.color} mb-8 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/80 shadow-sm shrink-0">
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Current Status</div>
            <h1 className="text-2xl font-black tracking-tight mt-0.5">{statusConfig.label}</h1>
            <p className="text-sm mt-2 opacity-90 leading-relaxed">{statusConfig.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Booking Details & Pricing (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Vehicle & Dates Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Vehicle & Schedule
            </h2>

            <div className="flex items-center gap-4 py-3 border-b border-slate-100">
              {booking.car.images[0] && (
                <img
                  src={booking.car.images[0].imageUrl}
                  alt={booking.car.model}
                  className="w-20 h-14 object-cover rounded-lg bg-slate-100"
                />
              )}
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {booking.car.make} {booking.car.model} ({booking.car.year})
                </h3>
                <div className="text-xs text-slate-500">
                  Plate: {booking.car.registrationNumber} &bull; {booking.car.transmission}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Pickup
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatDateTime(booking.pickupDateTime)}
                </div>
                <div className="text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {booking.pickupLocation}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Return
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatDateTime(booking.returnDateTime)}
                </div>
                <div className="text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {booking.returnLocation}
                </div>
              </div>
            </div>
          </div>

          {/* Agreed Financial Snapshot Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Agreed Pricing Snapshot
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Agreed Rental Price:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(booking.rentalPrice, booking.currency)}
                </span>
              </div>

              {booking.extras.length > 0 && (
                <div className="py-2 border-y border-slate-100 space-y-1.5">
                  <div className="font-semibold text-slate-700">Selected Add-ons:</div>
                  {booking.extras.map((extra) => (
                    <div key={extra.id} className="flex justify-between text-slate-600 pl-2">
                      <span>
                        &bull; {extra.nameSnapshot} (Qty: {extra.quantity})
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(Number(extra.priceSnapshot) * extra.quantity, booking.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Security Deposit (Refundable upon inspection):</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(booking.depositAmount, booking.currency)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Agreed Rental Amount:</span>
                <span className="text-blue-600">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Amount Paid to Date:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(booking.amountPaid, booking.currency)}
                </span>
              </div>

              {balanceRemaining > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <span>Balance Payable at Pickup:</span>
                  <span>{formatCurrency(balanceRemaining, booking.currency)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Support Contact (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Customer Details
            </h2>
            <div className="text-xs space-y-2 text-slate-600">
              <div>
                <span className="text-slate-400">Name:</span>
                <div className="font-bold text-slate-900">{booking.customer.fullName}</div>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>
                <div className="font-semibold text-slate-900">{booking.customer.phone}</div>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <div className="text-slate-800">{booking.customer.email}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-400">
              Need Assistance?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions regarding flight delay, location change, or payment? Contact Warraich Motors Gujrat directly:
            </p>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${settings?.contactPhone || "03136225135"}`}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Hotline ({settings?.contactPhone || "0313 6225135"})</span>
              </a>
              <a
                href="https://wa.me/923136225135"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Dispatch: 0313 6225135</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
