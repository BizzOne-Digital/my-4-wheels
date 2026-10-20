import type { Metadata } from "next";
import { Briefcase, Clock, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EmptyState } from "@/components/site/EmptyState";
import { RichText } from "@/components/site/RichText";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { openJobs } from "@/lib/queries";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.careersTitle, description: t.pages.careersIntro, alternates: { canonical: "/careers" } };
}

export default async function CareersPage() {
  const { t, locale } = await getDict();
  const jobs = await openJobs();
  return (
    <>
      <PageHero eyebrow={t.footer.careers} title={t.pages.careersTitle} intro={t.pages.careersIntro} image={IMG.about} />
      <section className="container-site py-14" aria-labelledby="jobs-title">
        <h2 id="jobs-title" className="h-section">{t.pages.openPositions}</h2>
        {jobs.length ? (
          <ul className="mt-8 space-y-5">
            {jobs.map((j) => (
              <li key={j.slug} id={j.slug} className="card scroll-mt-28 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{l(j.title, locale)}</h3>
                    <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand" aria-hidden /> {j.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand" aria-hidden /> {t.pages.jobTypes[j.type as "full-time"]}</span>
                    </p>
                  </div>
                </div>
                {l(j.summary, locale) && <p className="mt-4 text-neutral-700">{l(j.summary, locale)}</p>}
                <details className="group mt-5">
                  <summary className="btn-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden">{t.pages.viewAndApply}</summary>
                  <div className="mt-6 grid gap-8 lg:grid-cols-2">
                    <RichText text={l(j.description, locale)} />
                    <div>
                      <h4 className="mb-4 font-bold">{t.pages.applyFor} {l(j.title, locale)}</h4>
                      <InquiryForm variant="careers" offerTitle={l(j.title, "en")} />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <EmptyState icon={Briefcase} title={t.pages.careersEmptyTitle} text={t.pages.careersEmptyText} />
          </div>
        )}
      </section>
      <section className="bg-mist py-14" aria-labelledby="general-app">
        <div className="container-site max-w-3xl">
          <h2 id="general-app" className="h-section">{t.pages.generalApplication}</h2>
          <p className="mb-6 mt-2 text-sm text-neutral-600">{t.pages.generalApplicationText}</p>
          <div className="card p-6 sm:p-8">
            <InquiryForm variant="careers" />
          </div>
        </div>
      </section>
    </>
  );
}
