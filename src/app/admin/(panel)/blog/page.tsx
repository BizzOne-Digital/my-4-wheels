"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, Thumb, date, loc } from "@/components/admin/cells";
import { BLOG_DEFAULTS, BLOG_FIELDS } from "@/lib/admin/fields";

export default function BlogAdmin() {
  return (
    <ResourceManager
      resource="blog"
      title="Blog"
      description="Only published articles appear on the website. Demo articles are seeded as drafts."
      fields={BLOG_FIELDS}
      defaults={BLOG_DEFAULTS}
      filters={[{ key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] }]}
      columns={[
        { key: "img", label: "", render: (p) => <Thumb src={String(p.coverImage ?? "")} /> },
        { key: "title", label: "Title", render: (p) => <span className="font-semibold">{loc(p.title)} {p.isDemo ? <Badge value="demo" /> : null}</span> },
        { key: "category", label: "Category" },
        { key: "status", label: "Status", render: (p) => <Badge value={String(p.status)} /> },
        { key: "publishedAt", label: "Published", render: (p) => date(p.publishedAt) || "–" },
      ]}
    />
  );
}
