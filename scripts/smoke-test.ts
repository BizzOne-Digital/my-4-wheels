/**
 * End-to-end checks against a running server (dev or `next start`).
 * Usage: BASE_URL=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:smoke
 * Requires the admin account to exist (npm run create-admin) and seeded content.
 */
import "./env";

const BASE = process.env.BASE_URL || "http://localhost:3000";
let failures = 0;
const ok = (cond: unknown, label: string) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
};

class Client {
  cookies = new Map<string, string>();
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers = new Headers(init.headers);
    headers.set("origin", BASE);
    headers.set("x-m4w-csrf", "1");
    if (init.json !== undefined) headers.set("content-type", "application/json");
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await fetch(BASE + path, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body, redirect: "manual" });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const [k, v] = pair.split("=");
      if (v) this.cookies.set(k, v);
      else this.cookies.delete(k);
    }
    return res;
  }
}

// Smallest valid PNG (1x1)
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function upload(c: Client, folder: string, blob: Blob, name: string) {
  const fd = new FormData();
  fd.append("file", blob, name);
  fd.append("folder", folder);
  return c.req("/api/upload", { method: "POST", body: fd });
}

function nextOpenDate(daysAhead = 3) {
  const d = new Date(Date.now() + daysAhead * 86400_000);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const anon = new Client();
  const admin = new Client();

  // --- Public pages render
  for (const p of ["/", "/inventory", "/about", "/services", "/contact", "/testimonials", "/faq", "/pricing", "/blog", "/booking", "/team", "/offers", "/financing", "/trade-in", "/sell-your-car", "/privacy", "/terms", "/account/login", "/account/register", "/sitemap.xml", "/robots.txt"]) {
    const r = await anon.req(p);
    ok(r.status === 200, `GET ${p} -> ${r.status}`);
  }
  const inv = await (await anon.req("/inventory?make=Toyota")).text();
  ok(inv.includes("RAV4") && !inv.includes("Civic</a>"), "inventory filter by make via URL");

  // --- Language switch keeps page, changes content
  const fr = await anon.req("/inventory", { headers: { cookie: "m4w_lang=fr" } });
  ok((await fr.text()).includes("Parcourez nos véhicules"), "French content on /inventory");

  // --- Authorization on protected endpoints
  for (const [m, p] of [["GET", "/api/admin/vehicles"], ["POST", "/api/admin/vehicles"], ["GET", "/api/admin/settings"], ["DELETE", "/api/admin/uploads"], ["GET", "/api/account/bookings"]] as const) {
    const r = await anon.req(p, { method: m, json: m === "GET" ? undefined : {} });
    ok(r.status === 401, `anon ${m} ${p} -> ${r.status} (expect 401)`);
  }
  const up401 = await upload(anon, "products", new Blob([PNG], { type: "image/png" }), "a.png");
  ok(up401.status === 401, `anon upload -> ${up401.status}`);

  // --- CSRF
  const csrf = await fetch(BASE + "/api/inquiries", { method: "POST", headers: { origin: "https://evil.example", "content-type": "application/json", "x-m4w-csrf": "1" }, body: "{}" });
  ok(csrf.status === 403, `cross-origin POST blocked -> ${csrf.status}`);

  // --- Admin login
  const login = await admin.req("/api/auth/admin/login", { method: "POST", json: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  ok(login.status === 200, `admin login -> ${login.status}`);
  const bad = await anon.req("/api/auth/admin/login", { method: "POST", json: { email: process.env.ADMIN_EMAIL, password: "wrong-password" } });
  ok(bad.status === 401, `admin wrong password -> ${bad.status}`);

  // --- Uploads: validation
  const svg = await upload(admin, "products", new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: "image/svg+xml" }), "x.svg");
  ok(svg.status === 415, `SVG rejected -> ${svg.status}`);
  const fake = await upload(admin, "products", new Blob([Buffer.from("not an image at all, just text")], { type: "image/png" }), "fake.png");
  ok(fake.status === 415, `spoofed PNG rejected -> ${fake.status}`);
  const badFolder = await upload(admin, "../etc", new Blob([PNG], { type: "image/png" }), "a.png");
  ok(badFolder.status === 400, `bad folder rejected -> ${badFolder.status}`);
  const big = await upload(admin, "products", new Blob([Buffer.concat([PNG, Buffer.alloc(8 * 1024 * 1024)])], { type: "image/png" }), "big.png");
  ok(big.status === 413, `>8MB rejected -> ${big.status}`);
  const good = await upload(admin, "products", new Blob([PNG], { type: "image/png" }), "ok.png");
  const goodJson = await good.json();
  ok(good.status === 201 && /^\/api\/uploads\/products\/\d{13}-[a-f0-9]{24}\.png$/.test(goodJson.url), `valid PNG uploaded -> ${goodJson.url}`);

  // --- Binary retrieval
  const img = await anon.req(goodJson.url);
  const bytes = Buffer.from(await img.arrayBuffer());
  ok(img.status === 200 && img.headers.get("content-type") === "image/png" && bytes.equals(PNG), "binary served with correct type and bytes");
  ok(img.headers.get("cache-control") === "public, max-age=31536000, immutable" && img.headers.get("x-content-type-options") === "nosniff", "upload cache/nosniff headers");
  ok(Number(img.headers.get("content-length")) === PNG.length, "upload content-length");
  for (const p of ["/api/uploads/products/..%2F..%2Fetc", "/api/uploads/secret/" + goodJson.filename, "/api/uploads/products/missing-file.png", "/api/uploads/products/%2e%2e"]) {
    const r = await anon.req(p);
    ok(r.status === 404 || r.status === 308, `traversal/invalid ${p} -> ${r.status} (never 200)`);
  }
  const opt = await anon.req(`/_next/image?url=${encodeURIComponent(goodJson.url)}&w=64&q=75`);
  ok(opt.status === 200 && (opt.headers.get("content-type") ?? "").startsWith("image/"), `uploaded image renders through next/image -> ${opt.status}`);

  // --- Vehicle CRUD + replacement cleanup
  const vehicle = { year: 2023, make: "Testmake", model: "Smoke", trim: "", price: 12345, mileage: 1000, transmission: "automatic", bodyType: "sedan", fuelType: "gasoline", images: [goodJson.url], features: ["A"], description: { en: "x", fr: "" }, inspectionNotes: { en: "", fr: "" }, historyReportUrl: "", status: "available", featured: false, published: true, imagesIllustrative: false };
  const created = await admin.req("/api/admin/vehicles", { method: "POST", json: vehicle });
  const cj = await created.json();
  ok(created.status === 201 && cj.item?.slug, `vehicle created -> ${cj.item?.slug}`);
  const id = cj.item._id;
  const second = await (await upload(admin, "products", new Blob([PNG], { type: "image/png" }), "two.png")).json();
  const failedSave = await admin.req(`/api/admin/vehicles/${id}`, { method: "PATCH", json: { ...vehicle, images: [second.url], price: -5 } });
  ok(failedSave.status === 400, "invalid vehicle update rejected");
  ok((await anon.req(goodJson.url)).status === 200, "old image kept when content save fails");
  const replaced = await admin.req(`/api/admin/vehicles/${id}`, { method: "PATCH", json: { ...vehicle, images: [second.url] } });
  ok(replaced.status === 200, "vehicle image replaced");
  ok((await anon.req(goodJson.url)).status === 404, "old unreferenced image deleted after successful save");
  ok((await anon.req(second.url)).status === 200, "new image served");
  const ext = await admin.req("/api/admin/uploads", { method: "DELETE", json: { url: "https://images.unsplash.com/photo-1" } });
  ok(ext.status === 400, "external URL deletion refused");
  const inUse = await admin.req("/api/admin/uploads", { method: "DELETE", json: { url: second.url } });
  ok(inUse.status === 409, "deleting referenced image refused");
  const page = await anon.req(`/inventory/${cj.item.slug}`);
  ok(page.status === 200, "vehicle detail page");
  const del = await admin.req(`/api/admin/vehicles/${id}`, { method: "DELETE" });
  ok(del.status === 200, "vehicle deleted");
  ok((await anon.req(second.url)).status === 404, "image removed after vehicle deletion");

  // --- Booking + duplicate prevention
  const avail = await (await anon.req(`/api/bookings/availability?date=${nextOpenDate()}`)).json();
  const slot = avail.slots?.find((s: { available: boolean }) => s.available);
  ok(Boolean(slot), "availability returns open slots");
  const settings = await (await admin.req("/api/admin/settings")).json();
  const cap = settings.settings.booking.capacityPerSlot;
  const booking = { name: "Smoke Test", email: "smoke@example.com", phone: "514 555 0100", type: "visit", vehicleId: "", date: nextOpenDate(), time: slot.time, notes: "", consent: true, locale: "en" };
  const results = await Promise.all(Array.from({ length: cap + 2 }, () => anon.req("/api/bookings", { method: "POST", json: booking })));
  const statuses = results.map((r) => r.status);
  ok(statuses.filter((s) => s === 201).length === cap && statuses.filter((s) => s === 409).length === 2, `concurrent bookings: ${statuses.join(",")} (capacity ${cap})`);
  const firstBooking = await results.find((r) => r.status === 201)!.json();
  ok(/^M4W-[A-Z0-9]{8}$/.test(firstBooking.booking.reference) && firstBooking.booking.status === "pending", "booking reference + pending status");
  const past = await anon.req("/api/bookings", { method: "POST", json: { ...booking, date: "2020-01-01" } });
  ok(past.status === 409, "past date rejected by server");
  const noConsent = await anon.req("/api/bookings", { method: "POST", json: { ...booking, consent: false } });
  ok(noConsent.status === 400, "missing consent rejected");

  // --- Inquiry saved
  const inq = await anon.req("/api/inquiries", { method: "POST", json: { name: "Smoke Test", email: "smoke@example.com", phone: "", subject: "general", message: "Hello from the smoke test", consent: true } });
  ok(inq.status === 201, "inquiry saved");

  // --- Customer portal ownership
  const cust = new Client();
  const email = `cust${Date.now()}@example.com`;
  const reg = await cust.req("/api/auth/customer/register", { method: "POST", json: { name: "Cust Omer", email, phone: "", password: "a-strong-password", confirm: "a-strong-password" } });
  ok(reg.status === 201, "customer registered");
  const own = await (await cust.req("/api/account/bookings")).json();
  ok(Array.isArray(own.items) && own.items.length === 0, "customer sees only own bookings (none)");
  const allBookings = await (await admin.req("/api/admin/bookings")).json();
  const otherId = allBookings.items[0]._id;
  const steal = await cust.req(`/api/account/bookings/${otherId}`, { method: "PATCH", json: { action: "cancel" } });
  ok(steal.status === 404, `customer cannot cancel another person's booking -> ${steal.status}`);
  const custAdmin = await cust.req("/api/admin/vehicles");
  ok(custAdmin.status === 401, "customer session cannot access admin API");

  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
