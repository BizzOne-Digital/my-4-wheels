import Link from "next/link";
import { LogoutButton } from "../forms/AuthForms";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AccountShell({ t, active, name, children }: { t: Dictionary; active: "home" | "bookings" | "profile"; name: string; children: React.ReactNode }) {
  const links = [
    { key: "home", href: "/account", label: t.account.dashboard },
    { key: "bookings", href: "/account/bookings", label: t.account.bookings },
    { key: "profile", href: "/account/profile", label: t.account.profile },
  ];
  return (
    <section className="container-site grid gap-8 py-12 md:grid-cols-[220px_1fr]">
      <nav aria-label={t.account.dashboard} className="space-y-1">
        <p className="mb-3 text-sm text-neutral-500">{t.account.welcome}, <strong className="text-ink">{name}</strong></p>
        {links.map((l) => (
          <Link key={l.key} href={l.href} aria-current={active === l.key ? "page" : undefined} className={`block rounded-[3px] px-3 py-2 text-sm font-semibold ${active === l.key ? "bg-brand text-white" : "hover:bg-mist"}`}>
            {l.label}
          </Link>
        ))}
        <LogoutButton role="customer" className="block w-full rounded-[3px] px-3 py-2 text-left text-sm font-semibold text-neutral-600 hover:bg-mist" />
      </nav>
      <div>{children}</div>
    </section>
  );
}
