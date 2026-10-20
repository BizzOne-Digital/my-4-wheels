"use client";
import { useI18n } from "@/lib/i18n/client";

/** Label + control + translated error message. Error keys come from zod messages. */
export function Field({ id, label, error, optional, children, className = "" }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  const msg = error ? (t.validation as Record<string, string>)[error] ?? error : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {optional && <span className="ml-1 font-normal text-neutral-500">({t.common.optional})</span>}
      </label>
      {children}
      {msg && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {msg}
        </p>
      )}
    </div>
  );
}
