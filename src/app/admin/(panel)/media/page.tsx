"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { api, errorMessage } from "@/lib/api-client";

type Upload = { _id: string; folder: string; filename: string; size: number; mimeType: string; createdAt: string; url: string; referenced: boolean };

export default function MediaAdmin() {
  const [items, setItems] = useState<Upload[]>([]);
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api<{ items: Upload[]; pages: number }>(`/api/admin/uploads?page=${page}${folder ? `&folder=${folder}` : ""}`);
      setItems(r.items);
      setPages(r.pages || 1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [folder, page]);
  useEffect(() => { load(); }, [load]);

  const del = async (u: Upload) => {
    if (!confirm("Delete this image permanently?")) return;
    try {
      await api("/api/admin/uploads", { method: "DELETE", body: { url: u.url } });
      toast.success("Image deleted.");
      load();
    } catch (e) {
      toast.error((e as Error).message === "in_use" ? "This image is still used by content." : errorMessage(e));
    }
  };

  const cleanup = async () => {
    if (!confirm("Delete every unused upload older than 24 hours?")) return;
    setBusy(true);
    try {
      const r = await api<{ removed: number }>("/api/admin/uploads", { method: "DELETE", body: { orphans: true, hours: 24 } });
      toast.success(`Removed ${r.removed} unused image(s).`);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Media library</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">Images uploaded through the admin are stored in MongoDB. Upload images from each content form. “Unused” images are not referenced by any content (for example from abandoned edits).</p>
        </div>
        <button className="btn-outline" onClick={cleanup} disabled={busy}>{busy ? "Cleaning…" : "Clean up unused (24h+)"}</button>
      </div>
      <div className="mt-6">
        <label htmlFor="m-folder" className="sr-only">Folder</label>
        <select id="m-folder" className="input w-auto" value={folder} onChange={(e) => { setPage(1); setFolder(e.target.value); }}>
          <option value="">All folders</option>
          {["products", "gallery", "pages", "misc"].map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-neutral-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-brand-dark">{error} <button className="underline" onClick={load}>Retry</button></p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-[4px] bg-white p-10 text-center text-sm text-neutral-500">No uploaded images yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((u) => (
            <li key={u._id} className="card">
              <div className="relative aspect-[4/3] bg-neutral-100">
                <SafeImage src={u.url} alt={u.filename} fill sizes="240px" className="object-cover" />
              </div>
              <div className="space-y-1 p-3 text-xs">
                <p className="truncate font-mono" title={u.filename}>{u.folder}/{u.filename}</p>
                <p className="text-neutral-500">{(u.size / 1024).toFixed(0)} KB · {u.referenced ? <span className="text-green-700">in use</span> : <span className="text-amber-700">unused</span>}</p>
                <div className="flex gap-2 pt-1">
                  <button className="btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(u.url).then(() => toast.success("URL copied."))} aria-label="Copy URL"><Copy className="h-3.5 w-3.5" /></button>
                  {!u.referenced && <button className="btn btn-sm border border-brand text-brand" onClick={() => del(u)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
