import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { testimonialSubmitSchema } from "@/lib/validators";
import { Testimonial } from "@/models/Testimonial";

export const runtime = "nodejs";

/** Customer review submission. Always saved as "pending" until an admin publishes it. */
export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit("testimonial", clientIp(req), 3, 3600);
  const input = testimonialSubmitSchema.parse(await readJson(req));
  await connectDB();
  await Testimonial.create({ name: input.name, quote: input.quote, rating: input.rating, vehicle: input.vehicle, locale: input.locale, source: "Website", status: "pending" });
  return json({ success: true }, 201);
});
