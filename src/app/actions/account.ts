"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { sendAccountVerification } from "@/lib/emails";
import { clientKey, rateLimit } from "@/lib/rate-limit";

import config from "../../payload.config";

/**
 * Creating a shopper account, in a way that can undo itself.
 *
 * Registering used to POST straight at /api/customers, which asks Payload to
 * create the row and send the confirmation email in one call. SQLite here runs
 * without transactions (see payload.config.ts for why: the atomic commerce
 * statements need the write lock), so when the mail relay was down, and a
 * shared cPanel relay hitting its hourly cap is routine, the row was already
 * committed when the send threw. The request returned a 500, the shopper was
 * told the address might already be in use, and on retry that became true:
 * an account existed, no email had ever been sent, so there was no link to
 * confirm with, and only someone with admin access could clear it. One bad
 * minute on the mail server locked an address out of the shop permanently.
 *
 * So the two steps are separated. Payload creates the row with its email
 * suppressed, we send the confirmation ourselves, and if that fails we delete
 * the row we just made and say so plainly.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type RegisterResult = { ok: boolean; message: string };

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production" ? "https://verboten.co.za" : "http://localhost:3001");

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "register"), { limit: 5, windowMs: 15 * 60 * 1000 })) {
    return { ok: false, message: "Too many attempts. Wait a few minutes and try again." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { name, email, password } = parsed.data;

  const payload = await getPayload({ config });

  let created;
  try {
    created = await payload.create({
      collection: "customers",
      data: { email, password, name },
      overrideAccess: true,
      // We send it ourselves, so a failure is ours to handle.
      disableVerificationEmail: true,
    });
  } catch (err) {
    const message = String((err as Error)?.message ?? "");
    if (/already|duplicate|unique/i.test(message)) {
      // Deliberately the same answer whether or not the address is registered,
      // so this form cannot be used to find out who shops here.
      return {
        ok: true,
        message:
          "Check your email. If that address is new here, a confirmation link is on its way.",
      };
    }
    payload.logger.error({ err, email }, "Customer create failed");
    return {
      ok: false,
      message: "That account could not be created just then. Nothing was saved. Try again shortly.",
    };
  }

  // The token Payload generated during create, which is a hidden field.
  const doc = await payload.findByID({
    collection: "customers",
    id: created.id,
    overrideAccess: true,
    showHiddenFields: true,
  });
  const token = (doc as { _verificationToken?: string | null })._verificationToken;

  try {
    if (!token) throw new Error("No verification token was generated");
    await sendAccountVerification(payload, {
      to: email,
      link: `${siteUrl()}/account/verify?token=${encodeURIComponent(token)}`,
    });
  } catch (err) {
    // The row exists and the confirmation does not. Undo it, or this address
    // can never be registered again.
    payload.logger.error({ err, email }, "Verification email failed; rolling the signup back");
    try {
      await payload.delete({ collection: "customers", id: created.id, overrideAccess: true });
    } catch (delErr) {
      payload.logger.error(
        { err: delErr, email, id: created.id },
        "Could not remove the account after a failed verification email. Delete it by hand.",
      );
    }
    return {
      ok: false,
      message:
        "We could not send your confirmation email just then, so nothing was saved. Try again in a few minutes.",
    };
  }

  return {
    ok: true,
    message:
      "Check your email. There is a link waiting that opens your account, and your orders appear the moment you use it.",
  };
}

/**
 * Ask for a password reset link.
 *
 * Through a server action rather than the REST endpoint, for two reasons. It
 * was the one public form on the site with no rate limit at all, and it sends
 * an email on every hit, so anyone could use it to post mail at an address
 * repeatedly. And the client fired it without looking at the answer, so a mail
 * outage still told the customer a link was on its way, leaving them waiting
 * for something that was never sent.
 *
 * The reply still does not say whether the address has an account: that would
 * turn this form into a way of finding out who shops here. It only separates
 * "sent, or there was nothing to send to" from "our end failed".
 */
export async function requestPasswordReset(email: string): Promise<RegisterResult> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "reset"), { limit: 3, windowMs: 15 * 60 * 1000 })) {
    return { ok: false, message: "Too many requests. Wait a few minutes and try again." };
  }

  const parsed = z.string().trim().toLowerCase().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const payload = await getPayload({ config });
  try {
    await payload.forgotPassword({
      collection: "customers",
      data: { email: parsed.data },
      disableEmail: false,
    });
  } catch (err) {
    // Payload stays quiet about an address it does not know, so anything
    // thrown here is our problem, not the customer's.
    payload.logger.error({ err, email: parsed.data }, "Password reset email failed");
    return {
      ok: false,
      message: "We could not send that email just then. Try again in a few minutes.",
    };
  }

  return {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
}
