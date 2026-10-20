import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const APPOINTMENT_TYPES = ["test-drive", "visit", "financing", "trade-in"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

const BookingSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: APPOINTMENT_TYPES, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // business-local date (America/Toronto)
    time: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // business-local time
    startsAt: { type: Date, required: true, index: true }, // UTC instant
    notes: { type: String, default: "", maxlength: 2000 },
    consent: { type: Boolean, required: true },
    locale: { type: String, enum: ["en", "fr"], default: "en" },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    slotKeys: { type: [String], default: [] },
    rescheduleRequest: { type: String, default: "", maxlength: 1000 },
    adminNotes: { type: String, default: "", maxlength: 2000 },
    emailStatus: { type: String, enum: ["sent", "failed", "not_configured", "pending"], default: "pending" },
    deposit: {
      required: { type: Boolean, default: false },
      amountCents: { type: Number, default: 0 },
      status: { type: String, enum: ["none", "unpaid", "paid", "refunded"], default: "none" },
    },
  },
  { timestamps: true }
);
BookingSchema.index({ date: 1, time: 1 });
export type BookingDoc = InferSchemaType<typeof BookingSchema>;
export const Booking = (models.Booking as Model<BookingDoc>) || model("Booking", BookingSchema);
