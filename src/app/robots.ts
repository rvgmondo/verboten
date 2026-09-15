import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Only what must never be crawled is blocked here.
 *
 * The account, checkout, tracking and newsletter pages used to be disallowed
 * as well, which sounds tidy and does the opposite of what was meant. They are
 * linked from every page, so Google still learns the URLs; a robots block only
 * stops it reading the noindex on them, and the bare URL can then be indexed
 * with no title. Those pages carry noindex instead, which Google can see.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/media/ is carved out of the /api/ block: every product image
        // serves from there, and blocking it kills Google Images eligibility.
        allow: ["/", "/api/media/"],
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
