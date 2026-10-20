import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
    locale: { type: String, enum: ["en", "fr"], default: "en" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User = (models.User as Model<UserDoc>) || model("User", UserSchema);
