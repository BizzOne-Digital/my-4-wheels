"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { loginSchema, profileSchema, registerSchema } from "@/lib/validators";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";
import { Field } from "./Field";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export function CustomerLoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const onSubmit = handleSubmit(async (data) => {
    setError("");
    try {
      await api("/api/auth/customer/login", { body: data });
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError((e as { status?: number }).status === 429 ? t.form.rateLimited : t.account.invalid);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <p className="rounded-[3px] bg-brand/10 p-3 text-sm font-medium text-brand-dark" role="alert">{error}</p>}
      <Field id="cl-email" label={t.form.email} error={errors.email?.message}>
        <input id="cl-email" type="email" autoComplete="email" className="input" {...register("email")} />
      </Field>
      <Field id="cl-pass" label={t.account.password} error={errors.password?.message}>
        <input id="cl-pass" type="password" autoComplete="current-password" className="input" {...register("password")} />
      </Field>
      <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? t.common.loading : t.account.login}</button>
      <p className="text-center text-sm text-neutral-600">
        {t.account.noAccount} <Link href="/account/register" className="font-semibold text-brand">{t.account.register}</Link>
      </p>
    </form>
  );
}

export function CustomerRegisterForm() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { locale } });
  const onSubmit = handleSubmit(async (data) => {
    setError("");
    try {
      await api("/api/auth/customer/register", { body: { ...data, locale } });
      router.replace("/account");
      router.refresh();
    } catch (e) {
      const s = (e as { status?: number }).status;
      setError(s === 409 ? t.account.exists : s === 429 ? t.form.rateLimited : t.form.error);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <p className="rounded-[3px] bg-brand/10 p-3 text-sm font-medium text-brand-dark" role="alert">{error}</p>}
      <Field id="cr-name" label={t.form.name} error={errors.name?.message}>
        <input id="cr-name" autoComplete="name" className="input" {...register("name")} />
      </Field>
      <Field id="cr-email" label={t.form.email} error={errors.email?.message}>
        <input id="cr-email" type="email" autoComplete="email" className="input" {...register("email")} />
      </Field>
      <Field id="cr-phone" label={t.form.phone} error={errors.phone?.message} optional>
        <input id="cr-phone" type="tel" autoComplete="tel" className="input" {...register("phone")} />
      </Field>
      <Field id="cr-pass" label={t.account.password} error={errors.password?.message}>
        <input id="cr-pass" type="password" autoComplete="new-password" className="input" {...register("password")} />
      </Field>
      <Field id="cr-confirm" label={t.account.confirmPassword} error={errors.confirm?.message}>
        <input id="cr-confirm" type="password" autoComplete="new-password" className="input" {...register("confirm")} />
      </Field>
      <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? t.common.loading : t.account.register}</button>
      <p className="text-center text-sm text-neutral-600">
        {t.account.haveAccount} <Link href="/account/login" className="font-semibold text-brand">{t.account.login}</Link>
      </p>
    </form>
  );
}

export function ProfileForm({ initial }: { initial: { name: string; phone: string; locale: "en" | "fr"; email: string } }) {
  const { t } = useI18n();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: initial });
  const onSubmit = handleSubmit(async (data) => {
    try {
      await api("/api/account/profile", { method: "PATCH", body: data });
      toast.success(t.account.profileSaved);
      router.refresh();
    } catch {
      toast.error(t.form.error);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-lg space-y-4">
      <Field id="pf-email" label={t.form.email}>
        <input id="pf-email" className="input" value={initial.email} disabled readOnly />
      </Field>
      <Field id="pf-name" label={t.form.name} error={errors.name?.message}>
        <input id="pf-name" className="input" {...register("name")} />
      </Field>
      <Field id="pf-phone" label={t.form.phone} error={errors.phone?.message} optional>
        <input id="pf-phone" type="tel" className="input" {...register("phone")} />
      </Field>
      <Field id="pf-locale" label={t.nav.language}>
        <select id="pf-locale" className="input" {...register("locale")}>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </Field>
      <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? t.common.loading : t.common.save}</button>
    </form>
  );
}

export function LogoutButton({ role, className = "" }: { role: "admin" | "customer"; className?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await api(`/api/auth/${role}/logout`, { method: "POST" }).catch(() => {});
        router.replace(role === "admin" ? "/admin/login" : "/account/login");
        router.refresh();
      }}
    >
      {t.account.logout}
    </button>
  );
}
