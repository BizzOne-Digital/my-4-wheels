import { Schema } from "mongoose";

export type Localized = { en: string; fr: string };
export const LocalizedSchema = new Schema<Localized>(
  { en: { type: String, default: "", trim: true }, fr: { type: String, default: "", trim: true } },
  { _id: false }
);
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
