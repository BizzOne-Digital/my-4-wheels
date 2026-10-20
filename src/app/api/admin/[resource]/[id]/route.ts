import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { RESOURCES } from "@/lib/admin/resources";
import { applyBookingPatch, prepareUpdate } from "@/lib/admin/prepare";
import { cleanupReplacedUploads } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(params: Ctx["params"]) {
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def || !isValidObjectId(id)) throw new HttpError(404, "not_found");
  await connectDB();
  return { resource, id, def };
}

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id, def } = await load(params);
  const item = await def.model.findOne({ _id: id, ...(def.baseFilter ?? {}) }).lean();
  if (!item) throw new HttpError(404, "not_found");
  return json({ success: true, item });
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  await requireAdmin();
  const { resource, id, def } = await load(params);
  if (!def.update) throw new HttpError(405, "not_allowed");
  const existing = await def.model.findOne({ _id: id, ...(def.baseFilter ?? {}) }).lean<Record<string, unknown>>();
  if (!existing) throw new HttpError(404, "not_found");
  const input = def.update.parse(await readJson(req));

  if (resource === "bookings") {
    const item = await applyBookingPatch(id, existing, input);
    return json({ success: true, item });
  }

  const data = await prepareUpdate(resource, input, existing);
  // Save first; only then remove uploads that are no longer referenced.
  const item = await def.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean<Record<string, unknown>>();
  if (def.images && item) await cleanupReplacedUploads(def.images(existing), def.images(item));
  if (resource === "customers" && input.active === false) {
    const { Session } = await import("@/models/Session");
    await Session.deleteMany({ user: id });
  }
  return json({ success: true, item });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  await requireAdmin();
  const { id, def } = await load(params);
  if (!def.deletable) throw new HttpError(405, "not_allowed");
  const existing = await def.model.findByIdAndDelete(id).lean<Record<string, unknown>>();
  if (!existing) throw new HttpError(404, "not_found");
  if (def.images) await cleanupReplacedUploads(def.images(existing), []);
  return json({ success: true });
});
