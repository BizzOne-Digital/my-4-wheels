import type { Metadata } from "next";
import { Clock, MapPin, Phone, Mail } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.contactTitle, description: t.pages.contactIntro, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const { t, locale } = await getDict();
  const s = await getSettings();
  const address = `${s.street}, ${s.city}, ${s.region} ${s.postalCode}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <>
      <PageHero eyebrow={t.nav.contact} title={t.pages.contactTitle} intro={t.pages.contactIntro} />
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <a href={`tel:${s.phoneE164}`} className="card flex items-center gap-4 p-5 hover:border-brand">
            <Phone className="h-6 w-6 text-brand" aria-hidden />
            <span>
              <span className="block text-xs text-neutral-500">{t.common.callUs}</span>
              <span className="text-xl font-bold">{s.phone}</span>
            </span>
          </a>
          <div className="card flex items-start gap-4 p-5">
            <MapPin className="h-6 w-6 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-semibold">{address}</p>
              <a href={map} target="_blank" rel="noopener noreferrer" className="link-red mt-2">{t.common.getDirections}</a>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <Clock className="h-6 w-6 text-brand" aria-hidden />
            <p className="font-semibold">{l(s.hoursText, locale)}</p>
          </div>
          {s.email && s.emailVerified && (
            <a href={`mailto:${s.email}`} className="card flex items-center gap-4 p-5 hover:border-brand">
              <Mail className="h-6 w-6 text-brand" aria-hidden />
              <span className="font-semibold">{s.email}</span>
            </a>
          )}
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">{t.form.sendMessage}</h2>
          <InquiryForm variant="contact" />
        </div>
      </div>
    </>
  );
}
