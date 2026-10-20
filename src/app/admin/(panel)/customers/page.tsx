"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, date } from "@/components/admin/cells";
import { CustomerToggle } from "./CustomerToggle";

export default function CustomersAdmin() {
  return (
    <ResourceManager
      resource="customers"
      title="Customers"
      description="Customer portal accounts. Deactivating an account signs the customer out immediately."
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "name", label: "Name", render: (c) => <span className="font-semibold">{String(c.name)}</span> },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "createdAt", label: "Joined", render: (c) => date(c.createdAt) },
        { key: "active", label: "Active", render: (c) => <div className="flex items-center gap-2"><Badge value={String(c.active)} /><CustomerToggle id={c._id} active={Boolean(c.active)} /></div> },
      ]}
      emptyText="No customer accounts yet."
    />
  );
}
