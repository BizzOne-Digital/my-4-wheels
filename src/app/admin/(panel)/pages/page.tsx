"use client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Thumb, loc } from "@/components/admin/cells";
import { PAGE_DEFAULTS, PAGE_FIELDS } from "@/lib/admin/fields";

export default function PagesAdmin() {
  return (
    <ResourceManager
      resource="pages"
      title="Page content"
      description="Editable homepage sections and page copy. Keys used by the site: home.hero, home.about, home.cta, about.main, about.owner (owner name = Title, role = Subtitle, bio = Body, photo = Image; hidden until “Visible” is ticked). Empty fields fall back to the default translations."
      fields={PAGE_FIELDS}
      defaults={PAGE_DEFAULTS}
      columns={[
        { key: "img", label: "", render: (p) => <Thumb src={String(p.image ?? "")} /> },
        { key: "key", label: "Key", render: (p) => <span className="font-mono text-xs">{String(p.key)}</span> },
        { key: "label", label: "Label" },
        { key: "title", label: "Title", render: (p) => loc(p.title) },
      ]}
    />
  );
}
