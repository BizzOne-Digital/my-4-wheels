import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(c)) return c;
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("fr") ? "fr" : DEFAULT_LOCALE;
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
