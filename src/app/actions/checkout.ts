"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { nextOrderNumber } from "@/lib/commerce/atomic";
import { checkDiscount } from "@/lib/commerce/discounts";
import { findStockProblems } from "@/lib/commerce/stock";
import { getPaymentProvider } from "@/lib/payments";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { Product } from "@/payload-types";

import config from "../../payload.config";

/**
 * Checkout: the security boundary of the shop. The client's cart is treated
 * as a wish list of product ids and quantities; every price, the discount,
 * shipping and the total are recomputed here from the database. Orders are
 * created server-side only, already numbered, and handed to the payment
 * provider for a signed redirect.
 */

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

const itemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
});

const schema = z.object({
  items: z.array(itemSchema).min(1, "Your cart is empty."),
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth."),
  line1: z.string().trim().min(3, "Enter a street address.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  suburb: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city.").max(120),
  province: z.enum(SA_PROVINCES),
  postalCode: z.string().trim().min(4, "Enter a postal code.").max(10),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  customerNote: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Honeypot: humans never see or fill this field. */
  fax: z.string().max(0).optional().or(z.literal("")),
});

export type CheckoutResult =
  | { ok: true; orderNumber: string; redirect: { action: string; fields: Record<string, string> } }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const yearsOld = (isoDate: string): number => {
  const dob = new Date(`${isoDate}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const anniversary = new Date(dob);
  anniversary.setFullYear(now.getFullYear());
  if (now < anniversary) age -= 1;
  return age;
};

export async function createCheckout(
  _prev: CheckoutResult | null,
  formData: FormData,
): Promise<CheckoutResult> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "checkout"), { limit: 10, windowMs: 10 * 60 * 1000 })) {
    return { ok: false, message: "Too many attempts. Wait a few minutes and try again." };
  }

  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { ok: false, message: "Your cart could not be read. Refresh and try again." };
  }

  const parsed = schema.safeParse({
    items: itemsRaw,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    dateOfBirth: formData.get("dateOfBirth"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? "",
    suburb: formData.get("suburb") ?? "",
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode"),
    discountCode: formData.get("discountCode") ?? "",
    customerNote: formData.get("customerNote") ?? "",
    fax: formData.get("fax") ?? "",
  });

  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "fax")) {
      return { ok: false, message: "Something went wrong. Refresh and try again." };
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  // Age: the checkout-level compliance layer (the age gate is the first).
  if (yearsOld(input.dateOfBirth) < 18) {
    return {
      ok: false,
      message: "We cannot sell alcohol to anyone under 18.",
      fieldErrors: { dateOfBirth: "You must be 18 or older to order." },
    };
  }

  const payload = await getPayload({ config });

  // Authoritative product state, straight from the database.
  const products = await payload.find({
    collection: "products",
    where: {
      and: [
        { id: { in: input.items.map((i) => i.productId) } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 2,
    limit: 50,
    overrideAccess: true,
  });
  const byId = new Map<number, Product>(products.docs.map((p) => [p.id, p]));

  const requested: Array<{ product: Product; quantity: number }> = [];
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { ok: false, message: "An item in your cart is no longer available. Refresh and try again." };
    }
    requested.push({ product, quantity: item.quantity });
  }

  const stockProblems = findStockProblems(requested);
  if (stockProblems.length > 0) {
    return { ok: false, message: stockProblems.join(" ") };
  }

  // Money: recomputed here, never taken from the client.
  const subtotalCents = requested.reduce(
    (sum, r) => sum + r.product.priceCents * r.quantity,
    0,
  );

  let discountCents = 0;
  let discountCode: string | undefined;
  if (input.discountCode) {
    const check = await checkDiscount(payload, input.discountCode, subtotalCents);
    if (!check.ok) {
      return { ok: false, message: check.reason, fieldErrors: { discountCode: check.reason } };
    }
    discountCents = check.discountCents;
    discountCode = check.code.code;
  }

  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const freeThreshold = settings.shipping?.freeThresholdCents ?? 0;
  const shippingCents =
    freeThreshold > 0 && subtotalCents - discountCents >= freeThreshold
      ? 0
      : (settings.shipping?.flatRateCents ?? 0);

  const totalCents = subtotalCents - discountCents + shippingCents;

  // Sequence-backed, collision-free even under concurrent checkouts or after
  // an admin deletes an order (count()+1 would reuse a live number).
  const orderNumber = await nextOrderNumber(payload, new Date().getFullYear());

  // Signed-in customers get the order on their account; guests stay guests.
  const { user } = await payload.auth({ headers: hdrs });
  const customerId = user && user.collection === "customers" ? user.id : undefined;

  const order = await payload.create({
    collection: "orders",
    overrideAccess: true,
    data: {
      orderNumber,
      status: "pending_payment",
      customer: customerId,
      email: input.email,
      customerName: input.name,
      phone: input.phone || undefined,
      items: requested.map((r) => ({
        product: r.product.id,
        nameSnapshot: r.product.name,
        unitPriceCents: r.product.priceCents,
        quantity: r.quantity,
      })),
      subtotalCents,
      shippingCents,
      discountCents,
      discountCode,
      totalCents,
      currency: "ZAR",
      shippingAddress: {
        line1: input.line1,
        line2: input.line2 || undefined,
        suburb: input.suburb || undefined,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        country: "ZA",
      },
      ageVerification: {
        dateOfBirth: input.dateOfBirth,
        confirmedAt: new Date().toISOString(),
      },
      customerNote: input.customerNote || undefined,
      payment: { provider: "payfast" },
    },
  });

  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
  const provider = getPaymentProvider();
  const redirect = provider.createRedirect(order, {
    return: `${base}/checkout/success?order=${orderNumber}`,
    cancel: `${base}/checkout/cancelled?order=${orderNumber}`,
    notify: `${base}/api/payfast/notify`,
  });

  return { ok: true, orderNumber, redirect };
}

/** Preview a discount code against a subtotal (for the Apply button). */
export async function previewDiscount(
  code: string,
  subtotalCents: number,
): Promise<{ ok: boolean; message: string; discountCents: number }> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "discount"), { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return { ok: false, message: "Too many attempts. Wait a few minutes.", discountCents: 0 };
  }
  const payload = await getPayload({ config });
  const check = await checkDiscount(payload, code, subtotalCents);
  if (!check.ok) return { ok: false, message: check.reason, discountCents: 0 };
  return { ok: true, message: "Code applied.", discountCents: check.discountCents };
}
