import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Car,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { updateBookingStatusAction } from "@/app/actions/bookings";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const now = new Date();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Fetch real summary statistics
  const [
    totalCars,
    availableCars,
    activeRentals,
    pendingRequests,
    upcomingPickups,
    dueReturns,
    allBookings,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { operationalStatus: "AVAILABLE", isPublished: true } }),
    prisma.booking.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        pickupDateTime: { gte: now },
      },
    }),
    prisma.booking.count({
      where: {
        status: "ACTIVE",
        returnDateTime: { lte: endOfToday },
      },
    }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, amountPaid: true, currency: true },
    }),
  ]);

  // Compute total outstanding balance across active/confirmed rentals
  let totalOutstanding = 0;
  for (const b of allBookings) {
    const diff = Number(b.totalAmount) - Number(b.amountPaid);
    if (diff > 0) totalOutstanding += diff;
  }

  // 2. Fetch recent pending booking requests that require staff review
  const recentPending = await prisma.booking.findMany({
    where: { status: "PENDING" },
    include: {
      car: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // 3. Fetch active rentals
  const activeBookings = await prisma.booking.findMany({
    where: { status: "ACTIVE" },
    include: {
      car: true,
      customer: true,
    },
    orderBy: { returnDateTime: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fleet Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of Warraich Motors fleet, reservations, and customer collections.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/cars"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Manage Fleet</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>All Bookings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Fleet */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fleet</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCars}</div>
          <div className="text-[11px] text-slate-500">{availableCars} currently available</div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingRequests}</div>
          <div className="text-[11px] text-slate-500">Require staff approval</div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{activeRentals}</div>
          <div className="text-[11px] text-slate-500">Out with customers</div>
        </div>

        {/* Upcoming Pickups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Pickups</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{upcomingPickups}</div>
          <div className="text-[11px] text-slate-500">Confirmed upcoming</div>
        </div>

        {/* Due Returns */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Due Today</span>
            <AlertTriangle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{dueReturns}</div>
          <div className="text-[11px] text-slate-500">Expiring returns</div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Receivable</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {formatCurrency(totalOutstanding, "PKR")}
          </div>
          <div className="text-[11px] text-slate-500">Uncollected balances</div>
        </div>
      </div>

      {/* Main Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Requests Needing Approval */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Booking Requests</h2>
              <p className="text-xs text-slate-500">Requests submitted online awaiting manual approval</p>
            </div>
            <Link
              href="/admin/bookings?status=PENDING"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all &rarr;
            </Link>
          </div>

          {recentPending.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentPending.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.bookingReference}</span>
                      <span className="text-xs text-slate-500">&bull; {b.customer.fullName}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {b.car.make} {b.car.model} &bull; {formatDateTime(b.pickupDateTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-xs text-slate-900">
                      {formatCurrency(b.totalAmount, b.currency)}
                    </span>
                    <Link
                      href={`/admin/bookings?search=${b.bookingReference}`}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              No pending requests. All bookings reviewed!
            </div>
          )}
        </div>

        {/* Active Rentals Out on Road */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Rentals</h2>
              <p className="text-xs text-slate-500">Vehicles currently dispatched with customers</p>
            </div>
            <Link
              href="/admin/bookings?status=ACTIVE"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all &rarr;
            </Link>
          </div>

          {activeBookings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activeBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.bookingReference}</span>
                      <span className="text-xs text-emerald-600 font-semibold">&bull; Active</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {b.car.make} {b.car.model} &bull; Return: {formatDateTime(b.returnDateTime)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">{b.customer.fullName}</div>
                    <div className="text-[11px] text-slate-500">{b.customer.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              No vehicles currently active on rent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
