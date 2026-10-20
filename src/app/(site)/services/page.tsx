import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { EmptyState } from "@/components/site/EmptyState";
import { getDict } from "@/lib/i18n/server";
import { enabledServices } from "@/lib/queries";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.servicesTitle, description: t.pages.servicesIntro, alternates: { canonical: "/services" } };
}

export default async function ServicesPage() {
  const { t, locale } = await getDict();
  const services = await enabledServices();
  return (
    <>
      <PageHero eyebrow={t.nav.services} title={t.pages.servicesTitle} intro={t.pages.servicesIntro} image={IMG.inspection} />
      <section className="container-site py-14">
        {services.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} className="card flex flex-col p-6">
                <ServiceIcon name={s.icon} className="h-9 w-9 text-brand" />
                <h2 className="mt-4 text-lg font-bold">{l(s.title, locale)}</h2>
                <p className="mt-2 flex-1 text-sm text-neutral-600">{l(s.summary, locale)}</p>
                <Link href={`/services/${s.slug}`} className="link-red mt-4">
                  {t.common.learnMore} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Wrench} title={t.pages.servicesEmpty}>
            <Link href="/contact" className="btn-primary">{t.nav.contact}</Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
