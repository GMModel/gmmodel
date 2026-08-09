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
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar adminName={admin.name} />
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
