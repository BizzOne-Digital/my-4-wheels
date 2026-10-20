/**
 * Deletes uploaded images that no content references and that are older than ORPHAN_HOURS (default 24).
 * Usage: npm run cleanup:orphans   (DRY_RUN=true to only list them)
 */
import "./env";
import mongoose from "mongoose";
import { StoredUpload } from "../src/models";
import { findOrphans } from "../src/lib/uploads";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  const orphans = await findOrphans(Number(process.env.ORPHAN_HOURS || 24));
  for (const o of orphans) {
    console.log(process.env.DRY_RUN === "true" ? "[dry run]" : "deleting", o.url);
    if (process.env.DRY_RUN !== "true") await StoredUpload.deleteOne({ folder: o.folder, filename: o.filename });
  }
  console.log(`${orphans.length} orphan upload(s).`);
  await mongoose.disconnect();
}
main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
