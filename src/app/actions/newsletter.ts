"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { sendNewsletterConfirmation } from "@/lib/emails";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/seo";

import config from "../../payload.config";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  /** Honeypot: humans never see or fill this field. */
  company: z.string().max(0).optional().or(z.literal("")),
  source: z.string().max(40).optional(),
});

export type NewsletterResult = { ok: boolean; message: string };

/**
 * Stores a pending subscriber (double-opt-in ready: the confirm token is
 * generated here; the confirmation email ships with the email phase).
 * Honeypot submissions get a fake success so bots learn nothing.
 */
export async function subscribeToNewsletter(
  _prev: NewsletterResult | null,
  formData: FormData,
): Promise<NewsletterResult> {
  if (!rateLimit(clientKey(await headers(), "newsletter"), { limit: 6, windowMs: 10 * 60 * 1000 })) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    source: formData.get("source") ?? "footer",
  });

  if (!parsed.success) {
    const honeypotTripped = parsed.error.issues.some((i) => i.path[0] === "company");
    if (honeypotTripped) return { ok: true, message: "Dankie. Check your email: if that address is not on the list yet, a link to confirm is on its way." };
    return { ok: false, message: "Enter a valid email address." };
  }

  const payload = await getPayload({ config });
  const { email, source } = parsed.data;

  const existing = await payload.find({
    collection: "subscribers",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  const found = existing.docs[0];
  if (found) {
    // Someone who lost their confirmation email, or who unsubscribed and has
    // changed their mind, used to get the success message and nothing else,
    // with no way back onto the list. Both get a fresh confirmation link now.
    // It is still double opt-in, so typing someone else's address only ever
    // sends them a link they can ignore, and the reply is identical in every
    // case so nobody learns whether an address is on the list.
    if (found.status === "pending" || found.status === "unsubscribed") {
      const confirmToken = randomBytes(24).toString("hex");
      await payload.update({
        collection: "subscribers",
        id: found.id,
        data: {
          status: "pending",
          confirmToken,
          consentAt: new Date().toISOString(),
          // Older rows may predate unsubscribe tokens; every list email needs one.
          ...(found.unsubscribeToken ? {} : { unsubscribeToken: randomBytes(24).toString("hex") }),
        },
        overrideAccess: true,
      });
      await sendNewsletterConfirmation(payload, { to: email, token: confirmToken, siteUrl: SITE_URL });
    }
    return { ok: true, message: "Dankie. Check your email: if that address is not on the list yet, a link to confirm is on its way." };
  }

  const confirmToken = randomBytes(24).toString("hex");
  // Minted once and kept for the life of the subscription, so every
  // email we ever send this address can carry a working opt out.
  const unsubscribeToken = randomBytes(24).toString("hex");

  await payload.create({
    collection: "subscribers",
    data: {
      email,
      status: "pending",
      source,
      consentAt: new Date().toISOString(),
      confirmToken,
      unsubscribeToken,
    },
    overrideAccess: true,
  });

  // Double opt-in: nobody is mailed until they click the link. Under POPIA
  // that consent trail is the difference between a list and a liability.
  await sendNewsletterConfirmation(payload, { to: email, token: confirmToken, siteUrl: SITE_URL });

  return { ok: true, message: "Dankie. Check your email: if that address is not on the list yet, a link to confirm is on its way." };
}
