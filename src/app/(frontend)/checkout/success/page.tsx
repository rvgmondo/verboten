import type { Metadata } from "next";
import Link from "next/link";

import { BrandBadge } from "@/components/brand/crest";
import { ClearCartOnMount } from "@/components/checkout/clear-cart";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false },
};

/**
 * PayFast's return page. Deliberately makes no claims about payment state:
 * the webhook is the source of truth and the confirmation email follows it.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const settings = await getSiteSettings();
  const dispatch = settings.dispatchTimeText || "Ships within 1 to 2 weeks";

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <ClearCartOnMount />
      <BrandBadge className="h-20 w-20" />
      <div className="space-y-4">
        <p className="eyebrow" lang="af">Baie dankie</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          {order ? `Order ${order} is in` : "Your order is in"}
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
          The moment your payment clears you get a confirmation email with
          everything on it. {dispatch}, and your tracking number follows when
          the courier collects.
        </p>
      </div>
      {/* The warmest moment to offer an account: they have just bought, and
          the account instantly shows this order plus any earlier guest ones. */}
      <div className="w-full max-w-md border border-gold-dim/40 bg-coal p-6 text-left">
        <p className="eyebrow mb-3">Keep track of it</p>
        <p className="text-sm leading-relaxed text-parch">
          Check where it is any time with the order number and your email. No
          account needed. Or create one with the same email, and this order and
          anything you ordered before appear under your name.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={order ? `/track?order=${encodeURIComponent(order)}` : "/track"}>
              Track this order
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account">Create an account</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/shop">Keep browsing</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
