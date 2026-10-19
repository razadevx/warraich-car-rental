import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroSearch } from "@/components/public/HeroSearch";
import { CarCard } from "@/components/public/CarCard";
import {
  ShieldCheck,
  Award,
  Clock,
  Car,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { FALLBACK_CARS, FALLBACK_SETTINGS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredCars: any[] = [];
  let settings: any = FALLBACK_SETTINGS;
  let isDbConnected = true;

  try {
    featuredCars = await prisma.car.findMany({
      where: {
        isPublished: true,
        operationalStatus: "AVAILABLE",
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      take: 6,
      orderBy: { dailyRate: "desc" },
    });

    const dbSettings = await prisma.businessSettings.findFirst();
    if (dbSettings) settings = dbSettings;

    if (featuredCars.length === 0) {
      featuredCars = FALLBACK_CARS;
    }
  } catch (error) {
    console.warn("Database unavailable or not migrated yet. Falling back to default fleet.", error);
    isDbConnected = false;
    featuredCars = FALLBACK_CARS;
    settings = FALLBACK_SETTINGS;
  }

  return (
    <div>
      {!isDbConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs text-center">
          <strong>Database Notice:</strong> Currently showing initial demo fleet. Connect your Neon PostgreSQL database to enable live bookings.
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-12 pb-24 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Fleet in Gujrat & Punjab</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Drive with Confidence & Prestige in <span className="text-blue-500">Gujrat</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Choose from late-model Land Cruisers, Fortuners, Civics, and Corollas. Guaranteed availability, spotless interiors, transparent pricing, and optional professional chauffeurs.
            </p>
          </div>

          {/* Booking Search Box */}
          <div className="mt-10 max-w-5xl mx-auto">
            <HeroSearch />
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto pt-6 border-t border-slate-800">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Verified Fleet Availability</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">0 Hidden</div>
              <div className="text-xs text-slate-400 mt-1">Surprise Charges at Pickup</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">24 / 7</div>
              <div className="text-xs text-slate-400 mt-1">Gujrat Dispatch & Support</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">Airport</div>
              <div className="text-xs text-slate-400 mt-1">Meet & Greet Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              Our Premium Selection
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Rental Vehicles
            </h2>
          </div>
          <Link
            href="/cars"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Vehicles & Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* Why Choose Warraich Motors */}
      <section className="bg-slate-100 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              The Warraich Motors Standard
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Why Customers in Gujrat Choose Us
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              We eliminate the uncertainty often associated with car rentals through clear policies and uncompromising vehicle care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Guaranteed Clean & Inspected</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every vehicle undergoes a 25-point mechanical inspection, complete sanitation, and fluid check prior to handover.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Verified Professional Chauffeurs</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Travelling intercity or attending a VIP wedding? Hire our background-verified, courteous drivers with intimate knowledge of GT Road, Motorways, and northern routes.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Airport Pickup & Drop Services</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seamless airport handovers at Sialkot (SKT), Islamabad (ISB), or Lahore (LHE) terminals. We track your flight to ensure punctuality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gujrat Hub Location & CTA */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> GT Road, Gujrat Hub
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Reserve Your Car?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Book online in 2 minutes. Our team will review your request, lock your reservation, and contact you directly with pickup instructions.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free cancellation 24h before
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cash or Bank Transfer accepted
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <Link
              href="/cars"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-center shadow-lg transition"
            >
              Browse Full Fleet
            </Link>
            <Link
              href="/contact"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl text-center border border-slate-700 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
