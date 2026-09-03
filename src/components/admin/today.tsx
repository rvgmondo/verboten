import Link from "next/link";
import { getPayload } from "payload";

import config from "../../payload.config";

/**
 * What needs doing, at the top of the admin.
 *
 * The person running this shop is not a developer and opens the admin to a
 * list of collection names. Everything that needs attention is real but
 * scattered: an order flagged for reconciliation is a column on a list they
 * have to think to open, a product running out is a number inside a document,
 * an enquiry sitting unanswered looks identical to one already dealt with.
 *
 * So this answers the only question that matters first thing in the morning,
 * and links straight to the thing itself. Nothing here is decorative: a panel
 * only appears when there is something to do about it.
 */

const money = (cents: number) => {
  const rand = Math.floor(Math.abs(cents) / 100);
  return `R${rand.toLocaleString("en-ZA").replace(/,/g, " ")}`;
};

const Panel = ({
  tone = "quiet",
  title,
  children,
}: {
  tone?: "quiet" | "urgent";
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      border: `1px solid ${tone === "urgent" ? "#c2703f" : "var(--theme-elevation-150)"}`,
      borderLeftWidth: 3,
      padding: "14px 16px",
      borderRadius: 3,
      background: "var(--theme-elevation-50)",
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: tone === "urgent" ? "#c2703f" : "var(--theme-elevation-600)",
      }}
    >
      {title}
    </p>
    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>{children}</div>
  </div>
);

export const Today = async () => {
  const payload = await getPayload({ config });

  // Everything in parallel: this renders before the admin is usable.
  const [attention, awaitingPayment, toPack, newEnquiries, products] = await Promise.all([
    payload.find({
      collection: "orders",
      where: { needsAttention: { not_equals: "none" } },
      limit: 10,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "orders",
      where: { status: { equals: "pending_payment" } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "orders",
      where: { status: { in: ["paid", "packed"] } },
      limit: 10,
      depth: 0,
      overrideAccess: true,
      sort: "createdAt",
    }),
    payload.find({
      collection: "enquiries",
      where: { status: { equals: "new" } },
      limit: 10,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({ collection: "products", limit: 50, depth: 2, overrideAccess: true }),
  ]);

  // Low stock, using the same rule the shop uses, so the admin and the storefront
  // never disagree about what "running out" means.
  const { getAvailability } = await import("@/lib/inventory");
  const low = products.docs
    .map((p) => ({ product: p, availability: getAvailability(p) }))
    .filter((r) => r.availability.soldOut || r.availability.lowStock);

  const nothingToDo =
    attention.totalDocs === 0 &&
    toPack.totalDocs === 0 &&
    newEnquiries.totalDocs === 0 &&
    low.length === 0;

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 20, margin: "0 0 14px" }}>Today</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {attention.totalDocs > 0 && (
          <Panel tone="urgent" title={
              attention.totalDocs === 1
                ? "1 order needs a person"
                : `${attention.totalDocs} orders need a person`
            }>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {attention.docs.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/collections/orders/${o.id}`}>{o.orderNumber}</Link>{" "}
                  {String(o.needsAttention).replace(/_/g, " ")}, {money(o.totalCents)}
                </li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", color: "var(--theme-elevation-600)" }}>
              Money moved in a way that did not match the order. Nothing was shipped
              and nothing was refunded automatically.
            </p>
          </Panel>
        )}

        {toPack.totalDocs > 0 && (
          <Panel title={`${toPack.totalDocs} paid order${toPack.totalDocs === 1 ? "" : "s"} to pack`}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {toPack.docs.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/collections/orders/${o.id}`}>{o.orderNumber}</Link>{" "}
                  {o.customerName}, {money(o.totalCents)}
                  {o.status === "packed" ? ", packed, waiting for the courier" : ""}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {newEnquiries.totalDocs > 0 && (
          <Panel title={`${newEnquiries.totalDocs} unanswered enquir${newEnquiries.totalDocs === 1 ? "y" : "ies"}`}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {newEnquiries.docs.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/collections/enquiries/${e.id}`}>{e.name}</Link>{" "}
                  {e.topic === "booking" ? "wants to book the bar" : e.topic === "stockist" ? "wants to stock it" : "sent a message"}
                </li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", color: "var(--theme-elevation-600)" }}>
              They were told they would hear back within one business day.
            </p>
          </Panel>
        )}

        {low.length > 0 && (
          <Panel title="Running out">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {low.map(({ product, availability }) => (
                <li key={product.id}>
                  <Link href={`/admin/collections/products/${product.id}`}>{product.name}</Link>
                  {availability.soldOut
                    ? ", sold out and not buyable"
                    : `, ${availability.available} left`}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {nothingToDo && (
          <Panel title="Nothing waiting">
            Every order is packed or delivered, every enquiry is answered and nothing
            is running low.
            {awaitingPayment.totalDocs > 0 && (
              <>
                {" "}
                {awaitingPayment.totalDocs} checkout
                {awaitingPayment.totalDocs === 1 ? " was" : "s were"} started and never
                paid for, which is normal and needs nothing from you.
              </>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
};
