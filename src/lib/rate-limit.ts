import { connectDB } from "./db";
import { RateLimit } from "@/models/RateLimit";
import { HttpError } from "./http";

/**
 * Fixed-window rate limiter stored in MongoDB, so it works across serverless instances.
 * Expired windows are removed by a TTL index.
 */
export async function rateLimit(name: string, id: string, limit: number, windowSec: number) {
  await connectDB();
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const key = `${name}:${id}:${bucket}`;
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * windowSec * 1000 + 60_000) } },
    { upsert: true, new: true }
  ).lean();
  if (doc && doc.count > limit) throw new HttpError(429, "rate_limited");
}
