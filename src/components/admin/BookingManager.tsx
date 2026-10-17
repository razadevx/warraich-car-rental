"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
  Plus,
  FileText,
  User,
  Phone,
  Car,
  MapPin,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { updateBookingStatusAction } from "@/app/actions/bookings";
import { recordPaymentAction } from "@/app/actions/payments";
import { BookingStatus, PaymentMethod, PaymentType } from "@/types";

interface BookingManagerProps {
  initialBookings: Array<any>;
  cars: Array<any>;
}

export function BookingManager({ initialBookings, cars }: BookingManagerProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected booking for detail drawer
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Status transition modal
  const [transitioningBooking, setTransitioningBooking] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>("CONFIRMED");
  const [transitionReason, setTransitionReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment modal
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(10000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentType, setPaymentType] = useState<PaymentType>("RENTAL");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitioningBooking) return;
    setIsUpdatingStatus(true);
    setActionError(null);

    const res = await updateBookingStatusAction({
      bookingId: transitioningBooking.id,
      status: targetStatus,
      reason: transitionReason.trim() || undefined,
    });

    setIsUpdatingStatus(false);
    if (!res.success) {
      setActionError(res.error || "Failed to update status");
      return;
    }

    setTransitioningBooking(null);
    window.location.reload();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBooking) return;
    setIsRecordingPayment(true);
    setActionError(null);

    const res = await recordPaymentAction({
      bookingId: paymentBooking.id,
      amount: Number(paymentAmount),
      paymentMethod,
      paymentType,
      transactionReference: transactionRef.trim() || undefined,
      notes: paymentNotes.trim() || undefined,
    });

    setIsRecordingPayment(false);
    if (!res.success) {
      setActionError(res.error || "Failed to record payment");
      return;
    }

    setPaymentBooking(null);
    window.location.reload();
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.phone.includes(searchTerm) ||
      b.car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <Car className="w-3 h-3" /> Active Rental
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by reference (WM-...), customer name, phone, car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shrink-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Rental Interval</th>
                <th className="py-3 px-4">Financials (Total / Paid)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => {
                const total = Number(b.totalAmount);
                const paid = Number(b.amountPaid);
                const balance = total - paid;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        {b.bookingReference}
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">{b.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500">{b.customer.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {b.car.make} {b.car.model}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {b.car.registrationNumber}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-slate-900 font-semibold">
                        {formatDateTime(b.pickupDateTime)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        to {formatDateTime(b.returnDateTime)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">
                        {formatCurrency(total, b.currency)}
                      </div>
                      <div className="text-[11px]">
                        <span className="text-emerald-600 font-semibold">
                          Paid: {formatCurrency(paid, b.currency)}
                        </span>
                        {balance > 0 && (
                          <span className="text-amber-600 font-semibold ml-1.5">
                            (Due: {formatCurrency(balance, b.currency)})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                      >
                        Details
                      </button>

                      {b.status === "PENDING" && (
                        <button
                          onClick={() => {
                            setTransitioningBooking(b);
                            setTargetStatus("CONFIRMED");
                            setActionError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Approve
                        </button>
                      )}

                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => {
                            setTransitioningBooking(b);
                            setTargetStatus("ACTIVE");
                            setActionError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Handover
                        </button>
                      )}

                      {b.status === "ACTIVE" && (
                        <button
                          onClick={() => {
                            setTransitioningBooking(b);
                            setTargetStatus("COMPLETED");
                            setActionError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Return
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setPaymentBooking(b);
                          setPaymentAmount(balance > 0 ? balance : 10000);
                          setActionError(null);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        title="Record payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Booking Summary
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedBooking.bookingReference}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Quick Transition */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="text-xs text-slate-500">Current Status</div>
                <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
              </div>
              <div className="flex gap-2">
                {selectedBooking.status !== "CANCELLED" && selectedBooking.status !== "COMPLETED" && (
                  <button
                    onClick={() => {
                      setTransitioningBooking(selectedBooking);
                      setTargetStatus("CANCELLED");
                      setActionError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider">Customer</div>
                <div><strong>Name:</strong> {selectedBooking.customer.fullName}</div>
                <div><strong>Phone:</strong> {selectedBooking.customer.phone}</div>
                <div><strong>Email:</strong> {selectedBooking.customer.email}</div>
                <div><strong>ID/License:</strong> {selectedBooking.customer.drivingLicenceDetails || "N/A"}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider">Vehicle</div>
                <div><strong>Car:</strong> {selectedBooking.car.make} {selectedBooking.car.model}</div>
                <div><strong>Plate:</strong> {selectedBooking.car.registrationNumber}</div>
                <div><strong>Pickup:</strong> {formatDateTime(selectedBooking.pickupDateTime)}</div>
                <div><strong>Return:</strong> {formatDateTime(selectedBooking.returnDateTime)}</div>
              </div>
            </div>

            {/* Pricing Snapshot */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider">Financial Snapshot</div>
              <div className="flex justify-between text-slate-600">
                <span>Rental Base:</span>
                <span>{formatCurrency(selectedBooking.rentalPrice, selectedBooking.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extras Total:</span>
                <span>{formatCurrency(selectedBooking.extrasTotal, selectedBooking.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Deposit:</span>
                <span>{formatCurrency(selectedBooking.depositAmount, selectedBooking.currency)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount:</span>
                <span className="text-blue-600">{formatCurrency(selectedBooking.totalAmount, selectedBooking.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Amount Paid:</span>
                <span>{formatCurrency(selectedBooking.amountPaid, selectedBooking.currency)}</span>
              </div>
            </div>

            {/* Audit Logs */}
            {selectedBooking.auditLogs && selectedBooking.auditLogs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status History</div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {selectedBooking.auditLogs.map((log: any) => (
                    <div key={log.id} className="p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-800">{log.action}:</span> {log.details} &bull; <span className="text-slate-400">{formatDateTime(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Transition Modal */}
      {transitioningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Transition Booking: {transitioningBooking.bookingReference}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Current status: <strong>{transitioningBooking.status}</strong> &rarr; Target: <strong>{targetStatus}</strong>
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as BookingStatus)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CONFIRMED">CONFIRMED (Approved)</option>
                  <option value="ACTIVE">ACTIVE (Vehicle Handed Over)</option>
                  <option value="COMPLETED">COMPLETED (Returned & Settled)</option>
                  <option value="CANCELLED">CANCELLED (Rejected / Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Identity verified and advance received."
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransitioningBooking(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow"
                >
                  {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Status Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {paymentBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Record Payment: {paymentBooking.bookingReference}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Customer: {paymentBooking.customer.fullName} &bull; Total: {formatCurrency(paymentBooking.totalAmount, paymentBooking.currency)}
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount (PKR) *</label>
                <input
                  type="number"
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="POS">POS / Card Swipe</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Type *</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RENTAL">Rental Advance</option>
                    <option value="DEPOSIT">Security Deposit</option>
                    <option value="REFUND">Refund</option>
                    <option value="DAMAGE_CHARGE">Damage Charge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Reference (Bank TX / Receipt #)</label>
                <input
                  type="text"
                  placeholder="e.g. HBL-TX-998822"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Received at Gujrat Counter."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentBooking(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow"
                >
                  {isRecordingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
