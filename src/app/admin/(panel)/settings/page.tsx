"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { api, errorMessage } from "@/lib/api-client";

type L = { en: string; fr: string };
type Day = { open: boolean; start: string; end: string };
type S = {
  businessName: string; website: string; phone: string; phoneE164: string; email: string; emailVerified: boolean;
  street: string; city: string; region: string; postalCode: string; country: string; hoursText: L; logo: string; logoDark: string;
  seo: { title: L; description: L; ogImage: string };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string; google: string };
  booking: { slotMinutes: number; capacityPerSlot: number; leadTimeHours: number; maxDaysAhead: number; cancelHoursBefore: number; allowCustomerCancel: boolean; allowRescheduleRequest: boolean; weekly: Day[]; blockedDates: string[] };
  payments: { depositEnabled: boolean; depositAmountCents: number; depositTypes: string[] };
};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TYPES = ["test-drive", "visit", "financing", "trade-in"];

export default function SettingsAdmin() {
  const [s, setS] = useState<S | null>(null);
  const [integrations, setIntegrations] = useState({ email: false, stripe: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    api<{ settings: S; integrations: { email: boolean; stripe: boolean } }>("/api/admin/settings")
      .then((r) => { setS(r.settings); setIntegrations(r.integrations); })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p className="text-sm text-brand-dark">{error}</p>;
  if (!s) return <p className="flex items-center gap-2 text-sm text-neutral-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading settings…</p>;

  const up = <K extends keyof S>(k: K, v: S[K]) => setS({ ...s, [k]: v });
  const upB = <K extends keyof S["booking"]>(k: K, v: S["booking"][K]) => setS({ ...s, booking: { ...s.booking, [k]: v } });

  const save = async () => {
    setSaving(true);
    try {
      const { businessName, website, phone, phoneE164, email, emailVerified, street, city, region, postalCode, country, hoursText, logo, logoDark, seo, social, booking, payments } = s;
      const r = await api<{ settings: S }>("/api/admin/settings", { method: "PATCH", body: { businessName, website, phone, phoneE164, email, emailVerified, street, city, region, postalCode, country, hoursText, logo, logoDark, seo, social, booking, payments } });
      setS(r.settings);
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const text = (label: string, value: string, on: (v: string) => void, type = "text") => {
    const id = `s-${label.replace(/\W+/g, "-").toLowerCase()}`;
    return (<div><label htmlFor={id} className="label">{label}</label><input id={id} type={type} className="input" value={value} onChange={(e) => on(e.target.value)} /></div>);
  };
  const locField = (label: string, v: L, on: (v: L) => void) => (
    <fieldset className="sm:col-span-2"><legend className="label">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["en", "fr"] as const).map((l) => <input key={l} aria-label={`${label} (${l})`} className="input" placeholder={l.toUpperCase()} value={v[l]} onChange={(e) => on({ ...v, [l]: e.target.value })} />)}
      </div>
    </fieldset>
  );
  const Section = ({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) => (
    <section className="card p-6"><h2 className="text-lg font-bold">{title}</h2>{note && <p className="mt-1 text-xs text-neutral-500">{note}</p>}<div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div></section>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      {Section({ title: "Business details", children: (<>
        {text("Business name", s.businessName, (v) => up("businessName", v))}
        {text("Website", s.website, (v) => up("website", v))}
        {text("Phone (display)", s.phone, (v) => up("phone", v))}
        {text("Phone (international, for tel: links)", s.phoneE164, (v) => up("phoneE164", v))}
        {text("Business email", s.email, (v) => up("email", v), "email")}
        <label className="flex items-center gap-2 pt-6 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand" checked={s.emailVerified} onChange={(e) => up("emailVerified", e.target.checked)} /> Email confirmed by client (shown publicly only when ticked)</label>
        {text("Street", s.street, (v) => up("street", v))}
        {text("City", s.city, (v) => up("city", v))}
        {text("Province", s.region, (v) => up("region", v))}
        {text("Postal code", s.postalCode, (v) => up("postalCode", v))}
        {locField("Opening hours text", s.hoursText, (v) => up("hoursText", v))}
      </>) })}
      {Section({ title: "Logo", note: "Leave empty to use the built-in vector logo.", children: (<>
        <AdminImageField label="Logo (light backgrounds)" folder="misc" value={s.logo} onChange={(v) => up("logo", v)} />
        <AdminImageField label="Logo (dark backgrounds)" folder="misc" value={s.logoDark} onChange={(v) => up("logoDark", v)} />
      </>) })}
      {Section({ title: "SEO", children: (<>
        {locField("Default title", s.seo.title, (v) => up("seo", { ...s.seo, title: v }))}
        {locField("Default description", s.seo.description, (v) => up("seo", { ...s.seo, description: v }))}
        <AdminImageField label="Social share image" folder="misc" value={s.seo.ogImage} onChange={(v) => up("seo", { ...s.seo, ogImage: v })} />
      </>) })}
      {Section({ title: "Social links", note: "Full https:// URLs. Empty links are hidden.", children: (<>
        {(Object.keys(s.social) as (keyof S["social"])[]).map((k) => <div key={k}>{text(k[0].toUpperCase() + k.slice(1), s.social[k], (v) => up("social", { ...s.social, [k]: v }), "url")}</div>)}
      </>) })}
      {Section({ title: "Booking availability", note: "All times are America/Toronto (Montréal).", children: (<>
        {text("Slot length (minutes)", String(s.booking.slotMinutes), (v) => upB("slotMinutes", Number(v)), "number")}
        {text("Appointments per slot", String(s.booking.capacityPerSlot), (v) => upB("capacityPerSlot", Number(v)), "number")}
        {text("Minimum notice (hours)", String(s.booking.leadTimeHours), (v) => upB("leadTimeHours", Number(v)), "number")}
        {text("Book up to (days ahead)", String(s.booking.maxDaysAhead), (v) => upB("maxDaysAhead", Number(v)), "number")}
        {text("Customers can cancel up to (hours before)", String(s.booking.cancelHoursBefore), (v) => upB("cancelHoursBefore", Number(v)), "number")}
        <div className="space-y-2 pt-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand" checked={s.booking.allowCustomerCancel} onChange={(e) => upB("allowCustomerCancel", e.target.checked)} /> Allow online cancellation</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand" checked={s.booking.allowRescheduleRequest} onChange={(e) => upB("allowRescheduleRequest", e.target.checked)} /> Allow reschedule requests</label>
        </div>
        <fieldset className="sm:col-span-2"><legend className="label">Weekly schedule</legend>
          <div className="divide-y divide-neutral-100 rounded-[4px] border border-neutral-200">
            {s.booking.weekly.map((d, i) => (
              <div key={DAYS[i]} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                <label className="flex w-36 items-center gap-2 font-medium"><input type="checkbox" className="h-4 w-4 accent-brand" checked={d.open} onChange={(e) => upB("weekly", s.booking.weekly.map((x, j) => (j === i ? { ...x, open: e.target.checked } : x)))} /> {DAYS[i]}</label>
                <input aria-label={`${DAYS[i]} opens`} type="time" className="input w-32" disabled={!d.open} value={d.start} onChange={(e) => upB("weekly", s.booking.weekly.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
                <span>to</span>
                <input aria-label={`${DAYS[i]} closes`} type="time" className="input w-32" disabled={!d.open} value={d.end} onChange={(e) => upB("weekly", s.booking.weekly.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2"><legend className="label">Blocked dates (holidays, closures)</legend>
          <div className="flex gap-2">
            <input aria-label="Date to block" type="date" className="input w-48" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button type="button" className="btn-outline btn-sm" disabled={!newDate} onClick={() => { if (!s.booking.blockedDates.includes(newDate)) upB("blockedDates", [...s.booking.blockedDates, newDate].sort()); setNewDate(""); }}><Plus className="h-3.5 w-3.5" aria-hidden /> Block date</button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {s.booking.blockedDates.length === 0 && <li className="text-xs text-neutral-500">No blocked dates.</li>}
            {s.booking.blockedDates.map((d) => (
              <li key={d} className="flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold">{d}
                <button type="button" aria-label={`Unblock ${d}`} onClick={() => upB("blockedDates", s.booking.blockedDates.filter((x) => x !== d))}><X className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        </fieldset>
      </>) })}
      {Section({ title: "Payments (booking deposits)", note: integrations.stripe ? "Stripe keys detected in the environment." : "Stripe keys are not configured (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET). Deposits stay off until they are.", children: (<>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand" checked={s.payments.depositEnabled} onChange={(e) => up("payments", { ...s.payments, depositEnabled: e.target.checked })} /> Require a deposit</label>
        {text("Deposit amount (CAD)", String(s.payments.depositAmountCents / 100), (v) => up("payments", { ...s.payments, depositAmountCents: Math.round(Number(v) * 100) || 0 }), "number")}
        <fieldset className="sm:col-span-2"><legend className="label">Appointment types requiring a deposit</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            {TYPES.map((t) => <label key={t} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand" checked={s.payments.depositTypes.includes(t)} onChange={(e) => up("payments", { ...s.payments, depositTypes: e.target.checked ? [...s.payments.depositTypes, t] : s.payments.depositTypes.filter((x) => x !== t) })} /> {t}</label>)}
          </div>
        </fieldset>
      </>) })}
      <section className="card p-6 text-sm"><h2 className="text-lg font-bold">Email notifications</h2><p className="mt-2 text-neutral-600">{integrations.email ? "SMTP is configured." : "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM to send notifications."}</p></section>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white px-4 py-3 lg:left-60">
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
      </div>
    </div>
  );
}
