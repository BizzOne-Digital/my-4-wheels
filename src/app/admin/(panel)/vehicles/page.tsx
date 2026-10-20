"use client";
import Link from "next/link";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, Thumb, money } from "@/components/admin/cells";
import { RemoveDemoButton } from "../RemoveDemoButton";

export default function VehiclesAdmin() {
  return (
    <ResourceManager
      resource="vehicles"
      title="Vehicles"
      description="Demo listings are marked “demo”. Remove them before launch."
      createHref="/admin/vehicles/new"
      canCreate
      canDelete
      editHref={(v) => `/admin/vehicles/${v._id}/edit`}
      toolbar={<RemoveDemoButton />}
      filters={[
        { key: "status", label: "Status", options: ["available", "reserved", "sold"].map((v) => ({ value: v, label: v })) },
        { key: "featured", label: "Featured", options: [{ value: "true", label: "Featured" }, { value: "false", label: "Not featured" }] },
        { key: "isDemo", label: "Demo", options: [{ value: "true", label: "Demo only" }, { value: "false", label: "Real only" }] },
      ]}
      columns={[
        { key: "img", label: "", render: (v) => <Thumb src={(v.images as string[])?.[0]} /> },
        {
          key: "title",
          label: "Vehicle",
          render: (v) => (
            <div>
              <Link href={`/inventory/${v.slug}`} target="_blank" className="font-semibold hover:text-brand">{`${v.year} ${v.make} ${v.model}`}</Link>
              <p className="text-xs text-neutral-500">{v.trim as string} {v.isDemo ? <Badge value="demo" /> : null}</p>
            </div>
          ),
        },
        { key: "price", label: "Price", render: (v) => money(v.price) },
        { key: "mileage", label: "Km", render: (v) => Number(v.mileage).toLocaleString("en-CA") },
        { key: "status", label: "Status", render: (v) => <Badge value={String(v.status)} /> },
        { key: "featured", label: "Featured", render: (v) => (v.featured ? "Yes" : "–") },
        { key: "published", label: "Published", render: (v) => <Badge value={String(v.published)} /> },
      ]}
      emptyText="No vehicles yet. Click “Add new” to create your first listing."
    />
  );
}
