export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "m4w_lang";
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "fr";
