import Link from "next/link";
import { ArrowRight, CalendarCheck, CarFront, ChevronDown, FileSignature, KeyRound, Star } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { ServiceIcon } from "./ServiceIcon";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";
import { faqItems } from "@/lib/i18n/legal";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { L10n } from "@/lib/format";

type P = { t: Dictionary; locale: Locale };

/** Body-type shortcuts into the inventory filters, with live counts. */
export function BodyTypes({ t, counts }: { t: Dictionary; counts: Record<string, number> }) {
  const types = (["sedan", "suv", "hatchback", "coupe", "truck", "minivan"] as const).filter((b) => counts[b]);
  if (!types.length) return null;
  return (
    <section className="container-site py-14" aria-labelledby="body-title">
      <p className="eyebrow">{t.home.bodyEyebrow}</p>
      <h2 id="body-title" className="h-section mt-2">{t.home.bodyTitle}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {types.map((b) => (
          <li key={b}>
            <Link href={`/inventory?body=${b}`} className="group flex flex-col items-center rounded-[4px] border border-neutral-200 bg-white px-4 py-6 text-center transition hover:border-brand hover:shadow-md">
              <CarFront className="h-9 w-9 text-ink transition group-hover:text-brand" strokeWidth={1.4} aria-hidden />
              <span className="mt-3 font-semibold">{t.body[b]}</span>
              <span className="text-xs text-neutral-500">
                {counts[b]} {counts[b] === 1 ? t.inventory.result.split(" ")[0] : t.inventory.results.split(" ")[0]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Four-step buying process. */
export function HowItWorks({ t }: P) {
  const icons = [CarFront, CalendarCheck, FileSignature, KeyRound];
  return (
    <section className="bg-mist py-16" aria-labelledby="how-title">
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.home.howEyebrow}</p>
          <h2 id="how-title" className="h-section mt-2">{t.home.howTitle}</h2>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <li key={s.title} className="relative rounded-[4px] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-neutral-100" aria-hidden>0{i + 1}</span>
                <Icon className="relative h-8 w-8 text-brand" strokeWidth={1.5} aria-hidden />
                <h3 className="relative mt-4 text-lg font-bold">{s.title}</h3>
                <p className="relative mt-2 text-sm text-neutral-600">{s.text}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/inventory" className="btn-primary">{t.hero.explore}</Link>
          <Link href="/booking?type=test-drive" className="btn-outline">{t.nav.bookTestDrive}</Link>
        </div>
      </div>
    </section>
  );
}

type Svc = { slug: string; icon: string; title: L10n; summary: L10n };

/** Enabled services from the CMS. */
export function ServicesPreview({ t, locale, services }: P & { services: Svc[] }) {
  if (!services.length) return null;
  return (
    <section className="container-site py-16" aria-labelledby="svc-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.home.servicesEyebrow}</p>
          <h2 id="svc-title" className="h-section mt-2">{t.home.servicesTitle}</h2>
        </div>
        <Link href="/services" className="link-red border-b border-brand pb-0.5 text-xs">
          {t.home.allServices} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((s) => (
          <li key={s.slug}>
            <Link href={`/services/${s.slug}`} className="group flex h-full gap-4 rounded-[4px] border border-neutral-200 p-5 transition hover:border-brand">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-brand/10">
                <ServiceIcon name={s.icon} className="h-6 w-6 text-brand" />
              </span>
              <span>
                <span className="block font-bold group-hover:text-brand">{l(s.title, locale)}</span>
                <span className="mt-1 block text-sm text-neutral-600">{l(s.summary, locale)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Two image cards for financing and trade-in. */
export function FinanceTradeCards({ t }: P) {
  const cards = [
    { href: "/financing", img: IMG.road, title: t.home.financeTitle, text: t.home.financeText, cta: t.home.financeCta },
    { href: "/trade-in", img: IMG.suvSnow, title: t.home.tradeTitle, text: t.home.tradeText, cta: t.home.tradeCta },
  ];
  return (
    <section className="container-site grid gap-6 pb-16 md:grid-cols-2" aria-label={t.home.financeTitle}>
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="group relative flex min-h-[300px] overflow-hidden rounded-[4px] bg-ink text-white">
          <SafeImage src={c.img} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover opacity-60 transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" aria-hidden />
          <div className="relative mt-auto p-7">
            <h2 className="text-2xl font-extrabold">{c.title}</h2>
            <p className="mt-2 max-w-sm text-sm text-white/85">{c.text}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
              {c.cta} <ArrowRight className="h-4 w-4 text-brand transition group-hover:translate-x-1" aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

type Review = { _id: string; name: string; quote: string; rating?: number; vehicle?: string };

/** Only genuine, published testimonials. Hidden entirely when there are none. */
export function ReviewsPreview({ t, reviews }: { t: Dictionary; reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <section className="bg-ink py-16 text-white" aria-labelledby="rev-title">
      <div className="container-site">
        <p className="eyebrow">{t.footer.testimonials}</p>
        <h2 id="rev-title" className="h-section mt-2">{t.pages.testimonialsTitle}</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <li key={r._id} className="rounded-[4px] border border-white/10 bg-white/5 p-6">
              {r.rating ? (
                <p className="flex gap-0.5" aria-label={`${r.rating} / 5`}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating! ? "fill-brand text-brand" : "text-white/20"}`} aria-hidden />)}
                </p>
              ) : null}
              <blockquote className="mt-3 text-white/85">“{r.quote}”</blockquote>
              <p className="mt-4 text-sm font-bold">{r.name}</p>
              {r.vehicle && <p className="text-xs text-white/60">{r.vehicle}</p>}
            </li>
          ))}
        </ul>
        <Link href="/testimonials" className="link-red mt-6">{t.home.allReviews} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </div>
    </section>
  );
}

/** Short FAQ preview from the same source as the FAQ page. */
export function FaqPreview({ t, locale }: P) {
  const items = faqItems(locale).slice(0, 4);
  return (
    <section className="container-site grid gap-10 py-16 lg:grid-cols-[1fr_1.6fr]" aria-labelledby="faq-title">
      <div>
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-title" className="h-section mt-2">{t.home.faqTitle}</h2>
        <p className="mt-3 text-neutral-600">{t.home.faqText}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/faq" className="btn-outline">{t.home.allFaq}</Link>
          <Link href="/contact" className="btn-primary">{t.nav.contact}</Link>
        </div>
      </div>
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
    </section>
  );
}

type Post = { slug: string; title: L10n; excerpt: L10n; coverImage?: string; category: string };

/** Latest published articles. Hidden when none are published. */
export function LatestPosts({ t, locale, posts }: P & { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="bg-mist py-16" aria-labelledby="blog-title">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t.footer.blog}</p>
            <h2 id="blog-title" className="h-section mt-2">{t.home.blogTitle}</h2>
          </div>
          <Link href="/blog" className="link-red text-xs">{t.home.allPosts} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <li key={p.slug} className="card">
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="relative aspect-[16/9]"><SafeImage src={p.coverImage} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /></div>
                <div className="p-5">
                  <h3 className="font-bold hover:text-brand">{l(p.title, locale)}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{l(p.excerpt, locale)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
