import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { IMG } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.financingTitle, description: t.pages.financingIntro, alternates: { canonical: "/financing" } };
}

export default async function FinancingPage() {
  const { t } = await getDict();
  return (
    <>
      <PageHero eyebrow={t.footer.financing} title={t.pages.financingTitle} intro={t.pages.financingIntro} image={IMG.road} />
      <div className="container-site grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <h2 className="h-section">{t.pages.howItWorks}</h2>
          <ol className="mt-6 space-y-5">
            {t.pages.financingSteps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                <p className="pt-1 text-neutral-700">{s}</p>
              </li>
            ))}
          </ol>
          <Link href="/booking?type=financing" className="btn-primary mt-8">{t.pages.bookConsult}</Link>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">{t.pages.financingForm}</h2>
          <InquiryForm variant="financing" />
        </div>
      </div>
    </>
  );
}
