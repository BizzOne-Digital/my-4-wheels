import "server-only";
import { cache } from "react";
import { connectDB } from "./db";
import { SiteSettings } from "@/models/SiteSettings";

type L = { en: string; fr: string };
export interface Settings {
  _id: string;
  businessName: string;
  website: string;
  phone: string;
  phoneE164: string;
  email: string;
  emailVerified: boolean;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  hoursText: L;
  logo: string;
  logoDark: string;
  seo: { title: L; description: L; ogImage: string };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string; google: string };
  booking: {
    timezone: string;
    slotMinutes: number;
    capacityPerSlot: number;
    leadTimeHours: number;
    maxDaysAhead: number;
    cancelHoursBefore: number;
    allowCustomerCancel: boolean;
    allowRescheduleRequest: boolean;
    weekly: { open: boolean; start: string; end: string }[];
    blockedDates: string[];
  };
  payments: { depositEnabled: boolean; depositAmountCents: number; depositTypes: string[] };
}

async function loadSettings(): Promise<Settings> {
  await connectDB();
  const doc = await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return JSON.parse(JSON.stringify(doc)) as Settings;
}

/** Site settings, created with defaults on first access. Cached per request. */
export const getSettings = cache(loadSettings);
export const getSettingsFresh = loadSettings;
