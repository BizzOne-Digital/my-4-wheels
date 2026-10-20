"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, date } from "@/components/admin/cells";

export function PaymentsList() {
  return (
    <ResourceManager
      resource="payments"
      title="Payments"
      canCreate={false}
      canDelete={false}
      filters={[{ key: "status", label: "Status", options: ["created", "paid", "expired", "failed", "refunded"].map((v) => ({ value: v, label: v })) }]}
      columns={[
        { key: "createdAt", label: "Created", render: (p) => date(p.createdAt) },
        { key: "booking", label: "Booking", render: (p) => { const b = p.booking as { reference: string; name: string } | null; return b ? `${b.reference} · ${b.name}` : "–"; } },
        { key: "amount", label: "Amount", render: (p) => `${(Number(p.amountCents) / 100).toFixed(2)} ${String(p.currency).toUpperCase()}` },
        { key: "status", label: "Status", render: (p) => <Badge value={String(p.status)} /> },
      ]}
      emptyText="No payments yet. Deposits are disabled by default."
    />
  );
}
