import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, json, readJson, route } from "@/lib/http";
import { requireCustomer } from "@/lib/session";
import { profileSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const runtime = "nodejs";

export const PATCH = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  const me = await requireCustomer();
  const input = profileSchema.parse(await readJson(req));
  await connectDB();
  // Ownership: the update is always scoped to the session user's id.
  await User.updateOne({ _id: me.id, role: "customer" }, { $set: input });
  return json({ success: true });
});
