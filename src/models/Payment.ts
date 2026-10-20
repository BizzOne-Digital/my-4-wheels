import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const PaymentSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String, default: "" },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "cad" },
    status: { type: String, enum: ["created", "paid", "expired", "failed", "refunded"], default: "created", index: true },
    processedEvents: { type: [String], default: [] }, // Stripe event ids already applied (idempotency)
  },
  { timestamps: true }
);
export type PaymentDoc = InferSchemaType<typeof PaymentSchema>;
export const Payment = (models.Payment as Model<PaymentDoc>) || model("Payment", PaymentSchema);
