
import { StoredUpload, UPLOAD_FOLDERS, type UploadFolder } from "@/models/StoredUpload";
import { Vehicle } from "@/models/Vehicle";
import { Service } from "@/models/Service";
import { PageContent } from "@/models/PageContent";
import { BlogPost } from "@/models/BlogPost";
import { TeamMember } from "@/models/TeamMember";
import { Offer } from "@/models/Offer";
import { SiteSettings } from "@/models/SiteSettings";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" } as const;
export type AllowedMime = keyof typeof ALLOWED_MIME;

export const FILENAME_RE = /^\d{13}-[a-f0-9]{24}\.(jpg|png|webp|gif)$/;
export const isUploadFolder = (f: string): f is UploadFolder => (UPLOAD_FOLDERS as readonly string[]).includes(f);

/** Detects the real image type from magic bytes. Returns null for anything else (including SVG). */
export function sniffImage(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  const head6 = buf.subarray(0, 6).toString("ascii");
  if (head6 === "GIF87a" || head6 === "GIF89a") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

/** Validates and splits an internal upload URL. Returns null for external or malformed URLs. */
export function parseUploadUrl(url: unknown): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith("/api/uploads/")) return null;
  const rest = url.slice("/api/uploads/".length);
  const parts = rest.split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isUploadFolder(folder) || !FILENAME_RE.test(filename)) return null;
  return { folder, filename };
}

/** True if any content document still points at this upload URL. */
export async function isUploadReferenced(url: string) {
  const checks = await Promise.all([
    Vehicle.exists({ images: url }),
    Service.exists({ image: url }),
    PageContent.exists({ image: url }),
    BlogPost.exists({ coverImage: url }),
    TeamMember.exists({ photo: url }),
    Offer.exists({ image: url }),
    SiteSettings.exists({ $or: [{ logo: url }, { logoDark: url }, { "seo.ogImage": url }] }),
  ]);
  return checks.some(Boolean);
}

/** Deletes an internal upload only if nothing references it. External URLs are never touched. */
export async function deleteUploadIfUnreferenced(url: string) {
  const parsed = parseUploadUrl(url);
  if (!parsed) return false;
  if (await isUploadReferenced(url)) return false;
  const r = await StoredUpload.deleteOne(parsed);
  return r.deletedCount === 1;
}

/** Call after a content document was saved: removes uploads that were dropped from it. */
export async function cleanupReplacedUploads(before: string[], after: string[]) {
  const keep = new Set(after);
  for (const url of new Set(before)) {
    if (!keep.has(url)) {
      try {
        await deleteUploadIfUnreferenced(url);
      } catch (e) {
        console.error("[upload cleanup]", e); // content save already succeeded; orphan cleanup will retry later
      }
    }
  }
}

/** Uploads older than `hours` that no document references (abandoned edits). */
export async function findOrphans(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 3600_000);
  const candidates = await StoredUpload.find({ createdAt: { $lt: cutoff } }, { folder: 1, filename: 1, size: 1, createdAt: 1 }).lean();
  const orphans = [];
  for (const c of candidates) {
    const url = `/api/uploads/${c.folder}/${c.filename}`;
    if (!(await isUploadReferenced(url))) orphans.push({ ...c, url });
  }
  return orphans;
}

export async function deleteOrphans(hours = 24) {
  const orphans = await findOrphans(hours);
  for (const o of orphans) await StoredUpload.deleteOne({ folder: o.folder, filename: o.filename });
  return orphans.length;
}
