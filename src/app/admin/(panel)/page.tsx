import Link from "next/link";
import { AlertTriangle, CalendarDays, Car, CheckCircle2, MessageSquare, MessagesSquare } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettingsFresh } from "@/lib/settings";
import { emailConfigured } from "@/lib/email";
import { stripeReady } from "@/lib/stripe";
import { todayInZone } from "@/lib/time";
import { Booking } from "@/models/Booking";
import { Inquiry } from "@/models/Inquiry";
import { Testimonial } from "@/models/Testimonial";
import { Vehicle } from "@/models/Vehicle";
import { BlogPost } from "@/models/BlogPost";
import { RemoveDemoButton } from "./RemoveDemoButton";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await connectDB();
  const today = todayInZone("America/Toronto");
  const [available, reserved, pendingBookings, todayBookings, newInquiries, pendingReviews, demoVehicles, demoPosts, recentBookings, recentInquiries, settings] = await Promise.all([
    Vehicle.countDocuments({ status: "available", published: true }),
    Vehicle.countDocuments({ status: "reserved" }),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ date: today, status: { $in: ["pending", "confirmed"] } }),
    Inquiry.countDocuments({ status: "new" }),
    Testimonial.countDocuments({ status: "pending" }),
    Vehicle.countDocuments({ isDemo: true }),
    BlogPost.countDocuments({ isDemo: true }),
    Booking.find({}).select("reference name type date time status").sort({ createdAt: -1 }).limit(6).lean(),
    Inquiry.find({}).select("name subject status createdAt").sort({ createdAt: -1 }).limit(6).lean(),
    getSettingsFresh(),
  ]);
  const stats = [
    { label: "Available vehicles", value: available, sub: `${reserved} reserved`, href: "/admin/vehicles", icon: Car },
    { label: "Pending bookings", value: pendingBookings, sub: `${todayBookings} today`, href: "/admin/bookings", icon: CalendarDays },
    { label: "New inquiries", value: newInquiries, sub: "awaiting reply", href: "/admin/inquiries", icon: MessageSquare },
    { label: "Reviews to moderate", value: pendingReviews, sub: "pending", href: "/admin/testimonials", icon: MessagesSquare },
  ];
  const warnings: { text: string; href: string }[] = [];
  if (!settings.email || !settings.emailVerified) warnings.push({ text: "Business email is not confirmed. The client supplied conflicting spellings; confirm it and tick “Email verified” in Settings.", href: "/admin/settings" });
  if (!emailConfigured()) warnings.push({ text: "SMTP is not configured. Bookings and inquiries are saved, but no email notifications are sent.", href: "/admin/settings" });
  if (demoVehicles + demoPosts > 0) warnings.push({ text: `${demoVehicles} demo vehicle(s) and ${demoPosts} demo article(s) are still in the database. Remove them before launch.`, href: "/admin/vehicles" });
  if (settings.payments.depositEnabled && !stripeReady()) warnings.push({ text: "Deposits are enabled but Stripe keys are missing, so no deposit is requested.", href: "/admin/payments" });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className="card block p-5 hover:border-brand">
              <Icon className="h-5 w-5 text-brand" aria-hidden />
              <p className="mt-3 text-3xl font-extrabold">{value}</p>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-neutral-500">{sub}</p>
            </Link>
          </li>
        ))}
      </ul>
      {warnings.length > 0 ? (
        <section className="space-y-2" aria-label="Needs attention">
          {warnings.map((w) => (
            <Link key={w.text} href={w.href} className="flex items-start gap-3 rounded-[4px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 hover:bg-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {w.text}
            </Link>
          ))}
          {demoVehicles + demoPosts > 0 && <RemoveDemoButton />}
        </section>
      ) : (
        <p className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" aria-hidden /> Everything is configured.</p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Recent bookings</h2>
          {recentBookings.length ? (
            <ul className="divide-y divide-neutral-100 text-sm">
              {recentBookings.map((b) => (
                <li key={String(b._id)} className="flex justify-between gap-3 py-2">
                  <span><strong>{b.reference}</strong> · {b.name} · {b.type}</span>
                  <span className="text-neutral-500">{b.date} {b.time} · {b.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-500">No bookings yet.</p>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Recent inquiries</h2>
          {recentInquiries.length ? (
            <ul className="divide-y divide-neutral-100 text-sm">
              {recentInquiries.map((i) => (
                <li key={String(i._id)} className="flex justify-between gap-3 py-2">
                  <span><strong>{i.name}</strong> · {i.subject}</span>
                  <span className="text-neutral-500">{new Date(i.createdAt).toLocaleDateString("en-CA")} · {i.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-500">No inquiries yet.</p>}
        </section>
      </div>
    </div>
  );
}
