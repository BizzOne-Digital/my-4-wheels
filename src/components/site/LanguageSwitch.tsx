"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Switches language in place: sets the cookie and re-renders the current page. */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (l: Locale) => {
    if (l === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold ${pending ? "opacity-60" : ""} ${className}`} role="group" aria-label={t.nav.language}>
      {(["en", "fr"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-neutral-300" aria-hidden>|</span>}
          <button
            type="button"
            onClick={() => set(l)}
            aria-pressed={locale === l}
            lang={l}
            className={`uppercase ${locale === l ? "text-brand" : "text-neutral-500 hover:text-ink"}`}
          >
            {l}
            <span className="sr-only">{l === "en" ? " English" : " Français"}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
