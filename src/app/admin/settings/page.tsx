import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Only ADMIN can access business settings
  const user = await requireAuth(["ADMIN"]).catch(() => null);
  if (!user) {
    redirect("/admin");
  }

  const settings = await prisma.businessSettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business & Booking Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure operational policies, turnaround cleaning buffers, blocking reservation statuses, and contact details.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
