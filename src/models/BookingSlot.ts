import { Schema, model, models, type Model } from "mongoose";

/**
 * Atomic reservation mechanism. Each reserved seat in a slot (and each vehicle per slot)
 * gets a unique key; the unique index guarantees two requests can never claim the same key.
 * Keys look like "2026-10-21|14:00|seat:0" and "2026-10-21|14:00|vehicle:<id>".
 */
const BookingSlotSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);
export const BookingSlot =
  (models.BookingSlot as Model<{ key: string; booking?: unknown }>) || model("BookingSlot", BookingSlotSchema);
