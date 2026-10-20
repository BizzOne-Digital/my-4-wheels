"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { useI18n } from "@/lib/i18n/client";

export function VehicleGallery({ images, title, illustrative }: { images: string[]; title: string; illustrative: boolean }) {
  const { t } = useI18n();
  const list = images.length ? images : [""];
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + list.length) % list.length);
  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-neutral-100"
        tabIndex={list.length > 1 ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        aria-roledescription="carousel"
        aria-label={title}
      >
        <SafeImage src={list[i]} alt={`${title} – ${t.vehicle.photo} ${i + 1} ${t.vehicle.of} ${list.length}`} fill priority sizes="(min-width:1024px) 720px, 100vw" className="object-cover" />
        {illustrative && <span className="absolute bottom-3 left-3 rounded-[2px] bg-black/65 px-2 py-1 text-[11px] text-white">{t.common.illustrative}</span>}
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label={t.common.previous}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label={t.common.next}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="absolute bottom-3 right-3 rounded-[2px] bg-black/65 px-2 py-1 text-xs text-white" aria-live="polite">
              {i + 1} / {list.length}
            </p>
          </>
        )}
      </div>
      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {list.map((src, j) => (
            <li key={src + j}>
              <button
                type="button"
                onClick={() => setI(j)}
                aria-label={`${t.vehicle.photo} ${j + 1}`}
                aria-current={i === j}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[3px] ring-2 ${i === j ? "ring-brand" : "ring-transparent"}`}
              >
                <SafeImage src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
