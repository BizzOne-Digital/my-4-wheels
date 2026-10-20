import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { getDict } from "@/lib/i18n/server";
import { faqItems } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.faqTitle, alternates: { canonical: "/faq" } };
}

export default async function FaqPage() {
  const { t, locale } = await getDict();
  const items = faqItems(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <PageHero eyebrow="FAQ" title={t.pages.faqTitle} />
      <section className="container-site max-w-3xl py-14">
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((i) => (
            <details key={i.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {i.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{i.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">{t.nav.contact}</Link>
          <Link href="/booking" className="btn-outline">{t.cta.button}</Link>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
