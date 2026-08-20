import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { seoPlugin } from "@payloadcms/plugin-seo";
import type { GenerateTitle } from "@payloadcms/plugin-seo/types";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Batches } from "./collections/Batches";
import { Customers } from "./collections/Customers";
import { DiscountCodes } from "./collections/DiscountCodes";
import { Events } from "./collections/Events";
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

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

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
  },
  collections: [
    Products,
    Batches,
    DiscountCodes,
    Orders,
    Customers,
    JournalPosts,
    Serves,
    Stockists,
    Events,
    Pages,
    Subscribers,
    Media,
    Users,
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
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
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
