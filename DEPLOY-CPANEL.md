# Deploying Verboten to cPanel

Verboten is a Node app (Next.js + Payload CMS), so it runs through cPanel's
**Setup Node.js App** (Passenger), not `public_html`.

**Three pieces:**

1. **The Node app** on cPanel (this repo), started by `server.cjs`.
2. **The database: a managed PostgreSQL** (Neon or Supabase, free tier to
   start). Your cPanel's own PostgreSQL is too old for Payload 3, so the app
   points at an external Postgres instead. This keeps the order and stock
   safety logic (which relies on real Postgres) intact.
3. **Media** (`media/` folder) lives on the cPanel disk, persistent across
   restarts. Nothing to configure; uploads just work.

PayFast talks to the site over HTTPS at `https://verboten.co.za`, so no
tunnels or extra services are needed.

---

## 0. Create the database (once, ~5 minutes)

1. Sign up at [neon.tech](https://neon.tech) (or supabase.com) and create a
   project in the region closest to South Africa (EU works well).
2. Copy the connection string. It looks like
   `postgresql://user:pass@ep-xxxx.eu-central-1.aws.neon.tech/verboten?sslmode=require`.
   Use Neon's **pooled** connection string if it offers one.
3. Keep it for `DATABASE_URI` below.

## 1. Create the Node.js app (cPanel → Setup Node.js App → Create Application)

- **Node version:** 20 or 22
- **Application mode:** Production
- **Application root:** `verboten` (a folder in your home directory)
- **Application URL:** `verboten.co.za`
- **Application startup file:** `server.cjs`

Save. cPanel creates the app and a Node virtual environment. Keep this screen
open; you set the environment variables here in step 3.

## 2. Get the code onto the server

Two ways; pick one.

**A. Git (from GitHub).** Push this repo to a private GitHub repo, then in
cPanel → **Git Version Control** → Create, clone it into `~/verboten`. Later
updates are a "Pull" in that screen. `node_modules`, `.next`, `.env` and
`media/` are gitignored, so a clone gives source only; you still install
(step 4) and either build on the server or upload a prebuilt `.next`.

**B. Zip upload.** Zip the project (exclude `node_modules`, `.next`,
`vendor`, `.pgdata`, `.git`), upload to `~/verboten` via File Manager, and
Extract.

> **Low process/RAM limit? (CloudLinux).** If `npm run build` gets killed on
> the server, build locally instead (see step 4) and upload your local
> `.next` folder into `~/verboten/.next`, then run only `npm install` on the
> server.

## 3. Set environment variables (on the Setup Node.js App screen)

⚠️ Set these **before** building. `NEXT_PUBLIC_SERVER_URL` is baked in at
build time.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URI` | your Neon connection string from step 0 |
| `PAYLOAD_SECRET` | a new long random string (see below) |
| `NEXT_PUBLIC_SERVER_URL` | `https://verboten.co.za` |
| `PAYFAST_MERCHANT_ID` | your live PayFast merchant id |
| `PAYFAST_MERCHANT_KEY` | your live PayFast merchant key |
| `PAYFAST_PASSPHRASE` | your PayFast passphrase (must match the dashboard) |
| `PAYFAST_SANDBOX` | `false` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | your mailbox / Resend |
| `EMAIL_FROM` | `Verboten Spirits <orders@verboten.co.za>` |
| `ADMIN_NOTIFICATIONS_EMAIL` | where new-order and enquiry alerts go |

Generate the secret locally:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Do **not** set `PAYFAST_SKIP_REMOTE_VALIDATE` in production (it is ignored
outside sandbox mode anyway).

## 4. Install and build

Copy the "Enter to the virtual environment" command from the Node App screen
(or use Terminal), then in `~/verboten`:

```
npm install --include=dev
npm run build
```

- Use `--include=dev`: with `NODE_ENV=production` a plain `npm install` skips
  the build tools (Tailwind, TypeScript) and the build fails.
- `npm install` also compiles the correct Linux `sharp` binary.
- The build reaches the database (it prerenders product and journal pages),
  so `DATABASE_URI` must point at Neon and Neon must be seeded (step 5). If
  you prefer, seed first, then build.

If the server can't build (memory), build on your PC with the **production**
env set so the data and URL are baked correctly, then upload the `.next`
folder:

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
$env:DATABASE_URI = "<your Neon string>"
$env:NEXT_PUBLIC_SERVER_URL = "https://verboten.co.za"
npm run build
```

## 5. Seed the database (once)

Easiest from your PC (point `DATABASE_URI` at Neon in your local `.env`),
which avoids any server memory limits:

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
# .env has DATABASE_URI set to the Neon string:
npm run seed:admin    # first admin user
npm run seed          # batch, real products, pages, serves, journal
npm run seed:media    # pulls the client's product photos into Media
```

Then upload the resulting `media/` folder to `~/verboten/media/` on the
server (File Manager or SFTP), since media files live on the cPanel disk, not
in Neon.

Change the admin password immediately after first login.

## 6. Start and go live

1. On the Setup Node.js App screen, click **Restart**.
2. In cPanel, make sure **AutoSSL** has issued a certificate for the domain
   (HTTPS is required; PayFast and the security headers assume it).
3. Visit `https://verboten.co.za` and `https://verboten.co.za/admin`.
4. **PayFast dashboard:** set the passphrase to match `PAYFAST_PASSPHRASE`.
   The ITN (webhook) URL is `https://verboten.co.za/api/payfast/notify` and is
   sent automatically with each payment; no dashboard change needed for it.
5. Place one real low-value test order end to end, confirm the order flips to
   **paid** in the admin and the confirmation email arrives, then you are live.

Before launch, resolve the open facts in `README.md` (the 3-year vs 5-year
age, the responsible-drinking helpline numbers, the Brandy & Cola specs and
stock count).

---

## Updating later

Pull/upload changed source, run `npm install` only if dependencies changed,
`npm run build` (or upload a locally built `.next`), then **Restart**. Do not
overwrite the `media/` folder. The database lives in Neon and is untouched by
deploys.

## Troubleshooting

- **Build killed / out of memory:** build locally and upload `.next` (step 4),
  then run only `npm install` on the server. Or ask the host to raise the
  Node app's memory limit.
- **502 / won't start:** check the app's stderr log (Node App screen → Logs,
  or `~/verboten/stderr.log`). Usually a missing `PAYLOAD_SECRET` or a
  `DATABASE_URI` the server can't reach.
- **Cannot connect to Postgres:** confirm the Neon string is correct and
  includes `sslmode=require`; some hosts need outbound connections enabled
  (ask support). Neon's pooled connection string handles many short requests
  best.
- **Payments never confirm:** the ITN can't reach the site, or the passphrase
  differs between cPanel and the PayFast dashboard. They must match exactly.
- **Images 404:** the `media/` folder was not uploaded to `~/verboten/media/`.

## Not using cPanel?

The same build runs anywhere Node 20+ runs. On **Vercel** (plus Neon):
import the repo, set the env vars, and add a storage adapter for media
(Vercel's filesystem is not persistent, unlike cPanel). On a **VPS** or
Railway/Render: `npm install && npm run build && npm run start` behind HTTPS
with the same env vars, media on the local disk.
