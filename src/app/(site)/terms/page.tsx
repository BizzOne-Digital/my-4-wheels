import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { getDict } from "@/lib/i18n/server";
import { termsSections } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.termsTitle, alternates: { canonical: "/terms" } };
}

export default async function TermsPage() {
  const { t, locale } = await getDict();
  return (
    <>
      <PageHero title={t.pages.termsTitle} />
      <div className="container-site prose-m4w max-w-3xl py-14">
        {termsSections(locale).map((x) => (
          <section key={x.h}>
            <h2>{x.h}</h2>
            {x.p.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </div>
    </>
  );
}
