import { createHash } from "node:crypto";

import type { Payload } from "payload";

import type { Order, Product } from "@/payload-types";

/**
 * Reporting a sale to Google Analytics and Meta, from the server, once.
 *
 * The buyer pays on PayFast and may never return to the success page, so a
 * purchase event fired in the browser misses sales and credits nobody for
 * them. The dependable moment is the one the shop already trusts for money:
 * the order turning paid, whether PayFast's notification did it or a person
 * in the admin after an EFT. The Orders hook calls this at that moment.
 *
 * Nothing is sent for a buyer who did not allow it at checkout. Google gets
 * the sale only with analytics consent, Meta only with marketing consent, and
 * either one only when its IDs and secret are configured. Every failure is
 * logged and swallowed: a reporting problem must never touch an order.
 *
 *   Google: Measurement Protocol, needs the GA4 measurement ID (Site Settings)
 *           and GA_API_SECRET (environment).
 *   Meta:   Conversions API, needs the Pixel ID (Site Settings) and
 *           META_CAPI_TOKEN (environment).
 */

const SITE = "https://verboten.co.za";
const META_GRAPH_VERSION = "v25.0";
const TIMEOUT_MS = 5000;

const rands = (cents: number) => Math.round(cents) / 100;

type LineItem = { slug: string; name: string; unitPriceCents: number; quantity: number };

/** The order's lines with the product slug each one was sold as. */
export const orderLines = (order: Order): LineItem[] =>
  order.items.map((i) => ({
    slug:
      typeof i.product === "object" && i.product
        ? (i.product as Product).slug
        : String(i.product),
    name: i.nameSnapshot,
    unitPriceCents: i.unitPriceCents,
    quantity: i.quantity,
  }));

/**
 * Google's purchase event. Value is the goods after discount, without
 * delivery, which goes in its own field: that is how Google defines it, and it
 * keeps revenue in reports equal to what the products earned.
 */
export const gaPurchaseBody = (order: Order, lines: LineItem[], kind: "purchase" | "refund") => {
  const a = order.attribution;
  const params: Record<string, unknown> = {
    transaction_id: order.orderNumber,
    currency: "ZAR",
    value: rands(order.subtotalCents - order.discountCents),
    items: lines.map((l) => ({
      item_id: l.slug,
      item_name: l.name,
      item_brand: "Verboten",
      price: rands(l.unitPriceCents),
      quantity: l.quantity,
    })),
    // Without a session id Google cannot join the sale to the visit, and the
    // traffic source shows as "(not set)".
    ...(a?.gaSessionId ? { session_id: a.gaSessionId } : {}),
    engagement_time_msec: 1,
  };
  if (kind === "purchase") {
    params.shipping = rands(order.shippingCents);
    if (order.discountCode) params.coupon = order.discountCode;
  }
  return {
    // Identifiers are deleted once the sale is reported, so a later refund
    // has no visitor id left. Google matches a refund on transaction_id, and
    // accepts any stable client id for it, so the order's own number stands in.
    client_id: a?.gaClientId || `0.${order.id}`,
    events: [{ name: kind, params }],
  };
};

/** Meta wants personal fields trimmed, lower-cased and SHA-256 hashed. */
export const hashForMeta = (value: string | null | undefined) => {
  const v = (value ?? "").trim().toLowerCase();
  return v ? createHash("sha256").update(v).digest("hex") : undefined;
};

/** South African numbers to Meta's format: digits with the country code, no leading 0. */
export const normalisePhone = (phone: string | null | undefined) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits.length === 9 ? `27${digits}` : digits;
};

export const metaPurchaseBody = (order: Order, lines: LineItem[], eventTime: number) => {
  const a = order.attribution;
  const [first, ...rest] = order.customerName.trim().split(/\s+/);
  const last = rest.join(" ");
  const addr = order.shippingAddress;
  const hashed = (v: string | null | undefined) => {
    const h = hashForMeta(v);
    return h ? [h] : undefined;
  };
  const phone = normalisePhone(order.phone);

  return {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        // The order number is also what the browser would send as eventID,
        // so if a browser Purchase is ever added, Meta keeps only one.
        event_id: order.orderNumber,
        action_source: "website",
        event_source_url: `${SITE}/checkout`,
        user_data: {
          em: hashed(order.email),
          ph: phone ? [hashForMeta(phone)] : undefined,
          fn: hashed(first),
          ln: hashed(last),
          ct: hashed(addr?.city?.replace(/\s+/g, "")),
          zp: hashed(addr?.postalCode?.replace(/\s+/g, "")),
          country: hashed("za"),
          external_id: hashed(order.email),
          client_ip_address: a?.clientIp || undefined,
          client_user_agent: a?.userAgent || undefined,
          fbp: a?.fbp || undefined,
          fbc: a?.fbc || undefined,
        },
        custom_data: {
          currency: "ZAR",
          value: rands(order.subtotalCents - order.discountCents),
          content_type: "product",
          content_ids: lines.map((l) => l.slug),
          contents: lines.map((l) => ({ id: l.slug, quantity: l.quantity, item_price: rands(l.unitPriceCents) })),
          num_items: lines.reduce((n, l) => n + l.quantity, 0),
          order_id: order.orderNumber,
        },
      },
    ],
  };
};

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text.slice(0, 300)}`);
  }
};

/**
 * Clears the tracking identifiers saved on an order once they have done their
 * one job (POPIA s14). The campaign source and the consent flags stay: they
 * identify no one, and the consent flag is what allows a later refund report.
 */
const forgetIdentifiers = async (payload: Payload, id: number) => {
  try {
    await payload.update({
      collection: "orders",
      id,
      overrideAccess: true,
      context: { skipLifecycle: true },
      data: {
        attribution: {
          clientIp: null,
          userAgent: null,
          fbp: null,
          fbc: null,
          fbclid: null,
          gclid: null,
          gaClientId: null,
          gaSessionId: null,
        },
      },
    });
  } catch (err) {
    payload.logger.error({ err, order: id }, "Could not clear tracking identifiers");
  }
};

/**
 * Report a paid order, or a refund of one, once. Called from the Orders hook.
 */
export const reportOrderToAnalytics = async (
  payload: Payload,
  order: Order,
  kind: "purchase" | "refund",
): Promise<void> => {
  try {
    const already = order.analyticsReported ?? "none";
    if (kind === "purchase" && already !== "none") return;
    // A refund is only worth reporting for a sale that was reported. Either
    // way, a reversed order has no further use for its tracking identifiers.
    if (kind === "refund" && already !== "purchase") {
      await forgetIdentifiers(payload, order.id);
      return;
    }

    // The hook's doc may not carry the staff-only group, so read it directly.
    const full = await payload.findByID({
      collection: "orders",
      id: order.id,
      depth: 1,
      overrideAccess: true,
    });
    const a = full.attribution;
    const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
    const gaId = settings.measurement?.gaMeasurementId;
    const pixelId = settings.measurement?.metaPixelId;
    const gaSecret = process.env.GA_API_SECRET;
    const metaToken = process.env.META_CAPI_TOKEN;
    const lines = orderLines(full);

    let sent = false;

    // A purchase needs the visitor's id to credit the visit; a refund only
    // needs the transaction, since the ids are gone by then.
    if (gaId && gaSecret && a?.analyticsConsent && (kind === "refund" || a.gaClientId)) {
      try {
        const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(gaId)}&api_secret=${encodeURIComponent(gaSecret)}`;
        await post(url, gaPurchaseBody(full, lines, kind));
        sent = true;
        payload.logger.info({ order: full.orderNumber, kind }, "Sale reported to Google Analytics");
      } catch (err) {
        payload.logger.error({ err, order: full.orderNumber, kind }, "Google Analytics report failed");
      }
    }

    // Meta has no refund event worth sending; a purchase is reported once.
    if (kind === "purchase" && pixelId && metaToken && a?.marketingConsent) {
      try {
        const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(metaToken)}`;
        await post(url, metaPurchaseBody(full, lines, Math.floor(Date.now() / 1000)));
        sent = true;
        payload.logger.info({ order: full.orderNumber }, "Sale reported to Meta");
      } catch (err) {
        payload.logger.error({ err, order: full.orderNumber }, "Meta Conversions API report failed");
      }
    }

    if (sent) {
      await payload.update({
        collection: "orders",
        id: full.id,
        overrideAccess: true,
        context: { skipLifecycle: true },
        data: { analyticsReported: kind },
      });
    }
    // The identifiers existed for this report and nothing else.
    await forgetIdentifiers(payload, full.id);
  } catch (err) {
    payload.logger.error({ err, order: order.orderNumber }, "Analytics reporting skipped after an error");
  }
};
