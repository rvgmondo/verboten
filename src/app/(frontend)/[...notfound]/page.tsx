import type { Metadata } from "next";

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
export default function CatchAllNotFound() {
  return <NotFoundPanel />;
}
