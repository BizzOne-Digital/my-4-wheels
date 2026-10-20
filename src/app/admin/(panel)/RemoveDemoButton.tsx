"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api-client";

export function RemoveDemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-outline btn-sm"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete all demo vehicles and demo articles? This cannot be undone.")) return;
        setBusy(true);
        try {
          const r = await api<{ vehicles: number; posts: number }>("/api/admin/demo", { method: "DELETE" });
          toast.success(`Removed ${r.vehicles} vehicle(s) and ${r.posts} article(s).`);
          router.refresh();
        } catch (e) {
          toast.error(errorMessage(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Removing…" : "Remove demo content"}
    </button>
  );
}
