# Verboten Spirits — verboten.co.za rebuild

Ground-up production rebuild of https://verboten.co.za — Verboten Spirits
(Verboten Pty Ltd), an independent South African beverage house in Silverton,
Pretoria. Custom e-commerce (brandy, brandy & cola RTD), custom admin, full
copy rewrite. Replaces a WordPress WooCommerce template build.

## Stack

- **Next.js 15.4.11** — App Router, React 19, Server Components, TypeScript strict.
- **Payload CMS 3.88** — same Next app (CMS + admin + auth + commerce data).
- **SQLite by default** — a single file `verboten.db`, no DB server, so the site
  is self-contained (this is the cPanel deploy target). If `DATABASE_URI` is a
  `postgres://` URL the config switches to Postgres; the portable Postgres
  tooling (`vendor/pgsql`, `.pgdata`, port 5434, `scripts/db-*.ps1`) remains for
  that path. Dialect-specific raw SQL lives in `src/lib/commerce/atomic.ts`.
- **Tailwind CSS v4** — CSS-first tokens in `src/app/globals.css`.
- Motion, shadcn/ui-style primitives (fully restyled), React Hook Form, Zod.
- Payments: **PayFast** behind a provider interface. Email: nodemailer (SMTP/Resend).

## ⚠️ Non-obvious environment rules (read before running anything)

1. **Use the project-local Node 22**, not the machine's Node. Node 26 (machine
   default) breaks Payload's config loader (`ERR_REQUIRE_ASYNC_MODULE` via
   `@payloadcms/richtext-lexical`). Put it first on PATH for every command:
   ```powershell
   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
   ```
2. **`"type": "module"` is required** in package.json — Payload 3 is ESM-first.
3. **SQLite by default** — nothing to start; the seed creates `verboten.db`.
   Only if you set a `postgres://` `DATABASE_URI` do you need the portable
   Postgres (`npm run db:setup` once, then `db:start`); the `predev`/`prebuild`
   hooks (`scripts/predb.mjs`) start it only on Windows with a local URI.
4. Dev server runs on **port 3001** (3000 is Amico's). Site: http://localhost:3001,
   admin: http://localhost:3001/admin.

## Running locally

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm run seed:admin   # first time only: dev admin user (creates verboten.db)
npm run seed         # first time only: real products, pages, serves, journal
npm run dev          # Next + Payload on http://localhost:3001
```

The first admin is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.
Never write a real or default password into this file or any committed file:
this repository has been public, and a documented default is a working login
on any database that was seeded with it.
Env lives in `.env` (gitignored); see `.env.example`.

## Brand voice (copy rules — enforced, not aspirational)

- BANNED everywhere (copy, metadata, alt text): craft/crafted/craftsmanship,
  artisanal, handcrafted, small-batch-as-identity, boutique, micro,
  "legally produced" or any legitimacy defensiveness, lockdown references,
  stacked empty superlatives.
- NO EM DASHES anywhere (copy, comments, content). Use commas, full stops, or
  restructure. Grep for `[—–…·]` before delivering.
- Voice: confident, direct, a little dark. Short sentences. Quiet assurance,
  never shouting. Premium without pretension. South African grounding
  (Pretoria, braai, local pride) with international intent (NL/DE next).
- Afrikaans brand lines, exact spelling: "VIR DIÉ WAT WEET",
  "MEMORIES NOT REGRETS". Use as designed typographic moments only.
- Facts from the old site only (specs, prices, contacts). Never port old copy.

## Products (real data, seed source of truth)

- Verboten Premium Brandy: 3-year, French oak finish, 43% ABV, 750ml, R450.
  Slug `verboten-premium-brandy`.
- Verboten Premium Set (2 bottles): R850. A bundle, first-class product.
  Slug `verboten-premium-set-2-bottle`.
- Verboten Brandy & Cola RTD can: 440ml, 5% ABV, R45.
- Gin and further spirits in development.

NO batch numbering and NO "limited edition" framing anywhere shoppers see:
the flagship is a permanent product. The `batches` collection is internal
stock tracking only and never renders publicly. Old batch-numbered URLs 301
to the new slugs (next.config.ts).

## Structure

```
src/
  payload.config.ts        # Payload config (collections added per phase)
  payload-types.ts         # generated — do not edit by hand
  access/                  # role-based access helpers
  collections/             # Users, Media (+ commerce/content per phase)
  app/
    (frontend)/            # public site — its own root layout (renders <html>)
    (payload)/             # admin + REST/GraphQL — its own root layout
  seed/                    # create-admin + product seed
scripts/                   # db-*.ps1 (portable Postgres, port 5434)
docs/                      # recon dossier, redirect map, shot list
vendor/                    # portable node + postgres (gitignored)
```

There is intentionally **no `src/app/layout.tsx`** — two root layouts, one per
route group. Do not add a top-level layout.

## Money rules (do not re-derive these anywhere)

The shop is live and takes real payments. Four invariants hold it together,
and each one exists because breaking it cost something or nearly did.

1. **One place computes a total.** `orderTotals()` in
   `src/lib/commerce/totals.ts`. The server action, the checkout summary and
   the cart drawer all call it. It used to be three copies of the same
   arithmetic, which is how a buyer once saw one number and would have been
   charged another. Never inline shipping or total maths again.
2. **The buyer is never charged more than they were shown.** The checkout form
   posts `quotedTotalCents`; `createCheckout` refuses when its own total is
   *higher*. Lower is fine and is the normal case when someone types a code
   without pressing Apply.
3. **A discount use is claimed when the order is created, not when payment
   lands.** `claimDiscount()` tests the cap and takes the use in one statement.
   Reading the cap and counting the redemption later let ten people spend a
   single-use code in the same minute. A failed payment calls
   `releaseDiscount()`.
4. **Stock cannot go negative and cannot fail silently.** The decrement takes
   what it can and returns the shortfall; the webhook writes an `OVERSOLD:`
   note onto the order. Nothing reserves stock between checkout and payment, so
   two people can still pay for the last bottle. That is a known, documented
   trade-off, not an oversight: make it visible, never hide it.

5. **The order status dropdown is not a notification switch.** Moving an order
   to `paid` takes the stock; moving it to `cancelled` or `refunded` hands the
   discount use back. That lives in `src/lib/commerce/lifecycle.ts` and is
   owned by the Orders `afterChange` hook, so the webhook and a staff member
   marking an EFT by hand behave identically. Guards (`stockMoved`,
   `discountReleased`) are on the order, not on the code path, so the work
   happens exactly once. Never call the lifecycle helpers from the webhook as
   well: it would hand them a document captured before the hook's own write.
6. **Money that needs a person is visible in the order list.** The
   `needsAttention` column plus a staff email, not just `internalNotes` and a
   server log nobody reads.

### Do not turn on SQLite transactions

`transactionOptions` on the sqlite adapter looks like the obvious fix for the
lack of rollback. It was tried, and every write then fails with **"database is
locked"**: the concurrency-safe statements in `src/lib/commerce/atomic.ts` run
through drizzle on their own connection, and SQLite's write transaction lock is
exclusive. Those statements are what keep the order counter gapless, the
discount cap honest and the stock decrement safe under concurrent checkouts.
They win.

The consequence is that a multi-step write cannot roll back, so anything that
must not leave a half-finished row behind has to clean up after itself. See
`registerCustomer` in `src/app/actions/account.ts`, which deletes the account it
just made when the confirmation email will not send.

Customer accounts require a **confirmed email** (`verify` on the Customers
collection). The account page shows guest orders matched on email address, so
an unverified signup would hand a stranger someone else's purchase history.
This makes account signup depend on SMTP working.

## Backups

The whole business is one file. Orders, customer addresses, enquiries and the
staff logins live in `verboten.db`, which is deliberately outside git and
outside the deploy, so nothing anywhere else holds a copy.

```bash
cd ~/verboten && node scripts/backup-db.mjs
```

Uses SQLite's own `VACUUM INTO`, which is safe while the app is serving: `cp`
is not, because a write in progress leaves the copy torn. Every snapshot is
reopened, integrity-checked and row-counted against the source before it is
kept, because an unverified backup is a guess. Keeps the last 14; set
`BACKUP_KEEP` or `BACKUP_DIR` to change that.

Worth a nightly cPanel cron job:
```
cd ~/verboten && ~/nodevenv/verboten/[version]/bin/node scripts/backup-db.mjs
```

**To restore**, with the app stopped:
```bash
pkill -u "$(whoami)" -9 -f node
cd ~/verboten
mv verboten.db verboten.db.before-restore
cp backups/verboten-<stamp>.db verboten.db
```
then Start the app in cPanel. Keep the displaced file until the restore is
confirmed good.

Snapshots sit on the same disk as the database they protect, which is half a
backup. Download them periodically, or point `BACKUP_DIR` off the machine.

## Performance

Measured, not guessed:

```powershell
node scripts/measure-weight.mjs
```

Reports what a 360px phone actually downloads per page, over the wire with
compression on, following each srcset to the candidate a phone would pick. As
of the last run the home page is 309KB, the shop 340KB and a product page
331KB, with no single asset over 200KB.

It was 1.36MB before, because one photograph had been uploaded as PNG and its
768px variant alone was 1,063KB, more than everything else on the page put
together. Media.ts writes WebP variants now; `rebuild-image-variants.mjs` fixes
anything uploaded before that.

## Testing

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm test
```

`node:test` via `tsx`, no framework installed: the host is shared and the
toolchain stays small. Covers the logic where a quiet mistake costs money or
breaks a legal promise: totals, discount arithmetic, stock and bundle
availability (`lib/commerce/*.test.ts`), the age gate's date arithmetic
(`lib/compliance.test.ts`), and the sale reports and consent cookie
(`lib/analytics.test.ts`).

`scripts/verify-money-path.mjs` drives a real order through a forged but
correctly signed ITN. Localhost only, and it refuses to run anywhere else.

## Deploying

The build is committed, so the server never builds. Order matters.

1. `npm run build` locally, commit, push.
2. cPanel > Git Version Control > Update from Remote, then Deploy HEAD.
3. **If the release added a collection or a field**, on the server:
   ```bash
   cd ~/verboten && source ~/nodevenv/verboten/*/bin/activate
   node -v                      # must be v20.x, not the system Node 10
   node scripts/ensure-schema.mjs
   ```
   Schema push is off unless `PAYLOAD_PUSH=1` (`payload.config.ts`), so no
   script can rewrite the live schema by accident, and the live database is a
   single SQLite file holding real orders. New tables and columns are added by
   this idempotent script and nothing else.
4. **Restart properly.** The cPanel Restart button does not kill the running
   process, which then serves the old build from memory and makes a successful
   deploy look like a failed one:
   ```bash
   pkill -u "$(whoami)" -9 -f node
   ```
   then Stop and Start the app in cPanel.
5. **If the release touched image handling**, rebuild the variants on the
   server, BEFORE restarting:
   ```bash
   node scripts/rebuild-image-variants.mjs           # report first
   node scripts/rebuild-image-variants.mjs --write
   ```
   `media/` is gitignored and excluded from the deploy, so the real files only
   exist on the server and this is the only place that can fix them. The build
   bakes image URLs into the prerendered HTML, so the order matters: deploy,
   rebuild the variants, then restart, or the pages will briefly ask for WebP
   files that are not there yet. Idempotent, and it never touches the original
   upload.
6. **If content changed**, run `scripts/update-live-copy.mjs` (needs
   `ADMIN_EMAIL` and `ADMIN_PASSWORD`, talks to the live site over HTTPS, so the
   app must be up first).
7. Purge the Cloudflare cache. Verify twice: the first response can come from a
   stale edge copy and look like a failure.

The deploy excludes `verboten.db`, `media`, `.env` and `node_modules`, so live
data survives. `verboten.db` is gitignored and must stay that way: it holds
staff password hashes and, once trading, customer names, addresses and dates of
birth.

## Build phases

1. ✅ Scaffold: Next + Payload + Postgres running, admin reachable.
2. ✅ Data model: Products, Batches, Orders, Customers, DiscountCodes,
   Stockists, Events, JournalPosts, Serves, Pages, Subscribers, SiteSettings;
   roles & access control; seed real products.
3. ✅ Design system: tokens, dark theme, typography, restyled components.
4. ✅ Public site: all pages against CMS data, full copy rewrite.
5. ✅ Commerce: cart, checkout, PayFast + webhook verification, order emails,
   discount codes.
6. ✅ Age gate, compliance pages, accessibility pass, motion pass.
7. ✅ SEO, structured data, redirect map, OG images, performance.
8. ✅ Live, with a sandbox purchase driven end to end and the money path
   verified. Ongoing: audit findings, conversion work, real photography.

## Compliance (non-negotiable)

Checked against the DF-SA Alcohol Industry Communications Code of Conduct
(2026 edition, enforced by the ARB against non-members too), POPIA and the
Information Regulator's direct marketing guidance, and the CPA regulations of
15 April 2026. The owner's side of it is in `docs/launch-checklist.md`.

- **Age gate** (`components/compliance/age-gate.tsx`): full date of birth and
  country (code 7.8.4), under-age visitors go to Aware.org, the date is thrown
  away and only a pass flag is kept, per session unless "remember me". Client
  only and crawler safe. DOB check again at checkout.
- **Responsibility wording** is the code's own, from `lib/compliance.ts`, never
  a paraphrase. It stays on screen in the sticky header (7.8.1), sits in every
  email footer and on every share image.
- **No alcohol strength in promotional copy** (2.6.2): not in meta
  descriptions, share cards, emails, the feed, the hero or product stages. The
  factual spec row on the product page and the structured data keep it.
- **Every email names the house in full** (company, physical address, email,
  phone) through `standardFooter` / `identityText`, reading Site Settings.
- **Consent before measurement** (`lib/consent.ts`, `consent-banner.tsx`,
  `components/analytics/measurement.tsx`): GA4 and the Meta Pixel load only
  after the visitor agrees, and only once the age gate has been passed in this
  visit, because consent lasts months and a gate pass lasts a session. Anything
  new that talks to Google, Meta or any other tracker goes through the same
  gate: `hasPassedAgeGate()` plus `readConsent()`, checked at the moment of
  sending, not once at load.
- **Paid sales are reported from the server** (`lib/analytics-server.ts`), from
  the Orders hook, once (`analyticsReported` guard), only with the consent the
  buyer gave at checkout. The IP, user agent and click ids saved for that are
  deleted straight after (POPIA s14). Never add a browser purchase event: the
  buyer pays on PayFast and the sale would be counted twice or not at all.
- **Legal facts** in copy (brandy classes, liqueur sugar minimums) come from
  the regulations, cited in the code comment beside them. Never state which
  legal class a Verboten product is until the owner confirms it.
- Legal pages: Terms, Privacy (rewritten for consent, in `src/seed/content.ts`
  and `scripts/update-live-copy.mjs`, kept in step), Shipping & Returns,
  Responsible Enjoyment.

## Search and feeds

- Every indexable page builds metadata with `pageMeta()` (`lib/metadata.ts`).
  Setting `openGraph` directly on a page replaces the layout's whole object and
  silently drops the share image, which is how most pages lost theirs.
- JSON-LD builders are in `lib/seo.ts`. Shipping in them goes through
  `orderTotals()`, like every other money figure.
- `/feeds/products.xml` serves Google Merchant Center and Meta catalogue ads.
  Only products with a real JPEG or PNG photograph are listed.
- Redirects: `skipTrailingSlashRedirect` is on so every legacy WordPress URL
  reaches its final page in one hop (`next.config.ts`). Add new legacy paths to
  the `LEGACY` list, not as separate rules.
