import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | { toString: () => string },
  currency: string = "PKR"
): string {
  const num = typeof amount === "number" ? amount : Number(amount.toString());
  if (isNaN(num)) return `${currency} 0.00`;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currency === "PKR" ? "PKR" : "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateBookingReference(): string {
  const prefix = "WM";
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomChars}${timestamp}`;
}
