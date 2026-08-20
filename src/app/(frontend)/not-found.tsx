import Link from "next/link";

import { Crest } from "@/components/brand/crest";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Crest className="h-16 w-16 text-gold-dim" aria-hidden="true" />
      <div className="space-y-3">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          This page is forbidden. Or missing.
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-parch">
          Either way, there is nothing to pour here. The shop is stocked, though.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/shop">To the shop</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
