"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Car,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Wrench,
  CheckCircle,
  X,
  Search,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  createCarAction,
  updateCarAction,
  toggleCarPublishAction,
  updateCarOperationalStatusAction,
} from "@/app/actions/cars";
import { OperationalStatus } from "@/types";

interface FleetManagerProps {
  initialCars: Array<any>;
}

export function FleetManager({ initialCars }: FleetManagerProps) {
  const [cars, setCars] = useState(initialCars);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SEDAN");
  const [transmission, setTransmission] = useState("AUTOMATIC");
  const [fuelType, setFuelType] = useState("PETROL");
  const [seatingCapacity, setSeatingCapacity] = useState(5);
  const [luggageCapacity, setLuggageCapacity] = useState(3);
  const [dailyRate, setDailyRate] = useState(10000);
  const [weeklyRate, setWeeklyRate] = useState(60000);
  const [monthlyRate, setMonthlyRate] = useState(220000);
  const [currency, setCurrency] = useState("PKR");
  const [imageUrl, setImageUrl] = useState("");
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>("AVAILABLE");
  const [isPublished, setIsPublished] = useState(true);

  const openAddModal = () => {
    setEditingCar(null);
    setRegistrationNumber("");
    setMake("");
    setModel("");
    setYear(new Date().getFullYear());
    setSlug("");
    setDescription("");
    setCategory("SEDAN");
    setTransmission("AUTOMATIC");
    setFuelType("PETROL");
    setSeatingCapacity(5);
    setLuggageCapacity(3);
    setDailyRate(10000);
    setWeeklyRate(60000);
    setMonthlyRate(220000);
    setCurrency("PKR");
    setImageUrl("");
    setOperationalStatus("AVAILABLE");
    setIsPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (car: any) => {
    setEditingCar(car);
    setRegistrationNumber(car.registrationNumber);
    setMake(car.make);
    setModel(car.model);
    setYear(car.year);
    setSlug(car.slug);
    setDescription(car.description);
    setCategory(car.category);
    setTransmission(car.transmission);
    setFuelType(car.fuelType);
    setSeatingCapacity(car.seatingCapacity);
    setLuggageCapacity(car.luggageCapacity);
    setDailyRate(Number(car.dailyRate));
    setWeeklyRate(Number(car.weeklyRate));
    setMonthlyRate(Number(car.monthlyRate));
    setCurrency(car.currency);
    setImageUrl(car.images[0]?.imageUrl || "");
    setOperationalStatus(car.operationalStatus);
    setIsPublished(car.isPublished);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      registrationNumber: registrationNumber.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      category,
      transmission,
      fuelType,
      seatingCapacity: Number(seatingCapacity),
      luggageCapacity: Number(luggageCapacity),
      dailyRate: Number(dailyRate),
      weeklyRate: Number(weeklyRate),
      monthlyRate: Number(monthlyRate),
      currency,
      operationalStatus,
      isPublished,
      imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
    };

    let res;
    if (editingCar) {
      res = await updateCarAction(editingCar.id, payload);
    } else {
      res = await createCarAction(payload);
    }

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || "Failed to save vehicle");
      return;
    }

    setIsModalOpen(false);
    // Reload page to reflect database changes cleanly
    window.location.reload();
  };

  const handleTogglePublish = async (carId: string, currentVal: boolean) => {
    await toggleCarPublishAction(carId, !currentVal);
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, isPublished: !currentVal } : c))
    );
  };

  const handleStatusChange = async (carId: string, newStatus: OperationalStatus) => {
    await updateCarOperationalStatusAction(carId, newStatus);
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, operationalStatus: newStatus } : c))
    );
  };

  // Filter cars
  const filteredCars = cars.filter((car) => {
    const matchSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "ALL" || car.operationalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by make, model, registration..."
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
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Plate & Category</th>
                <th className="py-3 px-4">Rates (Day / Wk / Mo)</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          car.images[0]?.imageUrl ||
                          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={car.model}
                        className="w-12 h-9 object-cover rounded-md bg-slate-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {car.make} {car.model}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Year {car.year} &bull; {car.transmission} &bull; {car.seatingCapacity} seats
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    <div>{car.registrationNumber}</div>
                    <div className="text-[11px] font-sans text-slate-400 capitalize">
                      {car.category.toLowerCase().replace("_", " ")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {formatCurrency(car.dailyRate, car.currency)}/d
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatCurrency(car.weeklyRate, car.currency)}/w &bull; {formatCurrency(car.monthlyRate, car.currency)}/m
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={car.operationalStatus}
                      onChange={(e) =>
                        handleStatusChange(car.id, e.target.value as OperationalStatus)
                      }
                      className={`text-xs font-bold rounded-lg border py-1 px-2 focus:ring-2 focus:ring-blue-500 ${
                        car.operationalStatus === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : car.operationalStatus === "RENTED"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : car.operationalStatus === "MAINTENANCE"
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="RENTED">RENTED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublish(car.id, car.isPublished)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        car.isPublished
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {car.isPublished ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-500" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(car)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit vehicle details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCar ? `Edit ${editingCar.make} ${editingCar.model}` : "Add New Vehicle to Fleet"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Make *</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. Fortuner Legender"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    placeholder="e.g. GJT-24-9900"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm uppercase font-mono focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturing Year *</label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    placeholder="toyota-fortuner-2024"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LUXURY_SUV">Luxury SUV</option>
                    <option value="SUV">SUV (4x4)</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="ECONOMY">Economy</option>
                    <option value="CROSSOVER">Crossover</option>
                    <option value="VAN">Passenger Van</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transmission *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fuel Type *</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rate (PKR) *</label>
                  <input
                    type="number"
                    min={1000}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weekly Rate (PKR) *</label>
                  <input
                    type="number"
                    min={5000}
                    value={weeklyRate}
                    onChange={(e) => setWeeklyRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Rate (PKR) *</label>
                  <input
                    type="number"
                    min={20000}
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Publish to public website</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
                  <span>{editingCar ? "Save Changes" : "Create Vehicle"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
