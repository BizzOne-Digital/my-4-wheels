"use client";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGalleryField, AdminImageField } from "./AdminImageField";
import { api, errorMessage } from "@/lib/api-client";
import type { FieldDef } from "@/lib/admin/fields";

type Values = Record<string, unknown>;

const get = (o: Values, path: string) => path.split(".").reduce<unknown>((a, k) => (a as Values | undefined)?.[k], o);

/** Generic validated admin form. Server-side zod schemas are the source of truth; errors are shown inline. */
export function ResourceForm({
  resource,
  fields,
  initial,
  id,
  onSaved,
  onCancel,
}: {
  resource: string;
  fields: FieldDef[];
  initial: Values;
  id?: string;
  onSaved?: (item: Values) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Values>(() => normalize(initial, fields));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const missing: Record<string, string> = {};
    for (const f of fields) {
      if ("required" in f && f.required) {
        const v = f.type === "loc" ? (values[f.name] as { en?: string })?.en : values[f.name];
        if (v === "" || v === undefined || v === null) missing[f.name] = "Required";
      }
    }
    setErrors(missing);
    if (Object.keys(missing).length) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSaving(true);
    try {
      const body = serialize(values, fields);
      const res = await api<{ item: Values }>(id ? `/api/admin/${resource}/${id}` : `/api/admin/${resource}`, { method: id ? "PATCH" : "POST", body });
      toast.success(id ? "Changes saved." : "Created.");
      onSaved?.(res.item);
    } catch (err) {
      const issues = (err as { data?: { issues?: { path: string; message: string }[] } }).data?.issues ?? [];
      const map: Record<string, string> = {};
      for (const i of issues) map[i.path.split(".")[0]] = i.message;
      setErrors(map);
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      {fields.map((f) => {
        const full = !("half" in f && f.half);
        const err = errors[f.name];
        const fid = `f-${resource}-${f.name}`;
        return (
          <div key={f.name} className={full ? "sm:col-span-2" : ""}>
            {renderField(f, fid, values[f.name], (v) => set(f.name, v))}
            {"help" in f && f.help && <p className="mt-1 text-xs text-neutral-500">{f.help}</p>}
            {err && <p className="field-error" role="alert">{err}</p>}
          </div>
        );
      })}
      <div className="sticky bottom-0 flex gap-3 border-t border-neutral-200 bg-white py-4 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : id ? "Save changes" : "Create"}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function renderField(f: FieldDef, id: string, value: unknown, onChange: (v: unknown) => void) {
  switch (f.type) {
    case "checkbox":
      return (
        <label className="flex items-center gap-2 pt-6 text-sm font-medium">
          <input id={id} type="checkbox" className="h-4 w-4 accent-brand" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {f.label}
        </label>
      );
    case "select":
      return (
        <>
          <label htmlFor={id} className="label">{f.label}</label>
          <select id={id} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </>
      );
    case "textarea":
      return (
        <>
          <label htmlFor={id} className="label">{f.label}</label>
          <textarea id={id} rows={f.rows ?? 4} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "lines":
      return (
        <>
          <label htmlFor={id} className="label">{f.label}</label>
          <textarea id={id} rows={5} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "loc": {
      const v = (value as { en: string; fr: string }) ?? { en: "", fr: "" };
      const Tag = f.multiline ? "textarea" : "input";
      return (
        <fieldset>
          <legend className="label">{f.label}{f.required && " *"}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {(["en", "fr"] as const).map((lang) => (
              <div key={lang}>
                <label htmlFor={`${id}-${lang}`} className="mb-1 block text-[11px] font-semibold uppercase text-neutral-500">{lang === "en" ? "English" : "Français"}</label>
                <Tag id={`${id}-${lang}`} rows={f.multiline ? f.rows ?? 3 : undefined} className="input" value={v[lang] ?? ""} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} />
              </div>
            ))}
          </div>
        </fieldset>
      );
    }
    case "image":
      return <AdminImageField id={id} label={f.label} folder={f.folder} value={String(value ?? "")} onChange={onChange} />;
    case "gallery":
      return <AdminGalleryField label={f.label} folder={f.folder} value={(value as string[]) ?? []} onChange={onChange} />;
    default:
      return (
        <>
          <label htmlFor={id} className="label">{f.label}{"required" in f && f.required && " *"}</label>
          <input id={id} type={f.type} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </>
      );
  }
}

function normalize(initial: Values, fields: FieldDef[]) {
  const out: Values = { ...initial };
  for (const f of fields) {
    const v = get(initial, f.name);
    if (f.type === "lines") out[f.name] = Array.isArray(v) ? (v as string[]).join("\n") : "";
    if (f.type === "date") out[f.name] = v ? String(v).slice(0, 10) : "";
    if (f.type === "select" && typeof v === "number") out[f.name] = String(v);
    if (f.type === "loc") out[f.name] = { en: (v as Values)?.en ?? "", fr: (v as Values)?.fr ?? "" };
  }
  return out;
}

function serialize(values: Values, fields: FieldDef[]) {
  const out: Values = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === "lines") out[f.name] = String(v ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
    else if (f.type === "number") out[f.name] = v === "" || v === undefined ? 0 : Number(v);
    else if (f.type === "date") out[f.name] = v ? `${v}T00:00:00-05:00` : null;
    else out[f.name] = v;
  }
  return out;
}
