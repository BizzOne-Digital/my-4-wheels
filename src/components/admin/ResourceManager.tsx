"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Inbox, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { ResourceForm } from "./ResourceForm";
import { api, errorMessage } from "@/lib/api-client";
import type { FieldDef } from "@/lib/admin/fields";

export type Item = Record<string, unknown> & { _id: string };
export type Column = { key: string; label: string; render?: (item: Item) => React.ReactNode; className?: string };

type Props = {
  resource: string;
  title: string;
  description?: string;
  columns: Column[];
  fields?: FieldDef[];
  defaults?: Record<string, unknown>;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  editHref?: (item: Item) => string;
  createHref?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  statusControl?: { key: string; options: string[] };
  detail?: (item: Item) => React.ReactNode;
  toolbar?: React.ReactNode;
  emptyText?: string;
};

/** Generic list + create/edit drawer for admin resources, backed by /api/admin/[resource]. */
export function ResourceManager(p: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams({ page: String(page), ...(query ? { q: query } : {}) });
      for (const [k, v] of Object.entries(filterValues)) if (v) sp.set(k, v);
      const res = await api<{ items: Item[]; pages: number; total: number }>(`/api/admin/${p.resource}?${sp}`);
      setItems(res.items);
      setPages(res.pages);
      setTotal(res.total);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [p.resource, page, query, filterValues]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item: Item) => {
    if (!confirm("Delete this item permanently?")) return;
    setBusy(item._id);
    try {
      await api(`/api/admin/${p.resource}/${item._id}`, { method: "DELETE" });
      toast.success("Deleted.");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (item: Item, key: string, value: string) => {
    setBusy(item._id);
    try {
      await api(`/api/admin/${p.resource}/${item._id}`, { method: "PATCH", body: { [key]: value } });
      toast.success("Status updated.");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const canCreate = p.canCreate ?? Boolean(p.fields);
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{p.title}</h1>
          {p.description && <p className="mt-1 max-w-2xl text-sm text-neutral-600">{p.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {p.toolbar}
          {canCreate &&
            (p.createHref ? (
              <Link href={p.createHref} className="btn-primary"><Plus className="h-4 w-4" aria-hidden /> Add new</Link>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" aria-hidden /> Add new</button>
            ))}
        </div>
      </div>

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q.trim());
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor={`${p.resource}-q`} className="sr-only">Search</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input id={`${p.resource}-q`} className="input pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {p.filters?.map((f) => (
          <div key={f.key}>
            <label htmlFor={`${p.resource}-${f.key}`} className="sr-only">{f.label}</label>
            <select
              id={`${p.resource}-${f.key}`}
              className="input"
              value={filterValues[f.key] ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilterValues((s) => ({ ...s, [f.key]: e.target.value }));
              }}
            >
              <option value="">{f.label}: all</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
        <button className="btn-outline" type="submit">Search</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-[4px] border border-neutral-200 bg-white">
        {loading ? (
          <p className="flex items-center gap-2 p-8 text-sm text-neutral-500" aria-live="polite"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…</p>
        ) : error ? (
          <div className="p-8 text-sm">
            <p className="font-semibold text-brand-dark">{error}</p>
            <button className="btn-outline btn-sm mt-3" onClick={load}>Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            <Inbox className="mx-auto mb-2 h-8 w-8 text-neutral-300" aria-hidden />
            {p.emptyText ?? "Nothing here yet."}
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-mist text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                {p.columns.map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-semibold">{c.label}</th>)}
                {p.statusControl && <th scope="col" className="px-4 py-3 font-semibold">Status</th>}
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Row key={item._id} item={item} p={p} busy={busy === item._id} expanded={expanded === item._id}
                  onToggle={() => setExpanded((x) => (x === item._id ? null : item._id))}
                  onEdit={() => setEditing(item)} onDelete={() => remove(item)} onStatus={setStatus} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>{total} total</span>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {editing && p.fields && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label={editing === "new" ? "Create" : "Edit"} onKeyDown={(e) => e.key === "Escape" && setEditing(null)}>
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white px-6 pt-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing === "new" ? `New ${p.title.toLowerCase()}` : `Edit ${p.title.toLowerCase()}`}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1"><X className="h-5 w-5" /></button>
            </div>
            <ResourceForm
              resource={p.resource}
              fields={p.fields}
              initial={editing === "new" ? p.defaults ?? {} : editing}
              id={editing === "new" ? undefined : editing._id}
              onCancel={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ item, p, busy, expanded, onToggle, onEdit, onDelete, onStatus }: {
  item: Item; p: Props; busy: boolean; expanded: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void; onStatus: (i: Item, k: string, v: string) => void;
}) {
  const colSpan = p.columns.length + (p.statusControl ? 2 : 1);
  return (
    <>
      <tr className="border-b border-neutral-100 align-top last:border-0 hover:bg-neutral-50">
        {p.columns.map((c) => (
          <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</td>
        ))}
        {p.statusControl && (
          <td className="px-4 py-3">
            <label className="sr-only" htmlFor={`st-${item._id}`}>Status</label>
            <select id={`st-${item._id}`} className="input py-1.5 text-xs" value={String(item[p.statusControl.key])} disabled={busy || item[p.statusControl.key] === "cancelled"}
              onChange={(e) => onStatus(item, p.statusControl!.key, e.target.value)}>
              {p.statusControl.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </td>
        )}
        <td className="whitespace-nowrap px-4 py-3 text-right">
          <div className="inline-flex gap-1">
            {p.detail && (
              <button type="button" onClick={onToggle} className="rounded p-1.5 hover:bg-mist" aria-expanded={expanded} aria-label="Details">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
            {p.editHref ? (
              <Link href={p.editHref(item)} className="rounded p-1.5 hover:bg-mist" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
            ) : p.fields ? (
              <button type="button" onClick={onEdit} className="rounded p-1.5 hover:bg-mist" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
            ) : null}
            {p.canDelete !== false && (p.fields || p.editHref || p.canDelete) && (
              <button type="button" onClick={onDelete} disabled={busy} className="rounded p-1.5 text-brand hover:bg-brand/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            )}
          </div>
        </td>
      </tr>
      {expanded && p.detail && (
        <tr className="border-b border-neutral-100 bg-mist/60">
          <td colSpan={colSpan} className="px-4 py-4 text-sm">{p.detail(item)}</td>
        </tr>
      )}
    </>
  );
}
