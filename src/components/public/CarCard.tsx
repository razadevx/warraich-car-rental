import Link from "next/link";
import { Users, Fuel, Gauge, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CarCardProps {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    slug: string;
    category: string;
    transmission: string;
    fuelType: string;
    seatingCapacity: number;
    luggageCapacity: number;
    dailyRate: any;
    weeklyRate: any;
    currency: string;
    operationalStatus: string;
    images: Array<{ imageUrl: string; altText?: string | null }>;
  };
  pickup?: string;
  returnDate?: string;
}

export function CarCard({ car, pickup, returnDate }: CarCardProps) {
  const imageUrl =
    car.images && car.images.length > 0
      ? car.images[0].imageUrl
      : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";

  // Build detail link with date params if present
  const queryParams = new URLSearchParams();
  if (pickup) queryParams.set("pickup", pickup);
  if (returnDate) queryParams.set("return", returnDate);
  const detailUrl = `/cars/${car.slug}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {car.category.replace("_", " ")}
          </span>
          <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {car.year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition leading-snug">
            {car.make} {car.model}
          </h3>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 py-3 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{car.seatingCapacity} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="capitalize">{car.transmission.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="capitalize">{car.fuelType.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Daily Rate</div>
            <div className="text-lg font-extrabold text-slate-900">
              {formatCurrency(car.dailyRate, car.currency)}
              <span className="text-xs font-normal text-slate-500"> /day</span>
            </div>
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span>Reserve</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
