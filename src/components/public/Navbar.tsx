"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Phone, ShieldCheck, UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/cars", label: "Fleet & Rates" },
    { href: "/about", label: "About Us" },
    { href: "/terms", label: "Rental Rules" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top micro bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Gujrat Fleet Hub Active (GT Road)
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Phone className="w-3 h-3 text-emerald-400" /> +92 300 1234567 (24/7 Helpline)
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <UserCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md group-hover:bg-blue-700 transition">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
              WARRAICH MOTORS
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
              Gujrat Car Rental
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/cars"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Rent a Car Now
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow"
            >
              Rent a Car Now
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Staff Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
