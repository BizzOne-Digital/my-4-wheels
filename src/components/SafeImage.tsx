"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import { isLocalSiteImage, resolveSiteImage } from "@/lib/images";

/** Only sources next/image is configured for are rendered; everything else uses the placeholder. */
export function isRenderableSrc(src: unknown): src is string {
  if (typeof src !== "string" || !src) return false;
  if (src.startsWith("/uploads/") || src.startsWith("/public/uploads/")) return false; // legacy disk paths
  return isLocalSiteImage(src) || src.startsWith("/api/uploads/") || src.startsWith("https://images.unsplash.com/");
}

type Props = Omit<ImageProps, "src" | "onError"> & { src?: string | null; placeholderClassName?: string };

export function SafeImage({ src: suppliedSrc, alt, placeholderClassName, className, ...rest }: Props) {
  const src = resolveSiteImage(suppliedSrc);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (failed || !isRenderableSrc(src)) {
    const sizeStyle = rest.fill ? undefined : { width: rest.width as number, height: rest.height as number, maxWidth: "100%" };
    return (
      <div
        role="img"
        aria-label={alt}
        style={sizeStyle}
        className={`${rest.fill ? "absolute inset-0" : ""} flex items-center justify-center bg-neutral-200 text-neutral-400 ${placeholderClassName ?? ""} ${className ?? ""}`}
      >
        <Car className="h-10 w-10" strokeWidth={1.2} aria-hidden />
      </div>
    );
  }
  return <Image src={src} alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}
