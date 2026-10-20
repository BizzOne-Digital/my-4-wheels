/** AI-generated static artwork in public/images. Admin uploads remain in MongoDB. */
export const STOCK_IMAGE_MAP: Record<string, string> = {
  "1580273916550-e323be2ae537": "/images/hero.webp",
  "1492144534655-ae79c964c9d7": "/images/showroom.webp",
  "1449965408869-eaa3f722e40d": "/images/booking-interior.webp",
  "1486262715619-67b85e0b08d3": "/images/vehicle-inspection.webp",
  "1590362891991-f776e747a588": "/images/red-lit-garage.webp",
  "1568605117036-5fe5e7bab0b7": "/images/open-road.webp",
  "1517524008697-84bbe3c3fd98": "/images/winter-suv.webp",
  "1621007947382-bb3c3994e3fb": "/images/honda-civic.webp",
  "1617469767053-d3b523a0b982": "/images/toyota-rav4.webp",
  "1550355291-bbee04a92027": "/images/mazda-cx5.webp",
  "1541899481282-d53bffe3c35d": "/images/volkswagen-golf.webp",
  "1560958089-b8a1929cea89": "/images/tesla-model3.webp",
  "1619767886558-efdc259cde1a": "/images/hyundai-elantra.webp",
  "1600661653561-629509216228": "/images/white-suv.webp",
  "1503376780353-7e6692767b70": "/images/buying-checklist.webp"
};

const localSources = new Set(Object.values(STOCK_IMAGE_MAP));

export function isLocalSiteImage(src: string): boolean {
  return localSources.has(src);
}

/** Keep existing seeded database URLs working without overwriting admin content. */
export function resolveSiteImage(src: string | null | undefined): string {
  if (!src) return "";
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  try {
    const url = new URL(src);
    const id = url.pathname.match(/^\/photo-([\w-]+)$/)?.[1];
    return id ? STOCK_IMAGE_MAP[id] ?? src : src;
  } catch {
    return src;
  }
}

export function localImageForStock(id: string): string {
  return STOCK_IMAGE_MAP[id] ?? "";
}

export const IMG = {
  hero: "/images/hero.webp",
  about: "/images/showroom.webp",
  cta: "/images/booking-interior.webp",
  inspection: "/images/vehicle-inspection.webp",
  garage: "/images/red-lit-garage.webp",
  road: "/images/open-road.webp",
  suvSnow: "/images/winter-suv.webp",
  sedanDark: "/images/honda-civic.webp",
  suvSilver: "/images/toyota-rav4.webp",
  redHatch: "/images/mazda-cx5.webp",
  blueHatch: "/images/volkswagen-golf.webp",
  whiteSedan: "/images/tesla-model3.webp",
  blackSedan: "/images/hyundai-elantra.webp",
  whiteSuv: "/images/white-suv.webp",
};
