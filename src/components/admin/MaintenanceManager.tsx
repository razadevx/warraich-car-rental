"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { createMaintenanceAction, updateMaintenanceStatusAction } from "@/app/actions/maintenance";
import { MaintenanceStatus } from "@/types";

interface MaintenanceManagerProps {
  initialRecords: Array<any>;
  cars: Array<any>;
}

export function MaintenanceManager({ initialRecords, cars }: MaintenanceManagerProps) {
  const [records, setRecords] = useState(initialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carId, setCarId] = useState(cars[0]?.id || "");

  const getDefaultStart = () => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getDefaultEnd = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [startDateTime, setStartDateTime] = useState(getDefaultStart());
  const [endDateTime, setEndDateTime] = useState(getDefaultEnd());
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(15000);
  const [status, setStatus] = useState<MaintenanceStatus>("SCHEDULED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const res = await createMaintenanceAction({
      carId,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: endDateTime ? new Date(endDateTime).toISOString() : undefined,
      description,
      cost: Number(cost),
      status,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setFormError(res.error || "Failed to schedule maintenance");
      return;
    }

    setIsModalOpen(false);
    window.location.reload();
  };

  const handleStatusChange = async (recordId: string, newStatus: MaintenanceStatus) => {
    await updateMaintenanceStatusAction(recordId, newStatus);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">
          Scheduling maintenance automatically prevents online reservations during service intervals.
        </p>

        <button
          onClick={() => {
            setDescription("");
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{r.car.make} {r.car.model}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{r.car.registrationNumber}</div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {r.description}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                    <div>From: {formatDateTime(r.startDateTime)}</div>
                    <div>To: {r.endDateTime ? formatDateTime(r.endDateTime) : "Indefinite"}</div>
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {r.cost ? formatCurrency(r.cost, "PKR") : "Pending invoice"}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-700"
                          : r.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    {r.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "IN_PROGRESS")}
                        className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px]"
                      >
                        Start Service
                      </button>
                    )}
                    {r.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "COMPLETED")}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                      >
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Schedule Maintenance</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter vehicle workshop details. The car will be marked unavailable for these dates.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Vehicle *</label>
                <select
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.make} {c.model} ({c.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Completion Date & Time</label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description of Work *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Periodic 10,000 KM service, synthetic oil change, brake pads, tire rotation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SCHEDULED">SCHEDULED (Upcoming appointment)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Currently at workshop)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
