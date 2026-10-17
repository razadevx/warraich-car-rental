"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  CalendarDays,
  Users,
  CreditCard,
  Wrench,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole, userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cars", label: "Fleet Management", icon: Car },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/calendar", label: "Reservation Calendar", icon: CalendarDays },
    { href: "/admin/customers", label: "Customers CRM", icon: Users },
    { href: "/admin/payments", label: "Payments & Ledger", icon: CreditCard },
    { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
    ...(userRole === "ADMIN"
      ? [{ href: "/admin/settings", label: "Business Settings", icon: Settings }]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight leading-none">
              WARRAICH MOTORS
            </div>
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mt-0.5">
              Portal ({userRole})
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <div className="text-xs truncate max-w-[140px]">
            <div className="font-bold text-white truncate">{userName || "Staff Member"}</div>
            <div className="text-[11px] text-slate-500 capitalize">{userRole?.toLowerCase()}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
