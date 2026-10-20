import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, FileText, Info, Phone } from "lucide-react";
import { VehicleGallery } from "@/components/site/VehicleGallery";
import { VehicleCard } from "@/components/site/VehicleCard";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { RichText } from "@/components/site/RichText";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { relatedVehicles, vehicleBySlug } from "@/lib/queries";
import { formatKm, formatPrice, l, vehicleTitle } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getDict();
  const v = await vehicleBySlug((await params).slug);
  if (!v) return {};
  const title = vehicleTitle(v);
  return {
    title,
    description: `${title} · ${formatPrice(v.price, locale)} · ${formatKm(v.mileage, locale)}. ${l(v.description, locale).slice(0, 120)}`,
    alternates: { canonical: `/inventory/${v.slug}` },
    openGraph: v.images[0] ? { images: [{ url: v.images[0] }] } : undefined,
  };
}

export default async function VehiclePage({ params }: Props) {
  const { t, locale } = await getDict();
  const v = await vehicleBySlug((await params).slug);
  if (!v) notFound();
  const [related, settings] = await Promise.all([relatedVehicles({ _id: String(v._id), bodyType: v.bodyType, price: v.price }), getSettings()]);
  const title = vehicleTitle(v);
  const specs: [string, string | number | undefined][] = [
    [t.vehicle.year, v.year],
    [t.vehicle.make, v.make],
    [t.vehicle.model, v.model],
    [t.vehicle.trim, v.trim],
    [t.vehicle.mileage, formatKm(v.mileage, locale)],
    [t.vehicle.bodyType, t.body[v.bodyType as "sedan"]],
    [t.vehicle.transmission, t.trans[v.transmission as "automatic"]],
    [t.vehicle.fuel, t.fuel[v.fuelType as "gasoline"]],
    [t.vehicle.drivetrain, v.drivetrain],
    [t.vehicle.engine, v.engine],
    [t.vehicle.exterior, v.exteriorColor],
    [t.vehicle.interior, v.interiorColor],
    [t.vehicle.vin, v.vin],
    [t.vehicle.stock, v.stockNumber],
  ];
  const description = l(v.description, locale);
  const inspection = l(v.inspectionNotes, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: v.make,
    model: v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    ...(v.vin ? { vehicleIdentificationNumber: v.vin } : {}),
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "CAD",
      availability: v.status === "available" ? "https://schema.org/InStock" : v.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/LimitedAvailability",
    },
  };

  return (
    <>
      <div className="container-site py-6 text-xs text-neutral-500">
        <Link href="/inventory" className="hover:text-brand">{t.nav.inventory}</Link> <span aria-hidden>/</span> <span className="text-ink">{title}</span>
      </div>
      <div className="container-site grid gap-10 pb-14 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <VehicleGallery images={v.images} title={title} illustrative={Boolean(v.isDemo || v.imagesIllustrative)} />
          {(v.isDemo || v.imagesIllustrative) && (
            <p className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {t.vehicle.illustrativeNote}
            </p>
          )}
          {description && (
            <section className="mt-10" aria-labelledby="desc">
              <h2 id="desc" className="mb-3 text-xl font-bold">{t.vehicle.description}</h2>
              <RichText text={description} />
            </section>
          )}
          <section className="mt-10" aria-labelledby="specs">
            <h2 id="specs" className="mb-4 text-xl font-bold">{t.vehicle.specs}</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specs.filter(([, val]) => val !== undefined && val !== "").map(([k, val]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-neutral-200 py-2.5 text-sm">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-right font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          </section>
          {v.features.length > 0 && (
            <section className="mt-10" aria-labelledby="features">
              <h2 id="features" className="mb-4 text-xl font-bold">{t.vehicle.features}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {v.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {inspection && (
            <section className="mt-10" aria-labelledby="inspection">
              <h2 id="inspection" className="mb-3 text-xl font-bold">{t.vehicle.inspection}</h2>
              <RichText text={inspection} />
            </section>
          )}
          {v.historyReportUrl && (
            <section className="mt-10 flex items-center justify-between gap-4 rounded-[4px] bg-mist p-5">
              <p className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5 text-brand" aria-hidden /> {t.vehicle.history}</p>
              <a href={v.historyReportUrl} target="_blank" rel="noopener noreferrer" className="link-red">{t.vehicle.viewReport}</a>
            </section>
          )}
        </div>
        <aside className="space-y-6">
          <div className="card p-6 lg:sticky lg:top-24">
            {v.status !== "available" && (
              <p className={`mb-3 inline-block rounded-[2px] px-2 py-1 text-[11px] font-bold uppercase text-white ${v.status === "sold" ? "bg-ink" : "bg-brand"}`}>{t.status[v.status as "sold"]}</p>
            )}
            <h1 className="text-2xl font-extrabold">{title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {formatKm(v.mileage, locale)} · {t.trans[v.transmission as "automatic"]}
            </p>
            <p className="mt-4 text-3xl font-extrabold text-brand">{formatPrice(v.price, locale)}</p>
            {v.status === "sold" && <p className="mt-3 text-sm text-neutral-600">{t.vehicle.soldNote}</p>}
            {v.status === "reserved" && <p className="mt-3 text-sm text-neutral-600">{t.vehicle.reservedNote}</p>}
            <div className="mt-6 grid gap-3">
              {v.status !== "sold" && (
                <Link href={`/booking?type=test-drive&vehicle=${v._id}`} className="btn-primary">
                  <CalendarDays className="h-4 w-4" aria-hidden /> {t.vehicle.bookTestDrive}
                </Link>
              )}
              <a href={`tel:${settings.phoneE164}`} className="btn-outline">
                <Phone className="h-4 w-4" aria-hidden /> {settings.phone}
              </a>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold">{t.vehicle.ask}</h2>
            <InquiryForm variant="vehicle" vehicleId={String(v._id)} />
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="bg-mist py-14" aria-labelledby="related">
          <div className="container-site">
            <h2 id="related" className="h-section">{t.vehicle.related}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <VehicleCard key={r._id} v={r} t={t} locale={locale} />)}
            </div>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
