"use client";
import { ResourceManager, type Item } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/admin/cells";
import { BookingNotes } from "./BookingNotes";

const TYPES = ["test-drive", "visit", "financing", "trade-in"];

export default function BookingsAdmin() {
  return (
    <ResourceManager
      resource="bookings"
      title="Bookings"
      description="All times are America/Toronto. Cancelling or completing a booking frees its time slot."
      canCreate={false}
      canDelete={false}
      statusControl={{ key: "status", options: ["pending", "confirmed", "completed", "cancelled"] }}
      filters={[
        { key: "status", label: "Status", options: ["pending", "confirmed", "completed", "cancelled"].map((v) => ({ value: v, label: v })) },
        { key: "type", label: "Type", options: TYPES.map((v) => ({ value: v, label: v })) },
      ]}
      columns={[
        { key: "reference", label: "Ref", render: (b) => <span className="font-semibold">{String(b.reference)}</span> },
        { key: "when", label: "When", render: (b) => `${b.date} ${b.time}` },
        { key: "type", label: "Type" },
        { key: "name", label: "Customer", render: (b) => <div>{String(b.name)}<p className="text-xs text-neutral-500">{String(b.phone)}</p></div> },
        { key: "vehicle", label: "Vehicle", render: (b) => { const v = b.vehicle as { year: number; make: string; model: string } | null; return v ? `${v.year} ${v.make} ${v.model}` : "–"; } },
        { key: "deposit", label: "Deposit", render: (b) => { const d = b.deposit as { required: boolean; status: string }; return d?.required ? <Badge value={d.status} /> : "–"; } },
      ]}
      detail={(b: Item) => (
        <div className="grid gap-4 md:grid-cols-2">
          <dl className="space-y-1">
            <div><dt className="inline font-semibold">Email: </dt><dd className="inline"><a className="text-brand" href={`mailto:${b.email}`}>{String(b.email)}</a></dd></div>
            <div><dt className="inline font-semibold">Phone: </dt><dd className="inline"><a className="text-brand" href={`tel:${b.phone}`}>{String(b.phone)}</a></dd></div>
            <div><dt className="inline font-semibold">Language: </dt><dd className="inline">{String(b.locale)}</dd></div>
            <div><dt className="inline font-semibold">Email notification: </dt><dd className="inline">{String(b.emailStatus)}</dd></div>
            <div><dt className="inline font-semibold">Customer notes: </dt><dd className="inline whitespace-pre-line">{String(b.notes || "–")}</dd></div>
            {b.rescheduleRequest ? <div className="rounded bg-amber-50 p-2"><dt className="font-semibold">Reschedule request:</dt><dd className="whitespace-pre-line">{String(b.rescheduleRequest)}</dd></div> : null}
          </dl>
          <BookingNotes id={b._id} initial={String(b.adminNotes ?? "")} />
        </div>
      )}
      emptyText="No bookings match these filters."
    />
  );
}
