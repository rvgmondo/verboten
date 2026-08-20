import type { Metadata } from "next";
import Link from "next/link";

import { Crest } from "@/components/brand/crest";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false },
};

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Crest className="h-16 w-16 text-gold-dim" aria-hidden="true" />
      <div className="space-y-4">
        <p className="eyebrow">No harm done</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">Payment cancelled</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
          {order ? `Order ${order} was not paid and nothing was charged.` : "Nothing was charged."}{" "}
          Your cart is exactly as you left it whenever you want to pick it back up.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/checkout">Back to checkout</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">The shop</Link>
        </Button>
      </div>
    </main>
  );
}
