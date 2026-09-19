import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminProtectedLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  if (!user.isAdmin) {
    redirect("/admin/login?error=forbidden");
  }
  const admin = user;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 md:flex-row">
      <AdminSidebar adminName={admin.name} />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
