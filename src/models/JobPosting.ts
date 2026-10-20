import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema, SLUG_RE } from "./shared";

export const JOB_TYPES = ["full-time", "part-time", "contract", "seasonal"] as const;

const JobPostingSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, match: SLUG_RE },
    title: { type: LocalizedSchema, required: true },
    location: { type: String, default: "Montréal, QC", trim: true },
    type: { type: String, enum: JOB_TYPES, default: "full-time" },
    summary: { type: LocalizedSchema, default: () => ({}) },
    description: { type: LocalizedSchema, default: () => ({}) }, // responsibilities, requirements, schedule
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export type JobPostingDoc = InferSchemaType<typeof JobPostingSchema>;
export const JobPosting = (models.JobPosting as Model<JobPostingDoc>) || model("JobPosting", JobPostingSchema);
