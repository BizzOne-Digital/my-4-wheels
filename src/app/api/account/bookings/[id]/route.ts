import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, HttpError, json, readJson, route } from "@/lib/http";
import { requireCustomer } from "@/lib/session";
import { getSettingsFresh } from "@/lib/settings";
import { releaseSlots } from "@/lib/booking";
import { sendEmail, staffAddress } from "@/lib/email";
import { Booking } from "@/models/Booking";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), message: z.string().trim().min(5, "tooShort").max(1000, "tooLong") }),
]);

export const PATCH = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const me = await requireCustomer();
  const { id } = await params;
  if (!isValidObjectId(id)) throw new HttpError(404, "not_found");
  const input = schema.parse(await readJson(req));
  await connectDB();
  // Ownership enforced in the query itself.
  const booking = await Booking.findOne({ _id: id, user: me.id }).select("+slotKeys");
  if (!booking) throw new HttpError(404, "not_found");
  if (booking.status === "cancelled" || booking.status === "completed") throw new HttpError(409, "not_active");
  const settings = await getSettingsFresh();
  const cfg = settings.booking;
  const hoursLeft = (booking.startsAt.getTime() - Date.now()) / 3600_000;

  if (input.action === "cancel") {
    if (!cfg.allowCustomerCancel || hoursLeft < cfg.cancelHoursBefore) throw new HttpError(403, "cancel_window");
    booking.status = "cancelled";
    await booking.save();
    await releaseSlots(booking.slotKeys ?? []);
    await sendEmail(staffAddress(settings.email), `Booking ${booking.reference} cancelled by customer`, `${booking.name} cancelled ${booking.date} ${booking.time}.`);
  } else {
    if (!cfg.allowRescheduleRequest || hoursLeft < 0) throw new HttpError(403, "reschedule_not_allowed");
    booking.rescheduleRequest = input.message;
    await booking.save();
    await sendEmail(staffAddress(settings.email), `Reschedule request for ${booking.reference}`, `${booking.name} (${booking.email}, ${booking.phone}):\n\n${input.message}`);
  }
  return json({ success: true, status: booking.status });
});
