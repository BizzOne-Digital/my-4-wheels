import type { Model } from "mongoose";
import type { ZodTypeAny } from "zod";
import { Vehicle } from "@/models/Vehicle";
import { Service } from "@/models/Service";
import { PageContent } from "@/models/PageContent";
import { BlogPost } from "@/models/BlogPost";
import { Testimonial } from "@/models/Testimonial";
import { TeamMember } from "@/models/TeamMember";
import { Offer } from "@/models/Offer";
import { Booking } from "@/models/Booking";
import { Inquiry } from "@/models/Inquiry";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import {
  blogSchema,
  bookingPatchSchema,
  customerPatchSchema,
  inquiryPatchSchema,
  offerSchema,
  pageSchema,
  serviceSchema,
  teamSchema,
  testimonialSchema,
  vehicleSchema,
} from "./schemas";

type Doc = Record<string, unknown>;

export type ResourceDef = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  create?: ZodTypeAny;
  update?: ZodTypeAny;
  deletable?: boolean;
  /** Image URLs referenced by a document, used to clean up replaced uploads. */
  images?: (d: Doc) => string[];
  search?: string[];
  filters?: string[];
  sort: Record<string, 1 | -1>;
  baseFilter?: Record<string, unknown>;
  projection?: Record<string, 0 | 1>;
  populate?: { path: string; select: string };
};

const one = (k: string) => (d: Doc) => (d[k] ? [String(d[k])] : []);

export const RESOURCES: Record<string, ResourceDef> = {
  vehicles: {
    model: Vehicle,
    create: vehicleSchema,
    update: vehicleSchema,
    deletable: true,
    images: (d) => (Array.isArray(d.images) ? (d.images as string[]) : []),
    search: ["make", "model", "trim", "vin", "stockNumber"],
    filters: ["status", "featured", "isDemo"],
    sort: { createdAt: -1 },
  },
  services: { model: Service, create: serviceSchema, update: serviceSchema, deletable: true, images: one("image"), search: ["title.en", "slug"], filters: ["enabled"], sort: { order: 1 } },
  pages: { model: PageContent, create: pageSchema, update: pageSchema, deletable: true, images: one("image"), search: ["key", "label", "title.en"], sort: { key: 1 } },
  blog: { model: BlogPost, create: blogSchema, update: blogSchema, deletable: true, images: one("coverImage"), search: ["title.en", "slug", "category"], filters: ["status", "category"], sort: { createdAt: -1 } },
  testimonials: { model: Testimonial, create: testimonialSchema, update: testimonialSchema, deletable: true, search: ["name", "quote"], filters: ["status"], sort: { createdAt: -1 } },
  team: { model: TeamMember, create: teamSchema, update: teamSchema, deletable: true, images: one("photo"), search: ["name"], sort: { order: 1 } },
  offers: { model: Offer, create: offerSchema, update: offerSchema, deletable: true, images: one("image"), search: ["title.en", "slug"], filters: ["visible"], sort: { order: 1 } },
  bookings: {
    model: Booking,
    update: bookingPatchSchema,
    search: ["reference", "name", "email", "phone"],
    filters: ["status", "type", "date"],
    sort: { startsAt: -1 },
    populate: { path: "vehicle", select: "year make model slug" },
  },
  inquiries: {
    model: Inquiry,
    update: inquiryPatchSchema,
    deletable: true,
    search: ["name", "email", "message"],
    filters: ["status", "subject"],
    sort: { createdAt: -1 },
    populate: { path: "vehicle", select: "year make model slug" },
  },
  customers: { model: User, update: customerPatchSchema, search: ["name", "email", "phone"], sort: { createdAt: -1 }, baseFilter: { role: "customer" } },
  payments: { model: Payment, search: ["stripeSessionId"], filters: ["status"], sort: { createdAt: -1 }, populate: { path: "booking", select: "reference name email date time" } },
};
