"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, date, loc } from "@/components/admin/cells";
import { OFFER_DEFAULTS, OFFER_FIELDS } from "@/lib/admin/fields";

export default function OffersAdmin() {
  return (
    <ResourceManager
      resource="offers"
      title="Offers"
      description="Offers appear while visible and within their start/expiry dates. The first offer marked “homepage” fills the red strip."
      fields={OFFER_FIELDS}
      defaults={OFFER_DEFAULTS}
      columns={[
        { key: "title", label: "Offer", render: (o) => <span className="font-semibold">{loc(o.title)}</span> },
        { key: "expiresAt", label: "Expires", render: (o) => date(o.expiresAt) || "No expiry" },
        { key: "showOnHomepage", label: "Homepage", render: (o) => (o.showOnHomepage ? "Yes" : "–") },
        { key: "visible", label: "Visible", render: (o) => <Badge value={String(o.visible)} /> },
      ]}
    />
  );
}
