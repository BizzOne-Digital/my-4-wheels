import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { deleteOrphans, deleteUploadIfUnreferenced, isUploadReferenced, isUploadFolder, parseUploadUrl } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Media library listing: metadata only, never the binary. */
export const GET = route(async (req: NextRequest) => {
  await requireAdmin();
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const folder = sp.get("folder") ?? "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = 40;
  const filter = isUploadFolder(folder) ? { folder } : {};
  const [items, total] = await Promise.all([
    StoredUpload.find(filter, { folder: 1, filename: 1, size: 1, mimeType: 1, createdAt: 1 }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    StoredUpload.countDocuments(filter),
  ]);
  const withRefs = await Promise.all(
    items.map(async (i) => {
      const url = `/api/uploads/${i.folder}/${i.filename}`;
      return { ...i, _id: String(i._id), url, referenced: await isUploadReferenced(url) };
    })
  );
  return json({ success: true, items: withRefs, total, page, pages: Math.ceil(total / limit) });
});

/** Delete one upload by internal URL. Refuses external URLs and images still referenced by content. */
export const DELETE = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await connectDB();
  const body = await readJson(req);
  if (body?.orphans === true) {
    const hours = Math.max(1, Math.min(720, Number(body.hours) || 24));
    const removed = await deleteOrphans(hours);
    return json({ success: true, removed });
  }
  const url = body?.url;
  if (!parseUploadUrl(url)) throw new HttpError(400, "invalid_upload_url");
  if (await isUploadReferenced(url)) throw new HttpError(409, "in_use");
  const removed = await deleteUploadIfUnreferenced(url);
  return json({ success: true, removed });
});
