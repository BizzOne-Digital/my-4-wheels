import type { Locale } from "./i18n/config";

export type L10n = { en?: string; fr?: string } | null | undefined;

/** Picks the localized value, falling back to English. */
export const l = (v: L10n, locale: Locale) => (v?.[locale] || v?.en || "").trim();

export const formatPrice = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })
    .format(n)
    .replace(/^\$/, "CAD $")
    .replace(/\s\$$/, " $ CA");

export const formatKm = (n: number, locale: Locale) => `${new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA").format(n)} km`;

export const formatDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`)
  );

export const formatTime = (time: string, locale: Locale) => {
  const [h, m] = time.split(":").map(Number);
  if (locale === "fr") return `${h} h ${String(m).padStart(2, "0")}`;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

export const vehicleTitle = (v: { year: number; make: string; model: string; trim?: string }) =>
  `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;

/** Serializes Mongo lean docs (ObjectIds, Dates) into plain JSON for client components. */
export const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v));
