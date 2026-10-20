import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, HttpError, json, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";
import { ALLOWED_MIME, isUploadFolder, MAX_UPLOAD_BYTES, sniffImage } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  await rateLimit("upload", `${admin.id}:${clientIp(req)}`, 60, 600);

  // Reject obviously oversized bodies before buffering them.
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) throw new HttpError(413, "file_too_large");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, "invalid_form");
  }
  const folder = String(form.get("folder") ?? "");
  if (!isUploadFolder(folder)) throw new HttpError(400, "invalid_folder");
  const file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "file_missing");
  if (file.size === 0) throw new HttpError(400, "file_empty");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "file_too_large");
  if (!(file.type in ALLOWED_MIME)) throw new HttpError(415, "unsupported_type");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImage(buffer);
  if (!sniffed || sniffed !== file.type) throw new HttpError(415, "signature_mismatch");

  const ext = ALLOWED_MIME[sniffed];
  const filename = `${Date.now()}-${randomBytes(12).toString("hex")}.${ext}`;
  await connectDB();
  await StoredUpload.create({ folder, filename, mimeType: sniffed, size: buffer.length, data: buffer });

  return json({ success: true, url: `/api/uploads/${folder}/${filename}`, filename, size: buffer.length, folder }, 201);
});
