import type { Metadata } from "next";
import { Check, GraduationCap, Tag } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { EmptyState } from "@/components/site/EmptyState";
import { RichText } from "@/components/site/RichText";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { activeOffers } from "@/lib/queries";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.offersTitle, alternates: { canonical: "/offers" } };
}

export default async function OffersPage() {
  const { t, locale } = await getDict();
  const offers = await activeOffers();
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long", timeZone: "America/Toronto" });
  return (
    <>
      <PageHero eyebrow={t.footer.offers} title={t.pages.offersTitle} />
      <section className="container-site space-y-10 py-14">
        {offers.length ? (
          offers.map((o) => {
            const conditions = l(o.eligibility, locale).split("\n").map((x) => x.trim()).filter(Boolean);
            return (
              <article key={o.slug} id={o.slug} className="card grid scroll-mt-28 md:grid-cols-[1fr_1.4fr]">
                <div className="relative flex min-h-[200px] items-center justify-center bg-brand text-white">
                  {o.image ? <SafeImage src={o.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" /> : <GraduationCap className="h-20 w-20" strokeWidth={1.2} aria-hidden />}
                </div>
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold">{l(o.title, locale)}</h2>
                  {l(o.subtitle, locale) && <p className="mt-1 text-neutral-600">{l(o.subtitle, locale)}</p>}
                  <div className="mt-4"><RichText text={l(o.body, locale)} /></div>
                  {conditions.length > 0 && (
                    <>
                      <h3 className="mt-4 font-bold">{t.pages.eligibility}</h3>
                      <ul className="mt-2 space-y-1.5">
                        {conditions.map((c) => <li key={c} className="flex gap-2 text-sm text-neutral-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden /> {c}</li>)}
                      </ul>
                    </>
                  )}
                  {o.expiresAt && <p className="mt-4 text-xs text-neutral-500">{t.pages.expires} {fmt.format(new Date(o.expiresAt))}</p>}
                  <details className="mt-6">
                    <summary className="btn-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden">{t.pages.askOffer}</summary>
                    <div className="mt-5"><InquiryForm variant="offer" offerTitle={l(o.title, "en")} /></div>
                  </details>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState icon={Tag} title={t.pages.offersTitle} text={t.pages.offersEmpty} />
        )}
      </section>
    </>
  );
}
