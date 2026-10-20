import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerRegisterForm } from "@/components/forms/AuthForms";
import { getDict } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.account.register, robots: { index: false } };
}

export default async function RegisterPage() {
  const { t } = await getDict();
  if (await getSessionUser("customer")) redirect("/account");
  return (
    <section className="container-site max-w-md py-16">
      <h1 className="text-3xl font-extrabold">{t.account.register}</h1>
      <p className="mb-6 mt-2 text-sm text-neutral-600">{t.account.registerIntro}</p>
      <div className="card p-6"><CustomerRegisterForm /></div>
    </section>
  );
}
