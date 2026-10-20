import { z } from "zod";
import { isLocalSiteImage } from "@/lib/images";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, VEHICLE_STATUSES } from "@/models/Vehicle";

const loc = (max = 400) => z.object({ en: z.string().trim().max(max).default(""), fr: z.string().trim().max(max).default("") }).default({ en: "", fr: "" });
const reqLoc = (max = 200) => z.object({ en: z.string().trim().min(1, "English is required").max(max), fr: z.string().trim().max(max).default("") });
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").max(100);

/** Accept bundled artwork, MongoDB uploads, and configured Unsplash sources. */
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isLocalSiteImage(v) || /^\/api\/uploads\/(products|gallery|pages|misc)\/[\w.-]+$/.test(v) || /^https:\/\/images\.unsplash\.com\/[\w\-./?=&%]+$/.test(v), "Invalid image URL");
const httpsUrl = z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Must start with https://");
const optDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? new Date(v) : null))
  .refine((v) => v === null || !isNaN(v.getTime()), "Invalid date");

export const vehicleSchema = z.object({
  slug: slug.optional().or(z.literal("")),
  year: z.coerce.number().int().min(1950).max(2100),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  trim: z.string().trim().max(60).default(""),
  price: z.coerce.number().min(0).max(10_000_000),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES),
  fuelType: z.enum(FUEL_TYPES),
  drivetrain: z.string().trim().max(40).default(""),
  exteriorColor: z.string().trim().max(40).default(""),
  interiorColor: z.string().trim().max(40).default(""),
  engine: z.string().trim().max(80).default(""),
  vin: z.string().trim().max(17).default(""),
  stockNumber: z.string().trim().max(30).default(""),
  images: z.array(imageUrl).max(30).default([]),
  imagesIllustrative: z.boolean().default(false),
  features: z.array(z.string().trim().max(80)).max(60).default([]),
  description: loc(5000),
  inspectionNotes: loc(3000),
  historyReportUrl: httpsUrl.default(""),
  status: z.enum(VEHICLE_STATUSES),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const serviceSchema = z.object({
  slug,
  title: reqLoc(),
  summary: loc(400),
  body: loc(6000),
  icon: z.string().trim().max(40).default("car"),
  image: imageUrl.default(""),
  priceNote: loc(200),
  enabled: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const pageSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9.-]+$/).max(60),
  label: z.string().trim().max(80).default(""),
  eyebrow: loc(120),
  title: loc(200),
  subtitle: loc(400),
  body: loc(8000),
  image: imageUrl.default(""),
  imageAlt: loc(200),
  visible: z.boolean().default(true),
});

export const blogSchema = z.object({
  slug,
  title: reqLoc(),
  excerpt: loc(400),
  body: loc(20000),
  category: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).max(40).default("buying-tips"),
  coverImage: imageUrl.default(""),
  author: z.string().trim().max(80).default("My 4 Wheels"),
  status: z.enum(["draft", "published"]),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quote: z.string().trim().min(1).max(2000),
  rating: z.union([z.coerce.number().int().min(1).max(5), z.literal(""), z.null()]).optional().transform((v) => (v ? Number(v) : undefined)),
  vehicle: z.string().trim().max(120).default(""),
  source: z.string().trim().max(120).default(""),
  locale: z.enum(["en", "fr"]).default("en"),
  status: z.enum(["pending", "published", "hidden"]),
});

export const teamSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: loc(120),
  bio: loc(1500),
  photo: imageUrl.default(""),
  email: z.string().trim().max(200).refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email").default(""),
  phone: z.string().trim().max(40).default(""),
  order: z.coerce.number().int().default(0),
  visible: z.boolean().default(true),
});

export const offerSchema = z.object({
  slug,
  title: reqLoc(),
  subtitle: loc(200),
  body: loc(4000),
  eligibility: loc(2000),
  image: imageUrl.default(""),
  startsAt: optDate,
  expiresAt: optDate,
  visible: z.boolean().default(true),
  showOnHomepage: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
});

export const bookingPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export const inquiryPatchSchema = z.object({ status: z.enum(["new", "in-progress", "closed"]) });
export const customerPatchSchema = z.object({ active: z.boolean() });

const day = z.object({ open: z.boolean(), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) });

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  website: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  phoneE164: z.string().trim().regex(/^\+\d{8,15}$/, "Use international format, e.g. +15146612494"),
  email: z.string().trim().max(200).refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email"),
  emailVerified: z.boolean(),
  street: z.string().trim().max(120),
  city: z.string().trim().max(80),
  region: z.string().trim().max(10),
  postalCode: z.string().trim().max(10),
  country: z.string().trim().max(2),
  hoursText: loc(120),
  logo: imageUrl,
  logoDark: imageUrl,
  seo: z.object({ title: loc(120), description: loc(300), ogImage: imageUrl }),
  social: z.object({ facebook: httpsUrl, instagram: httpsUrl, tiktok: httpsUrl, youtube: httpsUrl, google: httpsUrl }),
  booking: z.object({
    slotMinutes: z.coerce.number().int().min(15).max(240),
    capacityPerSlot: z.coerce.number().int().min(1).max(20),
    leadTimeHours: z.coerce.number().int().min(0).max(168),
    maxDaysAhead: z.coerce.number().int().min(1).max(365),
    cancelHoursBefore: z.coerce.number().int().min(0).max(168),
    allowCustomerCancel: z.boolean(),
    allowRescheduleRequest: z.boolean(),
    weekly: z.array(day).length(7),
    blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(400),
  }),
  payments: z.object({
    depositEnabled: z.boolean(),
    depositAmountCents: z.coerce.number().int().min(0).max(1_000_000),
    depositTypes: z.array(z.enum(["test-drive", "visit", "financing", "trade-in"])),
  }),
});
