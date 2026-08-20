import { getPayload } from "payload";

import { decrementStockForOrder } from "@/lib/commerce/stock";
import { redeemDiscount } from "@/lib/commerce/discounts";
import { sendStaffNewOrderAlert } from "@/lib/emails";
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

  const verified = await provider.verifyWebhook(rawBody);
  if (!verified) {
    // Unverifiable notification: acknowledge nothing, log nothing sensitive.
    return new Response("invalid", { status: 400 });
  }

  const payload = await getPayload({ config });

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
          internalNotes: `${order.internalNotes ? order.internalNotes + "\n" : ""}PAYMENT RECEIVED on a ${order.status} order (PayFast ref ${verified.reference}, ${verified.amountCents} cents). Reconcile manually.`,
          payment: { ...order.payment, reference: verified.reference, raw: verified.raw },
        },
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
          internalNotes: `AMOUNT MISMATCH on ITN: gateway reported ${verified.amountCents} cents, order total is ${order.totalCents} cents. Investigate before fulfilling.`,
          payment: { ...order.payment, reference: verified.reference, raw: verified.raw },
        },
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

    await decrementStockForOrder(payload, updated);
    if (updated.discountCode) {
      await redeemDiscount(payload, updated.discountCode);
    }
    await sendStaffNewOrderAlert(payload, updated);
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
