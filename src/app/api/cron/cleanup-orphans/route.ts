import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { json } from "@/lib/http";
import { deleteOrphans } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Scheduled orphan cleanup (e.g. Vercel Cron). Requires `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return json({ success: false, error: "unauthorized" }, 401);
  await connectDB();
  const removed = await deleteOrphans(24);
  return json({ success: true, removed });
}
