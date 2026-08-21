import type { Payload } from "payload";

import { formatZAR } from "@/lib/money";
import type { Order } from "@/payload-types";

/**
 * Transactional email. Plain text on purpose: it delivers everywhere, reads
 * fast, and matches the voice. Sending failures are logged, never thrown;
 * an email problem must not break an order.
 */

const orderLines = (order: Order): string =>
  order.items
    .map((i) => `  ${i.quantity} x ${i.nameSnapshot}  ${formatZAR(i.unitPriceCents * i.quantity)}`)
    .join("\n");

const totals = (order: Order): string => {
  const lines = [`  Subtotal  ${formatZAR(order.subtotalCents)}`];
  if (order.discountCents > 0) {
    lines.push(`  Discount  -${formatZAR(order.discountCents)}${order.discountCode ? ` (${order.discountCode})` : ""}`);
  }
  lines.push(
    `  Shipping  ${order.shippingCents === 0 ? "Free" : formatZAR(order.shippingCents)}`,
    `  Total     ${formatZAR(order.totalCents)}`,
  );
  return lines.join("\n");
};

const signoff = "Verboten Spirits, Pretoria\nDrink responsibly. Not for sale to persons under 18.";

const STATUS_EMAILS: Partial<
  Record<Order["status"], (o: Order, dispatch: string) => { subject: string; body: string }>
> = {
  paid: (o, dispatch) => ({
    subject: `Order ${o.orderNumber} confirmed`,
    body: `Payment received. ${o.orderNumber} is yours.\n\n${orderLines(o)}\n\n${totals(o)}\n\n${dispatch}, and you get a tracking number the moment it ships.\n\n${signoff}`,
  }),
  packed: (o) => ({
    subject: `Order ${o.orderNumber} is packed`,
    body: `${o.orderNumber} is boxed and waiting for the courier.\n\nYou will get a tracking number when it is collected.\n\n${signoff}`,
  }),
  shipped: (o) => ({
    subject: `Order ${o.orderNumber} is on its way`,
    body: `${o.orderNumber} has shipped.${o.trackingNumber ? `\n\nTracking number: ${o.trackingNumber}` : ""}\n\nDelivery takes 3 to 7 business days. Someone 18 or older must receive it; the courier may ask for ID.\n\n${signoff}`,
  }),
  delivered: (o) => ({
    subject: `Order ${o.orderNumber} delivered`,
    body: `${o.orderNumber} has been delivered. Pour it properly.\n\nIf anything is wrong with the delivery, reply within 48 hours and we sort it out.\n\n${signoff}`,
  }),
  cancelled: (o) => ({
    subject: `Order ${o.orderNumber} cancelled`,
    body: `${o.orderNumber} has been cancelled. If you paid, the refund is on its way to the same payment method.\n\nQuestions: reply to this email.\n\n${signoff}`,
  }),
  refunded: (o) => ({
    subject: `Order ${o.orderNumber} refunded`,
    body: `The refund for ${o.orderNumber} has been processed to your original payment method. Allow a few business days for it to reflect.\n\n${signoff}`,
  }),
};

export const sendOrderStatusEmail = async (payload: Payload, order: Order): Promise<void> => {
  const template = STATUS_EMAILS[order.status];
  if (!template) return;
  // The dispatch promise is set once in Site Settings; every surface reads it
  // so the email can never contradict the site.
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const dispatch = settings.dispatchTimeText || "Ships within 1 to 2 weeks";
  const { subject, body } = template(order, dispatch);
  try {
    await payload.sendEmail({ to: order.email, subject, text: body });
  } catch (err) {
    payload.logger.error({ err, order: order.orderNumber }, "Order status email failed");
  }
};

export const sendStaffNewOrderAlert = async (payload: Payload, order: Order): Promise<void> => {
  const to = process.env.ADMIN_NOTIFICATIONS_EMAIL;
  if (!to) return;
  try {
    await payload.sendEmail({
      to,
      subject: `New paid order ${order.orderNumber} (${formatZAR(order.totalCents)})`,
      text: `${order.customerName} <${order.email}>\n\n${orderLines(order)}\n\n${totals(order)}\n\nShip to:\n  ${[order.shippingAddress.line1, order.shippingAddress.line2, order.shippingAddress.suburb, order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join("\n  ")}\n\nOpen the admin to process it.`,
    });
  } catch (err) {
    payload.logger.error({ err, order: order.orderNumber }, "Staff order alert failed");
  }
};
