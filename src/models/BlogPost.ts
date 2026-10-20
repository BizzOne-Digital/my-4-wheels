import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema, SLUG_RE } from "./shared";

const BlogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, match: SLUG_RE },
    title: { type: LocalizedSchema, required: true },
    excerpt: { type: LocalizedSchema, default: () => ({}) },
    body: { type: LocalizedSchema, default: () => ({}) },
    category: { type: String, default: "buying-tips", trim: true, index: true },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "My 4 Wheels" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export type BlogPostDoc = InferSchemaType<typeof BlogPostSchema>;
export const BlogPost = (models.BlogPost as Model<BlogPostDoc>) || model("BlogPost", BlogPostSchema);
