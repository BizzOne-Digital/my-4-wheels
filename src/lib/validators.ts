import { z } from "zod";

// Messages are keys into dictionary.validation so the client can show them in EN or FR.
const PHONE_RE = /^[+()\-.\s\d]{7,25}$/;
const OBJECT_ID_RE = /^[a-f0-9]{24}$/;

export const nameField = z.string().trim().min(2, "tooShort").max(120, "tooLong");
export const emailField = z.string().trim().toLowerCase().min(1, "required").max(200, "tooLong").email("email");
export const phoneField = z.string().trim().min(1, "required").regex(PHONE_RE, "phone");
const optionalPhone = z.string().trim().max(25, "tooLong").refine((v) => v === "" || PHONE_RE.test(v), "phone");
const optionalId = z.string().trim().refine((v) => v === "" || OBJECT_ID_RE.test(v), "required").optional().default("");

export const bookingSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  type: z.enum(["test-drive", "visit", "financing", "trade-in"], { message: "required" }),
  vehicleId: optionalId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time"),
  notes: z.string().trim().max(2000, "tooLong").optional().default(""),
  consent: z.literal(true, { errorMap: () => ({ message: "consent" }) }),
  locale: z.enum(["en", "fr"]).optional().default("en"),
});
export type BookingInput = z.input<typeof bookingSchema>;

export const inquirySchema = z.object({
  name: nameField,
  email: emailField,
  phone: optionalPhone.optional().default(""),
  subject: z.enum(["general", "vehicle", "financing", "trade-in", "sell", "offer", "careers", "other"]).default("general"),
  message: z.string().trim().min(5, "tooShort").max(4000, "tooLong"),
  vehicleId: optionalId,
  details: z
    .object({
      year: z.string().trim().max(4, "tooLong").optional(),
      make: z.string().trim().max(60, "tooLong").optional(),
      model: z.string().trim().max(60, "tooLong").optional(),
      mileage: z.string().trim().max(12, "tooLong").optional(),
      offer: z.string().trim().max(120, "tooLong").optional(),
      position: z.string().trim().max(120, "tooLong").optional(),
    })
    .optional()
    .default({}),
  consent: z.literal(true, { errorMap: () => ({ message: "consent" }) }),
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  locale: z.enum(["en", "fr"]).optional().default("en"),
});
export type InquiryInput = z.input<typeof inquirySchema>;

export const testimonialSubmitSchema = z.object({
  name: nameField,
  quote: z.string().trim().min(10, "tooShort").max(1500, "tooLong"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  vehicle: z.string().trim().max(120, "tooLong").optional().default(""),
  consent: z.literal(true, { errorMap: () => ({ message: "consent" }) }),
  website: z.string().max(0).optional().default(""),
  locale: z.enum(["en", "fr"]).optional().default("en"),
});

export const loginSchema = z.object({ email: emailField, password: z.string().min(1, "required").max(200, "tooLong") });

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    phone: optionalPhone.optional().default(""),
    password: z.string().min(10, "password").max(200, "tooLong"),
    confirm: z.string(),
    locale: z.enum(["en", "fr"]).optional().default("en"),
  })
  .refine((v) => v.password === v.confirm, { message: "passwordMatch", path: ["confirm"] });

export const profileSchema = z.object({
  name: nameField,
  phone: optionalPhone.optional().default(""),
  locale: z.enum(["en", "fr"]).optional().default("en"),
});
