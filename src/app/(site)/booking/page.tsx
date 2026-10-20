import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { BookingForm } from "@/components/forms/BookingForm";
import { getDict } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { getSessionUser } from "@/lib/session";
import { bookableVehicles } from "@/lib/queries";
import { addDays, todayInZone } from "@/lib/time";
import { stripeReady } from "@/lib/stripe";
import { IMG } from "@/lib/images";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.booking.eyebrow, description: t.booking.intro, alternates: { canonical: "/booking" } };
}

const TYPES = ["test-drive", "visit", "financing", "trade-in"] as const;

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ type?: string; vehicle?: string }> }) {
  const { t, locale } = await getDict();
  const sp = await searchParams;
  const [s, vehicles, user] = await Promise.all([getSettings(), bookableVehicles(), getSessionUser("customer")]);
  const today = todayInZone("America/Toronto");
  const type = TYPES.find((x) => x === sp.type) ?? "test-drive";
  const vehicleId = vehicles.some((v) => v._id === sp.vehicle) ? sp.vehicle! : "";
  const deposit = s.payments.depositEnabled && s.payments.depositAmountCents > 0 && stripeReady() ? { amountCents: s.payments.depositAmountCents, types: s.payments.depositTypes } : null;
  return (
    <>
      <PageHero eyebrow={t.booking.eyebrow} title={t.booking.title} intro={t.booking.intro} image={IMG.cta} />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1.7fr_1fr]">
        <BookingForm
          vehicles={vehicles}
          defaults={{ type, vehicleId, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }}
          minDate={today}
          maxDate={addDays(today, s.booking.maxDaysAhead)}
          depositInfo={deposit}
          signedIn={Boolean(user)}
        />
        <aside className="space-y-4 text-sm">
          <a href={`tel:${s.phoneE164}`} className="card flex items-center gap-3 p-5 hover:border-brand">
            <Phone className="h-5 w-5 text-brand" aria-hidden /> <span className="text-lg font-bold">{s.phone}</span>
          </a>
          <p className="card flex items-center gap-3 p-5"><Clock className="h-5 w-5 text-brand" aria-hidden /> {l(s.hoursText, locale)}</p>
          <p className="card flex items-center gap-3 p-5"><MapPin className="h-5 w-5 text-brand" aria-hidden /> {s.street}, {s.city}, {s.region} {s.postalCode}</p>
        </aside>
      </div>
    </>
  );
}
