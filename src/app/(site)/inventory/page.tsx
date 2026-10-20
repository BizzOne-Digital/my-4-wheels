import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { VehicleCard } from "@/components/site/VehicleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { getDict } from "@/lib/i18n/server";
import { makeModelMap, searchVehicles, type InventoryParams } from "@/lib/queries";
import { BODY_TYPES, TRANSMISSIONS } from "@/models/Vehicle";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.inventory.title, description: t.inventory.intro, alternates: { canonical: "/inventory" } };
}

const KEYS = ["q", "make", "model", "minPrice", "maxPrice", "minYear", "maxYear", "maxMileage", "body", "transmission", "sort", "page", "sold"] as const;

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getDict();
  const raw = await searchParams;
  const params: InventoryParams = {};
  for (const k of KEYS) {
    const v = raw[k];
    if (typeof v === "string" && v) params[k] = v.slice(0, 80);
  }
  const [{ items, total, page, pages }, makeModels] = await Promise.all([searchVehicles(params), makeModelMap()]);
  const makes = Object.keys(makeModels).sort();
  const models = params.make ? makeModels[params.make] ?? [] : [...new Set(Object.values(makeModels).flat())].sort();
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter(([k]) => k !== "page") as [string, string][]);
    if (p > 1) sp.set("page", String(p));
    return `/inventory${sp.toString() ? `?${sp}` : ""}`;
  };
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i);

  return (
    <>
      <PageHero eyebrow={t.inventory.eyebrow} title={t.inventory.title} intro={t.inventory.intro} />
      <div className="container-site grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside aria-label={t.inventory.filters}>
          <form method="get" action="/inventory" className="card space-y-4 p-5 lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="h-4 w-4 text-brand" aria-hidden /> {t.inventory.filters}
            </h2>
            <div>
              <label htmlFor="f-q" className="label">{t.inventory.keyword}</label>
              <input id="f-q" name="q" defaultValue={params.q} placeholder={t.inventory.keywordPh} className="input" />
            </div>
            <div>
              <label htmlFor="f-make" className="label">{t.search.make}</label>
              <select id="f-make" name="make" defaultValue={params.make ?? ""} className="input">
                <option value="">{t.search.allMakes}</option>
                {makes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-model" className="label">{t.search.model}</label>
              <select id="f-model" name="model" defaultValue={params.model ?? ""} className="input">
                <option value="">{t.search.allModels}</option>
                {models.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="f-minp" className="label">{t.inventory.minPrice}</label>
                <input id="f-minp" name="minPrice" inputMode="numeric" pattern="\d*" defaultValue={params.minPrice} className="input" />
              </div>
              <div>
                <label htmlFor="f-maxp" className="label">{t.inventory.maxPrice}</label>
                <input id="f-maxp" name="maxPrice" inputMode="numeric" pattern="\d*" defaultValue={params.maxPrice} className="input" />
              </div>
              <div>
                <label htmlFor="f-miny" className="label">{t.inventory.minYear}</label>
                <select id="f-miny" name="minYear" defaultValue={params.minYear ?? ""} className="input">
                  <option value="">{t.inventory.any}</option>
                  {years.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-maxy" className="label">{t.inventory.maxYear}</label>
                <select id="f-maxy" name="maxYear" defaultValue={params.maxYear ?? ""} className="input">
                  <option value="">{t.inventory.any}</option>
                  {years.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="f-km" className="label">{t.inventory.maxMileage}</label>
              <select id="f-km" name="maxMileage" defaultValue={params.maxMileage ?? ""} className="input">
                <option value="">{t.inventory.any}</option>
                {[25000, 50000, 75000, 100000, 150000, 200000].map((k) => (
                  <option key={k} value={k}>{new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA").format(k)} km</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-body" className="label">{t.inventory.bodyType}</label>
              <select id="f-body" name="body" defaultValue={params.body ?? ""} className="input">
                <option value="">{t.inventory.any}</option>
                {BODY_TYPES.map((b) => <option key={b} value={b}>{t.body[b]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-tr" className="label">{t.inventory.transmission}</label>
              <select id="f-tr" name="transmission" defaultValue={params.transmission ?? ""} className="input">
                <option value="">{t.inventory.any}</option>
                {TRANSMISSIONS.map((b) => <option key={b} value={b}>{t.trans[b]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-sort" className="label">{t.inventory.sort}</label>
              <select id="f-sort" name="sort" defaultValue={params.sort ?? "newest"} className="input">
                <option value="newest">{t.inventory.sortNewest}</option>
                <option value="price-asc">{t.inventory.sortPriceAsc}</option>
                <option value="price-desc">{t.inventory.sortPriceDesc}</option>
                <option value="mileage">{t.inventory.sortMileage}</option>
                <option value="year">{t.inventory.sortYear}</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="sold" value="1" defaultChecked={params.sold === "1"} className="h-4 w-4 accent-brand" /> {t.inventory.showSold}
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 px-3">{t.inventory.apply}</button>
              <Link href="/inventory" className="btn-outline px-3">{t.inventory.reset}</Link>
            </div>
          </form>
        </aside>
        <section aria-labelledby="results-title">
          <h2 id="results-title" className="text-sm text-neutral-600" aria-live="polite">
            <strong className="text-ink">{total}</strong> {total === 1 ? t.inventory.result : t.inventory.results}
          </h2>
          {items.length ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((v, i) => <VehicleCard key={v._id} v={v} t={t} locale={locale} priority={i < 3} />)}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={SearchX} title={t.inventory.emptyTitle} text={t.inventory.emptyText}>
                <Link href="/inventory" className="btn-outline">{t.inventory.reset}</Link>
                <Link href="/contact" className="btn-primary">{t.nav.contact}</Link>
              </EmptyState>
            </div>
          )}
          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && <Link href={pageHref(page - 1)} className="btn-outline btn-sm" rel="prev">{t.common.previous}</Link>}
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={pageHref(p)} aria-current={p === page ? "page" : undefined} className={`flex h-8 min-w-8 items-center justify-center rounded-[3px] px-2 text-sm font-semibold ${p === page ? "bg-brand text-white" : "hover:bg-mist"}`}>
                  {p}
                </Link>
              ))}
              {page < pages && <Link href={pageHref(page + 1)} className="btn-outline btn-sm" rel="next">{t.common.next}</Link>}
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
