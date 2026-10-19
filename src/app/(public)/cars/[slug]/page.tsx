import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BookingForm } from "@/components/public/BookingForm";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Gauge,
  Fuel,
  Briefcase,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";

import { FALLBACK_CARS, FALLBACK_EXTRAS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

interface CarDetailPageProps {
  params: { slug: string };
  searchParams: { pickup?: string; return?: string };
}

export default async function CarDetailPage({ params, searchParams }: CarDetailPageProps) {
  let car: any = null;
  let extras: any[] = FALLBACK_EXTRAS;

  try {
    car = await prisma.car.findUnique({
      where: { slug: params.slug },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (car) {
      const dbExtras = await prisma.rentalExtra.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });
      if (dbExtras.length > 0) extras = dbExtras;
    }
  } catch (err) {
    console.warn("Database offline in car details, using fallback:", err);
  }

  if (!car) {
    car = FALLBACK_CARS.find((c) => c.slug === params.slug);
  }

  if (!car || !car.isPublished) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Car Photos, Specs, Description & Terms (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                {car.category.replace("_", " ")}
              </span>
              <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded">
                Model {car.year}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {car.make} {car.model}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered vehicle ID: {car.registrationNumber} &bull; Stationed at Gujrat Main Hub
            </p>
          </div>

          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={
                  car.images[0]?.imageUrl ||
                  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
                }
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {car.images.slice(1).map((img: any, idx: number) => (
                  <div
                    key={img.id || idx}
                    className="relative aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || `View ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Seating
                </div>
                <div className="font-bold text-slate-900">{car.seatingCapacity} Passengers</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-600" /> Transmission
                </div>
                <div className="font-bold text-slate-900 capitalize">
                  {car.transmission.toLowerCase()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1">
                  <Fuel className="w-3.5 h-3.5 text-blue-600" /> Fuel Type
                </div>
                <div className="font-bold text-slate-900 capitalize">{car.fuelType.toLowerCase()}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Luggage
                </div>
                <div className="font-bold text-slate-900">{car.luggageCapacity} Large Bags</div>
              </div>
            </div>
          </div>

          {/* Rate Tiers Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Transparent Pricing Tiers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase">Daily Rate</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {formatCurrency(car.dailyRate, car.currency)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">1 to 6 days</div>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="text-xs font-semibold text-blue-700 uppercase">Weekly Package</div>
                <div className="text-xl font-black text-blue-600 mt-1">
                  {formatCurrency(car.weeklyRate, car.currency)}
                </div>
                <div className="text-[11px] text-blue-600 mt-1">
                  ~{formatCurrency(Number(car.weeklyRate) / 7, car.currency)}/day
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="text-xs font-semibold text-emerald-700 uppercase">Monthly Package</div>
                <div className="text-xl font-black text-emerald-600 mt-1">
                  {formatCurrency(car.monthlyRate, car.currency)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  ~{formatCurrency(Number(car.monthlyRate) / 30, car.currency)}/day
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Vehicle Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {car.description}
            </p>
          </div>

          {/* Rental Rules & Required Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">Rental Requirements</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Original CNIC (for Pakistani citizens) or Passport + Visa (for overseas visitors).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Valid Driving License (held for at least 1 year) or select our Chauffeur option.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Refundable security deposit collected upon vehicle inspection and handover.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Booking Form Widget (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <BookingForm
              car={car}
              extras={extras}
              initialPickup={searchParams.pickup}
              initialReturn={searchParams.return}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
