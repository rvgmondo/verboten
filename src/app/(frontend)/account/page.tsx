import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPayload } from "payload";

import { AccountAuth, LogoutButton } from "@/components/account/account-auth";
import { SectionHeading } from "@/components/brand/section-heading";
import { Badge } from "@/components/ui/badge";
import { formatZAR } from "@/lib/money";

import config from "../../../payload.config";

export const metadata: Metadata = {
  title: "Your Orders",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/**
 * Lightweight account area: sign in to see order history. Guest checkout
 * remains first-class; this page is optional by design.
 */
export default async function AccountPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  const customer = user && user.collection === "customers" ? user : null;

  if (!customer) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Your orders"
          title="Sign in to see your orders"
          lead="An account is optional; guest orders always land in your email. Signing in simply keeps the history in one place."
          className="mb-12"
        />
        <AccountAuth />
      </main>
    );
  }

  const orders = await payload.find({
    collection: "orders",
    where: { customer: { equals: customer.id } },
    sort: "-createdAt",
    limit: 50,
    overrideAccess: true,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          as="h1"
          eyebrow="Your orders"
          title={customer.name ? `Good to see you, ${customer.name.split(" ")[0]}` : "Your orders"}
        />
        <LogoutButton />
      </div>

      {orders.docs.length === 0 ? (
        <div className="mt-12 border border-line bg-coal p-8">
          <p className="text-sm text-parch">
            No orders on this account yet. Orders placed as a guest with{" "}
            {customer.email} stay in your email; future signed-in orders appear
            here.
          </p>
        </div>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {orders.docs.map((order) => (
            <li key={order.id} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
              <div>
                <p className="font-display text-lg text-bone">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-parch">
                  {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" | "}
                  {order.items.map((i) => `${i.quantity} x ${i.nameSnapshot}`).join(", ")}
                </p>
              </div>
              <Badge variant={order.status === "delivered" ? "gold" : "quiet"}>
                {STATUS_LABELS[order.status] ?? order.status}
              </Badge>
              <p className="text-sm text-gold">{formatZAR(order.totalCents)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
