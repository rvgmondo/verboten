import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import {
  gaPurchaseBody,
  hashForMeta,
  metaPurchaseBody,
  normalisePhone,
  orderLines,
} from "@/lib/analytics-server";
import { decodeConsent, encodeConsent } from "@/lib/consent";
import type { Order } from "@/payload-types";

/**
 * The sale reports and the consent cookie.
 *
 * A report that gets the value wrong quietly misleads every decision made
 * from the numbers, and a consent flag read wrongly sends data about someone
 * who said no. Both are cheap to pin down here and expensive to find later.
 */

const order = (over: Partial<Order> = {}): Order =>
  ({
    id: 7,
    orderNumber: "VB-2026-0042",
    status: "paid",
    email: " Buyer@Example.com ",
    customerName: "Thandi van der Merwe",
    phone: "082 123 4567",
    items: [
      { product: { slug: "verboten-premium-brandy" }, nameSnapshot: "Verboten Premium Brandy", unitPriceCents: 45000, quantity: 2 },
      { product: 3, nameSnapshot: "Verboten Brandy & Cola", unitPriceCents: 4500, quantity: 1 },
    ],
    subtotalCents: 94500,
    shippingCents: 15000,
    discountCents: 5000,
    discountCode: "WELCOME",
    totalCents: 104500,
    currency: "ZAR",
    shippingAddress: { line1: "1 Main", city: "Pretoria East", province: "Gauteng", postalCode: "0081", country: "ZA" },
    attribution: {
      analyticsConsent: true,
      marketingConsent: true,
      gaClientId: "123.456",
      gaSessionId: "1726400000",
      fbp: "fb.1.1.2",
      clientIp: "196.1.1.1",
      userAgent: "Mozilla/5.0",
    },
    updatedAt: "",
    createdAt: "",
    ...over,
  }) as unknown as Order;

describe("Google purchase report", () => {
  it("counts the goods after discount, with delivery kept apart", () => {
    const o = order();
    const body = gaPurchaseBody(o, orderLines(o), "purchase");
    const params = body.events[0].params as Record<string, unknown>;
    assert.equal(body.client_id, "123.456");
    assert.equal(params.transaction_id, "VB-2026-0042");
    assert.equal(params.value, 895); // R945 of goods less R50
    assert.equal(params.shipping, 150);
    assert.equal(params.coupon, "WELCOME");
    assert.equal(params.session_id, "1726400000");
    assert.equal(params.currency, "ZAR");
  });

  it("uses slugs as item ids, falling back to the stored id when unpopulated", () => {
    const o = order();
    const items = (gaPurchaseBody(o, orderLines(o), "purchase").events[0].params as { items: Array<{ item_id: string }> }).items;
    assert.deepEqual(items.map((i) => i.item_id), ["verboten-premium-brandy", "3"]);
  });

  it("still sends a refund after the visitor ids have been deleted", () => {
    // Identifiers are cleared once the sale is reported, so a refund weeks
    // later arrives with none. It must still carry a client id and the order.
    const o = order({ attribution: { analyticsConsent: true } } as Partial<Order>);
    const body = gaPurchaseBody(o, orderLines(o), "refund");
    assert.equal(body.client_id, "0.7");
    assert.equal((body.events[0].params as Record<string, unknown>).transaction_id, "VB-2026-0042");
  });

  it("sends a refund without delivery or coupon", () => {
    const o = order();
    const body = gaPurchaseBody(o, orderLines(o), "refund");
    const params = body.events[0].params as Record<string, unknown>;
    assert.equal(body.events[0].name, "refund");
    assert.equal(params.shipping, undefined);
    assert.equal(params.coupon, undefined);
  });
});

describe("Meta purchase report", () => {
  it("hashes personal fields the way Meta specifies", () => {
    const expected = createHash("sha256").update("buyer@example.com").digest("hex");
    assert.equal(hashForMeta(" Buyer@Example.com "), expected);
    assert.equal(hashForMeta(""), undefined);
  });

  it("puts South African numbers in international form before hashing", () => {
    assert.equal(normalisePhone("082 123 4567"), "27821234567");
    assert.equal(normalisePhone("+27 82 123 4567"), "27821234567");
    assert.equal(normalisePhone(""), undefined);
  });

  it("never hashes the network identifiers, and dedupes on the order number", () => {
    const o = order();
    const event = metaPurchaseBody(o, orderLines(o), 1726400000).data[0];
    assert.equal(event.event_id, "VB-2026-0042");
    assert.equal(event.user_data.client_ip_address, "196.1.1.1");
    assert.equal(event.user_data.fbp, "fb.1.1.2");
    assert.equal(event.user_data.fn?.[0], hashForMeta("Thandi"));
    assert.equal(event.user_data.ln?.[0], hashForMeta("van der Merwe"));
    assert.equal(event.custom_data.value, 895);
    assert.equal(event.custom_data.num_items, 3);
  });
});

describe("consent cookie", () => {
  it("round trips every combination", () => {
    for (const analytics of [true, false]) {
      for (const marketing of [true, false]) {
        assert.deepEqual(decodeConsent(encodeConsent({ analytics, marketing })), { analytics, marketing });
      }
    }
  });

  it("treats anything unexpected as no choice made, never as a yes", () => {
    assert.equal(decodeConsent(""), null);
    assert.equal(decodeConsent("a1"), null);
    assert.equal(decodeConsent("a1m1; extra"), null);
    assert.equal(decodeConsent(undefined), null);
  });
});
