import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// CSP compatible with the public site (next/image, self-hosted next/font) and
// the Payload admin (which needs eval + blob workers).
// 'unsafe-eval' is a known trade-off for the CMS admin; tighten with nonces later.
// form-action allows the PayFast checkout redirect (live + sandbox hosts).
const csp = [
  "default-src 'self'",
  // Analytics allowances: Cloudflare Web Analytics beacon + optional GA4.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  `connect-src 'self' https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com${isDev ? " ws: http://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
  "frame-ancestors 'self'",
]
  .concat(isDev ? [] : ["upgrade-insecure-requests"])
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  images: {
    // Serve images directly instead of through Next's /_next/image optimizer.
    // On shared hosting behind a CDN (Cloudflare) the optimizer often fails
    // (it cannot write its cache, and its internal fetch loops through the
    // proxy). Payload already generates sized variants, and Cloudflare caches
    // the delivered files, so direct serving is both reliable and fast here.
    unoptimized: true,
  },
  reactStrictMode: true,
  // TypeScript is the build-time quality gate; run ESLint separately via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Uploaded media never changes under a given filename (Payload writes a
      // new name on re-upload), so it is safe to cache hard. Without this the
      // origin serves every photograph on every visit.
      {
        source: "/api/media/file/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Agent discovery (RFC 8288). Points at llms.txt, which genuinely
      // describes the house, using the registered "describedby" relation.
      // Deliberately NOT an api-catalog link: /api/ is Payload's CMS backend,
      // not a public API, and robots.txt disallows it for the same reason.
      {
        source: "/",
        headers: [
          { key: "Link", value: '</llms.txt>; rel="describedby"; type="text/plain"' },
        ],
      },
      // Brand assets change rarely; a replaced file needs a Cloudflare purge.
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  // 301s preserving the old WordPress site's indexed URLs.
  // The full mapping rationale lives in docs/redirect-map.md.
  async redirects() {
    return [
      // One canonical host. Semrush crawled www and apex as two separate sites,
      // which splits crawl budget, caching and any link equity. Fires only when
      // the Host header is www, so it cannot loop.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.verboten.co.za" }],
        destination: "https://verboten.co.za/:path*",
        permanent: true,
      },
      { source: "/product/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/product-category/:path*", destination: "/shop", permanent: true },
      { source: "/about-us", destination: "/story", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/verboten-event-hub", destination: "/find-us", permanent: true },
      { source: "/my-account", destination: "/account", permanent: true },
      { source: "/wishlist", destination: "/shop", permanent: true },
      // Old WooCommerce cart URL still in the wild; the new cart is a drawer.
      { source: "/cart", destination: "/shop", permanent: true },
      // Batch-numbered product URLs, retired when the flagship was normalised.
      {
        source: "/shop/verboten-premium-brandy-batch-no-01-3-year",
        destination: "/shop/verboten-premium-brandy",
        permanent: true,
      },
      {
        source: "/shop/batch-no-01-premium-set-2-bottle",
        destination: "/shop/verboten-premium-set-2-bottle",
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
