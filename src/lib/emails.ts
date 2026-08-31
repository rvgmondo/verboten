import type { Payload } from "payload";

import {
  EMAIL_COLORS,
  button,
  emailLayout,
  esc,
  eyebrow,
  muted,
  panel,
  paragraph,
  rows,
  standardFooter,
} from "@/lib/email-layout";
import { formatZAR } from "@/lib/money";
import type { Order } from "@/payload-types";

/**
 * Transactional email, sent as multipart: branded HTML with the plain text
 * alongside it.
 *
 * The text part is not vestigial. It is what spam filters read, what renders
 * on a watch or in a terminal client, and what a screen reader gets when the
 * HTML is refused. Both parts must always say the same thing, so every
 * template here builds them together rather than letting one drift.
 *
 * Sending failures are logged, never thrown. An email problem must not break
 * an order.
 */

const SITE = "https://verboten.co.za";

/** Order lines as HTML rows, mirroring orderLines() exactly. */
const orderLinesHtml = (order: Order): string =>
  rows(
    order.items.map((i) => ({
      label: `${i.quantity} x ${i.nameSnapshot}`,
      value: formatZAR(i.unitPriceCents * i.quantity),
    })),
  );

/** Totals as HTML rows, mirroring totals() exactly. */
const totalsHtml = (order: Order): string => {
  const items: Array<{ label: string; value: string; strong?: boolean }> = [
    { label: "Subtotal", value: formatZAR(order.subtotalCents) },
  ];
  if (order.discountCents > 0) {
    items.push({
      label: `Discount${order.discountCode ? ` (${order.discountCode})` : ""}`,
      value: `-${formatZAR(order.discountCents)}`,
    });
  }
  items.push({
    label: "Delivery",
    value: order.shippingCents === 0 ? "Free" : formatZAR(order.shippingCents),
  });
  items.push({ label: "Total", value: formatZAR(order.totalCents), strong: true });
  return rows(items);
};

/** The order, boxed, as it appears in every order email. */
const orderPanel = (order: Order): string =>
  panel(
    `${eyebrow(`Order ${order.orderNumber}`)}${orderLinesHtml(order)}<div style="height:14px"></div>${totalsHtml(order)}`,
  );

const addressLines = (order: Order): string[] =>
  [
    order.shippingAddress.line1,
    order.shippingAddress.line2,
    order.shippingAddress.suburb,
    order.shippingAddress.city,
    order.shippingAddress.province,
    order.shippingAddress.postalCode,
  ].filter(Boolean) as string[];

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

type Rendered = { subject: string; body: string; html: string };

/**
 * One entry per status the customer hears about. Each builds the text and the
 * HTML side by side so the two can never end up saying different things.
 */
const STATUS_EMAILS: Partial<Record<Order["status"], (o: Order, dispatch: string) => Rendered>> = {
  paid: (o, dispatch) => ({
    subject: `Order ${o.orderNumber} confirmed`,
    body: `Payment received. ${o.orderNumber} is yours.\n\n${orderLines(o)}\n\n${totals(o)}\n\n${dispatch}, and you get a tracking number the moment it ships.\n\nYou can look this order up any time at ${SITE}/account, using this email address.\n\n${signoff}`,
    html: emailLayout({
      title: "Payment received.",
      preheader: `${o.orderNumber} is confirmed. ${dispatch}.`,
      body: [
        paragraph(`${esc(o.orderNumber)} is yours.`),
        orderPanel(o),
        paragraph(`${esc(dispatch)}, and you get a tracking number the moment it ships.`),
        button(`${SITE}/account`, "Track this order"),
        muted(
          "Look it up any time with this email address. No account is needed to receive an order, only to see the ones you have placed.",
        ),
      ].join(""),
      footer: standardFooter(),
    }),
  }),
  packed: (o) => ({
    subject: `Order ${o.orderNumber} is packed`,
    body: `${o.orderNumber} is boxed and waiting for the courier.\n\nYou will get a tracking number when it is collected.\n\n${signoff}`,
    html: emailLayout({
      title: "Boxed and waiting.",
      preheader: `${o.orderNumber} is packed and waiting for the courier.`,
      body: [
        paragraph(`${esc(o.orderNumber)} is boxed and waiting for the courier.`),
        muted("You get a tracking number the moment it is collected."),
      ].join(""),
      footer: standardFooter(),
    }),
  }),
  shipped: (o) => ({
    subject: `Order ${o.orderNumber} is on its way`,
    body: `${o.orderNumber} has shipped.${o.trackingNumber ? `\n\nTracking number: ${o.trackingNumber}` : ""}\n\nDelivery takes 3 to 7 business days. Someone 18 or older must receive it; the courier may ask for ID.\n\n${signoff}`,
    html: emailLayout({
      title: "On its way.",
      preheader: o.trackingNumber
        ? `${o.orderNumber} has shipped. Tracking ${o.trackingNumber}.`
        : `${o.orderNumber} has shipped.`,
      body: [
        paragraph(`${esc(o.orderNumber)} has shipped.`),
        o.trackingNumber
          ? panel(
              `${eyebrow("Tracking number")}<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:20px;letter-spacing:0.08em;color:${EMAIL_COLORS.GOLD};">${esc(o.trackingNumber)}</p>`,
            )
          : "",
        muted(
          "Delivery takes 3 to 7 business days. Someone 18 or older has to receive it, and the courier may ask for ID.",
        ),
      ].join(""),
      footer: standardFooter(),
    }),
  }),
  delivered: (o) => ({
    subject: `Order ${o.orderNumber} delivered`,
    body: `${o.orderNumber} has been delivered. Pour it properly.\n\nIf anything is wrong with the delivery, reply within 48 hours and we sort it out.\n\n${signoff}`,
    html: emailLayout({
      title: "Delivered. Pour it properly.",
      preheader: `${o.orderNumber} has been delivered.`,
      body: [
        paragraph(`${esc(o.orderNumber)} has been delivered.`),
        muted(
          "If anything is wrong with it, reply to this email within 48 hours and we sort it out.",
        ),
        button(`${SITE}/serves`, "How to pour it"),
      ].join(""),
      footer: standardFooter(),
    }),
  }),
  // Two very different things land on "cancelled": an order we cancelled after
  // taking money, and a card that was simply declined. Telling the second one
  // that "the refund is on its way" is a claim about money that was never
  // taken, and it reads as a charge they now have to chase down. The status
  // log is what says which of the two actually happened.
  cancelled: (o) => {
    const wasPaid = (o.statusLog ?? []).some((entry) => entry.status === "paid");
    return wasPaid
      ? {
          subject: `Order ${o.orderNumber} cancelled`,
          body: `${o.orderNumber} has been cancelled and the refund is on its way back to the same payment method. Allow a few business days for it to reflect.\n\nQuestions: reply to this email.\n\n${signoff}`,
          html: emailLayout({
            title: "Cancelled, and refunded.",
            preheader: `${o.orderNumber} is cancelled and the refund is on its way.`,
            body: [
              paragraph(
                `${esc(o.orderNumber)} has been cancelled and the refund is on its way back to the same payment method.`,
              ),
              muted(
                "Allow a few business days for it to reflect. Any questions, reply to this email.",
              ),
            ].join(""),
            footer: standardFooter(),
          }),
        }
      : {
          subject: `Order ${o.orderNumber} did not go through`,
          body: `The payment for ${o.orderNumber} did not go through, so nothing was charged and the order was not placed.\n\nBanks decline for all sorts of ordinary reasons. If you still want it, it takes a minute to start again at ${SITE}/shop\n\n${orderLines(o)}\n\nIf you think something went wrong on our side, reply to this email and we will look into it.\n\n${signoff}`,
          html: emailLayout({
            title: "That payment did not go through.",
            preheader: "Nothing was charged, and the order was not placed.",
            body: [
              paragraph(
                `The payment for ${esc(o.orderNumber)} did not go through, so <strong style="color:${EMAIL_COLORS.GOLD};">nothing was charged</strong> and the order was not placed.`,
              ),
              paragraph(
                "Banks decline for all sorts of ordinary reasons. If you still want it, starting again takes a minute.",
              ),
              orderPanel(o),
              button(`${SITE}/shop`, "Try again"),
              muted(
                "If you think something went wrong on our side, reply to this email and we will look into it.",
              ),
            ].join(""),
            footer: standardFooter(),
          }),
        };
  },
  refunded: (o) => ({
    subject: `Order ${o.orderNumber} refunded`,
    body: `The refund for ${o.orderNumber} has been processed to your original payment method. Allow a few business days for it to reflect.\n\n${signoff}`,
    html: emailLayout({
      title: "Refunded.",
      preheader: `The refund for ${o.orderNumber} has been processed.`,
      body: [
        paragraph(
          `The refund for ${esc(o.orderNumber)} has been processed to your original payment method.`,
        ),
        muted("Allow a few business days for it to reflect."),
      ].join(""),
      footer: standardFooter(),
    }),
  }),
};

export const sendOrderStatusEmail = async (payload: Payload, order: Order): Promise<void> => {
  const template = STATUS_EMAILS[order.status];
  if (!template) return;
  // The dispatch promise is set once in Site Settings; every surface reads it
  // so the email can never contradict the site.
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const dispatch = settings.dispatchTimeText || "Ships within 1 to 2 weeks";
  const { subject, body, html } = template(order, dispatch);
  try {
    await payload.sendEmail({
      to: order.email,
      subject,
      text: body,
      html,
      // Order mail is about a purchase, so a reply has to reach a person
      // rather than bouncing off a no-reply address.
      replyTo: settings.contact?.ordersEmail ?? settings.contact?.email ?? undefined,
    });
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

  const address = addressLines(order);
  // An order that took stock it did not have is the one thing that must not be
  // read past on a phone, so it leads the alert rather than hiding in a note.
  const oversold = (order.internalNotes ?? "").includes("OVERSOLD:");

  try {
    await payload.sendEmail({
      to,
      replyTo: order.email,
      subject: `${oversold ? "[CHECK STOCK] " : ""}New paid order ${order.orderNumber} (${formatZAR(order.totalCents)})`,
      text: `${order.customerName} <${order.email}>${order.phone ? `\n${order.phone}` : ""}\n\n${orderLines(order)}\n\n${totals(order)}\n\nShip to:\n  ${address.join("\n  ")}\n\n${oversold ? "WARNING: this order took stock that was not there. Check you can fill it before promising a date.\n\n" : ""}Open the admin to process it: ${SITE}/admin/collections/orders`,
      html: emailLayout({
        title: `New order, ${formatZAR(order.totalCents)}.`,
        preheader: `${order.customerName} ordered ${order.items.length} line${order.items.length === 1 ? "" : "s"}.`,
        body: [
          oversold
            ? panel(
                `${eyebrow("Check stock first")}<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${EMAIL_COLORS.BONE};">This order took stock that was not there. Confirm you can fill it before promising a delivery date.</p>`,
              )
            : "",
          orderPanel(order),
          panel(
            `${eyebrow("Ship to")}<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:${EMAIL_COLORS.BONE};">${esc(order.customerName)}<br>${address.map(esc).join("<br>")}</p><p style="margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${EMAIL_COLORS.PARCH};">${esc(order.email)}${order.phone ? `<br>${esc(order.phone)}` : ""}</p>`,
          ),
          order.customerNote
            ? panel(
                `${eyebrow("Note from the customer")}<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.BONE};">${esc(order.customerNote)}</p>`,
              )
            : "",
          button(`${SITE}/admin/collections/orders`, "Open in the admin"),
          muted("Reply to this email and it goes straight to the customer."),
        ].join(""),
        footer: standardFooter(),
      }),
    });
    payload.logger.info({ to, order: order.orderNumber, oversold }, "Staff order alert sent");
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

/** Contact details as an HTML footer, mirroring ACK_SIGNOFF. */
const ackFooterHtml = (settings: {
  contact?: { email?: string | null; phone?: string | null } | null;
}) =>
  standardFooter(
    [settings.contact?.email ?? "info@verboten.co.za", settings.contact?.phone ?? ""]
      .filter(Boolean)
      .map(esc)
      .join(" &middot; "),
  );

/** Confirms a contact or bar booking enquiry to the person who sent it. */
export const sendEnquiryAcknowledgement = async (
  payload: Payload,
  { topic, name, to }: { topic: "general" | "booking" | "stockist"; name: string; to: string },
): Promise<void> => {
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const hours = settings.contact?.supportHours ?? "Monday to Friday, 9am to 5pm SAST";
  const booking = topic === "booking";

  const body = booking
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

  const html = emailLayout({
    title: booking ? "We have your booking enquiry." : "We have your message.",
    preheader: "A person replies within one business day.",
    body: [
      paragraph(`${esc(name)},`),
      booking
        ? paragraph(
            "Someone reads every one of these. We come back with a quote within one business day.",
          )
        : paragraph(
            "We reply within one business day, and it is a person replying, not a system.",
          ),
      booking
        ? muted("If the date is tight, phone or WhatsApp us and we will move faster.")
        : "",
      muted(`We are here ${esc(hours)}.`),
      button(`${SITE}/shop`, "While you wait, the shop"),
    ].join(""),
    footer: ackFooterHtml(settings),
  });

  try {
    await payload.sendEmail({
      to,
      subject: booking ? "We have your booking enquiry" : "We have your message",
      text: body,
      html,
      // A reply has to reach a human, not bounce off the sending address.
      replyTo: settings.contact?.email ?? undefined,
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

  const html = emailLayout({
    title: "One step left.",
    preheader: "Confirm this address and you are on the list.",
    body: [
      paragraph(
        "Confirm this address and you are on the list. Release news and where we are pouring next, and never anything else.",
      ),
      button(link, "Confirm my address"),
      muted(
        "If you did not ask for this, ignore this email and nothing happens. Nobody is added who has not confirmed.",
      ),
    ].join(""),
    footer: ackFooterHtml(settings),
  });

  try {
    await payload.sendEmail({
      to,
      subject: "Confirm your place on the list",
      text: body,
      html,
    });
  } catch (err) {
    payload.logger.error({ err, to }, "Newsletter confirmation failed");
  }
};

/**
 * Sent once the address is confirmed.
 *
 * This is the first email that is genuinely marketing, so it is the first that
 * has to carry a way out. The footer link and the List-Unsubscribe header are
 * both required: the header is what Gmail and Outlook turn into their own
 * one-click unsubscribe button, and an easy exit is what stops people reaching
 * for "report spam" instead, which is what actually damages deliverability.
 * The site promises "unsubscribe any time" and the privacy policy says every
 * email carries a link, so this is also simply keeping our word.
 */
export const sendNewsletterWelcome = async (
  payload: Payload,
  to: string,
  unsubscribeToken?: string | null,
): Promise<void> => {
  const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
  const unsubscribe = unsubscribeToken
    ? `${SITE}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : null;

  const body = [
    "You are on the list.",
    "",
    "New releases, and where the bar is pouring next. This list hears first.",
    "",
    "Vir die wat weet.",
    "",
    ACK_SIGNOFF(settings),
    unsubscribe ? `\nUnsubscribe: ${unsubscribe}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = emailLayout({
    title: "You are on the list.",
    preheader: "New releases, and where the bar is pouring next.",
    body: [
      paragraph("New releases, and where the bar is pouring next. This list hears first."),
      `<p style="margin:24px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.24em;text-transform:uppercase;color:${EMAIL_COLORS.GOLD};">Vir di&eacute; wat weet</p>`,
      button(`${SITE}/shop`, "The shop"),
    ].join(""),
    footer: standardFooter(
      unsubscribe
        ? `<a href="${esc(unsubscribe)}" style="color:${EMAIL_COLORS.PARCH};">Unsubscribe</a>`
        : undefined,
    ),
  });

  try {
    await payload.sendEmail({
      to,
      subject: "You are on the list",
      text: body,
      html,
      ...(unsubscribe
        ? {
            headers: {
              "List-Unsubscribe": `<${unsubscribe}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }
        : {}),
    });
  } catch (err) {
    payload.logger.error({ err, to }, "Newsletter welcome failed");
  }
};
