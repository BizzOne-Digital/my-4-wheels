
import { Types } from "mongoose";
import { BookingSlot } from "@/models/BookingSlot";
import { HttpError } from "./http";
import { addDays, fromMinutes, isValidDate, todayInZone, toMinutes, weekday, zonedToUtc } from "./time";
import type { Settings } from "./settings";

export const BUSINESS_TZ = "America/Toronto";

type BookingCfg = Settings["booking"];

export function slotTimes(cfg: BookingCfg, date: string): string[] {
  if (!isValidDate(date)) return [];
  if (cfg.blockedDates?.includes(date)) return [];
  const day = cfg.weekly?.[weekday(date)];
  if (!day || !day.open) return [];
  const step = cfg.slotMinutes || 60;
  const out: string[] = [];
  for (let m = toMinutes(day.start); m + step <= toMinutes(day.end); m += step) out.push(fromMinutes(m));
  return out;
}

/** Checks the date/time against the schedule, lead time and booking window. */
export function isBookableTime(cfg: BookingCfg, date: string, time: string) {
  const tz = cfg.timezone || BUSINESS_TZ;
  if (!slotTimes(cfg, date).includes(time)) return false;
  const start = zonedToUtc(date, time, tz).getTime();
  if (start < Date.now() + (cfg.leadTimeHours ?? 0) * 3600_000) return false;
  if (date > addDays(todayInZone(tz), cfg.maxDaysAhead ?? 60)) return false;
  return true;
}

const seatKey = (date: string, time: string, n: number) => `${date}|${time}|seat:${n}`;
const vehicleKey = (date: string, time: string, id: string) => `${date}|${time}|vehicle:${id}`;

export async function availability(cfg: BookingCfg, date: string, vehicleId?: string) {
  const times = slotTimes(cfg, date);
  if (!times.length) return [];
  const taken = await BookingSlot.find({ key: { $regex: `^${date}\\|` } }, { key: 1 }).lean();
  const keys = new Set(taken.map((t) => t.key));
  const cap = cfg.capacityPerSlot || 1;
  return times.map((time) => {
    let used = 0;
    for (let i = 0; i < cap; i++) if (keys.has(seatKey(date, time, i))) used++;
    const vehicleBusy = vehicleId ? keys.has(vehicleKey(date, time, vehicleId)) : false;
    return { time, available: isBookableTime(cfg, date, time) && used < cap && !vehicleBusy };
  });
}

/**
 * Atomically reserves a slot. Uniqueness is enforced by MongoDB's unique index on BookingSlot.key,
 * so concurrent requests cannot double-book the same seat or the same vehicle.
 */
export async function reserveSlot(cfg: BookingCfg, date: string, time: string, bookingId: Types.ObjectId, vehicleId?: string) {
  const claimed: string[] = [];
  const claim = async (key: string) => {
    try {
      await BookingSlot.create({ key, booking: bookingId });
      claimed.push(key);
      return true;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) return false;
      throw e;
    }
  };
  if (vehicleId && !(await claim(vehicleKey(date, time, vehicleId)))) throw new HttpError(409, "vehicle_unavailable");
  const cap = cfg.capacityPerSlot || 1;
  for (let i = 0; i < cap; i++) {
    if (await claim(seatKey(date, time, i))) return claimed;
  }
  await releaseSlots(claimed);
  throw new HttpError(409, "slot_unavailable");
}

export async function releaseSlots(keys: string[]) {
  if (keys.length) await BookingSlot.deleteMany({ key: { $in: keys } });
}

export function bookingReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "M4W-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
