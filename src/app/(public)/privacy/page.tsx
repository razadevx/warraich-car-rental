import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="border-b pb-6">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Data Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          How Warraich Motors Gujrat collects, protects, and handles customer rental data.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you submit a reservation request, we collect contact details (full name, phone number, email address), identity verification (driving license and CNIC/Passport details where necessary for vehicle security), and reservation preferences.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>2. How Your Information is Used</span>
          </h2>
          <p>
            Your information is used strictly to process car bookings, coordinate vehicle pickup/delivery, verify eligibility, and facilitate emergency roadside assistance. We do not sell or rent customer data to third parties.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-600" />
            <span>3. Confidentiality and Access Controls</span>
          </h2>
          <p>
            Customer driving license records, private contact information, and internal notes are restricted strictly to authorized staff members on our management portal. Public tracking pages require matching reference numbers to prevent unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}
