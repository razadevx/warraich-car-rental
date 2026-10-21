"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();

  // Default pickup tomorrow at 10:00, return 3 days later at 10:00
  const getDefaultPickup = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getDefaultReturn = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [pickupDateTime, setPickupDateTime] = useState(getDefaultPickup());
  const [returnDateTime, setReturnDateTime] = useState(getDefaultReturn());
  const [pickupLocation, setPickupLocation] = useState("Warraich Motors Hub, GT Rd Small Industrial Area, Gujrat");
  const [category, setCategory] = useState("ALL");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupDateTime) params.set("pickup", new Date(pickupDateTime).toISOString());
    if (returnDateTime) params.set("return", new Date(returnDateTime).toISOString());
    if (pickupLocation) params.set("location", pickupLocation);
    if (category && category !== "ALL") params.set("category", category);

    router.push(`/cars?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-600" /> Pickup Location
          </label>
          <select
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="Warraich Motors Hub, GT Rd Small Industrial Area, Gujrat">Warraich Motors Hub (GT Rd, Small Industrial Area, Gujrat)</option>
            <option value="Gujrat City Center / Court Road / Rehman Shaheed Rd">Gujrat City Center / Court Road / Rehman Shaheed Rd</option>
            <option value="Kharian Cantt / Lalamusa / Jalalpur Jattan">Kharian Cantt / Lalamusa / Jalalpur Jattan</option>
            <option value="Sialkot International Airport (SKT)">Sialkot International Airport (SKT) Delivery</option>
            <option value="Islamabad International Airport (ISB)">Islamabad International Airport (ISB) Delivery</option>
            <option value="Lahore Allama Iqbal Airport (LHE)">Lahore Allama Iqbal Airport (LHE) Delivery</option>
            <option value="Custom Doorstep Address (Gujrat & Surroundings)">Custom Doorstep Address (Gujrat & Surroundings)</option>
          </select>
        </div>

        {/* Pickup Date & Time */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-600" /> Pickup Date & Time
          </label>
          <input
            type="datetime-local"
            value={pickupDateTime}
            onChange={(e) => setPickupDateTime(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {/* Return Date & Time */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-600" /> Return Date & Time
          </label>
          <input
            type="datetime-local"
            value={returnDateTime}
            onChange={(e) => setReturnDateTime(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {/* Vehicle Category & Submit */}
        <div className="flex flex-col justify-end">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Vehicle Type
          </label>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="LUXURY_SUV">Luxury SUV (Prado/V8)</option>
              <option value="SUV">SUV 4x4 (Fortuner/Revo)</option>
              <option value="SEDAN">Executive Sedan (Grande/Civic)</option>
              <option value="ECONOMY">Economy (Yaris/Alto)</option>
              <option value="VAN">Passenger Van (Hiace)</option>
            </select>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/30 transition shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Find Car</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
