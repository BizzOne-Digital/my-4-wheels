import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";
import { BlogPost } from "@/models/BlogPost";
import { Service } from "@/models/Service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://my4wheels.com";
  const statics = ["", "/inventory", "/about", "/services", "/contact", "/testimonials", "/faq", "/pricing", "/blog", "/booking", "/team", "/offers", "/careers", "/financing", "/trade-in", "/sell-your-car", "/privacy", "/terms"];
  const out: MetadataRoute.Sitemap = statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
  try {
    await connectDB();
    const [vehicles, posts, services] = await Promise.all([
      Vehicle.find({ published: true, status: { $ne: "sold" } }, { slug: 1, updatedAt: 1 }).lean(),
      BlogPost.find({ status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
      Service.find({ enabled: true }, { slug: 1, updatedAt: 1 }).lean(),
    ]);
    for (const v of vehicles) out.push({ url: `${base}/inventory/${v.slug}`, lastModified: v.updatedAt, priority: 0.8 });
    for (const p of posts) out.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt });
    for (const s of services) out.push({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt });
  } catch (e) {
    console.error("[sitemap]", e);
  }
  return out;
}
