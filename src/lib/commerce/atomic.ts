import { sql } from "drizzle-orm";
import type { Payload } from "payload";

/**
 * Concurrency-safe database operations that Payload's document API cannot
 * express atomically (arithmetic on an existing column, a gapless counter).
 * Each runs as a single SQL statement so it is safe under concurrent
 * checkouts and webhook retries.
 *
 * Dialect-aware: the default database is SQLite (a single file, so the whole
 * site is self-contained on cPanel); Postgres is used when DATABASE_URI is a
 * postgres:// URL. The two engines differ enough (sequences vs a counter
 * table, GREATEST vs MAX, execute() vs get()/run()) that each operation has a
 * branch.
 */

const isPostgres = (): boolean => (process.env.DATABASE_URI || "").startsWith("postgres");

type AnyDb = {
  execute?: (q: unknown) => Promise<{ rows: Array<Record<string, unknown>> }>;
  get?: (q: unknown) => Promise<Record<string, unknown> | undefined>;
  run?: (q: unknown) => Promise<unknown>;
};

const db = (payload: Payload): AnyDb =>
  (payload.db as unknown as { drizzle: AnyDb }).drizzle;

/** Run a statement that returns one row, on either driver. */
const queryOne = async (payload: Payload, query: unknown): Promise<Record<string, unknown> | undefined> => {
  const d = db(payload);
  if (typeof d.get === "function") return d.get(query); // SQLite (libsql)
  const res = await d.execute!(query); // Postgres (node-postgres)
  return res.rows?.[0];
};

/** Run a statement with no return value, on either driver. */
const exec = async (payload: Payload, query: unknown): Promise<void> => {
  const d = db(payload);
  if (typeof d.run === "function") {
    await d.run(query); // SQLite
    return;
  }
  await d.execute!(query); // Postgres
};

/**
 * A collision-free order number from the `counters` collection: a single
 * atomic `UPDATE ... SET value = value + 1 ... RETURNING value` takes a row
 * lock (or is serialised, on SQLite), so no two callers get the same number,
 * and it is immune to the count()+1 race and to admin deletions reusing a
 * number. Works identically on Postgres and SQLite. The row is created by the
 * seed; the fallback covers a first run without it.
 */
export const nextOrderNumber = async (payload: Payload, year: number): Promise<string> => {
  const bump = sql`UPDATE counters SET value = value + 1 WHERE name = 'order' RETURNING value`;
  let row = await queryOne(payload, bump);
  if (!row || !Number.isFinite(Number(row.value))) {
    try {
      await payload.create({ collection: "counters", data: { name: "order", value: 0 }, overrideAccess: true });
    } catch {
      // Another request created it first; the UPDATE below still succeeds.
    }
    row = await queryOne(payload, bump);
  }
  const n = Number(row?.value ?? 1);
  return `VB-${year}-${String(n).padStart(4, "0")}`;
};

/** Atomic `bottles_remaining = max(0, bottles_remaining - units)`. */
export const decrementBatch = async (payload: Payload, batchId: number, units: number): Promise<void> => {
  const floorExpr = isPostgres()
    ? sql`GREATEST(0, bottles_remaining - ${units})`
    : sql`MAX(0, bottles_remaining - ${units})`;
  await exec(payload, sql`UPDATE batches SET bottles_remaining = ${floorExpr} WHERE id = ${batchId}`);
};

/** Atomic `inventory_stock_qty = max(0, inventory_stock_qty - units)`. */
export const decrementProductStock = async (
  payload: Payload,
  productId: number,
  units: number,
): Promise<void> => {
  const cur = sql`COALESCE(inventory_stock_qty, 0)`;
  const floorExpr = isPostgres()
    ? sql`GREATEST(0, ${cur} - ${units})`
    : sql`MAX(0, ${cur} - ${units})`;
  await exec(payload, sql`UPDATE products SET inventory_stock_qty = ${floorExpr} WHERE id = ${productId}`);
};

/** Atomic single-use-safe redemption counter for a discount code. */
export const incrementDiscountUse = async (payload: Payload, codeId: number): Promise<void> => {
  await exec(
    payload,
    sql`UPDATE discount_codes SET used_count = COALESCE(used_count, 0) + 1 WHERE id = ${codeId}`,
  );
};
