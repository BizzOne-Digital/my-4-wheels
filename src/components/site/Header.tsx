"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, User, X } from "lucide-react";
import { Logo } from "../Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { useI18n } from "@/lib/i18n/client";

export function Header({ logo, phone, phoneHref }: { logo?: string; phone: string; phoneHref: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/inventory", label: t.nav.inventory },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/contact", label: t.nav.contact },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <div className="container-site flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="My 4 Wheels home">
          <Logo uploaded={logo} className="h-11 w-[176px]" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[13px] font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`relative py-6 transition-colors ${isActive(l.href) ? "text-brand" : "text-ink hover:text-brand"}`}
                >
                  {l.label}
                  {isActive(l.href) && <span className="absolute inset-x-0 bottom-[17px] h-[2px] bg-brand" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitch />
          <Link href="/account" className="text-neutral-500 hover:text-ink" aria-label={t.nav.account} title={t.nav.account}>
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/booking?type=test-drive" className="btn-primary px-7">
            {t.nav.bookTestDrive}
          </Link>
        </div>
        <button
          type="button"
          className="-mr-2 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.nav.closeMenu : t.nav.menu}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[105px] z-40 overflow-y-auto border-t border-neutral-100 bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-site py-4">
            <ul className="divide-y divide-neutral-100">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={`block py-4 text-base font-semibold ${isActive(l.href) ? "text-brand" : ""}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="flex items-center gap-2 py-4 text-base font-semibold">
                  <User className="h-4 w-4" /> {t.nav.account}
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <LanguageSwitch className="text-sm" />
              <a href={phoneHref} className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-brand" /> {phone}
              </a>
            </div>
            <Link href="/booking?type=test-drive" className="btn-primary mt-6 w-full">
              {t.nav.bookTestDrive}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
