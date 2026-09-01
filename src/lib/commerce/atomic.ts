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
  all?: (q: unknown) => Promise<Array<Record<string, unknown>>>;
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

/**
 * Run a statement that may legitimately match no rows, and say so.
 *
 * This is the whole point of a guarded UPDATE: the WHERE clause is the test,
 * and matching nothing is the answer "no". Asking for it with get() does not
 * work, because drizzle's libsql get() throws when there is no row rather than
 * returning undefined, so the two cases these statements exist to handle, an
 * oversell and a discount code claimed at its cap, both blew up instead of
 * being handled. all() returns an empty array, which is the truthful shape.
 */
const queryMaybe = async (
  payload: Payload,
  query: unknown,
): Promise<Record<string, unknown> | undefined> => {
  const d = db(payload);
  if (typeof d.all === "function") {
    const rows = await d.all(query); // SQLite (libsql)
    return rows?.[0];
  }
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
  // queryMaybe, not queryOne: on a database where the counter row is missing
  // this matches nothing, and get() would throw before the branch below ever
  // ran, so the self-healing was unreachable and every checkout crashed.
  let row = await queryMaybe(payload, bump);
  if (!row || !Number.isFinite(Number(row.value))) {
    try {
      await payload.create({ collection: "counters", data: { name: "order", value: 0 }, overrideAccess: true });
    } catch {
      // Another request created it first; the UPDATE below still succeeds.
    }
    row = await queryMaybe(payload, bump);
  }
  const n = Number(row?.value ?? 1);
  return `VB-${year}-${String(n).padStart(4, "0")}`;
};

/**
 * Take `units` off a counter, never below zero, reporting what could not be
 * taken.
 *
 * Two statements, and the order matters. The first only fires when there is
 * genuinely enough, so the ordinary case is a single atomic guarded update and
 * two concurrent sales can never both succeed on the last bottle. Only when
 * that guard refuses do we fall back to draining what is left, and the
 * difference is the oversell.
 *
 * Flooring at zero is still right: stock must not go negative. Flooring
 * silently was not. Nothing reserves stock between order creation and the
 * payment landing, so two buyers can both clear the checkout stock check and
 * both pay for the last bottle. Clamping and saying nothing left staff to
 * discover it at packing time, with a customer already told the order was
 * confirmed.
 */
const takeFrom = async (
  payload: Payload,
  table: "batches" | "products",
  id: number,
  units: number,
): Promise<number> => {
  const col = table === "batches" ? sql`bottles_remaining` : sql`inventory_stock_qty`;
  const cur = table === "batches" ? sql`bottles_remaining` : sql`COALESCE(inventory_stock_qty, 0)`;
  const tbl = table === "batches" ? sql`batches` : sql`products`;

  // Enough in stock: take it in one guarded, atomic statement.
  const ok = await queryMaybe(
    payload,
    sql`UPDATE ${tbl} SET ${col} = ${cur} - ${units}
        WHERE id = ${id} AND ${cur} >= ${units}
        RETURNING ${col}`,
  );
  if (ok) return 0;

  // Not enough, so this order is taking stock that is not there. Read what
  // remains, drain it, and report the difference. The read and the drain are
  // not one statement, but this path is only ever reached once the counter is
  // already short, and its output is a staff alert rather than a price.
  const row = await queryMaybe(payload, sql`SELECT ${cur} AS remaining FROM ${tbl} WHERE id = ${id}`);
  if (!row) return units;
  const left = Number(row.remaining ?? 0);
  await exec(payload, sql`UPDATE ${tbl} SET ${col} = 0 WHERE id = ${id}`);
  return Math.max(0, units - (Number.isFinite(left) ? left : 0));
};

/** Atomic decrement of a batch. Returns units that could not be taken. */
export const decrementBatch = async (
  payload: Payload,
  batchId: number,
  units: number,
): Promise<number> => takeFrom(payload, "batches", batchId, units);

/** Atomic decrement of a product's own stock. Returns units not taken. */
export const decrementProductStock = async (
  payload: Payload,
  productId: number,
  units: number,
): Promise<number> => takeFrom(payload, "products", productId, units);

/** Atomic single-use-safe redemption counter for a discount code. */
export const incrementDiscountUse = async (payload: Payload, codeId: number): Promise<void> => {
  await exec(
    payload,
    sql`UPDATE discount_codes SET used_count = COALESCE(used_count, 0) + 1 WHERE id = ${codeId}`,
  );
};

/**
 * Take one use of a discount code, or refuse because the cap is already met.
 *
 * The cap has to be claimed in the same statement that tests it. Reading
 * usedCount and then incrementing it later leaves a window the buyer controls:
 * ten people can all read "0 used" on a single-use code within the same
 * second, and all ten get the discount. Here the WHERE clause does the testing,
 * so exactly one of those ten updates a row and the rest get false.
 *
 * Returns true when the use is claimed.
 */
export const claimDiscountUse = async (payload: Payload, codeId: number): Promise<boolean> => {
  const row = await queryMaybe(
    payload,
    sql`UPDATE discount_codes
        SET used_count = COALESCE(used_count, 0) + 1
        WHERE id = ${codeId}
          AND (max_uses IS NULL OR COALESCE(used_count, 0) < max_uses)
        RETURNING used_count`,
  );
  return Boolean(row);
};

/** Hand a claimed use back when the order it was claimed for never gets paid. */
export const releaseDiscountUse = async (payload: Payload, codeId: number): Promise<void> => {
  const cur = sql`COALESCE(used_count, 0)`;
  const floorExpr = isPostgres() ? sql`GREATEST(0, ${cur} - 1)` : sql`MAX(0, ${cur} - 1)`;
  await exec(payload, sql`UPDATE discount_codes SET used_count = ${floorExpr} WHERE id = ${codeId}`);
};
