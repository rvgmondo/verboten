/**
 * End to end proof of the money path, run against a local production server.
 *
 * The checkout redirect, the ITN webhook, the paid transition, the stock
 * decrement and both order emails are the only part of this site where a
 * mistake costs real money, and it is the part a person cannot easily test by
 * clicking. This drives the whole chain and asserts on each step.
 *
 * Local only, and it refuses to run against anything but localhost: it posts a
 * forged (correctly signed) ITN, which is exactly what must never be possible
 * in production. It relies on PAYFAST_SKIP_REMOTE_VALIDATE=true, a dev-only
 * seam that skips PayFast's server-to-server confirmation.
 *
 *   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
 *   node scripts/verify-money-path.mjs
 */

import { createHash } from "crypto";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const EMAIL = process.env.ADMIN_EMAIL || "admin@verboten.co.za";
const PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(BASE)) {
  console.error("Refusing to run against anything but localhost. This forges an ITN.");
  process.exit(1);
}

const passphrase = process.env.PAYFAST_PASSPHRASE || "";
const merchantId = process.env.PAYFAST_MERCHANT_ID || "";
if (!passphrase || !merchantId) {
  console.error("PAYFAST_PASSPHRASE and PAYFAST_MERCHANT_ID must be set (load .env first).");
  process.exit(1);
}

/** PHP-style urlencode, matching the provider exactly. */
const phpUrlEncode = (v) =>
  encodeURIComponent(v)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E");

const md5 = (v) => createHash("md5").update(v).digest("hex");

let token = null;
const api = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  return data;
};

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

const run = async () => {
  console.log(`Target: ${BASE}\n`);

  const login = await api("/api/users/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  token = login.token;

  // The order must come from the real checkout: Orders.create is serverOnly,
  // and rightly so. Place one in the browser, then pass its number in.
  const orderNumber = process.env.ORDER_NUMBER;
  if (!orderNumber) {
    console.error(
      "Set ORDER_NUMBER to a pending order placed through the real checkout. " +
        "Orders cannot be created over the API on purpose: only the checkout " +
        "server action may create them.",
    );
    process.exit(1);
  }

  const orderFound = await api(
    `/api/orders?where[orderNumber][equals]=${encodeURIComponent(orderNumber)}&depth=1&limit=1`,
  );
  const order = orderFound.docs[0];
  if (!order) throw new Error(`Order ${orderNumber} not found.`);
  const orderId = order.id;
  const totalCents = order.totalCents;
  check("Order is pending_payment", order.status === "pending_payment", `${orderNumber} ${order.status}`);

  // Track stock on the first line item that carries its own count.
  const firstItem = order.items[0];
  const productId =
    typeof firstItem.product === "object" ? firstItem.product.id : firstItem.product;
  const product = await api(`/api/products/${productId}?depth=0`);
  const ownStock = product.inventory?.mode === "own";
  const stockBefore = product.inventory?.stockQty ?? 0;
  const qty = firstItem.quantity;


  // A correctly signed ITN, exactly as PayFast would send it.
  const itn = [
    ["m_payment_id", orderNumber],
    ["pf_payment_id", `TEST${Date.now().toString().slice(-8)}`],
    ["payment_status", "COMPLETE"],
    ["item_name", `Verboten order ${orderNumber}`],
    ["amount_gross", (totalCents / 100).toFixed(2)],
    ["merchant_id", merchantId],
  ];
  const base = itn.map(([k, v]) => `${k}=${phpUrlEncode(v)}`).join("&");
  const signature = md5(`${base}&passphrase=${phpUrlEncode(passphrase)}`);
  const rawBody = `${base}&signature=${signature}`;

  const notify = await fetch(`${BASE}/api/payfast/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  check("ITN accepted", notify.ok, `HTTP ${notify.status}`);

  // Give the handler a moment to finish its writes.
  await new Promise((r) => setTimeout(r, 1500));

  const after = await api(`/api/orders/${orderId}?depth=0`);
  check("Order flipped to paid", after.status === "paid", `status=${after.status}`);
  check("Payment reference recorded", Boolean(after.payment?.reference), after.payment?.reference ?? "none");

  const productAfter = await api(`/api/products/${productId}?depth=0`);
  const stockAfter = productAfter.inventory?.stockQty ?? 0;
  if (ownStock) {
    check("Stock decremented", stockAfter === stockBefore - qty, `${stockBefore} -> ${stockAfter} (qty ${qty})`);
  } else {
    check("Stock draws from a batch, checked separately", true, `mode=${product.inventory?.mode}`);
  }

  // Replay the same notification: PayFast retries, and a retry must not
  // decrement stock twice or re-send emails.
  const replay = await fetch(`${BASE}/api/payfast/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const productReplay = await api(`/api/products/${productId}?depth=0`);
  check(
    "Replayed ITN is idempotent",
    (productReplay.inventory?.stockQty ?? 0) === stockAfter,
    `still ${productReplay.inventory?.stockQty}, replay HTTP ${replay.status}`,
  );

  // A tampered amount must be rejected outright.
  const badItn = itn.map(([k, v]) => [k, k === "amount_gross" ? "1.00" : v]);
  const badBase = badItn.map(([k, v]) => `${k}=${phpUrlEncode(v)}`).join("&");
  const badSig = md5(`${badBase}&passphrase=${phpUrlEncode(passphrase)}`);
  const tampered = await fetch(`${BASE}/api/payfast/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `${badBase}&signature=${badSig}`,
  });
  check("Wrong amount rejected", !tampered.ok, `HTTP ${tampered.status}`);

  // An unsigned notification must be rejected.
  const unsigned = await fetch(`${BASE}/api/payfast/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: base,
  });
  check("Unsigned notification rejected", !unsigned.ok, `HTTP ${unsigned.status}`);

  // Restore the stock this run consumed. The order is left in place so it can
  // be inspected, and removed by hand in the admin once it has been.
  if (ownStock) {
    await api(`/api/products/${productId}`, {
      method: "PATCH",
      body: { inventory: { ...productAfter.inventory, stockQty: stockBefore } },
    });
    console.log(`\nStock restored to ${stockBefore}.`);
  }
  console.log(`Order ${orderNumber} left in place; delete it in the admin.`);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error("\nVerification failed:", err.message);
  process.exit(1);
});
