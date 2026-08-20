# Redirect map: old WordPress URLs to the rebuild

Source: full sitemap crawl of verboten.co.za (see old-site-recon.md, section 3).
Implemented as permanent (301) redirects in `next.config.ts` during Phase 7.
URLs that keep their slug need no redirect; they are listed for completeness.

| Old URL | New URL | Action |
| --- | --- | --- |
| `/` | `/` | keep |
| `/shop/` | `/shop` | keep (trailing slash normalised by Next) |
| `/product/verboten-premium-brandy-batch-no-01-3-year/` | `/shop/verboten-premium-brandy-batch-no-01-3-year` | 301 |
| `/product/batch-no-01-premium-set-2-bottle/` | `/shop/batch-no-01-premium-set-2-bottle` | 301 |
| `/product/verboten-brandy-cola/` | `/shop/verboten-brandy-cola` | 301 |
| `/product-category/premium-collection/` | `/shop` | 301 |
| `/about-us/` | `/story` | 301 |
| `/contact-us/` | `/contact` | 301 |
| `/verboten-event-hub/` | `/find-us` | 301 (events + stockists live here now) |
| `/responsible-enjoyment/` | `/responsible-enjoyment` | keep |
| `/shipping-returns/` | `/shipping-returns` | keep |
| `/privacy-policy/` | `/privacy-policy` | keep |
| `/terms-conditions/` | `/terms-conditions` | keep |
| `/cart/` | `/cart` | keep |
| `/checkout/` | `/checkout` | keep |
| `/my-account/` | `/account` | 301 |
| `/wishlist/` | `/shop` | 301 (no wishlist in the rebuild) |

Notes:

- Product slugs are preserved exactly so product URL equity transfers 1:1; only
  the `/product/` prefix changes to `/shop/`.
- WordPress serves everything with trailing slashes; Next normalises to no
  trailing slash. The redirect rules must match both forms.
- `/wp-content/...` asset URLs are not redirected; they 404 harmlessly after
  cutover and drop out of caches.
