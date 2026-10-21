import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { HeroSearch } from "@/components/public/HeroSearch";
import { CarCard } from "@/components/public/CarCard";
import {
  ShieldCheck,
  Award,
  Clock,
  Car,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight,
  Sparkles,
  Plane,
  Star,
  Users,
  Lock,
} from "lucide-react";

import { FALLBACK_CARS, FALLBACK_SETTINGS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings: any = FALLBACK_SETTINGS;

  let availableCars: any[] = [];
  let availableSoonCars: any[] = [];
  let currentlyBookedCars: any[] = [];

  try {
    const allCars = await prisma.car.findMany({
      where: {
        isPublished: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { dailyRate: "desc" },
    });

    const dbSettings = await prisma.businessSettings.findFirst();
    if (dbSettings) settings = dbSettings;

    if (allCars.length > 0) {
      allCars.forEach((c) => {
        const fallbackMatch = FALLBACK_CARS.find((fc) => fc.slug === c.slug);
        const funnel =
          fallbackMatch?.funnelStatus ||
          (c.operationalStatus === "AVAILABLE"
            ? "AVAILABLE_NOW"
            : c.operationalStatus === "MAINTENANCE"
            ? "AVAILABLE_SOON"
            : "CURRENTLY_BOOKED");

        const enrichedCar = {
          ...c,
          funnelStatus: funnel,
          availabilityNote: fallbackMatch?.availabilityNote,
        };

        if (funnel === "AVAILABLE_NOW" || c.operationalStatus === "AVAILABLE") {
          availableCars.push(enrichedCar);
        } else if (funnel === "AVAILABLE_SOON" || c.operationalStatus === "MAINTENANCE") {
          availableSoonCars.push(enrichedCar);
        } else {
          currentlyBookedCars.push(enrichedCar);
        }
      });
    } else {
      throw new Error("No cars found in DB");
    }
  } catch (error) {
    settings = FALLBACK_SETTINGS;

    availableCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "AVAILABLE_NOW");
    availableSoonCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "AVAILABLE_SOON");
    currentlyBookedCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "CURRENTLY_BOOKED");
  }

  // Fallback checks
  if (availableCars.length === 0) {
    availableCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "AVAILABLE_NOW");
  }
  if (availableSoonCars.length === 0) {
    availableSoonCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "AVAILABLE_SOON");
  }
  if (currentlyBookedCars.length === 0) {
    currentlyBookedCars = FALLBACK_CARS.filter((c) => c.funnelStatus === "CURRENTLY_BOOKED");
  }

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-20 sm:pb-28 overflow-hidden border-b border-red-950/40">
        {/* Subtle automotive mesh & crimson radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            {/* Logo Badge & 24 Hours Service Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-600/40 text-red-200 text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Warraich Motors &bull; 24 Hours Rental Service</span>
              <span className="hidden sm:inline text-red-400">|</span>
              <span className="hidden sm:inline text-slate-300">GT Road, Gujrat</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Drive with Prestige & Luxury in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-300">
                Gujrat & Punjab
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
              From executive Toyota Prado & Fortuner Legender to Corolla Grande, Civic RS, and economy Yaris & Alto. Guaranteed showroom condition, 24/7 roadside helpline, transparent PKR pricing, and optional verified chauffeurs.
            </p>

            {/* Direct Quick Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:03136225135"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline: 0313 6225135</span>
              </a>

              <a
                href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20I%20want%20to%20rent%20a%20car%20in%20Gujrat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant WhatsApp Dispatch</span>
              </a>
            </div>
          </div>

          {/* Hero Search Box */}
          <div className="mt-10 max-w-5xl mx-auto">
            <HeroSearch />
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-red-500">100%</div>
              <div className="text-xs text-slate-300 font-medium">Guaranteed Available Cars</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-red-500">0 Hidden</div>
              <div className="text-xs text-slate-300 font-medium">Extra Charges at Pickup</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-red-500">24 / 7</div>
              <div className="text-xs text-slate-300 font-medium">Hotline & Roadside Care</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-red-500">Airports</div>
              <div className="text-xs text-slate-300 font-medium">Sialkot &bull; ISB &bull; LHE Handovers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Address & Hub Micro Banner */}
      <div className="bg-slate-900 text-slate-300 py-3 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              <strong>Main Hub Location:</strong> Mian, GT Rd, Small Industrial Area, Punjab, Gujrat, 50700
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serving Gujrat, Kharian, Dinga, Lalamusa & Jalalpur</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="text-emerald-400 font-semibold">24/7 Helpline: 0313 6225135</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FUNNEL STAGE 1: 🟢 AVAILABLE RIGHT NOW (Ready to Drive Today) */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Category 1 &bull; Instant Delivery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              🟢 Available Right Now in Gujrat
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Parked at our GT Road showroom, fully washed, inspected, and ready for handover within 30 minutes. Self-drive or with professional chauffeur.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <a
              href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20what%20cars%20are%20available%20for%20rent%20right%20now?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-4 py-2 rounded-lg text-xs border border-emerald-300 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask Current Slot</span>
            </a>
            <Link
              href="/cars"
              className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700"
            >
              <span>View All Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FUNNEL STAGE 2: 🟡 ARRIVING SOON & ROTATION (Reserve Next Slot Ahead) */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-amber-500/5 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-amber-200/60">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Category 2 &bull; Pre-Book & Advance Slots</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                🟡 Will Be Available Soon
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                High-demand vehicles returning from active rentals or scheduled detailing. Lock your preferred date in advance for upcoming weddings, family tours, and airport pick-ups.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <span className="text-xs text-amber-900 font-semibold bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-300/50">
                ⚡ Slots fill fast on weekends & wedding dates
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableSoonCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FUNNEL STAGE 3: 🔴 CURRENTLY BOOKED FLEET (On Active Duty & VIP Protocol) */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-rose-700" />
              <span>Category 3 &bull; Live Fleet Status & Social Proof</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              🔴 Currently Booked Fleet
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              See why Gujrat and overseas Pakistani families trust Warraich Motors. These vehicles are currently on active VIP protocol, motorway travel, and royal wedding duty. Join the priority waitlist for their return.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <a
              href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20I%20want%20to%20inquire%20about%20future%20dates%20for%20your%20luxury%20fleet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-3.5 py-2 rounded-lg border border-rose-200 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Join Priority Waitlist</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentlyBookedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* Overseas Pakistanis & Airport Transfers Section */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 border-y border-red-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950 border border-red-700/60 text-red-300 text-xs font-bold uppercase tracking-wider">
                <Plane className="w-3.5 h-3.5 text-red-400" />
                <span>Dedicated Airport Concierge</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Visiting Gujrat from UK, Europe, or Gulf?{" "}
                <span className="text-red-500">We Meet You at the Terminal</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Skip airport taxi hassles. Warraich Motors provides seamless vehicle delivery at your arrival terminal. We track your flight in real-time, coordinate via WhatsApp, and have your chosen car fueled and ready at the gate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="font-extrabold text-white text-sm">Sialkot Airport (SKT)</div>
                  <div className="text-xs text-red-400 mt-1 font-semibold">~45 Mins Express</div>
                  <p className="text-[11px] text-slate-400 mt-1">Direct Sambrial / GT Road delivery</p>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="font-extrabold text-white text-sm">Islamabad (ISB)</div>
                  <div className="text-xs text-red-400 mt-1 font-semibold">~2 Hrs Via M-2</div>
                  <p className="text-[11px] text-slate-400 mt-1">Direct terminal chauffeur pickup</p>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="font-extrabold text-white text-sm">Lahore (LHE)</div>
                  <div className="text-xs text-red-400 mt-1 font-semibold">~2.5 Hrs Via Motorway</div>
                  <p className="text-[11px] text-slate-400 mt-1">Allama Iqbal Terminal handover</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20I%20am%20arriving%20at%20the%20airport%20and%20need%20a%20car"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/30 transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pre-Book Airport Car on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Testimonials / Social Proof Card */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  &ldquo;Booked a Fortuner Legender for our family wedding in Kharian coming from Birmingham. Car was spotless, driver was extremely courteous, and pricing was completely transparent. Best rental in Gujrat.&rdquo;
                </p>
                <div className="text-xs font-bold text-white flex justify-between">
                  <span>Chaudhry Kamran &bull; Birmingham, UK</span>
                  <span className="text-slate-400">Fortuner Legender Rental</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  &ldquo;Rented a Corolla Grande for two weeks during my visit to Jalalpur Jattan. Handover at Sialkot airport was right on time. No hidden deposits, returned my security promptly. Highly recommended.&rdquo;
                </p>
                <div className="text-xs font-bold text-white flex justify-between">
                  <span>Naveed Warraich &bull; Oslo, Norway</span>
                  <span className="text-slate-400">Corolla Altis Grande</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Warraich Motors */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-red-600 tracking-wider uppercase">
              The Warraich Motors Guarantee
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Gujrat Trusts Us for Every Journey
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              We eliminate rental uncertainty through guaranteed vehicle health, background-verified chauffeurs, and upfront transparent billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-7 rounded-2xl border border-slate-200/80 space-y-3.5 hover:border-red-300 transition">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">25-Point Mechanical Handover</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Brakes, tires, fluids, and ice-cold AC are thoroughly tested before every rental handover. Spotlessly vacuumed and sanitized interiors.
              </p>
            </div>

            <div className="bg-slate-50 p-7 rounded-2xl border border-slate-200/80 space-y-3.5 hover:border-emerald-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Verified Chauffeurs (Optional)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Travelling intercity or attending a VIP Barat? Hire our courteous, uniformed chauffeurs with expert knowledge of GT Road, Motorways, and northern routes.
              </p>
            </div>

            <div className="bg-slate-50 p-7 rounded-2xl border border-slate-200/80 space-y-3.5 hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">24/7 Roadside Assistance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our emergency response team is on call 24 hours daily on GT Road. In the rare event of a tire or mechanical issue, immediate replacement or assistance is dispatched.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gujrat Hub Location & CTA */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-red-900/50">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-red-500" /> Mian, GT Rd, Small Industrial Area, Gujrat
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Reserve Your Car in Gujrat?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Book online in 2 minutes or reach out directly via phone or WhatsApp. Our fleet manager will confirm vehicle availability and prepare your car.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free cancellation 24h before
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cash or Bank Transfer accepted
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Doorstep Delivery available
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <a
              href="tel:03136225135"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call 0313 6225135</span>
            </a>
            <a
              href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20I%20want%20to%20reserve%20a%20car"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}