# My 4 Wheels — Dealership Website, Admin Panel & Customer Portal

Next.js 15 (App Router, TypeScript) · Tailwind CSS · MongoDB/Mongoose · English/French.

## Before launch: items to confirm with the client

| Item | Status | Where to fix |
|---|---|---|
| **Business email** | The supplied email had conflicting spellings, so it is **not set**. It is shown publicly only after you enter it and tick "Email confirmed by client". | Admin → Settings |
| **Demo vehicles (6) and demo articles (2)** | Seeded with `isDemo: true` and labelled "Illustrative photo". The photos are AI-generated illustrations, not photographs of actual inventory. | Admin → Vehicles → "Remove demo content", or `npm run remove-demo` |
| **Legal pages** | Privacy and Terms are generic templates (they mention Québec Law 25). Have a qualified professional review them. | `src/lib/i18n/legal.ts` |
| **Testimonials and team** | None are seeded. No reviews or ratings are invented. | Admin → Testimonials / Team |
| **Service price notes** | Empty, so the site shows "Contact for details". No financing, warranty or history-report terms are stated. | Admin → Services |

## Setup

```bash
npm install
cp .env.example .env.local      # fill in MONGODB_URI and NEXT_PUBLIC_SITE_URL
npm run seed                    # settings, 10 services, page content, student offer, demo content
                                # SEED_DEMO=false npm run seed  → skip demo vehicles/articles
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='at-least-12-chars' npm run create-admin
npm run dev                     # http://localhost:3000  ·  admin: /admin/login
```

The seed script can be run again safely. It only inserts missing documents and never overwrites admin edits.
`create-admin` hashes the password with bcrypt (cost 12). Remove `ADMIN_PASSWORD` from your environment after using it. There are no hardcoded credentials.

## Credentials needed

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas (or any MongoDB 6+) connection string |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL, used for metadata, sitemap, Stripe redirects and the CSRF origin check |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL` | Optional | Booking and inquiry emails. Without them, submissions are still saved and the admin sees `emailStatus: not_configured`. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional | Booking deposits |
| `CRON_SECRET` | Optional | Protects the scheduled orphan-image cleanup |
| `NEXT_PUBLIC_UPLOAD_HOST_LIMIT_MB` | Optional (default 4) | Images larger than this are compressed in the browser before upload |

## Deployment (Vercel recommended)

1. Import the project and set the environment variables above.
2. In MongoDB Atlas, allow connections from your host (on Vercel, `0.0.0.0/0` with a strong database user).
3. Run `npm run seed` and `npm run create-admin` once against the production database, from your machine.
4. Optional: add a cron job, for example in `vercel.json`:
   `{"crons":[{"path":"/api/cron/cleanup-orphans","schedule":"0 4 * * *"}]}`. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically.

Database, auth, upload and payment routes run on the Node runtime. The MongoDB connection is cached across serverless invocations (`src/lib/db.ts`).

## Image upload architecture

Nothing is written to disk, so uploads survive redeploys and work on read-only serverless filesystems.

- **`AdminImageField`** (`src/components/admin/AdminImageField.tsx`) is used for vehicles, galleries, pages, blog covers, team photos, offers, logos and the share image. It accepts PNG, JPEG, WebP and GIF; shows a thumbnail with Replace and Remove; shows an uploading state and blocks duplicate uploads; shows toast messages; and releases its temporary preview URL. If an upload fails, the saved image stays as it was.
- **`POST /api/upload`** requires an admin session and the CSRF check. It accepts only the folders `products`, `gallery`, `pages` and `misc`. It checks both the declared MIME type and the file's magic bytes, so SVG files and disguised files are rejected. The limit is 8 MB. Filenames are `${Date.now()}-${24 random hex}.${ext}`, generated with `crypto.randomBytes`. The file is stored as a Buffer in the `StoredUpload` collection, which has a unique index on `{folder, filename}` and excludes `data` from queries by default.
- **`GET /api/uploads/[folder]/[filename]`** is public (no cookies). It rejects encoded input, traversal attempts and unknown folders, then returns the raw binary with `Content-Type`, `Content-Length`, `Cache-Control: public, max-age=31536000, immutable` and `nosniff`. Missing images return 404.
- **Content documents store only URL strings.** When an image is replaced or removed, the content is saved first. The old upload is deleted only after that save succeeds, and only if no other document still uses it (`src/lib/uploads.ts`). External Unsplash URLs are never deleted.
- **Unused uploads** (for example from abandoned edits) can be removed in three ways: Admin → Media → "Clean up unused (24h+)", `npm run cleanup:orphans` (set `DRY_RUN=true` to only list them), or the cron endpoint.
- **Host body limit.** Vercel rejects request bodies over about 4.5 MB before they reach the app, whatever the app's own limit. To fit, the browser resizes images to at most 2560 px and re-encodes them under `NEXT_PUBLIC_UPLOAD_HOST_LIMIT_MB`. The server still enforces 8 MB. Animated GIFs larger than the host limit cannot be compressed in the browser and are rejected with a clear message. If your host allows larger bodies, raise the variable.
- **Rendering.** `SafeImage` wraps `next/image`. It allows bundled `/images/**` artwork, `images.unsplash.com`, and `/api/uploads/**` (configured in `next.config.ts`). Legacy `/uploads/...` paths and broken images show a placeholder of the same size, and it does not retry in a loop.

## Booking system

- Appointment types: test drive, dealership visit, financing consultation, trade-in valuation. Times are in America/Toronto, and the timezone is shown on the form.
- The schedule, slot length, appointments per slot, minimum notice, booking window, blocked dates and cancellation rules are set in Admin → Settings.
- **No double bookings.** Every booked seat, and every vehicle for a given time slot, gets a `BookingSlot` document with a unique key. MongoDB's unique index guarantees that two simultaneous requests cannot claim the same key. Cancelling or completing a booking frees the slot.
- Statuses are pending, confirmed, completed and cancelled. Confirming or cancelling sends the customer an email when SMTP is configured. The confirmation screen shows the booking reference and the status actually saved, including whether the email was sent.

## Payments (optional, off by default)

1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. In Stripe, add a webhook to `https://<site>/api/stripe/webhook` for these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.
3. In Admin → Settings → Payments, enable deposits and set the amount and the appointment types that require one.

Checkout Sessions are created on the server, and the amount always comes from settings. The webhook signature is verified. Each Stripe event is applied at most once (event IDs are stored on the `Payment` record). A booking shows "Deposit paid" only after a verified webhook whose amount matches. When deposits are disabled, bookings work normally without payment.

## Security summary

- Sessions are random 256-bit tokens. Only a SHA-256 hash is stored in MongoDB (with a TTL). Cookies are `httpOnly`, `SameSite=Lax`, and `Secure` in production. Admin and customer sessions use separate cookies.
- Every admin page checks the session on the server (`app/admin/(panel)/layout.tsx`), and every admin API route checks it again. Nothing relies on middleware alone.
- Customer API queries always filter by the signed-in user's ID.
- CSRF protection: every cookie-authenticated request that changes data must come from the same origin and carry the `x-m4w-csrf` header.
- Rate limits are stored in MongoDB, so they work across serverless instances. They cover login, registration, bookings, inquiries, reviews and uploads.
- All input is validated with Zod. Database credentials, password hashes, upload binaries and payment secrets never reach the browser.

## Languages

The EN/FR switch sets a cookie and reloads the current page in the new language. It covers navigation, page content, forms, validation messages, the booking flow, the customer portal and page metadata. Content managed in the admin has separate English and French fields, and falls back to English when the French field is empty.

## Verification performed

`npm run typecheck` and `npm run build` both pass. The smoke test (`scripts/smoke-test.ts`) was run against a production build backed by an in-memory MongoDB, and all checks passed. It covers:

- All public routes render.
- Inventory URL filters and French rendering work.
- Anonymous and customer access to admin endpoints returns 401.
- Cross-origin requests are blocked.
- Uploads reject SVG, disguised PNGs, bad folders and files over 8 MB; a valid file is stored and served with the exact bytes and correct headers; traversal attempts never return a file; an uploaded image renders through `/_next/image`.
- Vehicle create, update and delete work. A failed save keeps the old image; a successful replacement deletes the unused old image; images in use or external URLs cannot be deleted.
- Concurrent bookings are capped at slot capacity; past dates and missing consent are rejected.
- Customers can only see and change their own bookings.

To run it locally: `npx tsx scripts/memdb.ts`, then seed, create an admin, `npm run build && npm start`, and `BASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:smoke`. Login and booking rate limits will trigger if you run it repeatedly against the same database within 15–60 minutes.

## Bundled website artwork

15 AI-generated WebP images are stored in `public/images` for the hero, showroom, booking CTA, inspection, inner-page banners, demo vehicles, and blog covers. The shared registry in `src/lib/images.ts` maps the original seeded Unsplash photo IDs to local files at render time, so existing content needs no database migration. New seeds use local image paths directly. Admin uploads still use MongoDB and take precedence over the bundled artwork. Team members and customer reviews are not fabricated. Generated vehicle and dealership visuals are illustrative. Exact generation prompts and file paths are recorded in `scripts/image-generation-prompts.json`.
