import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/validators";
import { sendEmail, staffAddress } from "@/lib/email";
import { getSettingsFresh } from "@/lib/settings";
import { Inquiry } from "@/models/Inquiry";
import { Vehicle } from "@/models/Vehicle";

export const runtime = "nodejs";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit("inquiry", clientIp(req), 6, 3600);
  const input = inquirySchema.parse(await readJson(req));
  await connectDB();
  const vehicle = input.vehicleId ? await Vehicle.findById(input.vehicleId, { year: 1, make: 1, model: 1 }).lean() : null;
  const inquiry = await Inquiry.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
    vehicle: vehicle?._id,
    details: input.details,
    locale: input.locale,
  });
  const settings = await getSettingsFresh();
  const details = Object.entries(input.details ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const emailStatus = await sendEmail(
    staffAddress(settings.email),
    `New ${input.subject} inquiry from ${input.name}`,
    `${input.name} · ${input.email} · ${input.phone}\n${vehicle ? `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}\n` : ""}${details}\n\n${input.message}`
  );
  inquiry.emailStatus = emailStatus;
  await inquiry.save();
  return json({ success: true, id: String(inquiry._id), emailStatus }, 201);
});
