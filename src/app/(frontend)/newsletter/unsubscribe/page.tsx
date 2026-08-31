import type { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";

import { BrandBadge } from "@/components/brand/crest";
import { Button } from "@/components/ui/button";

import config from "../../../../payload.config";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

/**
 * One click and they are off the list.
 *
 * No confirmation step and no sign in: making someone work to leave is what
 * turns an unsubscribe into a spam complaint, and POPIA expects withdrawing
 * consent to be as easy as giving it. The row is kept rather than deleted so
 * the consent trail survives, with the status set to unsubscribed.
 *
 * A bad or spent token gets the same quiet answer as a good one, so nobody can
 * use this page to work out whether an address is on the list.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const payload = await getPayload({ config });
    try {
      const found = await payload.find({
        collection: "subscribers",
        where: { unsubscribeToken: { equals: token } },
        limit: 1,
        overrideAccess: true,
      });
      const subscriber = found.docs[0];
      if (subscriber && subscriber.status !== "unsubscribed") {
        await payload.update({
          collection: "subscribers",
          id: subscriber.id,
          data: { status: "unsubscribed" },
          overrideAccess: true,
        });
      }
    } catch (err) {
      // Never show a stranger an error here. Worst case they are still on the
      // list and can reply to any email to be taken off by hand.
      const payload = await getPayload({ config });
      payload.logger.error({ err }, "Unsubscribe failed");
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <BrandBadge className="h-20 w-20" />
      <div className="space-y-4">
        <p className="eyebrow">Done</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          You are off the list.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
          No more release news from us. Nothing changes about any order you have
          placed, and those emails carry on as normal. If you ever want back on,
          the form is at the foot of every page.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/shop">The shop</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
