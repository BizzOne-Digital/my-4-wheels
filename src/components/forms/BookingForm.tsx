"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarCheck, CreditCard, Globe2 } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/format";
import { Field } from "./Field";

type VehicleOpt = { _id: string; label: string };
type Result = {
  booking: { reference: string; status: string; date: string; time: string; type: string; emailStatus: string; deposit: { required: boolean; amountCents: number; status: string } };
  checkoutUrl: string | null;
};

export function BookingForm({
  vehicles,
  defaults,
  minDate,
  maxDate,
  depositInfo,
  signedIn,
}: {
  vehicles: VehicleOpt[];
  defaults: Partial<BookingInput>;
  minDate: string;
  maxDate: string;
  depositInfo: { amountCents: number; types: string[] } | null;
  signedIn: boolean;
}) {
  const { t, locale } = useI18n();
  const [slots, setSlots] = useState<{ time: string; available: boolean }[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({ resolver: zodResolver(bookingSchema), defaultValues: { type: "test-drive", vehicleId: "", notes: "", time: "", ...defaults, locale } });

  const date = watch("date");
  const type = watch("type");
  const vehicleId = watch("vehicleId");
  const time = watch("time");
  const depositApplies = depositInfo && depositInfo.types.includes(type);

  useEffect(() => {
    if (!date) return setSlots(null);
    let cancelled = false;
    setLoadingSlots(true);
    setValue("time", "");
    const v = type === "test-drive" && vehicleId ? `&vehicle=${vehicleId}` : "";
    fetch(`/api/bookings/availability?date=${date}${v}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setSlots(d.slots ?? []))
      .catch(() => !cancelled && setSlots([]))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [date, vehicleId, type, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await api<Result>("/api/bookings", { body: { ...data, locale } });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setResult(res);
      toast.success(t.booking.confirmedTitle);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const err = e as { status?: number; message?: string };
      if (err.message === "slot_unavailable") {
        toast.error(t.booking.slotTaken);
        setValue("time", "");
        setValue("date", data.date); // refetch
        setSlots(null);
        fetch(`/api/bookings/availability?date=${data.date}`).then((r) => r.json()).then((d) => setSlots(d.slots ?? []));
      } else if (err.message === "vehicle_unavailable") toast.error(t.booking.vehicleTaken);
      else toast.error(err.status === 429 ? t.form.rateLimited : t.form.error);
    }
  });

  if (result) {
    const b = result.booking;
    return (
      <div className="card p-6 sm:p-8" role="status">
        <CalendarCheck className="h-10 w-10 text-brand" aria-hidden />
        <h2 className="mt-4 text-2xl font-extrabold">{t.booking.confirmedTitle}</h2>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">{t.booking.reference}</dt>
            <dd className="text-xl font-extrabold tracking-wide">{b.reference}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.booking.statusLabel}</dt>
            <dd className="font-semibold">{t.booking.statuses[b.status as "pending"]}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.booking.type}</dt>
            <dd className="font-semibold">{t.booking.types[b.type as "visit"]}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.booking.date}</dt>
            <dd className="font-semibold">
              {formatDate(b.date, locale)} · {formatTime(b.time, locale)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-neutral-500">{t.common.timezoneNote}</p>
        <p className="mt-4 text-sm text-neutral-700">{t.booking.keepRef}</p>
        <p className="mt-2 text-sm text-neutral-700">{b.emailStatus === "sent" ? t.booking.emailSent : t.booking.emailNotSent}</p>
        {b.deposit.required && b.deposit.status !== "paid" && (
          <p className="mt-2 text-sm font-semibold text-brand-dark">{t.booking.depositUnpaid}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/booking/confirmation?ref=${b.reference}`} className="btn-outline">
            {t.booking.lookup}
          </Link>
          <Link href="/inventory" className="btn-primary">
            {t.nav.inventory}
          </Link>
        </div>
      </div>
    );
  }

  const err = (k: keyof BookingInput) => errors[k]?.message as string | undefined;
  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <Field id="bk-type" label={t.booking.type} error={err("type")}>
        <select id="bk-type" className="input" {...register("type")}>
          {Object.entries(t.booking.types).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field id="bk-vehicle" label={t.booking.vehicle} optional>
        <select id="bk-vehicle" className="input" {...register("vehicleId")}>
          <option value="">{t.booking.noVehicle}</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="bk-date" label={t.booking.date} error={err("date")}>
        <input id="bk-date" type="date" min={minDate} max={maxDate} className="input" {...register("date")} />
      </Field>
      <div className="sm:col-span-2">
        <fieldset>
          <legend className="label">{t.booking.time}</legend>
          <p className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <Globe2 className="h-3.5 w-3.5" aria-hidden /> {t.common.timezoneNote}
          </p>
          {!date && <p className="text-sm text-neutral-500">{t.booking.pickDate}</p>}
          {date && loadingSlots && <p className="text-sm text-neutral-500" aria-live="polite">{t.booking.loadingTimes}</p>}
          {date && !loadingSlots && slots && slots.filter((s) => s.available).length === 0 && <p className="text-sm text-neutral-600">{t.booking.noTimes}</p>}
          {date && !loadingSlots && slots && slots.some((s) => s.available) && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((s) => (
                <label
                  key={s.time}
                  className={`cursor-pointer rounded-[3px] border px-2 py-2 text-center text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                    !s.available ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through" : time === s.time ? "border-brand bg-brand text-white" : "border-neutral-300 hover:border-ink"
                  }`}
                >
                  <input type="radio" value={s.time} disabled={!s.available} className="sr-only" {...register("time")} />
                  {formatTime(s.time, locale)}
                </label>
              ))}
            </div>
          )}
          {errors.time && <p className="field-error">{t.validation.time}</p>}
        </fieldset>
      </div>
      <Field id="bk-name" label={t.form.name} error={err("name")}>
        <input id="bk-name" className="input" autoComplete="name" {...register("name")} />
      </Field>
      <Field id="bk-email" label={t.form.email} error={err("email")}>
        <input id="bk-email" type="email" className="input" autoComplete="email" {...register("email")} />
      </Field>
      <Field id="bk-phone" label={t.form.phone} error={err("phone")}>
        <input id="bk-phone" type="tel" className="input" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field id="bk-notes" label={t.form.notes} optional className="sm:col-span-2">
        <textarea id="bk-notes" rows={3} className="input" {...register("notes")} />
      </Field>
      {depositApplies && (
        <div className="flex gap-3 rounded-[4px] bg-mist p-4 text-sm sm:col-span-2">
          <CreditCard className="h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p>
            <strong>
              {t.booking.deposit}: {new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(depositInfo!.amountCents / 100)}
            </strong>
            <br />
            {t.booking.depositText}
          </p>
        </div>
      )}
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" {...register("consent")} />
          <span>{t.form.consent}</span>
        </label>
        {errors.consent && <p className="field-error">{t.validation.consent}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="btn-primary px-8" disabled={isSubmitting}>
          {isSubmitting ? t.booking.submitting : depositApplies ? t.booking.payDeposit : t.booking.submit}
        </button>
        {!signedIn && (
          <Link href="/account/login?next=/booking" className="text-xs text-neutral-500 underline-offset-2 hover:underline">
            {t.booking.loginHint}
          </Link>
        )}
      </div>
    </form>
  );
}
