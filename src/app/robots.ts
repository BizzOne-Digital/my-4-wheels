import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://my4wheels.com";
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/uploads/"], disallow: ["/admin", "/account", "/api/", "/booking/confirmation"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
