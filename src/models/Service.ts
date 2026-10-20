import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema, SLUG_RE } from "./shared";

const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, match: SLUG_RE },
    title: { type: LocalizedSchema, required: true },
    summary: { type: LocalizedSchema, default: () => ({}) },
    body: { type: LocalizedSchema, default: () => ({}) },
    icon: { type: String, default: "car" },
    image: { type: String, default: "" },
    priceNote: { type: LocalizedSchema, default: () => ({}) }, // empty => "Contact for details"
    enabled: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export type ServiceDoc = InferSchemaType<typeof ServiceSchema>;
export const Service = (models.Service as Model<ServiceDoc>) || model("Service", ServiceSchema);
