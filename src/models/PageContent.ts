import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema } from "./shared";

/** Editable page/section copy, keyed like "home.hero" or "about.main". */
const PageContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, match: /^[a-z0-9.-]+$/ },
    label: { type: String, default: "" },
    eyebrow: { type: LocalizedSchema, default: () => ({}) },
    title: { type: LocalizedSchema, default: () => ({}) },
    subtitle: { type: LocalizedSchema, default: () => ({}) },
    body: { type: LocalizedSchema, default: () => ({}) },
    image: { type: String, default: "" },
    imageAlt: { type: LocalizedSchema, default: () => ({}) },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export type PageContentDoc = InferSchemaType<typeof PageContentSchema>;
export const PageContent = (models.PageContent as Model<PageContentDoc>) || model("PageContent", PageContentSchema);
