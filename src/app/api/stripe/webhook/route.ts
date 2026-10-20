import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { Booking } from "@/models/Booking";
import { Payment } from "@/models/Payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. The signature is verified against the raw body.
 * Idempotent: each event id is recorded on the Payment and applied at most once.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Payments not configured", { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const statusFor: Record<string, "paid" | "expired" | "failed" | undefined> = {
    "checkout.session.completed": "paid",
    "checkout.session.async_payment_succeeded": "paid",
    "checkout.session.async_payment_failed": "failed",
    "checkout.session.expired": "expired",
  };
  let status = statusFor[event.type];
  if (!status) return Response.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") return Response.json({ received: true });

  await connectDB();
  // Atomic: only matches if this event id has not been processed yet.
  const payment = await Payment.findOneAndUpdate(
    { stripeSessionId: session.id, processedEvents: { $ne: event.id } },
    {
      $set: { status, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "" },
      $push: { processedEvents: event.id },
    },
    { new: true }
  );
  if (!payment) return Response.json({ received: true, duplicate: true });
  if (status === "paid" && session.amount_total !== payment.amountCents) {
    status = "failed";
    await Payment.updateOne({ _id: payment._id }, { $set: { status: "failed" } });
    console.error("[stripe] amount mismatch for", session.id);
  }
  if (status === "paid") await Booking.updateOne({ _id: payment.booking }, { $set: { "deposit.status": "paid" } });
  return Response.json({ received: true });
}
