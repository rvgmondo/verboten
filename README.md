# Verboten Spirits

Production e-commerce and brand site for Verboten Pty Ltd (verboten.co.za):
an independent South African beverage house in Silverton, Pretoria. Custom
front end, custom admin, custom checkout. Replaces the previous WordPress
WooCommerce build entirely.

- **Stack**: Next.js 15 (App Router, React 19, TypeScript strict), Payload
  CMS 3 in the same app, PostgreSQL, Tailwind CSS v4, Motion, Zod.
- **Payments**: PayFast behind a provider interface (`src/lib/payments/`);
  Yoco or Peach Payments can be added without touching checkout code.
- **Email**: SMTP via nodemailer (Resend works over SMTP). Without SMTP
  config, emails print to the server console.

## Local development

Requirements: Node 20+ (a portable Node 22 lives in `vendor/node` for this
machine because Node 26 breaks Payload's config loader) and the portable
PostgreSQL in `vendor/pgsql`.

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm install
npm run db:setup      # once: init cluster (.pgdata, port 5434) + create db
npm run seed:admin    # once: dev admin user
npm run seed          # once: real products, batch, pages, serves, journal
npm run seed:media    # once: pull real product photography from the live site
npm run dev           # http://localhost:3001
```

- Public site: http://localhost:3001
- Admin: http://localhost:3001/admin (dev login `admin@verboten.co.za` /
  `ChangeMe123!`; change before any deployment)

All seeds are idempotent; re-running skips existing content.

## Environment variables

Copy `.env.example` to `.env`. The variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URI` | Postgres connection string. Local: portable instance on 5434. Production: Neon/Supabase URL. |
| `PAYLOAD_SECRET` | Payload auth secret. Generate per environment: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SERVER_URL` | Public origin, no trailing slash. Drives canonicals, sitemap, OG URLs, PayFast return/notify URLs. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `seed:admin`. |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | Transactional email. Resend: host `smtp.resend.com`, user `resend`, pass = API key. Empty host = console logging. |
| `ADMIN_NOTIFICATIONS_EMAIL` | Staff address for new-order and enquiry alerts. |
| `PAYFAST_MERCHANT_ID/KEY`, `PAYFAST_PASSPHRASE` | From the PayFast dashboard. The passphrase must match the one set in PayFast settings. |
| `PAYFAST_SANDBOX` | `"true"` targets sandbox.payfast.co.za. Anything else = live. |
| `PAYFAST_SKIP_REMOTE_VALIDATE` | Dev-only webhook test seam (PayFast cannot reach localhost). Ignored outside sandbox mode and in production builds. Never set in production. |
| `PAYMENT_PROVIDER` | Defaults to `payfast`. |

## PayFast configuration

1. Set a passphrase in the PayFast dashboard and the same value in
   `PAYFAST_PASSPHRASE`. This is **required**: the app refuses to build a
   payment redirect or verify a webhook without it, because an empty
   passphrase makes the ITN signature check insecure.
2. The site sends buyers to PayFast with a signed form; PayFast confirms
   payment server-to-server at `POST /api/payfast/notify` (the ITN webhook).
   The webhook verifies signature, merchant id, PayFast's own validation
   call, and the exact amount before an order is marked paid. Client-side
   success pages never change order state.
3. Sandbox testing end to end requires a public URL for the webhook (deploy
   a preview, or tunnel). Locally, `PAYFAST_SKIP_REMOTE_VALIDATE=true` lets
   you POST a signed ITN to the webhook yourself; see
   `docs/old-site-recon.md` and the Phase 5 commit message for the verified
   flow.
4. Go-live: set `PAYFAST_SANDBOX=false` and the live merchant credentials.

## Order lifecycle

`pending_payment` (created at checkout) → `paid` (set ONLY by the verified
webhook; decrements stock, redeems discount, emails customer + staff) →
`packed` → `shipped` (add the tracking number first) → `delivered`.
`cancelled` and `refunded` are available at any point. Every status change
emails the customer the matching update and is recorded in the order's
status log.

Stock: batch-mode products draw from their Batch's bottles remaining;
bundles derive availability from their components, so the 2-bottle set can
never oversell the batch.

## Staff guide (admin)

- **Orders**: the daily surface. Search by number, email, name or payment
  reference; update status from the sidebar.
- **Products / Batches**: prices are integer cents (R450 = 45000). Adjust
  batch "bottles remaining" for the live count; sold-out states appear on
  the site automatically.
- **Site Settings** (admins only): announcement bar text + toggle, dispatch
  time wording, shipping flat rate and free threshold, contact details,
  social links.
- **Stockists / Events / Journal / Serves / Pages**: all site content, no
  code needed. Pages holds the story and legal copy.
- **Subscribers**: newsletter list (double-opt-in ready; confirmation email
  wiring activates with SMTP).
- Roles: **admin** (everything) and **editor** (content and orders; no
  users, no settings). Enforced server-side.

## Deployment

### Vercel + managed Postgres (recommended)

1. Create a Neon or Supabase Postgres database; set `DATABASE_URI`.
2. Import the repo into Vercel; set every env var (production
   `NEXT_PUBLIC_SERVER_URL=https://verboten.co.za`, real `PAYLOAD_SECRET`,
   SMTP, live PayFast credentials).
3. First deploy, then run the seeds once against the production database
   (`npm run seed` etc. locally with `DATABASE_URI` pointed at prod).
4. Media uploads on Vercel need persistent storage: attach a storage
   adapter (e.g. `@payloadcms/storage-vercel-blob` or S3) in
   `payload.config.ts`, or self-host.
5. Point DNS. The 301 redirect map ships in `next.config.ts`, so old
   WordPress URLs keep their equity from the first request.

### VPS self-hosting

Any Node 20+ host works: `npm install && npm run build && npm run start`
behind a reverse proxy with the same env vars and any Postgres 15+.
`media/` holds uploads on disk; back it up with the database.

## Compliance notes

- Age gate (18+, consent cookie, accessible, crawler-safe) plus a
  date-of-birth check at checkout. Couriers verify age on delivery.
- "Drink responsibly. Not for sale to persons under 18." sits in the
  footer, on product pages, at checkout and on the age gate.
- POPIA: minimal collection, documented in the Privacy Policy page; the
  privacy contact is privacy@verboten.co.za; deletion requests are handled
  by deleting the customer and their orders in the admin.

## Facts to confirm with the client before launch

From the recon of the old site (`docs/old-site-recon.md`, section 6):

1. Brandy age contradiction: everything says 3-year, the old shipping page
   said "Aged 5 years". The rebuild uses 3-year everywhere.
2. Responsible-drinking helpline numbers (seeded: SADAG 0800 12 13 14,
   AA SA 0861 435 722, SANCA 011 892 3829). Verify before launch; the old
   site's SADAG number looked like a placeholder.
3. Brandy & Cola: ABV, can volume, pack size, real stock count (currently
   0, so it shows sold out until staff set stock).
4. Batch No. 01 bottles actually remaining (seeded at 500).
5. Company registration / VAT / liquor licence numbers for the Terms page.
6. Canonical Facebook URL (verbotenspirits vs verboten.spirits).
7. Street address, if the business wants more than "Silverton, Pretoria".
8. SKU scheme (placeholder internal SKUs: VB-B01-750, VB-B01-SET2,
   VB-RTD-CAN).

## Content shot list (placeholder frames on the site)

Real photography needed; every slot is a labelled frame at final aspect:

| Where | Shot | Aspect |
| --- | --- | --- |
| Home hero | Batch No. 01 bottle on black, crest visible | 3:4 |
| Home flagship | Bottle and glass, side light | 1:1 |
| Home RTD | Brandy & Cola cans on ice, condensation | 4:3 |
| Serves (x3) | Each serve, built, in glass | 4:3 |
| Journal | Hero image for the launch post | 16:9 |
| Brand | The real crest artwork (currently a placeholder SVG monogram) | vector |

Product pages currently use the photography recovered from the old site
(one shot each); more angles slot straight into each product's gallery.

## Useful scripts

`dev`, `build`, `start`, `lint`, `db:setup|start|stop`,
`seed`, `seed:admin`, `seed:media`, `generate:types`, `generate:importmap`.
