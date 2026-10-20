"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api-client";

export function BookingNotes({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <label htmlFor={`bn-${id}`} className="label">Internal notes</label>
      <textarea id={`bn-${id}`} rows={3} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
      <button
        type="button"
        className="btn-outline btn-sm mt-2"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api(`/api/admin/bookings/${id}`, { method: "PATCH", body: { adminNotes: notes } });
            toast.success("Notes saved.");
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
}
