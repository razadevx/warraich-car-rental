import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MaintenanceManager } from "@/components/admin/MaintenanceManager";

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const [records, cars] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      include: {
        car: true,
      },
      orderBy: { startDateTime: "desc" },
    }),
    prisma.car.findMany({
      orderBy: { make: "asc" },
      select: { id: true, make: true, model: true, registrationNumber: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Maintenance & Service Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Schedule periodic inspections, track workshop expenses, and prevent double bookings during mechanical downtime.
        </p>
      </div>

      <MaintenanceManager initialRecords={records} cars={cars} />
    </div>
  );
}
