import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { settingsSchema } from "@/lib/admin/schemas";
import { getSettingsFresh } from "@/lib/settings";
import { SiteSettings } from "@/models/SiteSettings";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { emailConfigured } from "@/lib/email";
import { stripeReady } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imgs = (s: { logo?: string; logoDark?: string; seo?: { ogImage?: string } }) => [s.logo, s.logoDark, s.seo?.ogImage].filter(Boolean) as string[];

export const GET = route(async () => {
  await requireAdmin();
  const settings = await getSettingsFresh();
  // Only report whether integrations are configured. Secret values never leave the server.
  return json({ success: true, settings, integrations: { email: emailConfigured(), stripe: stripeReady() } });
});

export const PATCH = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await connectDB();
  const before = await getSettingsFresh();
  const input = settingsSchema.parse(await readJson(req));
  const updated = await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: { ...input, booking: { ...input.booking, timezone: "America/Toronto" } } },
    { new: true, runValidators: true }
  ).lean();
  if (updated) await cleanupReplacedUploads(imgs(before), imgs(updated as never));
  return json({ success: true, settings: updated });
});
