"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { inquirySchema, type InquiryInput } from "@/lib/validators";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";
import { Field } from "./Field";

type Variant = "contact" | "vehicle" | "financing" | "trade-in" | "sell" | "offer";

export function InquiryForm({ variant = "contact", vehicleId, offerTitle }: { variant?: Variant; vehicleId?: string; offerTitle?: string }) {
  const { t, locale } = useI18n();
  const [done, setDone] = useState<null | { emailStatus: string }>(null);
  const subject = variant === "contact" ? "general" : variant;
  const showVehicleDetails = variant === "trade-in" || variant === "sell";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { subject: subject as InquiryInput["subject"], vehicleId: vehicleId ?? "", locale, details: { offer: offerTitle ?? "" }, website: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await api<{ emailStatus: string }>("/api/inquiries", { body: { ...data, locale } });
      setDone({ emailStatus: res.emailStatus });
      toast.success(t.form.successTitle);
    } catch (e) {
      toast.error((e as { status?: number }).status === 429 ? t.form.rateLimited : t.form.error);
    }
  });

  if (done)
    return (
      <div className="rounded-[4px] border border-neutral-200 bg-mist p-6" role="status">
        <CheckCircle2 className="h-8 w-8 text-brand" aria-hidden />
        <h3 className="mt-3 text-lg font-bold">{t.form.successTitle}</h3>
        <p className="mt-1 text-sm text-neutral-600">{t.form.successText}</p>
        {done.emailStatus === "failed" && <p className="mt-2 text-sm text-neutral-600">{t.form.emailNotice}</p>}
      </div>
    );

  const err = (k: string) => (errors as Record<string, { message?: string }>)[k]?.message;
  const prefix = `inq-${variant}`;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
      <Field id={`${prefix}-name`} label={t.form.name} error={err("name")}>
        <input id={`${prefix}-name`} className="input" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field id={`${prefix}-email`} label={t.form.email} error={err("email")}>
        <input id={`${prefix}-email`} type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field id={`${prefix}-phone`} label={t.form.phone} error={err("phone")} optional>
        <input id={`${prefix}-phone`} type="tel" className="input" autoComplete="tel" {...register("phone")} />
      </Field>
      {variant === "contact" ? (
        <Field id={`${prefix}-subject`} label={t.form.subject}>
          <select id={`${prefix}-subject`} className="input" {...register("subject")}>
            {Object.entries(t.form.subjects).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <div className="hidden sm:block" />
      )}
      {showVehicleDetails && (
        <>
          <Field id={`${prefix}-year`} label={t.form.vehicleYear} error={errors.details?.year?.message}>
            <input id={`${prefix}-year`} inputMode="numeric" className="input" {...register("details.year")} />
          </Field>
          <Field id={`${prefix}-make`} label={t.form.vehicleMake}>
            <input id={`${prefix}-make`} className="input" {...register("details.make")} />
          </Field>
          <Field id={`${prefix}-model`} label={t.form.vehicleModel}>
            <input id={`${prefix}-model`} className="input" {...register("details.model")} />
          </Field>
          <Field id={`${prefix}-mileage`} label={t.form.vehicleMileage}>
            <input id={`${prefix}-mileage`} inputMode="numeric" className="input" {...register("details.mileage")} />
          </Field>
        </>
      )}
      <Field id={`${prefix}-message`} label={showVehicleDetails ? t.form.vehicleCondition : t.form.message} error={err("message")} className="sm:col-span-2">
        <textarea id={`${prefix}-message`} rows={5} className="input" aria-invalid={!!errors.message} {...register("message")} />
      </Field>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" {...register("consent")} />
          <span>{t.form.consent}</span>
        </label>
        {errors.consent && <p className="field-error">{t.validation.consent}</p>}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? t.common.sending : t.form.sendMessage}
        </button>
      </div>
    </form>
  );
}
