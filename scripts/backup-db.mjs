/**
 * Take a consistent snapshot of the live database, verify it, and keep the
 * last few.
 *
 * The whole business is one file. Every order, every customer address, every
 * enquiry and the staff logins live in verboten.db on shared hosting, and it
 * is deliberately excluded from the deploy and from git, which means nothing
 * anywhere else has a copy. One bad command, one disk fault or one botched
 * restore and the order history is gone, along with the records the tax
 * authority expects to be kept for five years.
 *
 * VACUUM INTO is SQLite's own way of copying a database that is being written
 * to. It takes a read lock, writes a defragmented copy, and produces a file
 * that is internally consistent even if an order lands mid-run. Copying the
 * file with cp does not give that guarantee, because a write in progress
 * leaves the copy torn.
 *
 * Every snapshot is opened and counted afterwards. An unverified backup is a
 * guess, and the moment you find out it was a bad guess is the moment you
 * needed it.
 *
 *   cd ~/verboten && source ~/nodevenv/verboten/[version]/bin/activate
 *   node scripts/backup-db.mjs
 *
 * As a cPanel cron job, nightly:
 *   cd ~/verboten && ~/nodevenv/verboten/[version]/bin/node scripts/backup-db.mjs
 */

import fs from "node:fs";
import path from "node:path";

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URI || "file:./verboten.db";
if (url.startsWith("postgres")) {
  console.error("This script backs up the SQLite database. Postgres has its own tooling.");
  process.exit(1);
}

const DB_PATH = url.replace(/^file:/, "");
const OUT_DIR = process.env.BACKUP_DIR || path.resolve(process.cwd(), "backups");
/** How many snapshots to keep. A fortnight of nightly runs. */
const KEEP = Number(process.env.BACKUP_KEEP || 14);

/** Tables whose contents would actually hurt to lose. */
const CRITICAL = ["orders", "customers", "enquiries", "subscribers", "products", "media"];

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

const run = async () => {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`No database at ${DB_PATH}. Set DATABASE_URI or run from the app root.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = path.join(OUT_DIR, `verboten-${stamp}.db`);

  console.log(`Source: ${DB_PATH} (${mb(fs.statSync(DB_PATH).size)})`);
  console.log(`Target: ${outPath}\n`);

  const source = createClient({ url });

  // Counted before, so the verification below has something to compare against
  // rather than just asserting the file opens.
  const expected = {};
  for (const table of CRITICAL) {
    try {
      const r = await source.execute(`SELECT COUNT(*) AS n FROM ${table}`);
      expected[table] = Number(r.rows[0].n);
    } catch {
      // A table that does not exist yet is not a failure.
    }
  }

  // SQLite's own consistent copy. Safe while the app is serving.
  await source.execute({ sql: "VACUUM INTO ?", args: [outPath] });

  if (!fs.existsSync(outPath)) {
    console.error("VACUUM INTO reported success but wrote no file.");
    process.exit(1);
  }

  // Verify: open the copy and check it holds what the original held.
  const copy = createClient({ url: `file:${outPath}` });
  const integrity = await copy.execute("PRAGMA integrity_check");
  const verdict = String(integrity.rows[0]?.integrity_check ?? "");
  if (verdict !== "ok") {
    console.error(`Integrity check failed on the snapshot: ${verdict}`);
    process.exit(1);
  }

  let mismatch = false;
  for (const [table, count] of Object.entries(expected)) {
    const r = await copy.execute(`SELECT COUNT(*) AS n FROM ${table}`);
    const got = Number(r.rows[0].n);
    const ok = got >= count; // A row added mid-run is fine; a row missing is not.
    if (!ok) mismatch = true;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${table.padEnd(12)} ${String(count).padStart(6)} -> ${got}`);
  }
  if (mismatch) {
    console.error("\nThe snapshot is missing rows. Keeping it for inspection, but do not trust it.");
    process.exit(1);
  }

  console.log(`\nVerified. ${mb(fs.statSync(outPath).size)}`);

  // Prune, newest first, keeping KEEP.
  const snapshots = fs
    .readdirSync(OUT_DIR)
    .filter((f) => /^verboten-.*\.db$/.test(f))
    .sort()
    .reverse();
  const stale = snapshots.slice(KEEP);
  for (const f of stale) {
    fs.unlinkSync(path.join(OUT_DIR, f));
    console.log(`  pruned ${f}`);
  }
  console.log(`${Math.min(snapshots.length, KEEP)} snapshot(s) kept, oldest first is ${snapshots[Math.min(snapshots.length, KEEP) - 1] ?? "none"}.`);

  console.log(
    "\nThese live on the same disk as the thing they protect, which is only half a backup. " +
      "Download them, or point BACKUP_DIR somewhere else.",
  );
};

run().catch((err) => {
  console.error("\nBackup failed:", err.message);
  process.exit(1);
});
