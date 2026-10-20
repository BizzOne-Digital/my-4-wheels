import { Payment } from "@/models/Payment";
import { getStripe, stripeReady } from "./stripe";

type BookingLike = { _id: unknown; reference: string; email: string; locale?: string; deposit?: { amountCents?: number } | null };

/** Creates a Stripe Checkout Session. The amount always comes from the server-side booking record. */
export async function createDepositCheckout(booking: BookingLike, origin: string) {
  const stripe = getStripe();
  const amount = booking.deposit?.amountCents ?? 0;
  if (!stripe || !stripeReady() || amount <= 0) return null;
  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    locale: booking.locale === "fr" ? "fr-CA" : "en",
    line_items: [
      {
        quantity: 1,
        price_data: { currency: "cad", unit_amount: amount, product_data: { name: `My 4 Wheels appointment deposit (${booking.reference})` } },
      },
    ],
    metadata: { bookingId: String(booking._id), reference: booking.reference },
    success_url: `${base}/booking/confirmation?ref=${booking.reference}&paid=1`,
    cancel_url: `${base}/booking/confirmation?ref=${booking.reference}&cancelled=1`,
  });
  await Payment.create({ booking: booking._id, stripeSessionId: session.id, amountCents: amount, currency: "cad", status: "created" });
  return session.url;
}
