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
  await rateLimit("admin-login-ip", clientIp(req), 10, 900);
  await rateLimit("admin-login-email", email, 5, 900);
  await connectDB();
  const user = await User.findOne({ email, role: "admin", active: true }).select("+passwordHash").lean();
  const ok = await verifyPassword(password, user?.passwordHash ?? dummyHash());
  if (!user || !ok) throw new HttpError(401, "invalid_credentials");
  await createSession(String(user._id), "admin");
  return json({ success: true });
});
