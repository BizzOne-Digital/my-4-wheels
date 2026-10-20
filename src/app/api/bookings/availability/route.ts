import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { json, route } from "@/lib/http";
import { availability } from "@/lib/booking";
import { getSettingsFresh } from "@/lib/settings";
import { isValidDate } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async (req: NextRequest) => {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const vehicle = req.nextUrl.searchParams.get("vehicle") ?? "";
  if (!isValidDate(date)) return json({ success: false, error: "invalid_date" }, 400);
  const settings = await getSettingsFresh();
  const slots = await availability(settings.booking, date, isValidObjectId(vehicle) ? vehicle : undefined);
  return json({ success: true, timezone: "America/Toronto", slots });
});
