import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AdminLoginForm } from "./AdminLoginForm";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await getSessionUser("admin")) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-[4px] bg-white p-8 shadow-xl">
        <Logo className="mx-auto h-12 w-[190px]" />
        <h1 className="mt-6 text-center text-lg font-bold">Admin sign in</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
