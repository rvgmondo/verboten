import { createHash } from "crypto";

import { centsToDecimal } from "@/lib/money";
import type { Order } from "@/payload-types";

import type { PaymentProvider, PaymentRedirect, VerifiedPayment } from "./types";

/**
 * PayFast (payfast.co.za) implementation.
 *
 * Security model, non-negotiable:
 *  - The browser only ever carries a signed redirect. Nothing the client
 *    posts back is trusted.
 *  - Payment truth arrives via the ITN webhook and is verified four ways:
 *    signature, server-to-server validation against PayFast, merchant id,
 *    and amount. Fail any check and the notification is discarded.
 */

const config = () => {
  const sandbox = process.env.PAYFAST_SANDBOX === "true";
  return {
    sandbox,
    host: sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za",
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
  };
};

/** PHP-style urlencode: spaces become +, uppercase hex, PHP's reserved set. */
const phpUrlEncode = (value: string): string =>
  encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E");

const md5 = (value: string): string => createHash("md5").update(value).digest("hex");

/**
 * Signature for outgoing payment forms: non-empty fields in the exact order
 * of PayFast's attribute list, name=urlencode(value) joined by &, with the
 * passphrase appended. Field order matters; do not sort.
 */
const signOutgoing = (fields: Array<[string, string]>, passphrase: string): string => {
  const base = fields
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${phpUrlEncode(v)}`)
    .join("&");
  const withPass = passphrase ? `${base}&passphrase=${phpUrlEncode(passphrase)}` : base;
  return md5(withPass);
};

export const payfastProvider: PaymentProvider = {
  name: "payfast",

  createRedirect(order: Order, urls): PaymentRedirect {
    const cfg = config();
    if (!cfg.merchantId || !cfg.merchantKey) {
      throw new Error("PayFast is not configured (PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY).");
    }
    // A passphrase is required: without it the ITN signature check degrades to
    // an unkeyed MD5 of attacker-controlled data. Set the same value here and
    // in the PayFast dashboard.
    if (!cfg.passphrase) {
      throw new Error("PayFast passphrase is required (set PAYFAST_PASSPHRASE and match it in the PayFast dashboard).");
    }

    const [firstName, ...rest] = (order.customerName ?? "").trim().split(/\s+/);

    // Attribute order is the PayFast documented order; the signature depends on it.
    const fields: Array<[string, string]> = [
      ["merchant_id", cfg.merchantId],
      ["merchant_key", cfg.merchantKey],
      ["return_url", urls.return],
      ["cancel_url", urls.cancel],
      ["notify_url", urls.notify],
      ["name_first", firstName ?? ""],
      ["name_last", rest.join(" ")],
      ["email_address", order.email],
      ["m_payment_id", order.orderNumber],
      ["amount", centsToDecimal(order.totalCents)],
      ["item_name", `Verboten order ${order.orderNumber}`],
    ];

    const signature = signOutgoing(fields, cfg.passphrase);

    return {
      action: `https://${cfg.host}/eng/process`,
      fields: Object.fromEntries([...fields.filter(([, v]) => v !== ""), ["signature", signature]]),
    };
  },

  async verifyWebhook(rawBody: string): Promise<VerifiedPayment | null> {
    const cfg = config();

    // Fail closed: an unset passphrase would make the signature check an
    // unkeyed MD5 that any attacker can satisfy. Never verify without it.
    if (!cfg.passphrase) {
      return null;
    }

    const params = new URLSearchParams(rawBody);
    const posted = Object.fromEntries(params.entries());

    // 1. Signature: rebuild from the raw body with the signature pair removed,
    //    preserving the original order and encoding exactly as received.
    const pairsWithoutSignature = rawBody
      .split("&")
      .filter((pair) => !pair.startsWith("signature="));
    const base = pairsWithoutSignature.join("&");
    const withPass = cfg.passphrase ? `${base}&passphrase=${phpUrlEncode(cfg.passphrase)}` : base;
    if (!posted.signature || md5(withPass) !== posted.signature) {
      return null;
    }

    // 2. The notification must be for this merchant account.
    if (posted.merchant_id !== cfg.merchantId) {
      return null;
    }

    // 3. Server-to-server confirmation: PayFast itself must agree this
    //    notification is genuine. The skip flag exists ONLY for local webhook
    //    testing (PayFast cannot call localhost) and is dead in production.
    const skipRemoteValidate =
      process.env.PAYFAST_SKIP_REMOTE_VALIDATE === "true" &&
      cfg.sandbox &&
      process.env.NODE_ENV !== "production";
    if (skipRemoteValidate) {
      return buildResult(posted);
    }
    try {
      const res = await fetch(`https://${cfg.host}/eng/query/validate`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: rawBody,
      });
      const text = (await res.text()).trim();
      if (text !== "VALID") return null;
    } catch {
      return null;
    }

    return buildResult(posted);
  },
};

const buildResult = (posted: Record<string, string>): VerifiedPayment => ({
  orderNumber: posted.m_payment_id ?? "",
  reference: posted.pf_payment_id ?? "",
  amountCents: Math.round(parseFloat(posted.amount_gross ?? "0") * 100),
  status:
    posted.payment_status === "COMPLETE"
      ? "complete"
      : posted.payment_status === "FAILED"
        ? "failed"
        : "pending",
  raw: posted,
});
