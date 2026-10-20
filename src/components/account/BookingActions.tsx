"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";

export function BookingActions({ id, canCancel, canReschedule, pendingRequest }: { id: string; canCancel: boolean; canReschedule: boolean; pendingRequest?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const act = async (body: Record<string, string>, success: string) => {
    setBusy(true);
    try {
      await api(`/api/account/bookings/${id}`, { method: "PATCH", body });
      toast.success(success);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(t.form.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {pendingRequest && <p className="text-xs text-neutral-500">“{pendingRequest}”</p>}
      <div className="flex flex-wrap gap-2">
        {canReschedule && (
          <button type="button" className="btn-outline btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {t.account.requestReschedule}
          </button>
        )}
        {canCancel && (
          <button type="button" className="btn btn-sm border border-brand text-brand hover:bg-brand hover:text-white" disabled={busy} onClick={() => confirm(t.account.confirmCancel) && act({ action: "cancel" }, t.account.cancelled)}>
            {t.account.cancelBooking}
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-2">
          <label htmlFor={`rs-${id}`} className="sr-only">{t.account.requestReschedule}</label>
          <textarea id={`rs-${id}`} rows={3} className="input" placeholder={t.account.reschedulePh} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1000} />
          <button type="button" className="btn-primary btn-sm" disabled={busy || msg.trim().length < 5} onClick={() => act({ action: "reschedule", message: msg }, t.account.rescheduleSent)}>
            {t.account.sendRequest}
          </button>
        </div>
      )}
    </div>
  );
}
