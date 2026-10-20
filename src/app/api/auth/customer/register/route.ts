import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { assertSameOrigin, clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const runtime = "nodejs";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit("register", clientIp(req), 5, 3600);
  const input = registerSchema.parse(await readJson(req));
  await connectDB();
  if (await User.exists({ email: input.email })) throw new HttpError(409, "exists");
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    locale: input.locale,
    role: "customer",
    passwordHash: await hashPassword(input.password),
  });
  await createSession(String(user._id), "customer");
  return json({ success: true }, 201);
});
