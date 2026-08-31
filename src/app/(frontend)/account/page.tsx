import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPayload } from "payload";

import { AccountAuth, LogoutButton } from "@/components/account/account-auth";
import { PageMasthead } from "@/components/brand/page-masthead";
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
      <main>
        <PageMasthead
          align="center"
          eyebrow="Your account"
          title="Everything you have"
          titleAccent="ordered."
          lead="Create an account with the address you checked out with and every order you have placed appears here, including the ones you placed as a guest."
        />
        <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <AccountAuth />
        </div>
      </main>
    );
  }

  const orders = await payload.find({
    collection: "orders",
    // Orders placed as a guest carry no customer link, only an email. Matching
    // on either means signing up hands you every order you ever placed with
    // that address, instead of an empty page and a lost history.
    where: {
      or: [
        { customer: { equals: customer.id } },
        { email: { equals: customer.email } },
      ],
    },
    sort: "-createdAt",
    limit: 50,
    overrideAccess: true,
  });

  return (
    <main>
      <PageMasthead
        eyebrow="Your account"
        title={customer.name ? "Good to see you," : "Your"}
        titleAccent={customer.name ? `${customer.name.split(" ")[0]}.` : "orders."}
      />
      <div className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-parch">{customer.email}</p>
        <LogoutButton />
      </div>

      {orders.docs.length === 0 ? (
        <div className="mt-10 border border-line bg-coal p-8">
          <p className="text-sm text-parch">
            Nothing here yet. Any order placed with {customer.email} shows up
            on this page, whether you were signed in at the time or not.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
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
      </div>
    </main>
  );
}
