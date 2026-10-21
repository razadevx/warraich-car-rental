import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/db";
import { FALLBACK_SETTINGS } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let settings: any = FALLBACK_SETTINGS;
  try {
    const dbSettings = await prisma.businessSettings.findFirst();
    if (dbSettings) settings = dbSettings;
  } catch {
    settings = FALLBACK_SETTINGS;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
          Get in Touch
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Contact Warraich Motors Gujrat
        </h1>
        <p className="text-sm text-slate-600">
          Our fleet desk is active 24/7 on GT Road to assist with immediate bookings, airport meet & greet transfers, and wedding fleet packages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hub Location</h3>
              <p className="text-xs text-slate-700 font-medium mt-1">
                {settings?.address || "Mian, GT Rd, Small Industrial Area, Punjab, Gujrat, 50700"}
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Helpline & WhatsApp</h3>
              <p className="text-xs text-slate-900 font-bold mt-1">
                <a href="tel:03136225135" className="hover:text-red-600">
                  {settings?.contactPhone || "0313 6225135"}
                </a>
              </p>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Available 24/7 for Roadside Care & Instant Dispatch
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Email Inquiries</h3>
              <p className="text-xs text-slate-700 font-medium mt-1">
                <a href="mailto:warraichmotorsgujrat@gmail.com" className="hover:text-red-600">
                  {settings?.contactEmail || "warraichmotorsgujrat@gmail.com"}
                </a>
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Office Hours</h3>
              <p className="text-xs text-slate-600 mt-1">
                Showroom Counter: 08:00 AM – 11:00 PM Daily<br />
                Emergency Fleet Dispatch: 24 Hours Non-Stop
              </p>
            </div>
          </div>
        </div>

        {/* Quick Message Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" />
            <span>Send Direct Message</span>
          </h2>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-red-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                placeholder="0313 0000000"
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-red-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message / Inquiry</label>
              <textarea
                rows={4}
                placeholder="Ask about car availability, airport pickup, or special wedding fleet packages..."
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-red-500 text-sm"
                required
              />
            </div>
            <button
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md shadow-red-600/25 transition text-sm"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
