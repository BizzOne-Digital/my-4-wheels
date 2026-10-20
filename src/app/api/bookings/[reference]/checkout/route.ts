import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, HttpError, json, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createDepositCheckout } from "@/lib/payments";
import { Booking } from "@/models/Booking";

export const runtime = "nodejs";

/** Retry payment for an unpaid deposit (e.g. after a cancelled checkout). */
export const POST = route<{ params: Promise<{ reference: string }> }>(async (req: NextRequest, { params }) => {
  assertSameOrigin(req);
  await rateLimit("checkout", clientIp(req), 10, 3600);
  const { reference } = await params;
  if (!/^M4W-[A-Z0-9]{8}$/.test(reference)) throw new HttpError(404, "not_found");
  await connectDB();
  const booking = await Booking.findOne({ reference, status: { $ne: "cancelled" }, "deposit.required": true, "deposit.status": "unpaid" }).lean();
  if (!booking) throw new HttpError(404, "not_found");
  const url = await createDepositCheckout(booking, req.nextUrl.origin);
  if (!url) throw new HttpError(503, "payments_unavailable");
  return json({ success: true, url });
});
