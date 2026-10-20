import Link from "next/link";
import { ContactStrip } from "@/components/site/ContactStrip";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { l } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getDict();
  const s = await getSettings();
  const address = `${s.street}, ${s.city}`;
  const fullAddress = `${s.street}, ${s.city}, ${s.region} ${s.postalCode}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const hours = l(s.hoursText, locale);
  const phoneHref = `tel:${s.phoneE164}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://my4wheels.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: s.businessName,
    url: siteUrl,
    telephone: s.phoneE164,
    ...(s.email && s.emailVerified ? { email: s.email } : {}),
    address: { "@type": "PostalAddress", streetAddress: s.street, addressLocality: s.city, addressRegion: s.region, postalCode: s.postalCode, addressCountry: s.country },
    openingHoursSpecification: s.booking.weekly
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => d.open)
      .map(({ d, i }) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i],
        opens: d.start,
        closes: d.end,
      })),
    currenciesAccepted: "CAD",
  };
  return (
    <>
      <a href="#main" className="sr-only z-50 bg-white p-3 focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        {t.nav.skip}
      </a>
      <ContactStrip address={address} hours={hours} mapUrl={mapUrl} />
      <Header logo={s.logo} phone={s.phone} phoneHref={phoneHref} />
      <main id="main">{children}</main>
      <Footer
        t={t}
        logo={s.logoDark}
        website={s.website}
        address={fullAddress}
        mapUrl={mapUrl}
        hours={hours}
        phone={s.phone}
        phoneHref={phoneHref}
        email={s.emailVerified ? s.email : ""}
        social={s.social as Record<string, string>}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <noscript>
        <p className="p-4 text-center text-sm">
          <Link href="/contact">Contact</Link>
        </p>
      </noscript>
    </>
  );
}
