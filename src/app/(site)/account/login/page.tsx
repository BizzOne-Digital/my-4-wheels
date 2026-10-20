import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/forms/AuthForms";
import { getDict } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.account.login, robots: { index: false } };
}

export default async function LoginPage() {
  const { t } = await getDict();
  if (await getSessionUser("customer")) redirect("/account");
  return (
    <section className="container-site max-w-md py-16">
      <h1 className="text-3xl font-extrabold">{t.account.login}</h1>
      <p className="mb-6 mt-2 text-sm text-neutral-600">{t.account.loginIntro}</p>
      <div className="card p-6">
        <Suspense>
          <CustomerLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
