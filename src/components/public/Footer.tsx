import Link from "next/link";
import { Car, Phone, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              <span>WARRAICH MOTORS</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gujrat's trusted car rental service. Delivering premium SUVs, elegant sedans, and commercial vans with guaranteed mechanical reliability, chauffeur options, and transparent billing.
            </p>
            <div className="text-xs text-slate-500">
              Government Registered Fleet Operator &bull; Gujrat, Punjab
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Our Fleet</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars?category=LUXURY_SUV" className="hover:text-white transition">
                  Luxury SUVs (Prado TX)
                </Link>
              </li>
              <li>
                <Link href="/cars?category=SUV" className="hover:text-white transition">
                  4x4 Off-Road (Fortuner)
                </Link>
              </li>
              <li>
                <Link href="/cars?category=SEDAN" className="hover:text-white transition">
                  Executive Sedans (Civic & Corolla)
                </Link>
              </li>
              <li>
                <Link href="/cars?category=ECONOMY" className="hover:text-white transition">
                  Economy Commuters (Yaris)
                </Link>
              </li>
              <li>
                <Link href="/cars?category=VAN" className="hover:text-white transition">
                  Family Hiace Vans (14-Seater)
                </Link>
              </li>
            </ul>
          </div>

          {/* Rental Policies */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Warraich Motors
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Rental Rules & Policies
                </Link>
              </li>
              <li>
                <Link href="/terms#cancellation" className="hover:text-white transition">
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Gujrat Hub</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>GT Road, Gujrat, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>info@warraichmotors.pk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                <span>24/7 Dispatch & Roadside Assistance</span>
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
