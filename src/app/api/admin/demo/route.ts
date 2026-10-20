import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { Vehicle } from "@/models/Vehicle";
import { BlogPost } from "@/models/BlogPost";
import { cleanupReplacedUploads } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async () => {
  await requireAdmin();
  await connectDB();
  const [vehicles, posts] = await Promise.all([Vehicle.countDocuments({ isDemo: true }), BlogPost.countDocuments({ isDemo: true })]);
  return json({ success: true, vehicles, posts });
});

/** Removes all seeded demo listings and demo articles before launch. */
export const DELETE = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await connectDB();
  const vehicles = await Vehicle.find({ isDemo: true }).lean();
  const posts = await BlogPost.find({ isDemo: true }).lean();
  await Vehicle.deleteMany({ isDemo: true });
  await BlogPost.deleteMany({ isDemo: true });
  await cleanupReplacedUploads([...vehicles.flatMap((v) => v.images ?? []), ...posts.map((p) => p.coverImage ?? "")], []);
  return json({ success: true, vehicles: vehicles.length, posts: posts.length });
});
