import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// CSP compatible with the public site (next/image, self-hosted next/font) and
// the Payload admin (which needs eval + blob workers).
// 'unsafe-eval' is a known trade-off for the CMS admin; tighten with nonces later.
// form-action allows the PayFast checkout redirect (live + sandbox hosts).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
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
      { source: "/product/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/product-category/:path*", destination: "/shop", permanent: true },
      { source: "/about-us", destination: "/story", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/verboten-event-hub", destination: "/find-us", permanent: true },
      { source: "/my-account", destination: "/account", permanent: true },
      { source: "/wishlist", destination: "/shop", permanent: true },
      // Old WooCommerce cart URL still in the wild; the new cart is a drawer.
      { source: "/cart", destination: "/shop", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
