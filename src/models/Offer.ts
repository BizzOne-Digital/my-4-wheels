import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema, SLUG_RE } from "./shared";

const OfferSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, match: SLUG_RE },
    title: { type: LocalizedSchema, required: true },
    subtitle: { type: LocalizedSchema, default: () => ({}) },
    body: { type: LocalizedSchema, default: () => ({}) },
    eligibility: { type: LocalizedSchema, default: () => ({}) }, // one condition per line
    image: { type: String, default: "" },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    visible: { type: Boolean, default: true },
    showOnHomepage: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export type OfferDoc = InferSchemaType<typeof OfferSchema>;
export const Offer = (models.Offer as Model<OfferDoc>) || model("Offer", OfferSchema);
