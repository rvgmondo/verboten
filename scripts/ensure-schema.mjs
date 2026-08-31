/**
 * Bring the LIVE database's schema up to date, additively and in place.
 *
 * Why this exists: the cPanel host has no migration tooling (no tsx, no
 * Payload CLI), and the live database is a single SQLite file holding real
 * orders, so regenerating and re-uploading it is not an option. Payload only
 * pushes schema automatically in development, so when a release adds a
 * collection its table has to be created here.
 *
 * Every statement is IF NOT EXISTS or a guarded ALTER, so running it twice is
 * harmless and it never touches existing data. Run it on the server after
 * deploying a release that adds a collection, before restarting the app:
 *
 *   cd ~/verboten && source ~/nodevenv/verboten/20/bin/activate
 *   node scripts/ensure-schema.mjs
 */

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URI || "file:./verboten.db";

if (url.startsWith("postgres")) {
  console.error("This script is for the SQLite database only.");
  process.exit(1);
}

const client = createClient({ url });

/** Statements that are safe to run repeatedly. */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`gallery_items\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`image_id\` integer NOT NULL,
    \`caption\` text NOT NULL,
    \`category\` text DEFAULT 'bottle' NOT NULL,
    \`sort_order\` numeric DEFAULT 0,
    \`featured\` integer DEFAULT false,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  )`,
  "CREATE INDEX IF NOT EXISTS `gallery_items_image_idx` ON `gallery_items` (`image_id`)",
  "CREATE INDEX IF NOT EXISTS `gallery_items_updated_at_idx` ON `gallery_items` (`updated_at`)",
  "CREATE INDEX IF NOT EXISTS `gallery_items_created_at_idx` ON `gallery_items` (`created_at`)",
];

/** Columns to add only when the table lacks them (SQLite has no IF NOT EXISTS for ADD COLUMN). */
const COLUMNS = [
  {
    table: "site_settings",
    column: "contact_notifications_email",
    ddl: "ALTER TABLE `site_settings` ADD COLUMN `contact_notifications_email` text",
  },
  {
    table: "enquiries",
    column: "topic",
    ddl: "ALTER TABLE `enquiries` ADD COLUMN `topic` text DEFAULT 'general' NOT NULL",
  },
  {
    table: "enquiries",
    column: "event_date",
    ddl: "ALTER TABLE `enquiries` ADD COLUMN `event_date` text",
  },
  {
    table: "enquiries",
    column: "event_location",
    ddl: "ALTER TABLE `enquiries` ADD COLUMN `event_location` text",
  },
  {
    table: "enquiries",
    column: "event_guests",
    ddl: "ALTER TABLE `enquiries` ADD COLUMN `event_guests` numeric",
  },
  {
    table: "payload_locked_documents_rels",
    column: "gallery_items_id",
    ddl: "ALTER TABLE `payload_locked_documents_rels` ADD COLUMN `gallery_items_id` integer REFERENCES gallery_items(id)",
  },
];

const run = async () => {
  console.log(`Database: ${url}`);

  for (const sql of STATEMENTS) {
    await client.execute(sql);
  }
  console.log("Gallery table and indexes are present");

  for (const { table, column, ddl } of COLUMNS) {
    const info = await client.execute(`pragma table_info(${table})`);
    const has = info.rows.some((r) => r.name === column);
    if (has) {
      console.log(`${table}.${column} already present`);
      continue;
    }
    await client.execute(ddl);
    console.log(`Added ${table}.${column}`);
  }

  console.log("\nSchema is up to date. Restart the app.");
};

run().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
