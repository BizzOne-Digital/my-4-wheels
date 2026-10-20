import { randomBytes } from "crypto";
import { slugify } from "@/lib/format";
import { Booking } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";
import { releaseSlots } from "@/lib/booking";
import { HttpError } from "@/lib/http";
import { sendEmail } from "@/lib/email";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { formatDate, formatTime } from "@/lib/format";

type Data = Record<string, unknown>;

async function uniqueVehicleSlug(d: Data, excludeId?: unknown) {
  const base = slugify(`${d.year}-${d.make}-${d.model}${d.trim ? `-${d.trim}` : ""}`) || "vehicle";
  let slug = (d.slug as string) || base;
  const clash = await Vehicle.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  if (clash) slug = `${base}-${randomBytes(2).toString("hex")}`;
  return slug;
}

export async function prepareCreate(resource: string, d: Data) {
  if (resource === "vehicles") return { ...d, slug: await uniqueVehicleSlug(d) };
  if (resource === "blog" && d.status === "published") return { ...d, publishedAt: new Date() };
  return d;
}

export async function prepareUpdate(resource: string, d: Data, existing: Data) {
  if (resource === "vehicles") return { ...d, slug: await uniqueVehicleSlug(d, existing._id) };
  if (resource === "blog" && d.status === "published" && !existing.publishedAt) return { ...d, publishedAt: new Date() };
  if (resource === "testimonials" && d.rating === undefined) return { ...d, $unset: { rating: 1 } };
  return d;
}

/** Booking status changes: cancelling releases the reserved slot; cancelled bookings cannot be reopened. */
export async function applyBookingPatch(id: string, existing: Data, input: { status?: string; adminNotes?: string }) {
  const update: Data = {};
  if (input.adminNotes !== undefined) update.adminNotes = input.adminNotes;
  if (input.status && input.status !== existing.status) {
    if (existing.status === "cancelled") throw new HttpError(409, "booking_cancelled");
    update.status = input.status;
  }
  const item = await Booking.findByIdAndUpdate(id, update, { new: true }).populate("vehicle", "year make model slug").lean<Data>();
  if (update.status === "cancelled" || update.status === "completed") {
    const full = await Booking.findById(id).select("slotKeys").lean<{ slotKeys?: string[] }>();
    await releaseSlots(full?.slotKeys ?? []);
  }
  if (item && (update.status === "confirmed" || update.status === "cancelled")) {
    const loc = (item.locale as "en" | "fr") ?? "en";
    const t = dictionaries[loc];
    const status = t.booking.statuses[update.status as "confirmed" | "cancelled"];
    await sendEmail(
      String(item.email),
      `My 4 Wheels: ${t.booking.reference} ${item.reference} (${status})`,
      `${item.name},\n\n${t.booking.statusLabel}: ${status}\n${t.booking.types[item.type as "visit"]} · ${formatDate(String(item.date), loc)} · ${formatTime(String(item.time), loc)}\n${t.common.timezoneNote}\n\nMy 4 Wheels · 514 661 2494`
    );
  }
  return item;
}
