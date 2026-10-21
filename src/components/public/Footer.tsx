import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3 text-white font-bold text-lg">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/Warraich-Motors-logo.png"
                  alt="Warraich Motors Gujrat"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="font-black text-white text-lg tracking-tight">
                  WARRAICH <span className="text-red-500">MOTORS</span>
                </div>
                <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
                  And Rent A Car &bull; Gujrat
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gujrat's premier car rental service. Delivering late-model SUVs, luxury wedding protocol vehicles, and dependable sedans with verified chauffeurs, doorstep delivery, and 24/7 support.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Registered Fleet &bull; Small Industrial Area, Gujrat</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">Our Popular Fleet</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars?category=LUXURY_SUV" className="hover:text-red-400 transition">
                  Toyota Land Cruiser Prado TX
                </Link>
              </li>
              <li>
                <Link href="/cars?category=SUV" className="hover:text-red-400 transition">
                  Toyota Fortuner Legender 4x4
                </Link>
              </li>
              <li>
                <Link href="/cars?category=SEDAN" className="hover:text-red-400 transition">
                  Toyota Corolla Altis Grande 1.8
                </Link>
              </li>
              <li>
                <Link href="/cars?category=SEDAN" className="hover:text-red-400 transition">
                  Honda Civic RS Turbo 1.5L
                </Link>
              </li>
              <li>
                <Link href="/cars?category=ECONOMY" className="hover:text-red-400 transition">
                  Toyota Yaris & Suzuki Alto 660cc
                </Link>
              </li>
              <li>
                <Link href="/cars?category=VAN" className="hover:text-red-400 transition">
                  Toyota Hiace Grand Cabin (14-Seater)
                </Link>
              </li>
            </ul>
          </div>

          {/* Rental Policies */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-red-400 transition">
                  About Warraich Motors
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-400 transition">
                  Rental Rules & Requirement
                </Link>
              </li>
              <li>
                <Link href="/terms#cancellation" className="hover:text-red-400 transition">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-400 transition">
                  Contact Hub & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">Gujrat Hub Location</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-300">
                  Mian, GT Rd, Small Industrial Area, Punjab, Gujrat, 50700
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+923136225135" className="hover:text-white font-semibold text-slate-200">
                  0313 6225135
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/923136225135"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 text-emerald-400 font-semibold"
                >
                  WhatsApp: 0313 6225135
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <a
                  href="mailto:warraichmotorsgujrat@gmail.com"
                  className="hover:text-white text-slate-300 break-all"
                >
                  warraichmotorsgujrat@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200 font-medium">
                  24/7 Dispatch & Roadside Helpline
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Warraich Motors Gujrat. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-slate-400">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-400">
              Privacy Policy
            </Link>
            <Link href="/admin/login" className="hover:text-slate-400">
              Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
