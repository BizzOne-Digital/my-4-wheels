import type { Metadata } from "next";
import { MessageSquareQuote, Star } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EmptyState } from "@/components/site/EmptyState";
import { TestimonialForm } from "@/components/forms/TestimonialForm";
import { getDict } from "@/lib/i18n/server";
import { publishedTestimonials } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.testimonialsTitle, alternates: { canonical: "/testimonials" } };
}

export default async function TestimonialsPage() {
  const { t } = await getDict();
  const items = await publishedTestimonials();
  return (
    <>
      <PageHero eyebrow={t.footer.testimonials} title={t.pages.testimonialsTitle} />
      <section className="container-site py-14">
        {items.length ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => (
              <li key={String(x._id)} className="card flex flex-col p-6">
                {x.rating ? (
                  <p className="flex gap-0.5" aria-label={`${x.rating} / 5`}>
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < x.rating! ? "fill-brand text-brand" : "text-neutral-300"}`} aria-hidden />)}
                  </p>
                ) : null}
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-neutral-700">“{x.quote}”</blockquote>
                <p className="mt-4 text-sm font-bold">{x.name}</p>
                {(x.vehicle || x.source) && <p className="text-xs text-neutral-500">{[x.vehicle, x.source].filter(Boolean).join(" · ")}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={MessageSquareQuote} title={t.pages.testimonialsEmptyTitle} text={t.pages.testimonialsEmptyText} />
        )}
      </section>
      <section className="bg-mist py-14">
        <div className="container-site max-w-3xl">
          <h2 className="h-section">{t.pages.shareTitle}</h2>
          <p className="mb-6 mt-2 text-sm text-neutral-600">{t.pages.shareText}</p>
          <TestimonialForm />
        </div>
      </section>
    </>
  );
}
