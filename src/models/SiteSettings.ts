import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema } from "./shared";

const DaySchema = new Schema(
  { open: { type: Boolean, default: true }, start: { type: String, default: "10:00" }, end: { type: String, default: "20:00" } },
  { _id: false }
);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    businessName: { type: String, default: "My 4 Wheels" },
    website: { type: String, default: "my4wheels.com" },
    phone: { type: String, default: "514 661 2494" },
    phoneE164: { type: String, default: "+15146612494" },
    email: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false }, // must be confirmed by the client before launch
    street: { type: String, default: "35 Rue de Port-Royal E" },
    city: { type: String, default: "Montréal" },
    region: { type: String, default: "QC" },
    postalCode: { type: String, default: "H3L 3T1" },
    country: { type: String, default: "CA" },
    hoursText: { type: LocalizedSchema, default: () => ({ en: "Open daily 10 AM – 8 PM", fr: "Ouvert tous les jours, 10 h à 20 h" }) },
    logo: { type: String, default: "" },
    logoDark: { type: String, default: "" },
    seo: {
      title: { type: LocalizedSchema, default: () => ({}) },
      description: { type: LocalizedSchema, default: () => ({}) },
      ogImage: { type: String, default: "" },
    },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
      google: { type: String, default: "" },
    },
    booking: {
      timezone: { type: String, default: "America/Toronto" },
      slotMinutes: { type: Number, default: 60, min: 15, max: 240 },
      capacityPerSlot: { type: Number, default: 2, min: 1, max: 20 },
      leadTimeHours: { type: Number, default: 2, min: 0, max: 168 },
      maxDaysAhead: { type: Number, default: 60, min: 1, max: 365 },
      cancelHoursBefore: { type: Number, default: 24, min: 0, max: 168 },
      allowCustomerCancel: { type: Boolean, default: true },
      allowRescheduleRequest: { type: Boolean, default: true },
      weekly: {
        type: [DaySchema], // index 0 = Sunday
        default: () => Array.from({ length: 7 }, () => ({ open: true, start: "10:00", end: "20:00" })),
      },
      blockedDates: { type: [String], default: [] }, // YYYY-MM-DD, business-local
    },
    payments: {
      depositEnabled: { type: Boolean, default: false },
      depositAmountCents: { type: Number, default: 0, min: 0 },
      depositTypes: { type: [String], default: ["test-drive"] },
    },
  },
  { timestamps: true }
);
export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings = (models.SiteSettings as Model<SiteSettingsDoc>) || model("SiteSettings", SiteSettingsSchema);
