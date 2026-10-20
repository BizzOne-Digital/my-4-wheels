import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Server-side guard for every admin page. API routes check the session independently. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionUser("admin");
  if (!admin) redirect("/admin/login");
  return (
    <>
      <AdminSidebar name={admin.name} />
      <main className="px-4 py-6 sm:px-8 lg:ml-60 lg:py-8">{children}</main>
    </>
  );
}
