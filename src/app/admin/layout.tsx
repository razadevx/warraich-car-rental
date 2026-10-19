import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);

  // If user is not authenticated, render cleanly (e.g. for /admin/login)
  if (!user) {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AdminSidebar userRole={user.role} userName={user.name} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Management Portal &bull; Gujrat Main Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-right">
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
