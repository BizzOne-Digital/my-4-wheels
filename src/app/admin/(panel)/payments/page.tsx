import { connectDB } from "@/lib/db";
import { getSettingsFresh } from "@/lib/settings";
import { stripeReady } from "@/lib/stripe";
import { Payment } from "@/models/Payment";
import { PaymentsList } from "./PaymentsList";

export const metadata = { title: "Payments" };

export default async function PaymentsAdmin() {
  await connectDB();
  const s = await getSettingsFresh();
  const ready = stripeReady();
  const paidTotal = await Payment.aggregate<{ total: number }>([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amountCents" } } }]);
  return (
    <div className="space-y-6">
      <section className="card grid gap-4 p-5 text-sm sm:grid-cols-3">
        <div><p className="text-neutral-500">Stripe keys</p><p className="font-bold">{ready ? "Configured" : "Not configured"}</p></div>
        <div><p className="text-neutral-500">Deposits</p><p className="font-bold">{s.payments.depositEnabled ? `Enabled · ${(s.payments.depositAmountCents / 100).toFixed(2)} CAD` : "Disabled"}</p></div>
        <div><p className="text-neutral-500">Total paid deposits</p><p className="font-bold">{((paidTotal[0]?.total ?? 0) / 100).toFixed(2)} CAD</p></div>
        <p className="text-xs text-neutral-500 sm:col-span-3">
          Configure the deposit amount and appointment types in Settings → Payments. Secret keys are read only from environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) and are never shown here. A payment is marked paid only after Stripe’s signed webhook confirms it.
        </p>
      </section>
      <PaymentsList />
    </div>
  );
}
