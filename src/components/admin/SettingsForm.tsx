"use client";

import { useState } from "react";
import { updateBusinessSettingsAction } from "@/app/actions/settings";
import { Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [companyName, setCompanyName] = useState(initialSettings?.companyName || "Warraich Motors Gujrat");
  const [contactPhone, setContactPhone] = useState(initialSettings?.contactPhone || "+92 300 1234567");
  const [contactEmail, setContactEmail] = useState(initialSettings?.contactEmail || "info@warraichmotors.pk");
  const [address, setAddress] = useState(initialSettings?.address || "GT Road, Gujrat, Punjab, Pakistan");
  const [currency, setCurrency] = useState(initialSettings?.currency || "PKR");
  const [timezone, setTimezone] = useState(initialSettings?.timezone || "Asia/Karachi");
  const [turnaroundBufferHours, setTurnaroundBufferHours] = useState(
    initialSettings?.turnaroundBufferHours !== undefined ? initialSettings.turnaroundBufferHours : 2
  );
  const [blockingStatuses, setBlockingStatuses] = useState(
    initialSettings?.blockingStatuses || "PENDING,CONFIRMED,ACTIVE"
  );
  const [defaultRentalRules, setDefaultRentalRules] = useState(
    initialSettings?.defaultRentalRules || ""
  );
  const [bookingPolicy, setBookingPolicy] = useState(initialSettings?.bookingPolicy || "");
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialSettings?.cancellationPolicy || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await updateBusinessSettingsAction({
      companyName,
      contactPhone,
      contactEmail,
      address,
      currency,
      timezone,
      turnaroundBufferHours: Number(turnaroundBufferHours),
      blockingStatuses,
      defaultRentalRules,
      bookingPolicy,
      cancellationPolicy,
    });

    setIsSaving(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to update business settings");
      return;
    }

    setSuccessMessage("Business and booking rules updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-xs">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Business Identity & Contact */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          1. Business Identity & Hub Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone (Helpline)</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Operating Hub Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Booking Engine Parameters */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          2. Booking Engine & Availability Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Turnaround Buffer (Hours)
            </label>
            <input
              type="number"
              min={0}
              max={24}
              value={turnaroundBufferHours}
              onChange={(e) => setTurnaroundBufferHours(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Safety cleaning and inspection buffer between reservations.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Blocking Booking Statuses
            </label>
            <input
              type="text"
              value={blockingStatuses}
              onChange={(e) => setBlockingStatuses(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Comma-separated list (e.g. PENDING,CONFIRMED,ACTIVE).
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="PKR">PKR (Pakistani Rupee)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Legal Disclosures & Rental Policies */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          3. Legal Disclosures & Customer Guidelines
        </h3>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Rental Rules (Age, ID, License)
          </label>
          <textarea
            rows={2}
            value={defaultRentalRules}
            onChange={(e) => setDefaultRentalRules(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Booking & Confirmation Policy
          </label>
          <textarea
            rows={2}
            value={bookingPolicy}
            onChange={(e) => setBookingPolicy(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Cancellation Policy</label>
          <textarea
            rows={2}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow transition"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Business Settings</span>
        </button>
      </div>
    </form>
  );
}
