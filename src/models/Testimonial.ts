import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    quote: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 }, // only shown when actually supplied by the customer
    vehicle: { type: String, default: "", maxlength: 120 },
    source: { type: String, default: "", maxlength: 120 },
    locale: { type: String, enum: ["en", "fr"], default: "en" },
    status: { type: String, enum: ["pending", "published", "hidden"], default: "pending", index: true },
  },
  { timestamps: true }
);
export type TestimonialDoc = InferSchemaType<typeof TestimonialSchema>;
export const Testimonial = (models.Testimonial as Model<TestimonialDoc>) || model("Testimonial", TestimonialSchema);
