import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { serviceBySlug } from "@/lib/queries";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getDict();
  const s = await serviceBySlug((await params).slug);
  return s ? { title: l(s.title, locale), description: l(s.summary, locale), alternates: { canonical: `/services/${s.slug}` } } : {};
}

export default async function ServicePage({ params }: Props) {
  const { t, locale } = await getDict();
  const s = await serviceBySlug((await params).slug);
  if (!s) notFound();
  const price = l(s.priceNote, locale);
  const bookingType = s.slug === "car-financing" ? "financing" : s.slug === "trade-ins" ? "trade-in" : s.slug === "test-drives" ? "test-drive" : "visit";
  return (
    <>
      <PageHero eyebrow={t.nav.services} title={l(s.title, locale)} intro={l(s.summary, locale)} image={s.image || IMG.inspection} />
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <RichText text={l(s.body, locale) || l(s.summary, locale)} />
          <p className="mt-6 text-sm">
            <strong>{t.footer.pricing}:</strong> {price || t.common.contactForDetails}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/booking?type=${bookingType}`} className="btn-primary">{t.cta.button}</Link>
            <Link href="/services" className="btn-outline">{t.common.back}</Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold">{t.pages.contactTitle}</h2>
          <InquiryForm variant="contact" />
        </div>
      </div>
    </>
  );
}
