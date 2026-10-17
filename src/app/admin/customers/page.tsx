import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CustomerManager } from "@/components/admin/CustomerManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const user = await requireAuth(["ADMIN", "STAFF"]).catch(() => null);
  if (!user) {
    redirect("/admin/login");
  }

  const customers = await prisma.customer.findMany({
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          bookingReference: true,
          totalAmount: true,
          currency: true,
          status: true,
          pickupDateTime: true,
          returnDateTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer CRM</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search customer profiles, track historical rental charges, and maintain confidential internal staff notes.
        </p>
      </div>

      <CustomerManager initialCustomers={customers} />
    </div>
  );
}
