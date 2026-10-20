import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const INQUIRY_SUBJECTS = ["general", "vehicle", "financing", "trade-in", "sell", "offer", "careers", "other"] as const;

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    subject: { type: String, enum: INQUIRY_SUBJECTS, default: "general", index: true },
    message: { type: String, required: true, maxlength: 4000 },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    details: { type: Schema.Types.Mixed, default: {} }, // trade-in / sell-your-car vehicle info
    status: { type: String, enum: ["new", "in-progress", "closed"], default: "new", index: true },
    emailStatus: { type: String, enum: ["sent", "failed", "not_configured", "pending"], default: "pending" },
    locale: { type: String, enum: ["en", "fr"], default: "en" },
  },
  { timestamps: true }
);
export type InquiryDoc = InferSchemaType<typeof InquirySchema>;
export const Inquiry = (models.Inquiry as Model<InquiryDoc>) || model("Inquiry", InquirySchema);
