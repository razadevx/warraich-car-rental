"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, UserCircle, Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/cars", label: "Fleet & Rates" },
    { href: "/about", label: "About Us" },
    { href: "/terms", label: "Rental Rules" },
    { href: "/contact", label: "Contact Hub" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top micro bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Showroom Open:</span> Mian, GT Rd, Small Industrial Area, Gujrat
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <a
            href="tel:+923136225135"
            className="hidden md:flex items-center gap-1.5 text-slate-200 hover:text-red-400 transition-colors font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-red-500" />
            <span>0313 6225135 (24/7 Helpline)</span>
          </a>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <a
            href="https://wa.me/923136225135?text=Hello%20Warraich%20Motors,%20I%20want%20to%20inquire%20about%20car%20rental"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-[11px] sm:text-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Us</span>
          </a>
          <span className="text-slate-700">|</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-[11px] sm:text-xs"
          >
            <UserCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group py-1">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/Warraich-Motors-logo.png"
              alt="Warraich Motors and Rent A Car Gujrat"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="font-black text-xl sm:text-2xl text-slate-950 tracking-tight leading-none group-hover:text-red-700 transition">
              WARRAICH <span className="text-red-600">MOTORS</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
              Rent A Car &bull; Gujrat & Punjab
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-red-600 ${
                  isActive ? "text-red-600 font-bold border-b-2 border-red-600 pb-1" : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <a
            href="tel:+923136225135"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition"
          >
            <Phone className="w-3.5 h-3.5 text-red-600" />
            <span>0313 6225135</span>
          </a>
          <Link
            href="/cars"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 hover:bg-red-700 hover:shadow-lg transition active:scale-95"
          >
            Book A Car Now
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href="https://wa.me/923136225135"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-800 hover:bg-slate-100 border border-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-red-600" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-5 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            <a
              href="tel:+923136225135"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow"
            >
              <Phone className="w-4 h-4 text-red-500" />
              <span>Call Hotline: 0313 6225135</span>
            </a>
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md shadow-red-600/30"
            >
              Browse Available Fleet
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
