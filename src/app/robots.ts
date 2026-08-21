import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/media/ is carved out of the /api/ block: every product image
        // serves from there, and blocking it kills Google Images eligibility.
        allow: ["/", "/api/media/"],
        disallow: [
          "/admin",
          "/api/",
          "/checkout",
          "/cart",
          "/account",
          "/access-restricted",
          "/styleguide",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
