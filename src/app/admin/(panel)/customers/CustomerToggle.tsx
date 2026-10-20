"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api-client";

export function CustomerToggle({ id, active }: { id: string; active: boolean }) {
  const [state, setState] = useState(active);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api(`/api/admin/customers/${id}`, { method: "PATCH", body: { active: !state } });
          setState(!state);
          toast.success(state ? "Account deactivated." : "Account reactivated.");
        } catch (e) {
          toast.error(errorMessage(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      {state ? "Deactivate" : "Reactivate"}
    </button>
  );
}
