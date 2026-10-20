import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { BookingList } from "@/components/account/BookingList";
import { getDict } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { plain } from "@/lib/format";

export const metadata: Metadata = { title: "Bookings", robots: { index: false } };

export default async function AccountBookingsPage() {
  const { t, locale } = await getDict();
  const user = await getSessionUser("customer");
  if (!user) redirect("/account/login?next=/account/bookings");
  await connectDB();
  const [items, s] = await Promise.all([
    Booking.find({ user: user.id }).select("-slotKeys -adminNotes").sort({ startsAt: -1 }).populate("vehicle", "year make model slug").lean(),
    getSettings(),
  ]);
  return (
    <AccountShell t={t} active="bookings" name={user.name}>
      <h1 className="mb-4 text-2xl font-extrabold">{t.account.bookings}</h1>
      <BookingList items={plain(items) as never} t={t} locale={locale} rules={{ allowCancel: s.booking.allowCustomerCancel, cancelHours: s.booking.cancelHoursBefore, allowReschedule: s.booking.allowRescheduleRequest }} />
    </AccountShell>
  );
}
