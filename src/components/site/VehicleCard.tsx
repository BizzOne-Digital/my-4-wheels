import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export type VehicleCardData = {
  _id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  transmission: string;
  images: string[];
  status: string;
  isDemo?: boolean;
  imagesIllustrative?: boolean;
};

export function VehicleCard({ v, t, locale, priority }: { v: VehicleCardData; t: Dictionary; locale: Locale; priority?: boolean }) {
  const title = vehicleTitle({ year: v.year, make: v.make, model: v.model });
  return (
    <article className="card group flex flex-col">
      <Link href={`/inventory/${v.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-neutral-100" tabIndex={-1} aria-hidden>
        <SafeImage
          src={v.images?.[0]}
          alt=""
          fill
          priority={priority}
          sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {v.status !== "available" && (
          <span className={`absolute left-3 top-3 rounded-[2px] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${v.status === "sold" ? "bg-ink" : "bg-brand"}`}>
            {t.status[v.status as "sold"]}
          </span>
        )}
        {(v.isDemo || v.imagesIllustrative) && (
          <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/90">{t.common.illustrative}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-5 pb-4 pt-3.5">
        <h3 className="text-[17px] font-bold">
          <Link href={`/inventory/${v.slug}`} className="hover:text-brand">
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          {formatKm(v.mileage, locale)} <span className="mx-2 text-neutral-300">|</span> {t.trans[v.transmission as "automatic"] ?? v.transmission}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-lg font-extrabold text-brand">{formatPrice(v.price, locale)}</p>
          <Link href={`/inventory/${v.slug}`} className="link-red text-xs" aria-label={`${t.common.viewDetails}: ${title}`}>
            {t.common.viewDetails} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
