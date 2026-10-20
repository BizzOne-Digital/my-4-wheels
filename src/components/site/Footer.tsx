import Link from "next/link";
import { Clock, Globe, MapPin, Mail, Phone } from "lucide-react";
import { Logo } from "../Logo";
import { SocialLinks } from "./SocialLinks";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  t: Dictionary;
  logo?: string;
  website: string;
  address: string;
  mapUrl: string;
  hours: string;
  phone: string;
  phoneHref: string;
  email?: string;
  social: Record<string, string>;
};

export function Footer({ t, logo, website, address, mapUrl, hours, phone, phoneHref, email, social }: Props) {
  const quick = [
    { href: "/faq", label: t.footer.faq },
    { href: "/pricing", label: t.footer.pricing },
    { href: "/blog", label: t.footer.blog },
    { href: "/team", label: t.footer.team },
    { href: "/testimonials", label: t.footer.testimonials },
    { href: "/offers", label: t.footer.offers },
    { href: "/careers", label: t.footer.careers },
  ];
  const explore = [
    { href: "/inventory", label: t.nav.inventory },
    { href: "/services", label: t.nav.services },
    { href: "/financing", label: t.footer.financing },
    { href: "/trade-in", label: t.footer.tradeIn },
    { href: "/sell-your-car", label: t.footer.sell },
    { href: "/booking", label: t.footer.booking },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];
  const socials = Object.entries(social).filter(([, v]) => v);
  return (
    <footer className="bg-ink text-white">
      <div className="container-site grid gap-10 border-t border-white/10 py-12 md:grid-cols-[1.1fr_1.4fr_1.5fr] md:gap-8">
        <div>
          <Link href="/" aria-label="My 4 Wheels home">
            <Logo variant="dark" uploaded={logo} className="h-14 w-[200px]" />
          </Link>
          {socials.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">{t.footer.followUs}</p>
              <SocialLinks social={social} iconClass="h-5 w-5" className="gap-4 text-white/80" />
            </div>
          )}
        </div>
        <address className="space-y-3 text-sm not-italic text-white/80 md:border-r md:border-white/15 md:pr-8">
          <p className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {website}
          </p>
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {address}
            </a>
          </p>
          <p className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {hours}
          </p>
          <p className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <a href={phoneHref} className="hover:text-white">
              {phone}
            </a>
          </p>
          {email && (
            <p className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </p>
          )}
        </address>
        <div className="grid grid-cols-2 gap-6">
          <nav aria-label={t.footer.quickLinks}>
            <h2 className="mb-3 text-sm font-semibold">{t.footer.quickLinks}</h2>
            <ul className="space-y-2 text-sm text-white/75">
              {quick.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.footer.explore}>
            <h2 className="mb-3 text-sm font-semibold">{t.footer.explore}</h2>
            <ul className="space-y-2 text-sm text-white/75">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} My 4 Wheels. {t.footer.rights}
          </p>
          <p className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t.footer.terms}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
