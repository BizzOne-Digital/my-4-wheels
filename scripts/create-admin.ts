/**
 * Creates or updates the first admin account.
 * Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
 */
import "./env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email address.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });
  if (existing && existing.role !== "admin") throw new Error("A customer account already uses this email. Use a different admin email.");
  await User.updateOne({ email }, { $set: { name, passwordHash, role: "admin", active: true } }, { upsert: true });
  console.log(`Admin ready: ${email}. Remove ADMIN_PASSWORD from your environment now.`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e.message ?? e);
  await mongoose.disconnect();
  process.exit(1);
});
