import Link from "next/link";

import { BrandCrest } from "@/components/brand/brand-crest";
import { Button } from "@/components/ui/button";

/**
 * The page a visitor gets when the thing they asked for is not here.
 *
 * Rendered as an ordinary page inside the frontend layout, deliberately, and
 * not through Next's notFound(). The site has two root layouts, (frontend) and
 * (payload), because Payload's admin renders its own <html>. Next cannot wrap
 * a not-found in a layout when there is no root one, so notFound() fell back
 * to its internal error shell: no stylesheet, no content, no header, no way
 * back into the shop. Every dead link led to a white screen.
 *
 * The trade-off is stated plainly: these responses carry 200 rather than 404.
 * Every route that renders this also sets robots noindex, so nothing here gets
 * indexed. Between a correct status code on a blank page and a real page on a
 * soft 404, the shopper who followed a stale link is worth more than the
 * status line, and noindex keeps search engines honest either way.
 */
export const NotFoundPanel = ({
  title = "This page is forbidden. Or missing.",
  lead = "Either way, there is nothing to pour here. The shop is stocked, though.",
}: {
  title?: string;
  lead?: string;
}) => (
  <main className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
    <BrandCrest className="h-16 w-16 text-gold-dim" />
    <div className="space-y-3">
      <p className="eyebrow">Not found</p>
      <h1 className="font-display text-4xl tracking-tight text-bone">{title}</h1>
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-parch">{lead}</p>
    </div>
    <div className="flex flex-wrap justify-center gap-4">
      <Button asChild>
        <Link href="/shop">To the shop</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  </main>
);

/** Every route that renders the panel must also carry this. */
export const NOT_FOUND_METADATA = { robots: { index: false, follow: true } } as const;
