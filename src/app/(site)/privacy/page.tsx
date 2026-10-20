import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { privacySections } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.privacyTitle, alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  const { t, locale } = await getDict();
  const s = await getSettings();
  const sections = privacySections(locale, { name: s.businessName, email: s.emailVerified ? s.email : "", phone: s.phone, address: `${s.street}, ${s.city}, ${s.region} ${s.postalCode}` });
  return (
    <>
      <PageHero title={t.pages.privacyTitle} />
      <div className="container-site prose-m4w max-w-3xl py-14">
        {sections.map((x) => (
          <section key={x.h}>
            <h2>{x.h}</h2>
            {x.p.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </div>
    </>
  );
}
