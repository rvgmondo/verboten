# Verboten Spirits — verboten.co.za rebuild

Ground-up production rebuild of https://verboten.co.za — Verboten Spirits
(Verboten Pty Ltd), an independent South African beverage house in Silverton,
Pretoria. Custom e-commerce (brandy, brandy & cola RTD), custom admin, full
copy rewrite. Replaces a WordPress WooCommerce template build.

## Stack

- **Next.js 15.4.11** — App Router, React 19, Server Components, TypeScript strict.
- **Payload CMS 3.88** — same Next app (CMS + admin + auth + commerce data).
- **PostgreSQL** — portable instance under `vendor/pgsql`, cluster in `.pgdata`,
  port **5434**, db `verboten` (prod: Neon/Supabase via `DATABASE_URI`).
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
3. **Postgres must be running** before dev/build/seed: `npm run db:start`
   (the `predev`/`prebuild` hooks do this automatically). One-time cluster
   init: `npm run db:setup`.
4. Dev server runs on **port 3001** (3000 is Amico's). Site: http://localhost:3001,
   admin: http://localhost:3001/admin.

## Running locally

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm run db:setup     # first time only: init cluster + create db
npm run seed:admin   # first time only: dev admin user
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

- Verboten Premium Brandy Batch No. 01 — 3-year, French oak finish, 43% ABV,
  750ml, R450. Batch of 500 numbered bottles.
- Batch No. 01 Premium Set (2 bottles) — R850. A bundle, first-class product.
- Verboten Brandy & Cola RTD can — R45.
- Gin and further spirits in development.

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

## Build phases

1. ✅ Scaffold: Next + Payload + Postgres running, admin reachable.
2. Data model: Products, Batches, Orders, Customers, DiscountCodes, Stockists,
   Events, JournalPosts, Serves, Pages, Subscribers, SiteSettings; roles &
   access control; seed real products.
3. Design system: tokens, dark theme, typography, restyled component library.
4. Public site: all pages against CMS data, full copy rewrite.
5. Commerce: cart, checkout, PayFast + webhook verification, order emails,
   discount codes.
6. Age gate, compliance pages, accessibility pass, motion pass.
7. SEO, structured data, redirect map, OG images, performance.
8. Final QA: sandbox purchase E2E, a11y audit, Lighthouse, README.

## Compliance (non-negotiable)

- Age gate (18+) on first visit, accessible, consent-cookie remembered,
  crawler-safe. DOB check at checkout. "Drink responsibly. Not for sale to
  persons under 18." site-wide.
- POPIA-aware privacy handling. Legal pages: Terms, Privacy,
  Shipping & Returns, Responsible Enjoyment.
