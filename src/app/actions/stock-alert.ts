"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { getAvailability } from "@/lib/inventory";
import { clientKey, rateLimit } from "@/lib/rate-limit";

import config from "../../payload.config";

export type StockAlertResult = { ok: boolean; message: string; backNow?: boolean };

const schema = z.object({
  productId: z.coerce.number().int().positive(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  /** Honeypot. People never see it; scripts fill everything in. */
  company: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Ask to be told when one sold-out product is back.
 *
 * The request is the consent, and it is consent for one thing: a single email
 * about this product. It does not add anyone to the newsletter, and asking
 * twice for the same bottle does not create a second request.
 */
export async function requestStockAlert(
  _prev: StockAlertResult | null,
  formData: FormData,
): Promise<StockAlertResult> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "stock-alert"), { limit: 6, windowMs: 15 * 60 * 1000 })) {
    return { ok: false, message: "Too many requests in a short time. Try again in a few minutes." };
  }

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    email: formData.get("email") ?? "",
    company: formData.get("company") ?? "",
  });
  if (!parsed.success) {
    const honeypot = parsed.error.issues.some((i) => i.path[0] === "company");
    // A bot gets the same cheerful answer as a person, and nothing is saved.
    if (honeypot) return { ok: true, message: "Dankie. One email when it is back, and nothing else." };
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your email address." };
  }

  const { productId, email } = parsed.data;
  const payload = await getPayload({ config });

  let product;
  try {
    product = await payload.findByID({ collection: "products", id: productId, depth: 3, overrideAccess: true });
  } catch {
    return { ok: false, message: "That product could not be found. Refresh the page and try again." };
  }
  if (product._status !== "published") {
    return { ok: false, message: "That product could not be found. Refresh the page and try again." };
  }

  // Restocked between the page loading and the button being pressed.
  if (!getAvailability(product).soldOut) {
    return { ok: true, backNow: true, message: "Good timing: it is back in stock right now. Refresh the page to order." };
  }

  const existing = await payload.find({
    collection: "stock-alerts",
    where: {
      and: [
        { email: { equals: email } },
        { product: { equals: productId } },
        { status: { equals: "waiting" } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "stock-alerts",
      data: { email, product: productId, status: "waiting", requestedAt: new Date().toISOString() },
      overrideAccess: true,
    });
  }

  return {
    ok: true,
    message: `Dankie. We will send one email to ${email} when ${product.name} is back, and nothing else.`,
  };
}
