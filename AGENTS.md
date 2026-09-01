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

Dev admin login: `admin@verboten.co.za` / `ChangeMe123!` (change before deploy).
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

## Testing

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm test
```

`node:test` via `tsx`, no framework installed: the host is shared and the
toolchain stays small. Covers the only logic where a quiet mistake costs money
(totals, discount arithmetic, stock and bundle availability). Add to
`src/lib/commerce/commerce.test.ts` rather than starting a parallel setup.

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
   Payload only pushes schema in development, and the live database is a single
   SQLite file holding real orders, so new tables and columns are added by this
   idempotent script and nothing else.
4. **Restart properly.** The cPanel Restart button does not kill the running
   process, which then serves the old build from memory and makes a successful
   deploy look like a failed one:
   ```bash
   pkill -u "$(whoami)" -9 -f node
   ```
   then Stop and Start the app in cPanel.
5. **If content changed**, run `scripts/update-live-copy.mjs` (needs
   `ADMIN_EMAIL` and `ADMIN_PASSWORD`, talks to the live site over HTTPS, so the
   app must be up first).
6. Purge the Cloudflare cache. Verify twice: the first response can come from a
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

- Age gate (18+) on first visit, accessible, consent-cookie remembered,
  crawler-safe. DOB check at checkout. "Drink responsibly. Not for sale to
  persons under 18." site-wide.
- POPIA-aware privacy handling. Legal pages: Terms, Privacy,
  Shipping & Returns, Responsible Enjoyment.
