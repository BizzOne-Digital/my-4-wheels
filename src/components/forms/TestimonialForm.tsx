"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { testimonialSubmitSchema } from "@/lib/validators";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";
import { Field } from "./Field";
import type { z } from "zod";

type Input = z.input<typeof testimonialSubmitSchema>;

export function TestimonialForm() {
  const { t, locale } = useI18n();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({ resolver: zodResolver(testimonialSubmitSchema), defaultValues: { locale, website: "" } });
  const onSubmit = handleSubmit(async (data) => {
    try {
      await api("/api/testimonials", { body: { ...data, rating: data.rating || undefined, locale } });
      setDone(true);
      toast.success(t.pages.reviewThanks);
    } catch (e) {
      toast.error((e as { status?: number }).status === 429 ? t.form.rateLimited : t.form.error);
    }
  });
  if (done) return <p className="rounded-[4px] bg-mist p-5 text-sm" role="status">{t.pages.reviewThanks}</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
      <Field id="tm-name" label={t.form.name} error={errors.name?.message}>
        <input id="tm-name" className="input" {...register("name")} />
      </Field>
      <Field id="tm-rating" label={t.pages.ratingOptional}>
        <select id="tm-rating" className="input" {...register("rating")}>
          <option value="">{t.pages.noRating}</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
        </select>
      </Field>
      <Field id="tm-quote" label={t.pages.quote} error={errors.quote?.message} className="sm:col-span-2">
        <textarea id="tm-quote" rows={4} className="input" {...register("quote")} />
      </Field>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" {...register("consent")} />
          <span>{t.form.consent}</span>
        </label>
        {errors.consent && <p className="field-error">{t.validation.consent}</p>}
      </div>
      <div><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? t.common.sending : t.common.submit}</button></div>
    </form>
  );
}
