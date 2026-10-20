import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Receipt, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { RichText } from "@/components/site/RichText";
import { getDict } from "@/lib/i18n/server";
import { pageContent } from "@/lib/queries";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.aboutTitle, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const { t, locale } = await getDict();
  const [page, owner] = await Promise.all([pageContent("about.main"), pageContent("about.owner")]);
  const showOwner = Boolean(owner?.visible && l(owner.title, locale));
  const icons = [BadgeCheck, Receipt, Users];
  return (
    <>
      <PageHero eyebrow={l(page?.eyebrow, locale) || t.pages.aboutEyebrow} title={l(page?.title, locale) || t.pages.aboutTitle} image={IMG.garage} />
      <section className="container-site grid items-start gap-10 py-14 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
          <SafeImage src={page?.image || IMG.about} alt={l(page?.imageAlt, locale) || t.aboutPreview.imageAlt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="h-section">{t.aboutPreview.title}</h2>
          <div className="mt-5">
            <RichText text={l(page?.body, locale)} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/inventory" className="btn-primary">{t.hero.explore}</Link>
            <Link href="/contact" className="btn-outline">{t.nav.contact}</Link>
          </div>
        </div>
      </section>
      {showOwner && owner && (
        <section className="bg-ink py-16 text-white" aria-labelledby="owner-title">
          <div className={`container-site grid items-center gap-10 ${owner.image ? "md:grid-cols-[minmax(0,360px)_1fr]" : "max-w-3xl"}`}>
            {owner.image && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-[4px] bg-white/5">
                <SafeImage src={owner.image} alt={l(owner.imageAlt, locale) || l(owner.title, locale)} fill sizes="360px" className="object-cover" />
              </div>
            )}
            <div>
              <p className="eyebrow">{l(owner.eyebrow, locale) || t.pages.ownerEyebrow}</p>
              <h2 id="owner-title" className="h-section mt-2">{l(owner.title, locale)}</h2>
              {l(owner.subtitle, locale) && <p className="mt-1 font-semibold text-brand">{l(owner.subtitle, locale)}</p>}
              <div className="mt-5 [&_p]:text-white/80">
                <RichText text={l(owner.body, locale)} />
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="bg-mist py-14">
        <ul className="container-site grid gap-6 md:grid-cols-3">
          {t.pages.values.map((v, i) => {
            const Icon = icons[i];
            return (
              <li key={v.title} className="card p-6">
                <Icon className="h-8 w-8 text-brand" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{v.text}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
