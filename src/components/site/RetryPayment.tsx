"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/api-client";

export function RetryPayment({ reference }: { reference: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-primary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await api<{ url: string }>(`/api/bookings/${reference}/checkout`, { method: "POST" });
          window.location.href = r.url;
        } catch {
          toast.error(t.form.error);
          setBusy(false);
        }
      }}
    >
      {t.booking.payDeposit}
    </button>
  );
}
