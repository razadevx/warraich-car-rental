import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BookingManager } from "@/components/admin/BookingManager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const [bookings, cars] = await Promise.all([
    prisma.booking.findMany({
      include: {
        car: true,
        customer: true,
        extras: true,
        payments: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({
      where: { operationalStatus: { in: ["AVAILABLE", "RENTED"] } },
      select: { id: true, make: true, model: true, registrationNumber: true, dailyRate: true, currency: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Administration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending requests, confirm reservations, record payments, and process handovers & returns.
        </p>
      </div>

      <BookingManager initialBookings={bookings} cars={cars} />
    </div>
  );
}
