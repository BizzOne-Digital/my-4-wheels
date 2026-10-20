"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { date } from "@/components/admin/cells";

export default function InquiriesAdmin() {
  return (
    <ResourceManager
      resource="inquiries"
      title="Inquiries"
      canCreate={false}
      canDelete
      statusControl={{ key: "status", options: ["new", "in-progress", "closed"] }}
      filters={[
        { key: "status", label: "Status", options: ["new", "in-progress", "closed"].map((v) => ({ value: v, label: v })) },
        { key: "subject", label: "Subject", options: ["general", "vehicle", "financing", "trade-in", "sell", "offer", "careers", "other"].map((v) => ({ value: v, label: v })) },
      ]}
      columns={[
        { key: "createdAt", label: "Received", render: (i) => date(i.createdAt) },
        { key: "name", label: "From", render: (i) => <div>{String(i.name)}<p className="text-xs text-neutral-500">{String(i.email)}</p></div> },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message", render: (i) => <span className="line-clamp-2 max-w-sm">{String(i.message)}</span> },
      ]}
      detail={(i) => {
        const v = i.vehicle as { year: number; make: string; model: string } | null;
        const details = Object.entries((i.details as Record<string, string>) ?? {}).filter(([, x]) => x);
        return (
          <div className="space-y-2">
            <p><strong>Email:</strong> <a href={`mailto:${i.email}`} className="text-brand">{String(i.email)}</a> · <strong>Phone:</strong> {i.phone ? <a href={`tel:${i.phone}`} className="text-brand">{String(i.phone)}</a> : "–"}</p>
            {v && <p><strong>Vehicle:</strong> {v.year} {v.make} {v.model}</p>}
            {details.length > 0 && <p><strong>Details:</strong> {details.map(([k, x]) => `${k}: ${x}`).join(" · ")}</p>}
            <p className="whitespace-pre-line">{String(i.message)}</p>
            <p className="text-xs text-neutral-500">Email notification: {String(i.emailStatus)}</p>
          </div>
        );
      }}
      emptyText="No inquiries yet."
    />
  );
}
