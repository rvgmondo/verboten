import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { Payload } from "payload";

import {
  claimDiscountUse,
  decrementBatch,
  decrementProductStock,
  incrementDiscountUse,
  nextOrderNumber,
  releaseDiscountUse,
} from "@/lib/commerce/atomic";

/**
 * The raw SQL that guards money, run against a real SQLite engine.
 *
 * These statements exist precisely because Payload's document API cannot
 * express them safely: read-modify-write loses an update under concurrent
 * checkouts, which is how a numbered batch gets oversold and how ten people
 * spend a single-use code in the same minute. Asserting on their behaviour
 * against an in-memory database is the only way to know the semantics are
 * what the comments claim, without touching the live file.
 */

let client: ReturnType<typeof createClient>;
let payload: Payload;

const fakePayload = (db: unknown): Payload =>
  ({
    db: { drizzle: db },
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  }) as unknown as Payload;

beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  payload = fakePayload(drizzle(client));

  await client.batch([
    "CREATE TABLE products (id INTEGER PRIMARY KEY, inventory_stock_qty INTEGER)",
    "CREATE TABLE batches (id INTEGER PRIMARY KEY, bottles_remaining INTEGER, status TEXT)",
    `CREATE TABLE discount_codes (
       id INTEGER PRIMARY KEY, code TEXT, max_uses INTEGER, used_count INTEGER
     )`,
    "CREATE TABLE counters (name TEXT PRIMARY KEY, value INTEGER)",
  ]);
});

const stockOf = async (id: number) =>
  Number(
    (await client.execute({ sql: "SELECT inventory_stock_qty AS n FROM products WHERE id = ?", args: [id] }))
      .rows[0].n,
  );

const usedOf = async (code: string) =>
  Number(
    (await client.execute({ sql: "SELECT used_count AS n FROM discount_codes WHERE code = ?", args: [code] }))
      .rows[0].n,
  );

describe("decrementProductStock", () => {
  it("takes what was asked for when there is enough", async () => {
    await client.execute("INSERT INTO products VALUES (1, 10)");
    const short = await decrementProductStock(payload, 1, 3);
    assert.equal(short, 0);
    assert.equal(await stockOf(1), 7);
  });

  it("takes the last unit exactly, leaving zero", async () => {
    await client.execute("INSERT INTO products VALUES (1, 1)");
    assert.equal(await decrementProductStock(payload, 1, 1), 0);
    assert.equal(await stockOf(1), 0);
  });

  it("reports the shortfall instead of going negative", async () => {
    await client.execute("INSERT INTO products VALUES (1, 2)");
    const short = await decrementProductStock(payload, 1, 5);
    assert.equal(short, 3); // asked 5, had 2
    assert.equal(await stockOf(1), 0);
  });

  it("reports the whole amount when there is nothing left", async () => {
    await client.execute("INSERT INTO products VALUES (1, 0)");
    assert.equal(await decrementProductStock(payload, 1, 2), 2);
    assert.equal(await stockOf(1), 0);
  });

  it("only the first of two sales gets the last bottle", async () => {
    // The oversell the shop can actually suffer: nothing reserves stock
    // between checkout and payment, so two paid orders can arrive for one
    // bottle. The second must come back short rather than quietly succeed.
    await client.execute("INSERT INTO products VALUES (1, 1)");
    assert.equal(await decrementProductStock(payload, 1, 1), 0);
    assert.equal(await decrementProductStock(payload, 1, 1), 1);
    assert.equal(await stockOf(1), 0);
  });

  it("treats a null count as zero rather than throwing", async () => {
    await client.execute("INSERT INTO products VALUES (1, NULL)");
    assert.equal(await decrementProductStock(payload, 1, 1), 1);
  });
});

describe("decrementBatch", () => {
  it("takes from the batch and reports no shortfall", async () => {
    await client.execute("INSERT INTO batches VALUES (1, 60, 'available')");
    assert.equal(await decrementBatch(payload, 1, 12), 0);
    const left = await client.execute("SELECT bottles_remaining AS n FROM batches WHERE id = 1");
    assert.equal(Number(left.rows[0].n), 48);
  });

  it("drains what remains and reports the difference", async () => {
    await client.execute("INSERT INTO batches VALUES (1, 4, 'available')");
    assert.equal(await decrementBatch(payload, 1, 10), 6);
    const left = await client.execute("SELECT bottles_remaining AS n FROM batches WHERE id = 1");
    assert.equal(Number(left.rows[0].n), 0);
  });
});

describe("claimDiscountUse", () => {
  it("claims a use and counts it in the same statement", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'ONCE', 1, 0)");
    assert.equal(await claimDiscountUse(payload, 1), true);
    assert.equal(await usedOf("ONCE"), 1);
  });

  it("refuses once the cap is met, which is the whole point", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'ONCE', 1, 0)");
    assert.equal(await claimDiscountUse(payload, 1), true);
    assert.equal(await claimDiscountUse(payload, 1), false);
    assert.equal(await claimDiscountUse(payload, 1), false);
    // The refusals must not have counted.
    assert.equal(await usedOf("ONCE"), 1);
  });

  it("lets an uncapped code through every time", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'OPEN', NULL, 0)");
    for (let i = 0; i < 5; i += 1) assert.equal(await claimDiscountUse(payload, 1), true);
    assert.equal(await usedOf("OPEN"), 5);
  });

  it("honours a cap above one", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'THREE', 3, 0)");
    assert.deepEqual(
      [
        await claimDiscountUse(payload, 1),
        await claimDiscountUse(payload, 1),
        await claimDiscountUse(payload, 1),
        await claimDiscountUse(payload, 1),
      ],
      [true, true, true, false],
    );
    assert.equal(await usedOf("THREE"), 3);
  });

  it("refuses a code that is not there", async () => {
    assert.equal(await claimDiscountUse(payload, 999), false);
  });
});

describe("releaseDiscountUse", () => {
  it("hands a use back when a sale comes off", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'ONCE', 1, 1)");
    await releaseDiscountUse(payload, 1);
    assert.equal(await usedOf("ONCE"), 0);
    // And the code works again, which is the reason for releasing it.
    assert.equal(await claimDiscountUse(payload, 1), true);
  });

  it("never takes the count below zero", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'ONCE', 1, 0)");
    await releaseDiscountUse(payload, 1);
    await releaseDiscountUse(payload, 1);
    assert.equal(await usedOf("ONCE"), 0);
  });
});

describe("incrementDiscountUse", () => {
  it("counts a redemption without testing the cap", async () => {
    await client.execute("INSERT INTO discount_codes VALUES (1, 'ONCE', 1, 0)");
    await incrementDiscountUse(payload, 1);
    await incrementDiscountUse(payload, 1);
    assert.equal(await usedOf("ONCE"), 2);
  });
});

describe("nextOrderNumber", () => {
  it("hands out consecutive numbers, padded and dated", async () => {
    await client.execute("INSERT INTO counters VALUES ('order', 0)");
    assert.equal(await nextOrderNumber(payload, 2026), "VB-2026-0001");
    assert.equal(await nextOrderNumber(payload, 2026), "VB-2026-0002");
    assert.equal(await nextOrderNumber(payload, 2026), "VB-2026-0003");
  });

  it("never reuses a number, which count()+1 would after a deletion", async () => {
    await client.execute("INSERT INTO counters VALUES ('order', 0)");
    const seen = new Set<string>();
    for (let i = 0; i < 50; i += 1) seen.add(await nextOrderNumber(payload, 2026));
    assert.equal(seen.size, 50);
  });

  it("creates the counter row when it is missing rather than crashing", async () => {
    // A fresh database, or one where the row was lost. The self-healing branch
    // was unreachable while the query threw on matching nothing, which meant
    // every checkout failed instead of the first one fixing it.
    const created: Array<Record<string, unknown>> = [];
    const healing = {
      db: { drizzle: drizzle(client) },
      logger: { info: () => {}, warn: () => {}, error: () => {} },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        await client.execute("INSERT INTO counters VALUES ('order', 0)");
        return data;
      },
    } as unknown as Payload;

    assert.equal(await nextOrderNumber(healing, 2026), "VB-2026-0001");
    assert.equal(created.length, 1);
  });

  it("keeps the padding to four digits and grows past it", async () => {
    await client.execute("INSERT INTO counters VALUES ('order', 9998)");
    assert.equal(await nextOrderNumber(payload, 2026), "VB-2026-9999");
    assert.equal(await nextOrderNumber(payload, 2026), "VB-2026-10000");
  });
});
