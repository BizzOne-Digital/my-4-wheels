"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/admin/cells";
import { TESTIMONIAL_DEFAULTS, TESTIMONIAL_FIELDS } from "@/lib/admin/fields";

export default function TestimonialsAdmin() {
  return (
    <ResourceManager
      resource="testimonials"
      title="Testimonials"
      description="Publish only genuine customer feedback. Website submissions arrive as “pending”."
      fields={TESTIMONIAL_FIELDS}
      defaults={TESTIMONIAL_DEFAULTS}
      filters={[{ key: "status", label: "Status", options: ["pending", "published", "hidden"].map((v) => ({ value: v, label: v })) }]}
      columns={[
        { key: "name", label: "Customer", render: (x) => <span className="font-semibold">{String(x.name)}</span> },
        { key: "quote", label: "Quote", render: (x) => <span className="line-clamp-2 max-w-md">{String(x.quote)}</span> },
        { key: "rating", label: "Rating", render: (x) => (x.rating ? `${x.rating}/5` : "–") },
        { key: "status", label: "Status", render: (x) => <Badge value={String(x.status)} /> },
      ]}
    />
  );
}
