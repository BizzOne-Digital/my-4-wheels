import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { RESOURCES } from "@/lib/admin/resources";
import { prepareCreate } from "@/lib/admin/prepare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string }> };
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const GET = route<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) throw new HttpError(404, "not_found");
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || 25));
  const filter: Record<string, unknown> = { ...(def.baseFilter ?? {}) };
  for (const f of def.filters ?? []) {
    const v = sp.get(f);
    if (v) filter[f] = v === "true" ? true : v === "false" ? false : v;
  }
  const q = sp.get("q")?.trim();
  if (q && def.search?.length) filter.$or = def.search.map((k) => ({ [k]: { $regex: escape(q.slice(0, 80)), $options: "i" } }));
  let query = def.model.find(filter).sort(def.sort).skip((page - 1) * limit).limit(limit);
  if (def.populate) query = query.populate(def.populate.path, def.populate.select);
  const [items, total] = await Promise.all([query.lean(), def.model.countDocuments(filter)]);
  return json({ success: true, items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const POST = route<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  await requireAdmin();
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def?.create) throw new HttpError(404, "not_found");
  await connectDB();
  const data = await prepareCreate(resource, def.create.parse(await readJson(req)));
  const doc = await def.model.create(data);
  return json({ success: true, item: doc.toObject() }, 201);
});
