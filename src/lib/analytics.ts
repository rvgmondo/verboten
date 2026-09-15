/**
 * Shop events, told to whichever measurement the visitor agreed to.
 *
 * Every call site speaks Google's ecommerce vocabulary once (view_item,
 * add_to_cart, begin_checkout), and this translates for Meta. Neither tool is
 * loaded without consent (see consent.ts and components/analytics), and when
 * a tool is not loaded its call here is simply a no-op, so a call site never
 * has to ask.
 *
 * Purchases are deliberately not sent from the browser. The buyer pays on
 * PayFast and may never come back to the success page, so the sale is reported
 * from the server when PayFast confirms the payment (lib/analytics-server.ts).
 * Reporting it here as well would count it twice.
 *
 * Item ids are product slugs, the same id the product feeds use, because Meta
 * matches catalogue ads on that id and Google joins feed data on it.
 */

import { hasPassedAgeGate } from "@/lib/compliance";
import { readConsent } from "@/lib/consent";

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown };

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    dataLayer?: unknown[];
  }
}

export type ShopItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type ShopEvent = "view_item" | "add_to_cart" | "remove_from_cart" | "begin_checkout" | "add_payment_info";

const META_NAMES: Partial<Record<ShopEvent, string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
};

const rands = (cents: number) => Math.round(cents) / 100;

export const trackShop = (
  event: ShopEvent,
  items: ShopItem[],
  extra: Record<string, string | number> = {},
) => {
  if (typeof window === "undefined" || items.length === 0) return;
  // Asked afresh on every event. A tag that loaded earlier in the visit stays
  // on the page after consent is withdrawn, and Meta's queue in particular
  // would otherwise keep collecting events until it next reached its server.
  const consent = hasPassedAgeGate() ? readConsent() : null;
  // Goods only. Google's value excludes delivery, and Meta's is compared
  // against it, so both get the same number.
  const valueCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  if (consent?.analytics) window.gtag?.("event", event, {
    currency: "ZAR",
    value: rands(valueCents),
    items: items.map((i) => ({
      item_id: i.slug,
      item_name: i.name,
      item_brand: "Verboten",
      price: rands(i.priceCents),
      quantity: i.quantity,
    })),
    ...extra,
  });

  const metaName = META_NAMES[event];
  if (metaName && consent?.marketing) {
    window.fbq?.("track", metaName, {
      currency: "ZAR",
      value: rands(valueCents),
      content_type: "product",
      content_ids: items.map((i) => i.slug),
      contents: items.map((i) => ({ id: i.slug, quantity: i.quantity })),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
    });
  }
};

/* ------------------------------------------------------------------ */
/* Where a visit came from, kept for the order it turns into.          */
/* ------------------------------------------------------------------ */

export const ATTRIBUTION_KEY = "vb_attribution";

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  /** The referring site's host only, never the full address. */
  referrer?: string;
  landingPath?: string;
  gclid?: string;
  fbclid?: string;
  /** When the fbclid arrived, for Meta's fbc value. */
  fbclidAt?: number;
};

/**
 * First touch within the browser session. Session storage, not a cookie: it
 * never leaves this site, is gone when the tab closes, and lets an order say
 * "came from the Instagram ad" without following anyone anywhere.
 */
export const captureAttribution = () => {
  try {
    if (sessionStorage.getItem(ATTRIBUTION_KEY)) return;
    const url = new URL(window.location.href);
    const q = url.searchParams;
    let referrer: string | undefined;
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.host !== url.host) referrer = ref.host.replace(/^www\./, "");
    } catch {
      referrer = undefined;
    }
    const clip = (v: string | null) => (v ? v.slice(0, 120) : undefined);
    const data: Attribution = {
      source: clip(q.get("utm_source")),
      medium: clip(q.get("utm_medium")),
      campaign: clip(q.get("utm_campaign")),
      referrer,
      landingPath: url.pathname.slice(0, 200),
      gclid: clip(q.get("gclid")),
      fbclid: q.get("fbclid")?.slice(0, 500) || undefined,
      fbclidAt: q.get("fbclid") ? Date.now() : undefined,
    };
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked: the order simply carries no source.
  }
};

export const readAttribution = (): Attribution => {
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
};
