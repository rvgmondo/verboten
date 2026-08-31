/**
 * The house's email shell.
 *
 * Every transactional email goes out as multipart: this HTML plus the plain
 * text that was already being sent. The text part is not a fallback nobody
 * reads, it is what keeps these out of spam filters and what renders in a
 * watch, a terminal client or a screen reader. Neither version is allowed to
 * say something the other does not.
 *
 * The markup is deliberately old fashioned. Tables, inline styles, no flexbox,
 * no grid, no external stylesheet, no web fonts, no images that matter. Outlook
 * renders with Word's engine and Gmail strips <style> blocks, so anything more
 * modern arrives broken on the two clients most South African customers use.
 * Width is capped at 600px, which is the widest that survives a phone.
 *
 * Colours are the site's dark palette, taken from the .inverse block in
 * globals.css, so an email looks like the shop it came from.
 */

const INK = "#141414"; // page
const COAL = "#1b1b19"; // raised panel
const LINE = "#33312b"; // hairline
const BONE = "#f5f1e6"; // primary text
const PARCH = "#b0a891"; // muted text
const GOLD = "#cdb88d"; // accent

export const EMAIL_COLORS = { INK, COAL, LINE, BONE, PARCH, GOLD };

/** Escapes anything that reaches the HTML part from user or CMS data. */
export const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** A gold call to action. Padded with a table so Outlook honours the box. */
export const button = (href: string, label: string): string => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
  <tr>
    <td align="center" bgcolor="#cdb88d" style="border-radius:0;">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#141414;text-decoration:none;">${esc(label)}</a>
    </td>
  </tr>
</table>`;

/** A quiet label above a block. */
export const eyebrow = (text: string): string =>
  `<p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};">${esc(text)}</p>`;

export const paragraph = (text: string): string =>
  `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.65;color:${BONE};">${text}</p>`;

export const muted = (text: string): string =>
  `<p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${PARCH};">${text}</p>`;

/** A bordered panel, for order contents and anything that wants separating. */
export const panel = (inner: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border:1px solid ${LINE};background-color:${COAL};">
  <tr><td style="padding:22px 24px;">${inner}</td></tr>
</table>`;

/** Two column rows, label left and value right. Used for totals and specs. */
export const rows = (
  items: Array<{ label: string; value: string; strong?: boolean }>,
): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${items
    .map(
      (r) => `<tr>
    <td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:${r.strong ? "14px" : "13px"};color:${r.strong ? BONE : PARCH};${r.strong ? "border-top:1px solid " + LINE + ";padding-top:12px;" : ""}">${esc(r.label)}</td>
    <td align="right" style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:${r.strong ? "16px" : "13px"};color:${r.strong ? GOLD : BONE};${r.strong ? "border-top:1px solid " + LINE + ";padding-top:12px;" : ""}">${esc(r.value)}</td>
  </tr>`,
    )
    .join("")}
</table>`;

export type LayoutOptions = {
  /** Shown as the headline inside the email. */
  title: string;
  /** The body, already built from the helpers above. */
  body: string;
  /**
   * The line most clients show beside the subject in the inbox list. Without
   * one they scrape the first words of the markup, which reads like debris.
   */
  preheader: string;
  /** Footer lines: contact details, the legal line, an unsubscribe link. */
  footer?: string;
};

/**
 * Wraps a body in the house shell.
 *
 * The wordmark is set in type rather than pulled from an image: most clients
 * block remote images by default, and a brand that renders as a broken icon is
 * worse than one that renders as its own name.
 */
export const emailLayout = ({ title, body, preheader, footer }: LayoutOptions): string => `<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${INK};">
<div style="display:none;font-size:1px;color:${INK};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK}" style="background-color:${INK};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="https://verboten.co.za" style="font-family:Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.16em;color:${BONE};text-decoration:none;">VERBOTEN</a>
            <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:${GOLD};">Pure Spirit. Pure Mischief.</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 28px;background-color:${COAL};border:1px solid ${LINE};">
            <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:normal;color:${BONE};">${esc(title)}</h1>
            ${body}
          </td>
        </tr>

        <tr>
          <td style="padding:26px 28px 8px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.8;color:${PARCH};">
              ${footer ?? ""}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

/** The footer every email carries, with anything extra appended. */
export const standardFooter = (extra?: string): string =>
  [
    "Verboten Spirits, Silverton, Pretoria",
    '<a href="https://verboten.co.za" style="color:' + GOLD + ';text-decoration:none;">verboten.co.za</a>',
    "Drink responsibly. Not for sale to persons under 18.",
    extra ?? "",
  ]
    .filter(Boolean)
    .join("<br>");
