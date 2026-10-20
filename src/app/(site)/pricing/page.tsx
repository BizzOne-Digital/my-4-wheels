import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { getDict } from "@/lib/i18n/server";
import { enabledServices, searchVehicles } from "@/lib/queries";
import { formatKm, formatPrice, l, vehicleTitle } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.pricingTitle, alternates: { canonical: "/pricing" } };
}

export default async function PricingPage() {
  const { t, locale } = await getDict();
  const [{ items }, services] = await Promise.all([searchVehicles({ sort: "price-asc" }), enabledServices()]);
  return (
    <>
      <PageHero eyebrow={t.footer.pricing} title={t.pages.pricingTitle} intro={t.pages.pricingIntro} />
      <section className="container-site grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <ul className="space-y-3">
            {t.pages.pricingPoints.map((p) => (
              <li key={p} className="flex gap-3 text-sm text-neutral-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden /> {p}
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-xl font-bold">{t.pages.pricingServices}</h2>
          <dl className="mt-4">
            {services.map((s) => (
              <div key={s.slug} className="flex justify-between gap-4 border-b border-neutral-200 py-3 text-sm">
                <dt><Link href={`/services/${s.slug}`} className="font-semibold hover:text-brand">{l(s.title, locale)}</Link></dt>
                <dd className="text-right text-neutral-600">{l(s.priceNote, locale) || t.common.contactForDetails}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.pages.pricingVehicles}</h2>
          <ul className="mt-4">
            {items.map((v) => (
              <li key={v._id} className="flex items-center justify-between gap-4 border-b border-neutral-200 py-3 text-sm">
                <Link href={`/inventory/${v.slug}`} className="hover:text-brand">
                  <span className="font-semibold">{vehicleTitle(v)}</span>
                  <span className="block text-xs text-neutral-500">{formatKm(v.mileage, locale)}</span>
                </Link>
                <span className="font-bold text-brand">{formatPrice(v.price, locale)}</span>
              </li>
            ))}
          </ul>
          <Link href="/inventory" className="link-red mt-4">{t.common.viewAll} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>
    </>
  );
}
