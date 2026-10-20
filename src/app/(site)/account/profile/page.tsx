import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/forms/AuthForms";
import { getDict } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const { t } = await getDict();
  const user = await getSessionUser("customer");
  if (!user) redirect("/account/login?next=/account/profile");
  return (
    <AccountShell t={t} active="profile" name={user.name}>
      <h1 className="mb-6 text-2xl font-extrabold">{t.account.profile}</h1>
      <ProfileForm initial={{ name: user.name, phone: user.phone, locale: user.locale, email: user.email }} />
    </AccountShell>
  );
}
