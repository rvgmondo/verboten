/**
 * Render every transactional email to disk so they can be looked at.
 *
 * Email is the one part of this site nobody sees until a customer does, and
 * markup that reads fine in a diff can arrive broken. This writes each HTML
 * body to .email-preview/ so it can be opened in a browser, and prints the
 * plain text part beside it so the two can be compared for drift.
 *
 * Renders templates only. Sends nothing, touches no database.
 *
 *   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
 *   node --import tsx scripts/preview-emails.mjs
 */

import fs from "node:fs";
import path from "node:path";

import {
  button,
  emailLayout,
  eyebrow,
  muted,
  panel,
  paragraph,
  rows,
  standardFooter,
} from "../src/lib/email-layout.ts";
import { formatZAR } from "../src/lib/money.ts";

const OUT = path.resolve(process.cwd(), ".email-preview");
fs.mkdirSync(OUT, { recursive: true });

// The real formatter, not an approximation. A preview that renders money
// differently from production is worse than no preview.
const money = formatZAR;

const orderPanel = () =>
  panel(
    eyebrow("Order VB-2026-0007") +
      rows([
        { label: "2 x Verboten Premium Brandy", value: money(90000) },
        { label: "1 x Verboten Brandy & Cola", value: money(4500) },
      ]) +
      '<div style="height:14px"></div>' +
      rows([
        { label: "Subtotal", value: money(94500) },
        { label: "Discount (WELCOME10)", value: `-${money(9450)}` },
        { label: "Delivery", value: money(15000) },
        { label: "Total", value: money(100050), strong: true },
      ]),
  );

const SAMPLES = {
  "order-paid": emailLayout({
    title: "Payment received.",
    preheader: "VB-2026-0007 is confirmed. Ships within 1 to 2 weeks.",
    body: [
      paragraph("VB-2026-0007 is yours."),
      orderPanel(),
      paragraph("Ships within 1 to 2 weeks, and you get a tracking number the moment it ships."),
      button("https://verboten.co.za/account", "Track this order"),
      muted(
        "Look it up any time with this email address. No account is needed to receive an order, only to see the ones you have placed.",
      ),
    ].join(""),
    footer: standardFooter(),
  }),

  "order-shipped": emailLayout({
    title: "On its way.",
    preheader: "VB-2026-0007 has shipped. Tracking TCG1234567ZA.",
    body: [
      paragraph("VB-2026-0007 has shipped."),
      panel(
        eyebrow("Tracking number") +
          '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:20px;letter-spacing:0.08em;color:#cdb88d;">TCG1234567ZA</p>',
      ),
      muted(
        "Delivery takes 3 to 7 business days. Someone 18 or older has to receive it, and the courier may ask for ID.",
      ),
    ].join(""),
    footer: standardFooter(),
  }),

  "payment-declined": emailLayout({
    title: "That payment did not go through.",
    preheader: "Nothing was charged, and the order was not placed.",
    body: [
      paragraph(
        'The payment for VB-2026-0007 did not go through, so <strong style="color:#cdb88d;">nothing was charged</strong> and the order was not placed.',
      ),
      paragraph(
        "Banks decline for all sorts of ordinary reasons. If you still want it, starting again takes a minute.",
      ),
      orderPanel(),
      button("https://verboten.co.za/shop", "Try again"),
      muted("If you think something went wrong on our side, reply to this email and we will look into it."),
    ].join(""),
    footer: standardFooter(),
  }),

  "staff-new-order": emailLayout({
    title: `New order, ${money(100050)}.`,
    preheader: "Ruben van Greunen ordered 2 lines.",
    body: [
      panel(
        eyebrow("Check stock first") +
          '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#f5f1e6;">This order took stock that was not there. Confirm you can fill it before promising a delivery date.</p>',
      ),
      orderPanel(),
      panel(
        eyebrow("Ship to") +
          '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#f5f1e6;">Ruben van Greunen<br>12 Sample Street<br>Silverton<br>Pretoria<br>Gauteng<br>0184</p>' +
          '<p style="margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#b0a891;">buyer@example.com<br>072 123 4567</p>',
      ),
      button("https://verboten.co.za/admin/collections/orders", "Open in the admin"),
      muted("Reply to this email and it goes straight to the customer."),
    ].join(""),
    footer: standardFooter(),
  }),

  "newsletter-confirm": emailLayout({
    title: "One step left.",
    preheader: "Confirm this address and you are on the list.",
    body: [
      paragraph(
        "Confirm this address and you are on the list. Release news and where we are pouring next, and never anything else.",
      ),
      button("https://verboten.co.za/newsletter/confirm?token=sample", "Confirm my address"),
      muted(
        "If you did not ask for this, ignore this email and nothing happens. Nobody is added who has not confirmed.",
      ),
    ].join(""),
    footer: standardFooter("info@verboten.co.za"),
  }),

  "newsletter-welcome": emailLayout({
    title: "You are on the list.",
    preheader: "New releases, and where the bar is pouring next.",
    body: [
      paragraph("New releases, and where the bar is pouring next. This list hears first."),
      '<p style="margin:24px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.24em;text-transform:uppercase;color:#cdb88d;">Vir di&eacute; wat weet</p>',
      button("https://verboten.co.za/shop", "The shop"),
    ].join(""),
    footer: standardFooter(
      '<a href="https://verboten.co.za/newsletter/unsubscribe?token=sample" style="color:#b0a891;">Unsubscribe</a>',
    ),
  }),

  "account-verify": emailLayout({
    title: "One step left.",
    preheader: "Confirm this address and your account is open.",
    body: [
      paragraph(
        "Confirm this address and your account is open. Every order you have placed with it, guest orders included, appears under your name.",
      ),
      button("https://verboten.co.za/account/verify?token=sample", "Confirm my account"),
      muted(
        "If you did not create this account, ignore this email. Nothing is opened and nothing is shared until the link above is used.",
      ),
    ].join(""),
    footer: standardFooter(),
  }),
};

const index = [];
for (const [name, html] of Object.entries(SAMPLES)) {
  const file = path.join(OUT, `${name}.html`);
  fs.writeFileSync(file, html, "utf8");
  index.push(`<li><a href="./${name}.html">${name}</a></li>`);
  console.log(`wrote ${path.relative(process.cwd(), file)}  (${html.length} bytes)`);
}

fs.writeFileSync(
  path.join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Verboten emails</title>
<body style="background:#141414;color:#f5f1e6;font-family:Helvetica,Arial,sans-serif;padding:40px;">
<h1 style="font-weight:400;">Email previews</h1><ul style="line-height:2;">${index.join("")}</ul></body>`,
  "utf8",
);
console.log(`\nOpen .email-preview/index.html`);
