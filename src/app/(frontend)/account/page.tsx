import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Orders",
  robots: { index: false },
};

/* Order history and sign-in ship with the commerce phase; this page keeps the
 * route stable so nothing links into a 404 meanwhile. */
export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <SectionHeading
        as="h1"
        align="center"
        eyebrow="Your orders"
        title="Order history lives here"
        lead="Sign in arrives together with checkout. Order confirmations and tracking always reach your email either way."
      />
      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link href="/shop">Back to the shop</Link>
        </Button>
      </div>
    </main>
  );
}
