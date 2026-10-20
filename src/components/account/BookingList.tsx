import Link from "next/link";
import { BookingActions } from "./BookingActions";
import { formatDate, formatTime, vehicleTitle } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type B = {
  _id: string;
  reference: string;
  type: string;
  date: string;
  time: string;
  startsAt: string;
  status: string;
  rescheduleRequest?: string;
  vehicle?: { year: number; make: string; model: string; slug: string } | null;
  deposit?: { required: boolean; status: string };
};

export function BookingList({ items, t, locale, rules }: { items: B[]; t: Dictionary; locale: Locale; rules: { allowCancel: boolean; cancelHours: number; allowReschedule: boolean } }) {
  if (!items.length)
    return (
      <div className="rounded-[4px] bg-mist p-8 text-center">
        <p>{t.account.noBookings}</p>
        <Link href="/booking" className="btn-primary mt-4">{t.account.bookNow}</Link>
      </div>
    );
  const colors: Record<string, string> = { pending: "bg-amber-100 text-amber-800", confirmed: "bg-green-100 text-green-800", completed: "bg-neutral-200 text-neutral-700", cancelled: "bg-red-100 text-red-800" };
  return (
    <>
      <p className="mb-4 text-xs text-neutral-500">{t.account.cancelWindow.replace("{hours}", String(rules.cancelHours))} {t.common.timezoneNote}</p>
      <ul className="space-y-4">
        {items.map((b) => {
          const hoursLeft = (new Date(b.startsAt).getTime() - Date.now()) / 3600_000;
          const active = b.status === "pending" || b.status === "confirmed";
          return (
            <li key={b._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-neutral-500">{b.reference}</p>
                  <h3 className="mt-1 font-bold">{t.booking.types[b.type as "visit"]}{b.vehicle ? ` · ${vehicleTitle(b.vehicle)}` : ""}</h3>
                  <p className="text-sm text-neutral-600">{formatDate(b.date, locale)} · {formatTime(b.time, locale)}</p>
                  {b.deposit?.required && <p className="mt-1 text-xs">{b.deposit.status === "paid" ? t.booking.depositPaid : t.booking.depositUnpaid}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[b.status]}`}>{t.booking.statuses[b.status as "pending"]}</span>
              </div>
              {active && (
                <BookingActions
                  id={b._id}
                  canCancel={rules.allowCancel && hoursLeft >= rules.cancelHours}
                  canReschedule={rules.allowReschedule && hoursLeft > 0}
                  pendingRequest={b.rescheduleRequest}
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
