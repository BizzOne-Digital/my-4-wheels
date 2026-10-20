import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema } from "./shared";

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: LocalizedSchema, default: () => ({}) },
    bio: { type: LocalizedSchema, default: () => ({}) },
    photo: { type: String, default: "" },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export type TeamMemberDoc = InferSchemaType<typeof TeamMemberSchema>;
export const TeamMember = (models.TeamMember as Model<TeamMemberDoc>) || model("TeamMember", TeamMemberSchema);
