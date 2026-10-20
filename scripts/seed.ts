/**
 * Seeds settings, services, page content, the student offer and DEMO vehicles/articles.
 * Idempotent: existing documents (matched by slug/key) are never overwritten, so admin edits are kept.
 * Usage: npm run seed            (all content)
 *        SEED_DEMO=false npm run seed   (skip demo vehicles and articles)
 */
import "./env";
import mongoose from "mongoose";
import { SiteSettings, Service, PageContent, Offer, Vehicle, BlogPost } from "../src/models";
import { DEMO_POSTS, DEMO_VEHICLES, OFFERS, PAGES, SERVICES } from "./seed-data";

async function upsertAll(model: mongoose.Model<any>, key: string, docs: Record<string, unknown>[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let created = 0;
  for (const d of docs) {
    const r = await model.updateOne({ [key]: d[key] }, { $setOnInsert: d }, { upsert: true });
    created += r.upsertedCount;
  }
  return created;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([SiteSettings, Service, PageContent, Offer, Vehicle, BlogPost].map((m) => m.syncIndexes()));
  await SiteSettings.updateOne({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true });
  console.log("services:", await upsertAll(Service, "slug", SERVICES), "created");
  console.log("pages:", await upsertAll(PageContent, "key", PAGES), "created");
  console.log("offers:", await upsertAll(Offer, "slug", OFFERS), "created");
  if (process.env.SEED_DEMO !== "false") {
    console.log("demo vehicles:", await upsertAll(Vehicle, "slug", DEMO_VEHICLES), "created (isDemo: true)");
    console.log("demo articles (drafts):", await upsertAll(BlogPost, "slug", DEMO_POSTS), "created (isDemo: true)");
  }
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
