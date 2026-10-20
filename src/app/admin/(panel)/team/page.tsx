"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, Thumb, loc } from "@/components/admin/cells";
import { TEAM_DEFAULTS, TEAM_FIELDS } from "@/lib/admin/fields";

export default function TeamAdmin() {
  return (
    <ResourceManager
      resource="team"
      title="Team"
      fields={TEAM_FIELDS}
      defaults={TEAM_DEFAULTS}
      columns={[
        { key: "photo", label: "", render: (m) => <Thumb src={String(m.photo ?? "")} /> },
        { key: "name", label: "Name", render: (m) => <span className="font-semibold">{String(m.name)}</span> },
        { key: "role", label: "Role", render: (m) => loc(m.role) },
        { key: "order", label: "Order" },
        { key: "visible", label: "Visible", render: (m) => <Badge value={String(m.visible)} /> },
      ]}
      emptyText="No team members yet."
    />
  );
}
