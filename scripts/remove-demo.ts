/** Deletes all demo vehicles and demo blog posts. Usage: npm run remove-demo */
import "./env";
import mongoose from "mongoose";
import { BlogPost, Vehicle } from "../src/models";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  const v = await Vehicle.deleteMany({ isDemo: true });
  const p = await BlogPost.deleteMany({ isDemo: true });
  console.log(`Removed ${v.deletedCount} demo vehicles and ${p.deletedCount} demo articles.`);
  await mongoose.disconnect();
}
main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
