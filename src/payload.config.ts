import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { seoPlugin } from "@payloadcms/plugin-seo";
import type { GenerateTitle } from "@payloadcms/plugin-seo/types";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Batches } from "./collections/Batches";
import { Counters } from "./collections/Counters";
import { Customers } from "./collections/Customers";
import { DiscountCodes } from "./collections/DiscountCodes";
import { Enquiries } from "./collections/Enquiries";
import { Events } from "./collections/Events";
import { GalleryItems } from "./collections/GalleryItems";
import { JournalPosts } from "./collections/JournalPosts";
import { Media } from "./collections/Media";
import { Orders } from "./collections/Orders";
import { Pages } from "./collections/Pages";
import { Products } from "./collections/Products";
import { Serves } from "./collections/Serves";
import { Stockists } from "./collections/Stockists";
import { Subscribers } from "./collections/Subscribers";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Baked into the admin client bundle at build time (.env.production) and used
// server-side for CORS/CSRF. If it ever pointed at localhost in production,
// the live admin would call localhost and every cookie-authed save would 403
// as a CSRF mismatch, so the production fallback is the real domain.
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://verboten.co.za"
    : "http://localhost:3001");

const generateTitle: GenerateTitle = ({ doc }) => {
  const title = (doc as { title?: string; name?: string })?.title
    ?? (doc as { name?: string })?.name;
  return title ? `${title} | Verboten Spirits` : "Verboten Spirits";
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " | Verboten Spirits",
    },
    components: {
      // The admin otherwise opens on a list of collection names, which tells
      // someone running the shop alone nothing about what needs doing. This
      // puts the answer at the top of the dashboard and links straight to it.
      beforeDashboard: ["@/components/admin/today#Today"],
    },
  },
  collections: [
    Products,
    Batches,
    DiscountCodes,
    Orders,
    Customers,
    Enquiries,
    JournalPosts,
    Serves,
    GalleryItems,
    Stockists,
    Events,
    Pages,
    Subscribers,
    Media,
    Users,
    Counters,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // SQLite by default: a single file (verboten.db) on disk, no database
  // server, so the whole site is self-contained on cPanel. If DATABASE_URI is
  // a postgres:// URL instead, use Postgres (e.g. a managed instance).
  db: (process.env.DATABASE_URI || "").startsWith("postgres")
    ? postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || "" } })
    // Schema changes are applied deliberately, not auto-pushed: the live
    // database is a single file holding real orders. When a release adds a
    // collection, run scripts/ensure-schema.mjs on the server once.
    : sqliteAdapter({
        client: { url: process.env.DATABASE_URI || "file:./verboten.db" },
        // Transactions are OFF, and that is deliberate. Turning them on was
        // tried: every write then fails with "database is locked", because the
        // concurrency-safe statements in lib/commerce/atomic.ts go through
        // drizzle on their own connection and SQLite's write transaction holds
        // an exclusive lock. Those statements are what make the order counter
        // gapless, the discount cap honest and the stock decrement safe under
        // concurrent checkouts, so they win.
        //
        // The consequence is that a multi-step write cannot roll back. Nothing
        // here may rely on one: anything that must not leave a half-finished
        // row behind has to clean up after itself explicitly, the way
        // registerCustomer does when the confirmation email will not send.
      }),
  // Only configure SMTP when provided; otherwise Payload logs emails to the console.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress:
          process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "orders@verboten.co.za",
        defaultFromName: "Verboten Spirits",
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  plugins: [
    seoPlugin({
      collections: ["products", "journal-posts", "pages"],
      uploadsCollection: "media",
      generateTitle,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string; shortDescription?: string })?.excerpt
        ?? (doc as { shortDescription?: string })?.shortDescription
        ?? "",
    }),
  ],
});
