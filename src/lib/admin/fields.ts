import type { UploadFolder } from "@/components/admin/AdminImageField";

export type FieldDef =
  | { name: string; label: string; type: "text" | "number" | "date" | "email" | "url"; required?: boolean; help?: string; half?: boolean }
  | { name: string; label: string; type: "textarea"; rows?: number; help?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; half?: boolean }
  | { name: string; label: string; type: "checkbox"; help?: string; half?: boolean }
  | { name: string; label: string; type: "loc"; multiline?: boolean; rows?: number; required?: boolean; help?: string }
  | { name: string; label: string; type: "image"; folder: UploadFolder }
  | { name: string; label: string; type: "gallery"; folder: UploadFolder }
  | { name: string; label: string; type: "lines"; help?: string };

const opts = (xs: readonly string[]) => xs.map((x) => ({ value: x, label: x.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }));

export const VEHICLE_FIELDS: FieldDef[] = [
  { name: "year", label: "Year", type: "number", required: true, half: true },
  { name: "make", label: "Make", type: "text", required: true, half: true },
  { name: "model", label: "Model", type: "text", required: true, half: true },
  { name: "trim", label: "Trim", type: "text", half: true },
  { name: "price", label: "Price (CAD)", type: "number", required: true, half: true },
  { name: "mileage", label: "Mileage (km)", type: "number", required: true, half: true },
  { name: "status", label: "Status", type: "select", options: opts(["available", "reserved", "sold"]), half: true },
  { name: "transmission", label: "Transmission", type: "select", options: opts(["automatic", "manual", "cvt"]), half: true },
  { name: "bodyType", label: "Body type", type: "select", options: opts(["sedan", "suv", "hatchback", "coupe", "truck", "minivan", "wagon", "convertible"]), half: true },
  { name: "fuelType", label: "Fuel", type: "select", options: opts(["gasoline", "diesel", "hybrid", "electric", "plugin-hybrid"]), half: true },
  { name: "drivetrain", label: "Drivetrain", type: "text", half: true },
  { name: "engine", label: "Engine", type: "text", half: true },
  { name: "exteriorColor", label: "Exterior colour", type: "text", half: true },
  { name: "interiorColor", label: "Interior colour", type: "text", half: true },
  { name: "vin", label: "VIN", type: "text", half: true },
  { name: "stockNumber", label: "Stock #", type: "text", half: true },
  { name: "slug", label: "URL slug", type: "text", help: "Leave empty to generate from year/make/model." },
  { name: "images", label: "Photos", type: "gallery", folder: "products" },
  { name: "imagesIllustrative", label: "Photos are illustrative (not this exact vehicle)", type: "checkbox" },
  { name: "features", label: "Features", type: "lines", help: "One feature per line." },
  { name: "description", label: "Description", type: "loc", multiline: true, rows: 6 },
  { name: "inspectionNotes", label: "Inspection notes (only if an inspection was actually done)", type: "loc", multiline: true, rows: 4 },
  { name: "historyReportUrl", label: "Vehicle history report URL (only if supplied)", type: "url" },
  { name: "featured", label: "Featured on homepage", type: "checkbox", half: true },
  { name: "published", label: "Published", type: "checkbox", half: true },
];

export const VEHICLE_DEFAULTS = {
  year: new Date().getFullYear() - 3,
  make: "",
  model: "",
  trim: "",
  price: 0,
  mileage: 0,
  status: "available",
  transmission: "automatic",
  bodyType: "sedan",
  fuelType: "gasoline",
  drivetrain: "",
  engine: "",
  exteriorColor: "",
  interiorColor: "",
  vin: "",
  stockNumber: "",
  slug: "",
  images: [],
  imagesIllustrative: false,
  features: [],
  description: { en: "", fr: "" },
  inspectionNotes: { en: "", fr: "" },
  historyReportUrl: "",
  featured: false,
  published: true,
};

const ICON_OPTIONS = ["car", "financing", "tradein", "buy", "inspection", "history", "warranty", "paperwork", "testdrive", "finder", "handshake"];

export const SERVICE_FIELDS: FieldDef[] = [
  { name: "title", label: "Title", type: "loc", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, half: true },
  { name: "icon", label: "Icon", type: "select", options: opts(ICON_OPTIONS), half: true },
  { name: "summary", label: "Summary", type: "loc", multiline: true, rows: 2 },
  { name: "body", label: "Details", type: "loc", multiline: true, rows: 6, help: "Blank line = new paragraph. Start a line with '- ' for bullets." },
  { name: "priceNote", label: "Price note (leave empty to show “Contact for details”)", type: "loc" },
  { name: "image", label: "Header image", type: "image", folder: "pages" },
  { name: "order", label: "Order", type: "number", half: true },
  { name: "enabled", label: "Enabled", type: "checkbox", half: true },
];
export const SERVICE_DEFAULTS = { title: { en: "", fr: "" }, slug: "", icon: "car", summary: { en: "", fr: "" }, body: { en: "", fr: "" }, priceNote: { en: "", fr: "" }, image: "", order: 0, enabled: true };

export const PAGE_FIELDS: FieldDef[] = [
  { name: "key", label: "Key", type: "text", required: true, half: true, help: "e.g. home.hero, home.about, home.cta, about.main" },
  { name: "label", label: "Admin label", type: "text", half: true },
  { name: "eyebrow", label: "Eyebrow", type: "loc" },
  { name: "title", label: "Title", type: "loc" },
  { name: "subtitle", label: "Subtitle", type: "loc", multiline: true, rows: 2 },
  { name: "body", label: "Body", type: "loc", multiline: true, rows: 8 },
  { name: "image", label: "Image", type: "image", folder: "pages" },
  { name: "imageAlt", label: "Image alt text", type: "loc" },
  { name: "visible", label: "Visible", type: "checkbox" },
];
export const PAGE_DEFAULTS = { key: "", label: "", eyebrow: { en: "", fr: "" }, title: { en: "", fr: "" }, subtitle: { en: "", fr: "" }, body: { en: "", fr: "" }, image: "", imageAlt: { en: "", fr: "" }, visible: true };

export const BLOG_FIELDS: FieldDef[] = [
  { name: "title", label: "Title", type: "loc", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, half: true },
  { name: "category", label: "Category", type: "text", half: true, help: "lowercase-with-dashes" },
  { name: "status", label: "Status", type: "select", options: opts(["draft", "published"]), half: true },
  { name: "author", label: "Author", type: "text", half: true },
  { name: "excerpt", label: "Excerpt", type: "loc", multiline: true, rows: 2 },
  { name: "body", label: "Article", type: "loc", multiline: true, rows: 14, help: "Blank line = new paragraph. '## ' = heading. '- ' = bullet." },
  { name: "coverImage", label: "Cover image", type: "image", folder: "pages" },
];
export const BLOG_DEFAULTS = { title: { en: "", fr: "" }, slug: "", category: "buying-tips", status: "draft", author: "My 4 Wheels", excerpt: { en: "", fr: "" }, body: { en: "", fr: "" }, coverImage: "" };

export const TESTIMONIAL_FIELDS: FieldDef[] = [
  { name: "name", label: "Customer name", type: "text", required: true, half: true },
  { name: "status", label: "Status", type: "select", options: opts(["pending", "published", "hidden"]), half: true },
  { name: "quote", label: "Quote (customer’s own words)", type: "textarea", rows: 4 },
  { name: "rating", label: "Rating (only if the customer gave one)", type: "select", options: [{ value: "", label: "None" }, ...["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v} / 5` }))], half: true },
  { name: "locale", label: "Language", type: "select", options: [{ value: "en", label: "English" }, { value: "fr", label: "French" }], half: true },
  { name: "vehicle", label: "Vehicle purchased", type: "text", half: true },
  { name: "source", label: "Source", type: "text", half: true },
];
export const TESTIMONIAL_DEFAULTS = { name: "", status: "pending", quote: "", rating: "", locale: "en", vehicle: "", source: "" };

export const TEAM_FIELDS: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "loc" },
  { name: "bio", label: "Bio", type: "loc", multiline: true, rows: 3 },
  { name: "photo", label: "Photo", type: "image", folder: "misc" },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "phone", label: "Phone", type: "text", half: true },
  { name: "order", label: "Order", type: "number", half: true },
  { name: "visible", label: "Visible", type: "checkbox", half: true },
];
export const TEAM_DEFAULTS = { name: "", role: { en: "", fr: "" }, bio: { en: "", fr: "" }, photo: "", email: "", phone: "", order: 0, visible: true };

export const OFFER_FIELDS: FieldDef[] = [
  { name: "title", label: "Title", type: "loc", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, half: true },
  { name: "order", label: "Order", type: "number", half: true },
  { name: "subtitle", label: "Subtitle", type: "loc" },
  { name: "body", label: "Details", type: "loc", multiline: true, rows: 4 },
  { name: "eligibility", label: "Eligibility conditions", type: "loc", multiline: true, rows: 4, help: "One condition per line." },
  { name: "image", label: "Image", type: "image", folder: "pages" },
  { name: "startsAt", label: "Starts", type: "date", half: true },
  { name: "expiresAt", label: "Expires", type: "date", half: true },
  { name: "visible", label: "Visible", type: "checkbox", half: true },
  { name: "showOnHomepage", label: "Show in homepage red strip", type: "checkbox", half: true },
];
export const OFFER_DEFAULTS = { title: { en: "", fr: "" }, slug: "", order: 0, subtitle: { en: "", fr: "" }, body: { en: "", fr: "" }, eligibility: { en: "", fr: "" }, image: "", startsAt: "", expiresAt: "", visible: true, showOnHomepage: false };

export const JOB_FIELDS: FieldDef[] = [
  { name: "title", label: "Job title", type: "loc", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, half: true, help: "e.g. sales-advisor" },
  { name: "location", label: "Location", type: "text", half: true },
  { name: "type", label: "Employment type", type: "select", options: opts(["full-time", "part-time", "contract", "seasonal"]), half: true },
  { name: "status", label: "Status", type: "select", options: opts(["open", "closed"]), half: true },
  { name: "summary", label: "Short summary", type: "loc", multiline: true, rows: 2 },
  { name: "description", label: "Full description", type: "loc", multiline: true, rows: 10, help: "Responsibilities, requirements, schedule, pay range. Blank line = new paragraph, '## ' = heading, '- ' = bullet." },
  { name: "order", label: "Order", type: "number", half: true },
];
export const JOB_DEFAULTS = { title: { en: "", fr: "" }, slug: "", location: "Montréal, QC", type: "full-time", status: "open", summary: { en: "", fr: "" }, description: { en: "", fr: "" }, order: 0 };
