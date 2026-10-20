import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { dummyHash, verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const runtime = "nodejs";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  const { email, password } = loginSchema.parse(await readJson(req));
  await rateLimit("login-ip", clientIp(req), 20, 900);
  await rateLimit("login-email", email, 8, 900);
  await connectDB();
  const user = await User.findOne({ email, role: "customer", active: true }).select("+passwordHash").lean();
  const ok = await verifyPassword(password, user?.passwordHash ?? dummyHash());
  if (!user || !ok) throw new HttpError(401, "invalid_credentials");
  await createSession(String(user._id), "customer");
  return json({ success: true });
});
