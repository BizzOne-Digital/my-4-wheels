import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { FILENAME_RE, isUploadFolder } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function GET(req: NextRequest, { params }: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await params;
  // Reject encoded or ambiguous path input: the raw path must contain exactly the expected plain segments.
  const rawPath = new URL(req.url).pathname;
  if (rawPath.includes("%") || rawPath.includes("\\") || rawPath !== `/api/uploads/${folder}/${filename}`) return notFound();
  if (!isUploadFolder(folder)) return notFound();
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || !FILENAME_RE.test(filename)) return notFound();

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).select("+data mimeType").lean();
    if (!doc || !doc.data) return notFound();
    const raw = doc.data as unknown as Buffer | { buffer: ArrayBuffer };
    const buf = Buffer.isBuffer(raw) ? raw : Buffer.from((raw as { buffer: ArrayBuffer }).buffer);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch (e) {
    console.error("[uploads GET]", e);
    return new Response("Server error", { status: 500 });
  }
}
