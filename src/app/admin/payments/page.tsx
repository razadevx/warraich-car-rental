import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CreditCard, Banknote, ShieldCheck, ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { type?: string; method?: string };
}) {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const whereClause: any = {};
  if (searchParams.type && searchParams.type !== "ALL") {
    whereClause.paymentType = searchParams.type;
  }
  if (searchParams.method && searchParams.method !== "ALL") {
    whereClause.paymentMethod = searchParams.method;
  }

  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      booking: {
        include: {
          customer: { select: { fullName: true, phone: true } },
          car: { select: { make: true, model: true } },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  // Calculate totals
  let totalCollected = 0;
  let totalDeposits = 0;
  let totalRefunds = 0;

  for (const p of payments) {
    const amt = Number(p.amount);
    if (p.paymentType === "RENTAL" || p.paymentType === "DAMAGE_CHARGE") {
      totalCollected += amt;
    } else if (p.paymentType === "DEPOSIT") {
      totalDeposits += amt;
    } else if (p.paymentType === "REFUND") {
      totalRefunds += amt;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Payment & Deposit Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete ledger of rental advances, cash collections, security deposits, and issued refunds.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rental Revenue Collected
            </span>
            <Banknote className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalCollected, "PKR")}
          </div>
          <div className="text-[11px] text-slate-500">Rental charges & damage settlements</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Security Deposits Held
            </span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {formatCurrency(totalDeposits, "PKR")}
          </div>
          <div className="text-[11px] text-slate-500">Active client refundable deposits</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Refunds Disbursed
            </span>
            <ArrowDownLeft className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {formatCurrency(totalRefunds, "PKR")}
          </div>
          <div className="text-[11px] text-slate-500">Returned upon vehicle inspection</div>
        </div>
      </div>

      {/* Filter row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-2">
          {["ALL", "RENTAL", "DEPOSIT", "REFUND", "DAMAGE_CHARGE"].map((t) => {
            const isSelected = (!searchParams.type && t === "ALL") || searchParams.type === t;
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (t === "ALL") params.delete("type");
            else params.set("type", t);

            return (
              <Link
                key={t}
                href={`/admin/payments?${params.toString()}`}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.replace("_", " ")}
              </Link>
            );
          })}
        </div>

        <span className="text-slate-500">
          Showing {payments.length} ledger transactions
        </span>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Booking Ref & Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Payment Type</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => {
                const isRefund = p.paymentType === "REFUND";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{formatDateTime(p.paidAt)}</div>
                      {p.notes && <div className="text-[11px] text-slate-500 italic">{p.notes}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/bookings?search=${p.booking.bookingReference}`}
                        className="font-bold text-blue-600 hover:underline font-mono"
                      >
                        {p.booking.bookingReference}
                      </Link>
                      <div className="text-slate-800 font-semibold">{p.booking.customer.fullName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {p.booking.car.make} {p.booking.car.model}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.paymentType === "RENTAL"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.paymentType === "DEPOSIT"
                            ? "bg-blue-100 text-blue-800"
                            : p.paymentType === "REFUND"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.paymentType.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <div>{p.paymentMethod.replace("_", " ")}</div>
                      {p.transactionReference && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {p.transactionReference}
                        </div>
                      )}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                        isRefund ? "text-purple-600" : "text-slate-900"
                      }`}
                    >
                      {isRefund ? "-" : "+"}
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
