"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { SafeImage } from "../SafeImage";

export type UploadFolder = "products" | "gallery" | "pages" | "misc";
const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const SERVER_MAX = 8 * 1024 * 1024;
/**
 * Most serverless hosts cap request bodies below 8MB (Vercel: 4.5MB). Images above this size are
 * resized/re-encoded in the browser before upload. Override with NEXT_PUBLIC_UPLOAD_HOST_LIMIT_MB.
 */
const HOST_LIMIT = Math.min(SERVER_MAX, Number(process.env.NEXT_PUBLIC_UPLOAD_HOST_LIMIT_MB || 4) * 1024 * 1024);
const MAX_DIMENSION = 2560;

async function prepareFile(file: File): Promise<File> {
  if (file.type === "image/gif") {
    if (file.size > HOST_LIMIT) throw new Error(`GIF is too large (max ${(HOST_LIMIT / 1048576).toFixed(1)} MB). Animated GIFs cannot be compressed in the browser.`);
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= HOST_LIMIT) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/webp" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  for (const q of [0.88, 0.8, 0.7, 0.6, 0.5]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
    if (blob && blob.size <= HOST_LIMIT) return new File([blob], file.name.replace(/\.\w+$/, type === "image/webp" ? ".webp" : ".jpg"), { type });
  }
  throw new Error("Image is too large even after compression. Please use a smaller image.");
}

const ERRORS: Record<string, string> = {
  unsupported_type: "Only JPEG, PNG, WebP and GIF images are allowed.",
  signature_mismatch: "This file is not a valid image of the declared type.",
  file_too_large: "The image is larger than the 8 MB limit.",
  invalid_folder: "Invalid upload folder.",
  unauthorized: "Your admin session has expired. Please sign in again.",
  rate_limited: "Too many uploads. Please wait a moment.",
};

/** Reusable admin image input. Uploads to MongoDB via /api/upload and returns the public URL through onChange. */
export function AdminImageField({
  label,
  value,
  onChange,
  folder,
  id,
  compact,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  id?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fieldId = id ?? `img-${label.replace(/\W+/g, "-").toLowerCase()}`;

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    if (!ACCEPT.includes(file.type)) {
      toast.error(ERRORS.unsupported_type);
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      toast.error("File is too large.");
      return;
    }
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const prepared = await prepareFile(file);
      const fd = new FormData();
      fd.append("file", prepared);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd, headers: { "x-m4w-csrf": "1" }, credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(res.status === 413 ? ERRORS.file_too_large : ERRORS[data.error] ?? "Upload failed. Please try again.");
      }
      onChange(data.url);
      toast.success("Image uploaded. Save the form to apply it.");
    } catch (e) {
      // Previous saved image is untouched.
      toast.error((e as Error).message || "Upload failed.");
    } finally {
      setPreview(null);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shown = preview ?? value;
  return (
    <div>
      <span className="label" id={`${fieldId}-label`}>
        {label}
      </span>
      <div className={`flex items-center gap-4 ${compact ? "" : "rounded-[4px] border border-dashed border-neutral-300 p-3"}`}>
        <div className={`relative shrink-0 overflow-hidden rounded-[3px] bg-neutral-100 ${compact ? "h-16 w-24" : "h-24 w-36"}`}>
          {shown ? (
            preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover opacity-60" />
            ) : (
              <SafeImage src={value} alt="" fill sizes="150px" className="object-cover" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <ImagePlus className="h-6 w-6" aria-hidden />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <Loader2 className="h-6 w-6 animate-spin text-brand" aria-label="Uploading" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={ACCEPT.join(",")}
            className="sr-only"
            disabled={uploading}
            aria-labelledby={`${fieldId}-label`}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button type="button" className="btn-outline btn-sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {value ? <RefreshCw className="h-3.5 w-3.5" aria-hidden /> : <ImagePlus className="h-3.5 w-3.5" aria-hidden />}
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && !uploading && (
            <button type="button" className="btn btn-sm border border-neutral-300 text-neutral-700 hover:border-brand hover:text-brand" onClick={() => onChange("")}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Ordered list of images built from AdminImageField. */
export function AdminGalleryField({ label, value, onChange, folder }: { label: string; value: string[]; onChange: (v: string[]) => void; folder: UploadFolder }) {
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="space-y-3">
      <legend className="label">{label}</legend>
      {value.map((url, i) => (
        <div key={url + i} className="flex items-center gap-3">
          <div className="flex-1">
            <AdminImageField
              compact
              id={`gal-${i}`}
              label={i === 0 ? "Main photo" : `Photo ${i + 1}`}
              value={url}
              folder={folder}
              onChange={(u) => onChange(u ? value.map((x, k) => (k === i ? u : x)) : value.filter((_, k) => k !== i))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" className="btn-outline btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" className="btn-outline btn-sm" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</button>
          </div>
        </div>
      ))}
      <AdminImageField compact id="gal-new" label="Add photo" value="" folder={folder} onChange={(u) => u && onChange([...value, u])} />
    </fieldset>
  );
}
