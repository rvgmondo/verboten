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
  // Settings first so staff can redirect alerts without a deploy; the env var
  // stays as a fallback for environments with no settings row yet.
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const to =
    settings.contact?.notificationsEmail ||
    process.env.ADMIN_NOTIFICATIONS_EMAIL ||
    settings.contact?.ordersEmail;
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

/* ------------------------------------------------------------------ */
/* Acknowledgements: what the person on the other end receives.        */
/*                                                                     */
/* Every form on this site used to notify staff and tell the sender    */
/* nothing. Silence after a form reads as a broken website, so each    */
/* submission now answers back in the house voice.                     */
/* ------------------------------------------------------------------ */

const ACK_SIGNOFF = (settings: {
  contact?: { email?: string | null; phone?: string | null } | null;
}) =>
  [
    "Verboten Spirits",
    "Silverton, Pretoria",
    settings.contact?.email ?? "info@verboten.co.za",
    settings.contact?.phone ?? "",
    "",
    "Drink responsibly. Not for sale to persons under 18.",
  ]
    .filter(Boolean)
    .join("\n");

/** Confirms a contact or bar booking enquiry to the person who sent it. */
export const sendEnquiryAcknowledgement = async (
  payload: Payload,
  { topic, name, to }: { topic: "general" | "booking" | "stockist"; name: string; to: string },
): Promise<void> => {
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const hours = settings.contact?.supportHours ?? "Monday to Friday, 9am to 5pm SAST";

  const body =
    topic === "booking"
      ? [
          `${name},`,
          "",
          "We have your booking enquiry. Someone reads every one of these, and we come back with a quote within one business day.",
          "",
          "If the date is tight, phone or WhatsApp us and we will move faster.",
          "",
          `We are here ${hours}.`,
          "",
          ACK_SIGNOFF(settings),
        ].join("\n")
      : [
          `${name},`,
          "",
          "Thank you, we have your message. We reply within one business day, and it is a person replying, not a system.",
          "",
          `We are here ${hours}.`,
          "",
          ACK_SIGNOFF(settings),
        ].join("\n");

  try {
    await payload.sendEmail({
      to,
      subject:
        topic === "booking"
          ? "We have your booking enquiry"
          : "We have your message",
      text: body,
    });
  } catch (err) {
    // The enquiry is stored either way; a mail failure must not lose it.
    payload.logger.error({ err, to }, "Enquiry acknowledgement failed");
  }
};

/** Double opt-in: asks a new subscriber to confirm before we ever mail them. */
export const sendNewsletterConfirmation = async (
  payload: Payload,
  { to, token, siteUrl }: { to: string; token: string; siteUrl: string },
): Promise<void> => {
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const link = `${siteUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`;

  const body = [
    "One step left.",
    "",
    "Confirm this address and you are on the list. We only send release news and where we are pouring next, and never anything else.",
    "",
    link,
    "",
    "If you did not ask for this, ignore this email and nothing happens. We do not add anyone who has not confirmed.",
    "",
    ACK_SIGNOFF(settings),
  ].join("\n");

  try {
    await payload.sendEmail({ to, subject: "Confirm your place on the list", text: body });
  } catch (err) {
    payload.logger.error({ err, to }, "Newsletter confirmation failed");
  }
};

/** Sent once the address is confirmed. */
export const sendNewsletterWelcome = async (payload: Payload, to: string): Promise<void> => {
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const body = [
    "You are on the list.",
    "",
    "New releases, and where the bar is pouring next. This list hears first.",
    "",
    "Vir die wat weet.",
    "",
    ACK_SIGNOFF(settings),
  ].join("\n");
  try {
    await payload.sendEmail({ to, subject: "You are on the list", text: body });
  } catch (err) {
    payload.logger.error({ err, to }, "Newsletter welcome failed");
  }
};
