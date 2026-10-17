"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  X,
  Loader2,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { updateCustomerAction, createCustomerAction } from "@/app/actions/customers";

interface CustomerManagerProps {
  initialCustomers: Array<any>;
}

export function CustomerManager({ initialCustomers }: CustomerManagerProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // New customer modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setNotesText(customer.internalNotes || "");
    setIsEditingNotes(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    setIsSavingNotes(true);

    const res = await updateCustomerAction(selectedCustomer.id, {
      fullName: selectedCustomer.fullName,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email,
      address: selectedCustomer.address,
      drivingLicenceDetails: selectedCustomer.drivingLicenceDetails,
      internalNotes: notesText,
    });

    setIsSavingNotes(false);
    if (res.success) {
      setSelectedCustomer((prev: any) => ({ ...prev, internalNotes: notesText }));
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, internalNotes: notesText } : c))
      );
      setIsEditingNotes(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const res = await createCustomerAction({
      fullName,
      phone,
      email,
      address,
      drivingLicenceDetails: drivingLicense,
      internalNotes,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setFormError(res.error || "Failed to create customer");
      return;
    }

    setIsAddModalOpen(false);
    window.location.reload();
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <button
          onClick={() => {
            setFullName("");
            setPhone("");
            setEmail("");
            setAddress("");
            setDrivingLicense("");
            setInternalNotes("");
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Address / City</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const totalSpent = c.bookings.reduce(
                  (sum: number, b: any) => sum + Number(b.totalAmount),
                  0
                );

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                      {c.internalNotes && (
                        <div className="text-[11px] text-amber-700 italic truncate max-w-xs">
                          Note: {c.internalNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-semibold text-slate-900">{c.phone}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                      {c.address || "Gujrat"}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.bookings.length} {c.bookings.length === 1 ? "booking" : "bookings"}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {formatCurrency(totalSpent, "PKR")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenCustomer(c)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                      >
                        Profile & History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Customer Profile
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedCustomer.fullName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile cards */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Phone:</span>
                <div className="font-bold text-slate-900 text-sm">{selectedCustomer.phone}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Email:</span>
                <div className="font-bold text-slate-900 text-sm">{selectedCustomer.email}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Address:</span>
                <div className="font-bold text-slate-900">{selectedCustomer.address || "N/A"}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Driving License:</span>
                <div className="font-bold text-slate-900 font-mono">
                  {selectedCustomer.drivingLicenceDetails || "Not registered"}
                </div>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Staff-Only Internal Notes
                </span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs font-semibold text-amber-800 hover:underline"
                  >
                    Edit Note
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter confidential staff notes (e.g. VIP client, preferred chauffeur, payment punctuality)..."
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="px-3 py-1 rounded bg-amber-600 text-white text-xs font-bold"
                    >
                      {isSavingNotes ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-900 italic">
                  {selectedCustomer.internalNotes || "No internal notes recorded yet for this client."}
                </p>
              )}
            </div>

            {/* Booking History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rental History ({selectedCustomer.bookings.length})
              </h3>
              {selectedCustomer.bookings.length > 0 ? (
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs">
                  {selectedCustomer.bookings.map((b: any) => (
                    <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{b.bookingReference}</div>
                        <div className="text-[11px] text-slate-500">
                          {formatDateTime(b.pickupDateTime)} &rarr; {formatDateTime(b.returnDateTime)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(b.totalAmount, b.currency)}
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-xl">
                  No reservations placed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add New Customer</h2>
            <p className="text-xs text-slate-500 mb-4">
              Register a customer record into the CRM database.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chaudhry Bilal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. bilal@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. GT Road, Gujrat"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driving License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-GJT-112233"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Staff Notes</label>
                <textarea
                  rows={2}
                  placeholder="Confidential client preferences..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
