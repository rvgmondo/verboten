import { getPayload } from "payload";

import { sendStaffNewOrderAlert, sendStaffReconcileAlert } from "@/lib/emails";
import { getPaymentProvider } from "@/lib/payments";

import config from "../../../../payload.config";

/**
 * PayFast ITN webhook: the only place an order becomes paid.
 *
 * The provider verifies signature, merchant id and PayFast's own
 * server-to-server confirmation; this handler then enforces amount match
 * and idempotency before any state changes. Client-side "success" pages
 * never touch order status.
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const provider = getPaymentProvider();

  const payload = await getPayload({ config });

  const verified = await provider.verifyWebhook(rawBody);
  if (!verified) {
    // Refusing is right: this could be anyone. Refusing in silence was not.
    // The same rejection covers a forged notification and a real payment that
    // failed verification because a passphrase drifted or PayFast could not
    // be reached, and the second one is money quietly going missing. Log
    // enough to tell the two apart, and nothing that could help an attacker.
    payload.logger.error(
      {
        bytes: rawBody.length,
        // The order reference only, never the signature or the payload.
        orderNumber: new URLSearchParams(rawBody).get("m_payment_id") ?? "absent",
      },
      "ITN failed verification and was rejected",
    );
    return new Response("invalid", { status: 400 });
  }

  const order = (
    await payload.find({
      collection: "orders",
      where: { orderNumber: { equals: verified.orderNumber } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0];

  if (!order) {
    payload.logger.warn({ orderNumber: verified.orderNumber }, "ITN for unknown order");
    return new Response("unknown order", { status: 400 });
  }

  // PayFast retries notifications and may deliver concurrently. Only a
  // pending order is processed; anything else is already handled.
  if (order.status !== "pending_payment") {
    // A COMPLETE payment against an order that is not payable (e.g. the buyer
    // retried after an earlier failure cancelled it) means money was taken
    // with nothing on the order to reconcile against. Record it for staff
    // rather than swallowing it silently.
    const nonPayable = order.status === "cancelled" || order.status === "refunded";
    if (verified.status === "complete" && nonPayable) {
      payload.logger.error(
        { order: order.orderNumber, status: order.status, ref: verified.reference },
        "COMPLETE ITN for a non-payable order; flagged for manual reconciliation",
      );
      await payload.update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        data: {
          needsAttention: "paid_after_cancel",
          internalNotes: `${order.internalNotes ? order.internalNotes + "\n" : ""}PAYMENT RECEIVED on a ${order.status} order (PayFast ref ${verified.reference}, ${verified.amountCents} cents). Reconcile manually.`,
          payment: { ...order.payment, reference: verified.reference, raw: verified.raw },
        },
      });
      await sendStaffReconcileAlert(payload, order, {
        headline: `Payment received on a ${order.status} order`,
        detail: `PayFast reports ${(verified.amountCents / 100).toFixed(2)} rand taken against ${order.orderNumber}, which is already ${order.status}. Nothing was shipped and nothing was refunded automatically. Reference ${verified.reference}.`,
      });
    }
    return new Response("ok", { status: 200 });
  }

  if (verified.status === "complete") {
    if (verified.amountCents !== order.totalCents) {
      payload.logger.error(
        { order: order.orderNumber, expected: order.totalCents, got: verified.amountCents },
        "ITN amount mismatch; order left pending for manual review",
      );
      await payload.update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        data: {
          needsAttention: "amount_mismatch",
          internalNotes: `AMOUNT MISMATCH on ITN: gateway reported ${verified.amountCents} cents, order total is ${order.totalCents} cents. Investigate before fulfilling.`,
          payment: { ...order.payment, reference: verified.reference, raw: verified.raw },
        },
      });
      await sendStaffReconcileAlert(payload, order, {
        headline: "Payment does not match the order total",
        detail: `PayFast reports ${(verified.amountCents / 100).toFixed(2)} rand against ${order.orderNumber}, which totals ${(order.totalCents / 100).toFixed(2)} rand. The order has been left pending and nothing has shipped.`,
      });
      return new Response("amount mismatch", { status: 400 });
    }

    // Atomic claim: a single UPDATE ... WHERE status = 'pending_payment'.
    // If a concurrent delivery already flipped it, zero rows match and this
    // request does no side effects, so stock and discounts move exactly once
    // even under simultaneous ITN retries.
    const claim = await payload.update({
      collection: "orders",
      overrideAccess: true,
      where: {
        and: [{ id: { equals: order.id } }, { status: { equals: "pending_payment" } }],
      },
      data: {
        status: "paid",
        payment: { provider: "payfast", reference: verified.reference, raw: verified.raw },
      },
    });
    const updated = claim.docs[0];
    if (!updated) {
      // Another concurrent delivery won the claim; nothing more to do.
      return new Response("ok", { status: 200 });
    }

    // Stock movement is NOT triggered from here. The status write above fires
    // the Orders afterChange hook, which owns that transition so a staff
    // member marking Paid by hand after an EFT gets identical behaviour.
    // Calling it here as well would hand it a doc captured before the hook's
    // own bookkeeping write and defeat the guard that makes it run once.
    //
    // The discount use was claimed when the order was created, so there is
    // nothing to count here either.

    // Re-read so the alert sees anything the hook just wrote, the oversold
    // note in particular.
    const settled =
      (await payload.findByID({ collection: "orders", id: order.id, overrideAccess: true })) ??
      updated;
    await sendStaffNewOrderAlert(payload, settled);
    // The customer's "paid" confirmation email is sent by the Orders
    // afterChange hook, which also covers staff-made status changes.

    return new Response("ok", { status: 200 });
  }

  if (verified.status === "failed") {
    await payload.update({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
      data: {
        status: "cancelled",
        internalNotes: "Payment failed at PayFast.",
        payment: { provider: "payfast", reference: verified.reference, raw: verified.raw },
      },
    });
    // The discount use is handed back by the Orders hook on the transition
    // into cancelled, for the same reason: one owner, one guard.
    return new Response("ok", { status: 200 });
  }

  // PENDING: store the reference, keep waiting for the final notification.
  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    data: {
      payment: { provider: "payfast", reference: verified.reference, raw: verified.raw },
    },
  });
  return new Response("ok", { status: 200 });
}
