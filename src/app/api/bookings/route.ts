import type { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { bookingReference, isBookableTime, releaseSlots, reserveSlot } from "@/lib/booking";
import { getSettingsFresh } from "@/lib/settings";
import { getSessionUser } from "@/lib/session";
import { zonedToUtc } from "@/lib/time";
import { bookingSchema } from "@/lib/validators";
import { sendEmail, staffAddress } from "@/lib/email";
import { formatDate, formatTime, vehicleTitle } from "@/lib/format";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { Booking } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";
import { createDepositCheckout } from "@/lib/payments";

export const runtime = "nodejs";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit("booking", clientIp(req), 8, 3600);
  const input = bookingSchema.parse(await readJson(req));
  await connectDB();
  const settings = await getSettingsFresh();
  const cfg = settings.booking;
  const tz = "America/Toronto";

  if (!isBookableTime(cfg, input.date, input.time)) throw new HttpError(409, "slot_unavailable");

  let vehicle: { _id: Types.ObjectId; year: number; make: string; model: string; trim?: string } | null = null;
  if (input.vehicleId) {
    vehicle = await Vehicle.findOne({ _id: input.vehicleId, published: true, status: { $ne: "sold" } }, { year: 1, make: 1, model: 1, trim: 1 }).lean();
    if (!vehicle) throw new HttpError(400, "vehicle_invalid");
  }

  const user = await getSessionUser("customer");
  const bookingId = new Types.ObjectId();
  const vehicleId = input.type === "test-drive" && vehicle ? String(vehicle._id) : undefined;
  const slotKeys = await reserveSlot(cfg, input.date, input.time, bookingId, vehicleId);

  const depositActive =
    settings.payments.depositEnabled && settings.payments.depositAmountCents > 0 && settings.payments.depositTypes.includes(input.type);

  let booking;
  try {
    booking = await Booking.create({
      _id: bookingId,
      reference: bookingReference(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      type: input.type,
      vehicle: vehicle?._id,
      date: input.date,
      time: input.time,
      startsAt: zonedToUtc(input.date, input.time, tz),
      notes: input.notes,
      consent: true,
      locale: input.locale,
      user: user?.id,
      slotKeys,
      deposit: depositActive ? { required: true, amountCents: settings.payments.depositAmountCents, status: "unpaid" } : { required: false, amountCents: 0, status: "none" },
    });
  } catch (e) {
    await releaseSlots(slotKeys);
    throw e;
  }

  // Notifications: the booking is already saved; email failure only changes emailStatus.
  const t = dictionaries[input.locale];
  const when = `${formatDate(input.date, input.locale)} · ${formatTime(input.time, input.locale)}`;
  const vehicleLine = vehicle ? `\n${t.booking.vehicle}: ${vehicleTitle(vehicle)}` : "";
  const customerResult = await sendEmail(
    input.email,
    `My 4 Wheels: ${t.booking.confirmedTitle} (${booking.reference})`,
    `${input.name},\n\n${t.booking.reference}: ${booking.reference}\n${t.booking.types[input.type]} · ${when}${vehicleLine}\n${t.common.timezoneNote}\n${t.booking.statusLabel}: ${t.booking.statuses.pending}\n\n${t.booking.keepRef}\n\nMy 4 Wheels · ${settings.phone} · ${settings.street}, ${settings.city}`
  );
  await sendEmail(
    staffAddress(settings.email),
    `New booking ${booking.reference}: ${input.type} ${input.date} ${input.time}`,
    `${input.name} · ${input.email} · ${input.phone}${vehicleLine}\n${when}\n\n${input.notes}`
  );
  booking.emailStatus = customerResult;
  await booking.save();

  let checkoutUrl: string | null = null;
  if (depositActive) {
    try {
      checkoutUrl = await createDepositCheckout(booking, req.nextUrl.origin);
    } catch (e) {
      console.error("[deposit checkout]", e);
    }
  }

  return json(
    {
      success: true,
      booking: {
        reference: booking.reference,
        status: booking.status,
        date: booking.date,
        time: booking.time,
        type: booking.type,
        emailStatus: booking.emailStatus,
        deposit: booking.deposit,
      },
      checkoutUrl,
    },
    201
  );
});
