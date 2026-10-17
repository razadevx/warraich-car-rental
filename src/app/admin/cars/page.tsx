import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { FleetManager } from "@/components/admin/FleetManager";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const cars = await prisma.car.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      bookings: {
        where: { status: { in: ["CONFIRMED", "ACTIVE"] } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add new cars, update rates, toggle public visibility, and monitor mechanical statuses.
        </p>
      </div>

      <FleetManager initialCars={cars} />
    </div>
  );
}
