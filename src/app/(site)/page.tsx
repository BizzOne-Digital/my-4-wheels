import Link from "next/link";
import { ArrowRight, GraduationCap, Handshake, Phone, ShieldCheck, CalendarDays } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { SearchPanel } from "@/components/site/SearchPanel";
import { VehicleCard } from "@/components/site/VehicleCard";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { activeOffers, bodyTypeCounts, enabledServices, featuredVehicles, makeModelMap, pageContent, publishedPosts, publishedTestimonials } from "@/lib/queries";
import { BodyTypes, FaqPreview, FinanceTradeCards, HowItWorks, LatestPosts, ReviewsPreview, ServicesPreview } from "@/components/site/HomeSections";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

function TradeInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M10 22l3-8c.6-1.6 2-2.6 3.7-2.6h14.6c1.7 0 3.1 1 3.7 2.6l3 8" />
      <rect x="7" y="22" width="34" height="10" rx="2" />
      <circle cx="14" cy="27" r="1.6" />
      <circle cx="34" cy="27" r="1.6" />
      <path d="M11 32v3M37 32v3M14 41h20M14 41l3-3M14 41l3 3M34 41l-3-3M34 41l-3 3" />
    </svg>
  );
}

export default async function HomePage() {
  const { t, locale } = await getDict();
  const [settings, vehicles, makeModels, offers, hero, about, cta, counts, services, reviews, posts] = await Promise.all([
    getSettings(),
    featuredVehicles(3),
    makeModelMap(),
    activeOffers(true),
    pageContent("home.hero"),
    pageContent("home.about"),
    pageContent("home.cta"),
    bodyTypeCounts(),
    enabledServices(),
    publishedTestimonials(),
    publishedPosts(),
  ]);
  const offer = offers[0];
  const benefitIcons = [ShieldCheck, Handshake, TradeInIcon];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
        <div className="absolute inset-0">
          <SafeImage
            src={hero?.image || IMG.hero}
            alt={l(hero?.imageAlt, locale) || t.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="animate-fadein object-cover object-[70%_center] md:object-[center_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-transparent md:from-ink/90 md:via-ink/35 md:to-transparent md:[background-size:70%_100%] md:bg-no-repeat" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" aria-hidden />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" aria-hidden />
        </div>
        <div className="container-site relative pb-28 pt-14 sm:pb-32 sm:pt-16 md:min-h-[560px] md:pt-20 lg:min-h-[600px] lg:pt-24">
          <h1 id="hero-title" className="animate-rise text-[44px] font-extrabold leading-[1.02] sm:text-[56px] lg:text-[60px]">
            <span className="block">{t.hero.line1}</span>
            <span className="block text-brand">{t.hero.line2}</span>
            <span className="block">{t.hero.line3}</span>
          </h1>
          <p className="mt-5 max-w-md animate-rise text-base text-white/90 [animation-delay:120ms] sm:text-[17px]">
            {l(hero?.subtitle, locale) || (
              <>
                {t.hero.sub1}
                <br />
                {t.hero.sub2}
              </>
            )}
          </p>
          <div className="mt-7 flex animate-rise flex-wrap gap-4 [animation-delay:220ms]">
            <Link href="/inventory" className="btn-primary min-w-[160px]">
              {t.hero.explore}
            </Link>
            <Link href="/booking?type=test-drive" className="btn-outline-light min-w-[160px]">
              {t.nav.bookTestDrive}
            </Link>
          </div>
          <ul className="mt-8 flex animate-rise flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/85 [animation-delay:320ms]">
            {t.hero.trust.map((x, i) => (
              <li key={x} className="flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden />}
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Search panel overlapping the hero */}
      <div className="container-site relative z-10 -mt-[72px]">
        <SearchPanel makeModels={makeModels} />
      </div>

      {/* Featured vehicles */}
      <section className="container-site pb-14 pt-12" aria-labelledby="featured-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t.featured.eyebrow}</p>
            <h2 id="featured-title" className="h-section mt-2">
              {t.featured.title}
            </h2>
          </div>
          <Link href="/inventory" className="link-red border-b border-brand pb-0.5 text-xs">
            {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        {vehicles.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v, i) => (
              <VehicleCard key={v._id} v={v} t={t} locale={locale} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-[4px] bg-mist p-6 text-sm text-neutral-600">{t.featured.empty}</p>
        )}
      </section>

      {/* Benefits */}
      <section className="bg-ink text-white" aria-label="Benefits">
        <ul className="container-site grid divide-y divide-white/15 py-4 md:grid-cols-3 md:divide-x md:divide-y-0 md:py-10">
          {t.benefits.map((b, i) => {
            const Icon = benefitIcons[i];
            return (
              <li key={b.title} className="flex items-center gap-6 py-6 md:justify-center md:px-6 md:py-0">
                <Icon className="h-12 w-12 shrink-0 text-white" strokeWidth={1.4} />
                <div>
                  <h3 className="text-[17px] font-semibold">{b.title}</h3>
                  <p className="mt-1 max-w-[220px] text-sm text-white/75">{b.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <BodyTypes t={t} counts={counts} />

      {/* About preview */}
      <section className="container-site grid items-center gap-8 py-4 md:grid-cols-[1.2fr_1fr] md:gap-12 md:py-4" aria-labelledby="about-title">
        <div className="relative -mx-4 aspect-[16/10] overflow-hidden sm:mx-0 md:my-4">
          <SafeImage
            src={about?.image || IMG.about}
            alt={l(about?.imageAlt, locale) || t.aboutPreview.imageAlt}
            fill
            sizes="(min-width:768px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="pb-10 md:py-10">
          <p className="eyebrow">{l(about?.eyebrow, locale) || t.aboutPreview.eyebrow}</p>
          <h2 id="about-title" className="h-section mt-3 max-w-sm">
            {l(about?.title, locale) || t.aboutPreview.title}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-neutral-700">{l(about?.body, locale) || t.aboutPreview.text}</p>
          <Link href="/about" className="mt-6 inline-flex items-center gap-2 border-b-2 border-brand pb-1 text-sm font-semibold text-ink hover:text-brand">
            {t.common.learnMore} <ArrowRight className="h-4 w-4 text-brand" aria-hidden />
          </Link>
        </div>
      </section>

      <HowItWorks t={t} locale={locale} />
      <ServicesPreview t={t} locale={locale} services={services as never} />

      {/* Student / homepage offer */}
      {offer && (
        <section className="bg-brand text-white" aria-labelledby="offer-title">
          <div className="container-site flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <GraduationCap className="h-12 w-12 shrink-0" strokeWidth={1.4} aria-hidden />
              <span className="hidden h-12 w-px bg-white/40 sm:block" aria-hidden />
              <div>
                <h2 id="offer-title" className="text-2xl font-extrabold leading-tight">
                  {l(offer.title, locale)}
                </h2>
                {l(offer.subtitle, locale) && <p className="mt-0.5 text-sm text-white/90">{l(offer.subtitle, locale)}</p>}
              </div>
            </div>
            <Link href={`/offers#${offer.slug}`} className="btn-white self-start sm:self-auto">
              {t.offer.explore} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <div className="pt-16" />
      <FinanceTradeCards t={t} locale={locale} />
      <ReviewsPreview t={t} reviews={reviews as never} />
      <FaqPreview t={t} locale={locale} />
      <LatestPosts t={t} locale={locale} posts={posts as never} />

      {/* Booking CTA */}
      <section className="relative overflow-hidden bg-ink text-white" aria-labelledby="cta-title">
        <SafeImage src={cta?.image || IMG.cta} alt={l(cta?.imageAlt, locale) || t.cta.imageAlt} fill sizes="100vw" className="object-cover object-[70%_center] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" aria-hidden />
        <div className="container-site relative py-12 sm:py-14">
          <h2 id="cta-title" className="text-3xl font-extrabold sm:text-[34px]">
            {l(cta?.title, locale) || t.cta.title}
          </h2>
          <p className="mt-2 text-white/85">{l(cta?.subtitle, locale) || t.cta.text}</p>
          <div className="mt-7 flex flex-wrap items-center gap-6 sm:gap-8">
            <Link href="/booking" className="btn-primary min-w-[196px]">
              <CalendarDays className="h-4 w-4" aria-hidden /> {t.cta.button}
            </Link>
            <span className="hidden h-10 w-px bg-white/30 sm:block" aria-hidden />
            <a href={`tel:${settings.phoneE164}`} className="flex items-center gap-3 text-xl font-bold hover:text-white/80">
              <Phone className="h-5 w-5" aria-hidden />
              <span>
                <span className="sr-only">{t.common.callUs}: </span>
                {settings.phone}
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
