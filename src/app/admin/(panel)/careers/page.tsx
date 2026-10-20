"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, loc } from "@/components/admin/cells";
import { JOB_DEFAULTS, JOB_FIELDS } from "@/lib/admin/fields";

export default function CareersAdmin() {
  return (
    <ResourceManager
      resource="careers"
      title="Careers"
      description="Job postings shown on /careers. Only “open” postings are public. Applications arrive in Inquiries with the subject “careers”."
      fields={JOB_FIELDS}
      defaults={JOB_DEFAULTS}
      filters={[{ key: "status", label: "Status", options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }] }]}
      columns={[
        { key: "order", label: "#" },
        { key: "title", label: "Position", render: (j) => <span className="font-semibold">{loc(j.title)}</span> },
        { key: "type", label: "Type" },
        { key: "location", label: "Location" },
        { key: "status", label: "Status", render: (j) => <Badge value={String(j.status) === "open" ? "published" : "closed"} /> },
      ]}
      emptyText="No job postings yet. Click “Add new” to publish an opening."
    />
  );
}
