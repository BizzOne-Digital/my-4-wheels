import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { Session } from "@/models/Session";
import { User } from "@/models/User";
import { HttpError } from "./http";

export type Role = "admin" | "customer";
const COOKIE: Record<Role, string> = { admin: "m4w_admin", customer: "m4w_customer" };
const TTL_DAYS: Record<Role, number> = { admin: 1, customer: 30 };

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export type SessionUser = { id: string; name: string; email: string; phone: string; role: Role; locale: "en" | "fr" };

export async function createSession(userId: string, role: Role) {
  await connectDB();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_DAYS[role] * 86400_000);
  await Session.create({ tokenHash: sha256(token), user: userId, role, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(role: Role) {
  const jar = await cookies();
  const token = jar.get(COOKIE[role])?.value;
  if (token) {
    await connectDB();
    await Session.deleteOne({ tokenHash: sha256(token) });
  }
  jar.delete(COOKIE[role]);
}

/** Server-side session lookup. Always re-checks the user's role and active flag in the database. */
export async function getSessionUser(role: Role): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE[role])?.value;
  if (!token || token.length > 100) return null;
  await connectDB();
  const session = await Session.findOne({ tokenHash: sha256(token), role, expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const user = await User.findById(session.user).lean();
  if (!user || !user.active || user.role !== role) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role as Role,
    locale: (user.locale as "en" | "fr") ?? "en",
  };
}

export async function requireAdmin() {
  const u = await getSessionUser("admin");
  if (!u) throw new HttpError(401, "unauthorized");
  if (u.role !== "admin") throw new HttpError(403, "forbidden");
  return u;
}

export async function requireCustomer() {
  const u = await getSessionUser("customer");
  if (!u) throw new HttpError(401, "unauthorized");
  return u;
}
