import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Car, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const currentDate = new Date();
  const year = searchParams.year ? parseInt(searchParams.year) : currentDate.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) - 1 : currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  // Fetch cars and their bookings in this month
  const [cars, bookings, maintenanceRecords] = await Promise.all([
    prisma.car.findMany({
      where: { isPublished: true },
      orderBy: { make: "asc" },
      select: { id: true, make: true, model: true, registrationNumber: true },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
        pickupDateTime: { lte: endOfMonth },
        returnDateTime: { gte: startOfMonth },
      },
      include: {
        customer: { select: { fullName: true } },
      },
    }),
    prisma.maintenanceRecord.findMany({
      where: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        startDateTime: { lte: endOfMonth },
        OR: [{ endDateTime: null }, { endDateTime: { gte: startOfMonth } }],
      },
    }),
  ]);

  const daysInMonth = endOfMonth.getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = month === 0 ? 12 : month;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 1 : month + 2;
  const nextYear = month === 11 ? year + 1 : year;

  const monthName = startOfMonth.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reservation Timeline & Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual fleet schedule for {monthName} {year}. Confirmed, active rentals and maintenance windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/calendar?month=${prevMonth}&year=${prevYear}`}
            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg">
            {monthName} {year}
          </span>
          <Link
            href={`/admin/calendar?month=${nextMonth}&year=${nextYear}`}
            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Confirmed Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Active On Road</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
          <span>Pending Request</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span>Maintenance / Service</span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-600">
              <th className="py-3 px-4 font-bold min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r">
                Vehicle
              </th>
              {daysArray.map((day) => (
                <th key={day} className="py-2 px-1 text-center font-bold min-w-[32px] border-r">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cars.map((car) => {
              const carBookings = bookings.filter((b) => b.carId === car.id);
              const carMaintenance = maintenanceRecords.filter((m) => m.carId === car.id);

              return (
                <tr key={car.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r">
                    <div>{car.make} {car.model}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{car.registrationNumber}</div>
                  </td>

                  {daysArray.map((day) => {
                    const currentDayDate = new Date(year, month, day, 12, 0, 0);

                    // Check booking on this day
                    const activeBooking = carBookings.find((b) => {
                      const pickup = new Date(b.pickupDateTime);
                      const returnDate = new Date(b.returnDateTime);
                      return currentDayDate >= pickup && currentDayDate <= returnDate;
                    });

                    // Check maintenance on this day
                    const activeMaint = carMaintenance.find((m) => {
                      const start = new Date(m.startDateTime);
                      const end = m.endDateTime ? new Date(m.endDateTime) : new Date(2099, 1, 1);
                      return currentDayDate >= start && currentDayDate <= end;
                    });

                    let cellColor = "";
                    let cellTooltip = "";

                    if (activeMaint) {
                      cellColor = "bg-red-400 text-white";
                      cellTooltip = `Maintenance: ${activeMaint.description}`;
                    } else if (activeBooking) {
                      if (activeBooking.status === "ACTIVE") {
                        cellColor = "bg-emerald-500 text-white";
                        cellTooltip = `${activeBooking.bookingReference} (Active) - ${activeBooking.customer.fullName}`;
                      } else if (activeBooking.status === "CONFIRMED") {
                        cellColor = "bg-blue-500 text-white";
                        cellTooltip = `${activeBooking.bookingReference} (Confirmed) - ${activeBooking.customer.fullName}`;
                      } else {
                        cellColor = "bg-amber-400 text-slate-900";
                        cellTooltip = `${activeBooking.bookingReference} (Pending) - ${activeBooking.customer.fullName}`;
                      }
                    }

                    return (
                      <td
                        key={day}
                        title={cellTooltip}
                        className={`py-2 px-1 text-center border-r transition cursor-pointer text-[10px] font-bold ${cellColor}`}
                      >
                        {activeBooking ? "●" : activeMaint ? "■" : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
