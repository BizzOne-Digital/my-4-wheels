import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { BookingList } from "@/components/account/BookingList";
import { getDict } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { plain } from "@/lib/format";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const { t, locale } = await getDict();
  const user = await getSessionUser("customer");
  if (!user) redirect("/account/login?next=/account");
  await connectDB();
  const [items, s] = await Promise.all([
    Booking.find({ user: user.id, status: { $in: ["pending", "confirmed"] }, startsAt: { $gte: new Date() } }).select("-slotKeys -adminNotes").sort({ startsAt: 1 }).limit(3).populate("vehicle", "year make model slug").lean(),
    getSettings(),
  ]);
  return (
    <AccountShell t={t} active="home" name={user.name}>
      <h1 className="text-2xl font-extrabold">{t.account.upcoming}</h1>
      <div className="mt-4">
        <BookingList items={plain(items) as never} t={t} locale={locale} rules={{ allowCancel: s.booking.allowCustomerCancel, cancelHours: s.booking.cancelHoursBefore, allowReschedule: s.booking.allowRescheduleRequest }} />
      </div>
      <Link href="/account/bookings" className="link-red mt-6">{t.account.bookings}</Link>
    </AccountShell>
  );
}
