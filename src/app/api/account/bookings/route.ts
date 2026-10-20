import { connectDB } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireCustomer } from "@/lib/session";
import { Booking } from "@/models/Booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const me = await requireCustomer();
  await connectDB();
  const items = await Booking.find({ user: me.id }).select("-slotKeys -adminNotes").sort({ startsAt: -1 }).populate("vehicle", "year make model slug").lean();
  return json({ success: true, items });
});
