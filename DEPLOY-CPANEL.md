# Deploying Verboten to cPanel

Verboten is a Node app (Next.js + Payload CMS), so it runs through cPanel's
**Setup Node.js App** (Passenger), not `public_html`.

**Fully self-contained. Nothing external.**

- **The Node app** on cPanel (this repo), started by `server.cjs`.
- **The database is SQLite** (`verboten.db`), a single file on the cPanel
  disk. No database server, no external account, no third-party service.
- **Media** (`media/`) also lives on the cPanel disk.

Your whole site state is two things: the `verboten.db` file and the `media/`
folder. Back those up together and you have everything.

> Payload 3 supports Postgres, SQLite and MongoDB (not MySQL/MariaDB), and
> your cPanel's own PostgreSQL (v10) is too old for it. SQLite is the right
> internal fit for a single site. If you ever outgrow it, set `DATABASE_URI`
> to a `postgres://` URL and the app switches automatically, no code change.

---

## Fastest path: use the prebuilt bundle (recommended)

The `deploy/` folder holds a ready-to-go package so you do NOT build on the
server:

- **`verboten-deploy.zip`**: the whole app, already built (`.next` included),
  with the seeded `verboten.db` and the product photos in `media/`. No
  `node_modules` (you install those on the server, once).
- **`PROD-ENV.txt`**: every environment variable, with a fresh
  `PAYLOAD_SECRET` already generated. You only fill the PayFast and email blanks.

Steps:

1. **cPanel → Setup Node.js App → Create Application:** Node 20 or 22,
   Application mode Production, Application root `verboten`, Application URL
   `verboten.co.za`, Application startup file `server.cjs`. Save.
2. **File Manager → `~/verboten`:** upload `verboten-deploy.zip` and **Extract**
   it there.
3. **Environment variables** (on the Node App screen): paste each line from
   `PROD-ENV.txt`; fill the `<FILL IN>` PayFast and SMTP values.
4. **Enter the virtual environment** (button on the Node App screen), then:
   ```
   npm install --omit=dev
   ```
   No build step: the `.next` build is already in the zip, so you only need
   the runtime dependencies. `--omit=dev` installs those (and compiles the
   Linux `sharp` and SQLite binaries) while skipping the build-only dev tools,
   one of which (`unrs-resolver`, from the ESLint tooling) has a native
   postinstall that fails on some shared hosts.
5. **Restart** (button on the Node App screen). Confirm AutoSSL has issued the
   certificate. Visit `/admin`, log in as `admin@verboten.co.za`, change the
   password. In the PayFast dashboard set the passphrase to match
   `PAYFAST_PASSPHRASE`. Place one real low-value test order.

That is the whole deployment. The sections below are the manual, from-source
alternative (e.g. deploying updates later, or via GitHub).

---

## 1. Create the Node.js app (cPanel → Setup Node.js App → Create Application)

- **Node version:** 20 or 22
- **Application mode:** Production
- **Application root:** `verboten` (a folder in your home directory)
- **Application URL:** `verboten.co.za`
- **Application startup file:** `server.cjs`

Save. cPanel creates the app and a Node virtual environment. Keep this screen
open; you set the environment variables here in step 3.

## 2. Prepare the database and media on your PC (once)

Seed locally so the shipped database already has the products, pages and
photos. In `C:\CC\verboten`:

```powershell
$env:Path = "C:\CC\verboten\vendor\node;$env:Path"
npm run seed:admin    # first admin user
npm run seed          # batch, real products, pages, serves, journal, counter
npm run seed:media    # pulls the product photos into media/
```

This creates `verboten.db` and fills `media/`. (Local dev uses SQLite too, so
there is no database server to start.)

## 3. Get the code + data onto the server

Two ways to send the code; pick one.

**A. Git (from GitHub).** Push this repo to a private GitHub repo, then in
cPanel → **Git Version Control** → clone it into `~/verboten`. Later updates
are a "Pull". `node_modules`, `.next`, `verboten.db` and `media/` are
gitignored, so the clone is source only.

**B. Zip upload.** Zip the project (exclude `node_modules`, `.next`,
`vendor`, `.pgdata`, `.git`), upload to `~/verboten` via File Manager, Extract.

Then upload the **data** (not in Git, so always separate):

1. Upload **`verboten.db`** into `~/verboten/verboten.db`.
2. Upload **`media/`** so the photos land in `~/verboten/media/` (a big
   `media` folder may need SFTP rather than File Manager).

## 4. Set environment variables (on the Setup Node.js App screen)

⚠️ Set these **before** building. `NEXT_PUBLIC_SERVER_URL` is baked in at
build time.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URI` | `file:./verboten.db` |
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

## 5. Install and build

Copy the "Enter to the virtual environment" command from the Node App screen
(or use Terminal), then in `~/verboten`:

```
npm install --include=dev
npm run build
```

- Use `--include=dev`: with `NODE_ENV=production` a plain `npm install` skips
  the build tools (Tailwind, TypeScript) and the build fails.
- `npm install` also compiles the correct Linux `sharp` and SQLite binaries.

> **Low process/RAM limit? (CloudLinux).** If `npm run build` gets killed,
> build on your PC instead (`npm run build`) and upload your local `.next`
> folder into `~/verboten/.next`, then run only `npm install` on the server.

## 6. Start and go live

1. On the Setup Node.js App screen, click **Restart**.
2. In cPanel, confirm **AutoSSL** has issued a certificate for the domain
   (HTTPS is required; PayFast and the security headers assume it).
3. Visit `https://verboten.co.za` and `https://verboten.co.za/admin`, log in
   as `admin@verboten.co.za` and **change the password immediately**.
4. **PayFast dashboard:** set the passphrase to match `PAYFAST_PASSPHRASE`.
   The ITN (webhook) URL is `https://verboten.co.za/api/payfast/notify`, sent
   automatically with each payment; no dashboard change needed for it.
5. Place one real low-value test order end to end, confirm the order flips to
   **paid** in the admin and the confirmation email arrives, then you are live.

Before launch, resolve the open facts in `README.md` (the 3-year vs 5-year
age, the responsible-drinking helpline numbers, the Brandy & Cola specs and
stock count).

---

## Updating the code later

Pull/upload changed source, run `npm install` only if dependencies changed,
`npm run build` (or upload a locally built `.next`), then **Restart**.

**Do not overwrite `verboten.db` or `media/` when updating.** Those hold your
live orders, customers and photos. Only replace them deliberately.

## Backups

Back up **`verboten.db`** and the **`media/`** folder together, on a schedule.
That is your entire database (orders, customers, products, content) and all
images. To restore, put both back and Restart.

## Troubleshooting

- **Build killed / out of memory:** build locally and upload `.next`, then run
  only `npm install` on the server. Or ask the host to raise the Node app's
  memory limit.
- **502 / won't start:** check the app's stderr log (Node App screen → Logs,
  or `~/verboten/stderr.log`). Usually a missing `PAYLOAD_SECRET`, or the app
  can't write to `verboten.db` (the app root must be writable, and it is by
  default if you uploaded the file there).
- **"readonly database" errors:** make sure `verboten.db` and `~/verboten` are
  owned by your cPanel user (they are, if you uploaded them there).
- **Payments never confirm:** the ITN can't reach the site, or the passphrase
  differs between cPanel and the PayFast dashboard. They must match exactly.
- **Images 404:** `media/` was not uploaded into `~/verboten/media/`.

## Not using cPanel?

The same build runs anywhere Node 20+ runs. On a **VPS** or Railway/Render:
`npm install && npm run build && npm run start` behind HTTPS with the same env
vars; `verboten.db` and `media/` on the local disk. (On serverless platforms
like Vercel the filesystem is not persistent, so SQLite and local media do not
fit there without a managed Postgres and a media storage adapter.)
