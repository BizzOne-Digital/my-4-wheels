import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { RetryPayment } from "@/components/site/RetryPayment";
import { getDict } from "@/lib/i18n/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { formatDate, formatTime } from "@/lib/format";
import { stripeReady } from "@/lib/stripe";

export const metadata: Metadata = { robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string; paid?: string; cancelled?: string }> }) {
  const { t, locale } = await getDict();
  const sp = await searchParams;
  const ref = sp.ref && /^M4W-[A-Z0-9]{8}$/.test(sp.ref) ? sp.ref : null;
  await connectDB();
  // Only non-sensitive fields are shown; paid status comes from the webhook-verified record.
  const b = ref ? await Booking.findOne({ reference: ref }, { reference: 1, status: 1, date: 1, time: 1, type: 1, deposit: 1 }).lean() : null;
  return (
    <section className="container-site max-w-2xl py-16">
      {!b ? (
        <p className="card p-8 text-center">{t.booking.notFound}</p>
      ) : (
        <div className="card p-8">
          <CalendarCheck className="h-10 w-10 text-brand" aria-hidden />
          <h1 className="mt-4 text-2xl font-extrabold">{t.booking.lookup}</h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-neutral-500">{t.booking.reference}</dt><dd className="text-xl font-extrabold">{b.reference}</dd></div>
            <div><dt className="text-neutral-500">{t.booking.statusLabel}</dt><dd className="font-semibold">{t.booking.statuses[b.status as "pending"]}</dd></div>
            <div><dt className="text-neutral-500">{t.booking.type}</dt><dd className="font-semibold">{t.booking.types[b.type as "visit"]}</dd></div>
            <div><dt className="text-neutral-500">{t.booking.date}</dt><dd className="font-semibold">{formatDate(b.date, locale)} · {formatTime(b.time, locale)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-neutral-500">{t.common.timezoneNote}</p>
          {b.deposit?.required && (
            <div className="mt-6 rounded-[4px] bg-mist p-4 text-sm">
              {b.deposit.status === "paid" ? (
                <p className="font-semibold text-green-700">{t.booking.depositPaid}</p>
              ) : (
                <>
                  <p className="font-semibold">{sp.paid ? t.booking.depositPending : sp.cancelled ? t.booking.paymentCancelled : t.booking.depositUnpaid}</p>
                  {!sp.paid && b.status !== "cancelled" && stripeReady() && <div className="mt-3"><RetryPayment reference={b.reference} /></div>}
                </>
              )}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Link href="/inventory" className="btn-outline">{t.nav.inventory}</Link>
            <Link href="/account/bookings" className="btn-primary">{t.account.bookings}</Link>
          </div>
        </div>
      )}
    </section>
  );
}
