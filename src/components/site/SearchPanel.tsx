"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export const PRICE_RANGES = [
  { value: "0-15000", max: 15000 },
  { value: "15000-25000", min: 15000, max: 25000 },
  { value: "25000-35000", min: 25000, max: 35000 },
  { value: "35000-", min: 35000 },
];

function Select({ id, label, value, onChange, disabled, children }: { id: string; label: string; value: string; onChange: (v: string) => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="input appearance-none pr-9 text-[13px] text-neutral-600">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" aria-hidden />
      </div>
    </div>
  );
}

/** Floating search panel. Model options depend on the selected make; submits real query params. */
export function SearchPanel({ makeModels }: { makeModels: Record<string, string[]> }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const makes = Object.keys(makeModels).sort();
  const models = useMemo(() => (make ? makeModels[make] ?? [] : []), [make, makeModels]);
  const money = (n: number) => new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
  const priceLabel = (r: (typeof PRICE_RANGES)[number]) =>
    r.min && r.max ? `${money(r.min)} – ${money(r.max)}` : r.max ? `${t.search.under} ${money(r.max)}` : `${t.search.over} ${money(r.min!)}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (make) p.set("make", make);
    if (model) p.set("model", model);
    const r = PRICE_RANGES.find((x) => x.value === price);
    if (r?.min) p.set("minPrice", String(r.min));
    if (r?.max) p.set("maxPrice", String(r.max));
    router.push(`/inventory${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <form onSubmit={submit} role="search" aria-label={t.search.label} className="grid gap-4 rounded-[4px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:gap-5">
      <Select id="sp-make" label={t.search.make} value={make} onChange={(v) => { setMake(v); setModel(""); }}>
        <option value="">{t.search.allMakes}</option>
        {makes.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
      <Select id="sp-model" label={t.search.model} value={model} onChange={setModel} disabled={!make}>
        <option value="">{t.search.allModels}</option>
        {models.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
      <Select id="sp-price" label={t.search.price} value={price} onChange={setPrice}>
        <option value="">{t.search.anyPrice}</option>
        {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{priceLabel(r)}</option>)}
      </Select>
      <button type="submit" className="btn-primary h-[42px] px-8 lg:min-w-[184px]">
        <Search className="h-4 w-4" aria-hidden /> {t.search.submit}
      </button>
    </form>
  );
}
