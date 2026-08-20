import { sql } from "drizzle-orm";
import type { Payload } from "payload";

/**
 * Concurrency-safe database operations that Payload's document API cannot
 * express atomically. All run as single SQL statements against the Postgres
 * adapter's drizzle client, so they are safe under concurrent checkouts and
 * webhook retries.
 */

type Drizzle = { execute: (q: unknown) => Promise<{ rows: Array<Record<string, unknown>> }> };

const db = (payload: Payload): Drizzle =>
  (payload.db as unknown as { drizzle: Drizzle }).drizzle;

/**
 * A gapless-enough, collision-free order number from a dedicated sequence.
 * Immune to the count()+1 race and to admin deletions reusing a number
 * (nextval never goes backwards). Created on first use.
 */
export const nextOrderNumber = async (payload: Payload, year: number): Promise<string> => {
  await db(payload).execute(sql`CREATE SEQUENCE IF NOT EXISTS verboten_order_seq START 1`);
  const res = await db(payload).execute(sql`SELECT nextval('verboten_order_seq') AS n`);
  const n = Number(res.rows[0]?.n ?? 0);
  return `VB-${year}-${String(n).padStart(4, "0")}`;
};

/** Atomic `bottles_remaining = GREATEST(0, bottles_remaining - units)`. */
export const decrementBatch = async (
  payload: Payload,
  batchId: number,
  units: number,
): Promise<void> => {
  await db(payload).execute(
    sql`UPDATE batches SET bottles_remaining = GREATEST(0, bottles_remaining - ${units}) WHERE id = ${batchId}`,
  );
};

/** Atomic `inventory_stock_qty = GREATEST(0, inventory_stock_qty - units)`. */
export const decrementProductStock = async (
  payload: Payload,
  productId: number,
  units: number,
): Promise<void> => {
  await db(payload).execute(
    sql`UPDATE products SET inventory_stock_qty = GREATEST(0, COALESCE(inventory_stock_qty, 0) - ${units}) WHERE id = ${productId}`,
  );
};

/** Atomic single-use-safe redemption counter for a discount code. */
export const incrementDiscountUse = async (payload: Payload, codeId: number): Promise<void> => {
  await db(payload).execute(
    sql`UPDATE discount_codes SET used_count = COALESCE(used_count, 0) + 1 WHERE id = ${codeId}`,
  );
};
