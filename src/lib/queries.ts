import "server-only";
import { connectDB } from "./db";
import { plain } from "./format";
import { Vehicle, BODY_TYPES, TRANSMISSIONS } from "@/models/Vehicle";
import { Service } from "@/models/Service";
import { PageContent } from "@/models/PageContent";
import { Offer } from "@/models/Offer";
import { BlogPost } from "@/models/BlogPost";
import { TeamMember } from "@/models/TeamMember";
import { Testimonial } from "@/models/Testimonial";
import type { VehicleCardData } from "@/components/site/VehicleCard";

const CARD_FIELDS = { slug: 1, year: 1, make: 1, model: 1, trim: 1, price: 1, mileage: 1, transmission: 1, images: { $slice: 1 }, status: 1, isDemo: 1, imagesIllustrative: 1 } as const;

export async function featuredVehicles(limit = 3): Promise<VehicleCardData[]> {
  await connectDB();
  let list = await Vehicle.find({ published: true, featured: true, status: { $ne: "sold" } }, CARD_FIELDS).sort({ updatedAt: -1 }).limit(limit).lean();
  if (list.length < limit) {
    const more = await Vehicle.find({ published: true, status: "available", _id: { $nin: list.map((v) => v._id) } }, CARD_FIELDS).sort({ createdAt: -1 }).limit(limit - list.length).lean();
    list = [...list, ...more];
  }
  return plain(list) as unknown as VehicleCardData[];
}

export async function makeModelMap() {
  await connectDB();
  const rows = await Vehicle.aggregate<{ _id: { make: string; model: string } }>([
    { $match: { published: true, status: { $ne: "sold" } } },
    { $group: { _id: { make: "$make", model: "$model" } } },
  ]);
  const map: Record<string, string[]> = {};
  for (const r of rows) (map[r._id.make] ??= []).push(r._id.model);
  for (const k of Object.keys(map)) map[k].sort();
  return map;
}

export type InventoryParams = {
  q?: string;
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  maxMileage?: string;
  body?: string;
  transmission?: string;
  sort?: string;
  page?: string;
  sold?: string;
};

const num = (v?: string) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const PAGE_SIZE = 9;

export async function searchVehicles(p: InventoryParams) {
  await connectDB();
  const filter: Record<string, unknown> = { published: true };
  if (p.sold !== "1") filter.status = { $ne: "sold" };
  if (p.make) filter.make = String(p.make).slice(0, 60);
  if (p.model) filter.model = String(p.model).slice(0, 60);
  if (p.body && (BODY_TYPES as readonly string[]).includes(p.body)) filter.bodyType = p.body;
  if (p.transmission && (TRANSMISSIONS as readonly string[]).includes(p.transmission)) filter.transmission = p.transmission;
  const price: Record<string, number> = {};
  if (num(p.minPrice) !== undefined) price.$gte = num(p.minPrice)!;
  if (num(p.maxPrice) !== undefined) price.$lte = num(p.maxPrice)!;
  if (Object.keys(price).length) filter.price = price;
  const year: Record<string, number> = {};
  if (num(p.minYear)) year.$gte = num(p.minYear)!;
  if (num(p.maxYear)) year.$lte = num(p.maxYear)!;
  if (Object.keys(year).length) filter.year = year;
  if (num(p.maxMileage) !== undefined) filter.mileage = { $lte: num(p.maxMileage) };
  if (p.q?.trim()) {
    const re = { $regex: escapeRe(p.q.trim().slice(0, 60)), $options: "i" };
    filter.$or = [{ make: re }, { model: re }, { trim: re }];
  }
  const sorts: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    mileage: { mileage: 1 },
    year: { year: -1 },
  };
  const sort = sorts[p.sort ?? ""] ?? sorts.newest;
  const total = await Vehicle.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, num(p.page) ?? 1), pages);
  const items = await Vehicle.find(filter, CARD_FIELDS).sort({ ...sort, _id: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean();
  return { items: plain(items) as unknown as VehicleCardData[], total, page, pages };
}

export async function vehicleBySlug(slug: string) {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  await connectDB();
  const v = await Vehicle.findOne({ slug, published: true }).lean();
  return v ? plain(v) : null;
}

export async function relatedVehicles(v: { _id: string; bodyType: string; price: number }) {
  await connectDB();
  const list = await Vehicle.find(
    { published: true, status: { $ne: "sold" }, _id: { $ne: v._id }, $or: [{ bodyType: v.bodyType }, { price: { $gte: v.price * 0.7, $lte: v.price * 1.3 } }] },
    CARD_FIELDS
  )
    .limit(3)
    .lean();
  return plain(list) as unknown as VehicleCardData[];
}

export async function bookableVehicles() {
  await connectDB();
  const list = await Vehicle.find({ published: true, status: "available" }, { year: 1, make: 1, model: 1, trim: 1 }).sort({ make: 1, model: 1 }).lean();
  return list.map((v) => ({ _id: String(v._id), label: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}` }));
}

export async function enabledServices() {
  await connectDB();
  return plain(await Service.find({ enabled: true }).sort({ order: 1 }).lean());
}

export async function serviceBySlug(slug: string) {
  await connectDB();
  const s = await Service.findOne({ slug, enabled: true }).lean();
  return s ? plain(s) : null;
}

export async function pageContent(key: string) {
  await connectDB();
  const p = await PageContent.findOne({ key }).lean();
  return p ? plain(p) : null;
}

/** Offers that are visible and within their start/expiry window. */
export async function activeOffers(homepageOnly = false) {
  await connectDB();
  const now = new Date();
  const filter: Record<string, unknown> = {
    visible: true,
    $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }],
  };
  if (homepageOnly) filter.showOnHomepage = true;
  return plain(await Offer.find(filter).sort({ order: 1 }).lean());
}

export async function publishedPosts(category?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { status: "published" };
  if (category) filter.category = category;
  return plain(await BlogPost.find(filter, { body: 0 }).sort({ publishedAt: -1 }).lean());
}

export async function postCategories() {
  await connectDB();
  return (await BlogPost.distinct("category", { status: "published" })) as string[];
}

export async function postBySlug(slug: string) {
  await connectDB();
  const p = await BlogPost.findOne({ slug, status: "published" }).lean();
  return p ? plain(p) : null;
}

export async function visibleTeam() {
  await connectDB();
  return plain(await TeamMember.find({ visible: true }).sort({ order: 1 }).lean());
}

export async function publishedTestimonials() {
  await connectDB();
  return plain(await Testimonial.find({ status: "published" }).sort({ createdAt: -1 }).lean());
}

/** Count of listed (not sold) vehicles per body type, for homepage shortcuts. */
export async function bodyTypeCounts() {
  await connectDB();
  const rows = await Vehicle.aggregate<{ _id: string; n: number }>([
    { $match: { published: true, status: { $ne: "sold" } } },
    { $group: { _id: "$bodyType", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n])) as Record<string, number>;
}

/** Open job postings for the Careers page. */
export async function openJobs() {
  await connectDB();
  const { JobPosting } = await import("@/models/JobPosting");
  return plain(await JobPosting.find({ status: "open" }).sort({ order: 1, createdAt: -1 }).lean());
}
