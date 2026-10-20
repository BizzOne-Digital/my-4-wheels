"use client";
import { SafeImage } from "../SafeImage";

export const Badge = ({ value }: { value: string }) => {
  const colors: Record<string, string> = {
    available: "bg-green-100 text-green-800", published: "bg-green-100 text-green-800", confirmed: "bg-green-100 text-green-800", paid: "bg-green-100 text-green-800", true: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800", new: "bg-amber-100 text-amber-800", reserved: "bg-amber-100 text-amber-800", draft: "bg-neutral-200 text-neutral-700", created: "bg-neutral-200 text-neutral-700", "in-progress": "bg-blue-100 text-blue-800",
    sold: "bg-neutral-800 text-white", cancelled: "bg-red-100 text-red-800", hidden: "bg-neutral-200 text-neutral-700", false: "bg-neutral-200 text-neutral-700", closed: "bg-neutral-200 text-neutral-700", completed: "bg-neutral-200 text-neutral-700", failed: "bg-red-100 text-red-800", expired: "bg-neutral-200 text-neutral-700",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[value] ?? "bg-neutral-100"}`}>{value}</span>;
};

export const Thumb = ({ src }: { src?: string }) => (
  <div className="relative h-10 w-16 overflow-hidden rounded-[2px] bg-neutral-100">
    <SafeImage src={src} alt="" fill sizes="64px" className="object-cover" />
  </div>
);

export const loc = (v: unknown) => ((v as { en?: string })?.en ?? "") as string;
export const date = (v: unknown) => (v ? new Date(String(v)).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" }) : "");
export const money = (n: unknown) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Number(n) || 0);
