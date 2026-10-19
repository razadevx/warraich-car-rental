import { prisma } from "@/lib/db";
import { CarCard } from "@/components/public/CarCard";
import { checkCarAvailability } from "@/lib/booking-engine/availability";
import { Filter, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { FALLBACK_CARS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

interface CarsPageProps {
  searchParams: {
    pickup?: string;
    return?: string;
    category?: string;
    transmission?: string;
    location?: string;
  };
}


export default async function CarsPage({ searchParams }: CarsPageProps) {
  const { pickup, return: returnDate, category, transmission } = searchParams;

  let allCars: any[] = [];
  try {
    const whereClause: any = {
      isPublished: true,
    };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (transmission && transmission !== "ALL") {
      whereClause.transmission = transmission.toUpperCase();
    }

    allCars = await prisma.car.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { dailyRate: "asc" },
    });

    if (allCars.length === 0 && !category) {
      allCars = FALLBACK_CARS;
    }
  } catch (err) {
    console.warn("Database offline in /cars, using fallback fleet:", err);
    allCars = FALLBACK_CARS.filter((c) => {
      if (category && category !== "ALL" && c.category !== category) return false;
      return true;
    });
  }

  // If date range is specified, evaluate availability for each car
  let hasDateFilter = false;
  let availableCars: typeof allCars = [];
  let unavailableCars: typeof allCars = [];

  if (pickup && returnDate) {
    const pickupParsed = new Date(pickup);
    const returnParsed = new Date(returnDate);

    if (returnParsed.getTime() > pickupParsed.getTime()) {
      hasDateFilter = true;
      try {
        for (const car of allCars) {
          const avail = await checkCarAvailability(car.id, pickupParsed, returnParsed);
          if (avail.isAvailable) {
            availableCars.push(car);
          } else {
            unavailableCars.push(car);
          }
        }
      } catch {
        availableCars = allCars;
      }
    } else {
      availableCars = allCars;
    }
  } else {
    availableCars = allCars;
  }


  const categories = [
    { label: "All Vehicles", value: "ALL" },
    { label: "Luxury SUV", value: "LUXURY_SUV" },
    { label: "SUV (4x4)", value: "SUV" },
    { label: "Sedan", value: "SEDAN" },
    { label: "Economy", value: "ECONOMY" },
    { label: "Passenger Van", value: "VAN" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Rental Fleet & Availability
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Browse verified, clean vehicles stationed at our Gujrat Hub ready for immediate handover.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => {
            const isSelected = (!category && cat.value === "ALL") || category === cat.value;
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (cat.value === "ALL") params.delete("category");
            else params.set("category", cat.value);

            return (
              <Link
                key={cat.value}
                href={`/cars?${params.toString()}`}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Date Filter Indicator */}
        {hasDateFilter ? (
          <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Dates: {new Date(pickup!).toLocaleDateString()} &rarr; {new Date(returnDate!).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">
            Showing all published fleet. Select dates on details page for live booking.
          </span>
        )}
      </div>

      {/* Available Cars Grid */}
      {availableCars.length > 0 ? (
        <div className="space-y-10">
          <div>
            {hasDateFilter && (
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Available for Selected Dates ({availableCars.length})</span>
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCars.map((car) => (
                <CarCard key={car.id} car={car} pickup={pickup} returnDate={returnDate} />
              ))}
            </div>
          </div>

          {/* Unavailable Cars (if date filter active) */}
          {hasDateFilter && unavailableCars.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Reserved for These Dates ({unavailableCars.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-60">
                {unavailableCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <CarCard
            car={{
              id: "none",
              make: "No cars",
              model: "matching your criteria",
              year: 2024,
              slug: "",
              category: "",
              transmission: "",
              fuelType: "",
              seatingCapacity: 0,
              luggageCapacity: 0,
              dailyRate: 0,
              weeklyRate: 0,
              currency: "PKR",
              operationalStatus: "AVAILABLE",
              images: [],
            }}
          />
          <p className="text-slate-600 text-sm mt-4">
            Try adjusting your category filter or date range to see more vehicles.
          </p>
          <Link
            href="/cars"
            className="inline-block mt-4 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Clear All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
