"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, loc } from "@/components/admin/cells";
import { SERVICE_DEFAULTS, SERVICE_FIELDS } from "@/lib/admin/fields";

export default function ServicesAdmin() {
  return (
    <ResourceManager
      resource="services"
      title="Services"
      description="Disabled services are hidden from the website. Leave the price note empty to show “Contact for details”."
      fields={SERVICE_FIELDS}
      defaults={SERVICE_DEFAULTS}
      filters={[{ key: "enabled", label: "Enabled", options: [{ value: "true", label: "Enabled" }, { value: "false", label: "Disabled" }] }]}
      columns={[
        { key: "order", label: "#" },
        { key: "title", label: "Service", render: (s) => <span className="font-semibold">{loc(s.title)}</span> },
        { key: "slug", label: "Slug" },
        { key: "enabled", label: "Enabled", render: (s) => <Badge value={String(s.enabled)} /> },
      ]}
    />
  );
}
