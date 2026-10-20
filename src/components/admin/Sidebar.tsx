"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, CalendarDays, Car, CreditCard, FileText, Image as ImageIcon, LayoutDashboard, Menu, MessageSquare, MessagesSquare, Settings, Tag, Users, UserSquare2, Wrench, X } from "lucide-react";
import { Logo } from "../Logo";
import { LogoutButton } from "../forms/AuthForms";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/pages", label: "Page content", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessagesSquare },
  { href: "/admin/team", label: "Team", icon: UserSquare2 },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? pathname === "/admin" : pathname.startsWith(h));
  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-[3px] px-3 py-2 text-sm font-medium ${active(href) ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
          <Icon className="h-4 w-4" aria-hidden /> {label}
        </Link>
      ))}
    </nav>
  );
  const footer = (
    <div className="border-t border-white/10 p-4 text-xs text-white/60">
      <p className="truncate">Signed in as {name}</p>
      <div className="mt-2 flex gap-4">
        <Link href="/" className="hover:text-white" target="_blank">View site</Link>
        <LogoutButton role="admin" className="hover:text-white" />
      </div>
    </div>
  );
  return (
    <>
      <div className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo variant="dark" className="h-9 w-[140px]" />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="text-white"><Menu className="h-6 w-6" /></button>
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-ink lg:flex">
        <div className="px-5 py-5"><Logo variant="dark" className="h-10 w-[160px]" /></div>
        {nav}
        {footer}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 flex bg-black/50 lg:hidden" role="dialog" aria-modal="true">
          <aside className="flex w-64 flex-col bg-ink">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo variant="dark" className="h-9 w-[140px]" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="text-white"><X className="h-5 w-5" /></button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
