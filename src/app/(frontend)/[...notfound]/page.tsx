import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, NotFoundPanel } from "@/components/brand/not-found-panel";

export const metadata: Metadata = {
  title: "Not found",
  ...NOT_FOUND_METADATA,
};

/**
 * Anything that matches no other route.
 *
 * Single segment URLs are handled by [slug], which looks the page up in the
 * CMS and renders the same panel when it finds nothing. This catches
 * everything deeper: old multi segment WordPress paths, mistyped links, and
 * the endless probing for /wp-admin and friends. Without it those fell through
 * to Next's internal error shell and painted a blank white document.
 */
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ notfound?: string[] }>;
}) {
  const { notfound = [] } = await params;
  const last = notfound[notfound.length - 1] ?? "";

  // A request for a file gets a real 404, blank shell and all. Nobody reads
  // those with their eyes, and answering /favicon-2.png or /style.css with a
  // 200 HTML document misleads browsers, crawlers and caches. Pages, which
  // people do read, keep the designed panel.
  if (/\.[a-z0-9]{2,5}$/i.test(last)) notFound();

  return <NotFoundPanel />;
}
