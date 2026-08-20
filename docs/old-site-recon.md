# Verboten Spirits: old-site recon dossier

Notation used in this dossier: the source site uses characters that are banned in Mondobase deliverables. They are transcribed here as [EN DASH] for the en dash, [EM DASH] for the em dash, and [NBH] for the non-breaking hyphen U+2011, so the exact original spelling is preserved without reproducing the characters.

## 1. Verified facts

### Products and prices

**Verboten Premium Brandy [EN DASH] Batch No. 01 (3-Year)**
- URL: /product/verboten-premium-brandy-batch-no-01-3-year/
- Price: R450,00 (schema price valid through 2027-12-31, InStock)
- ABV: 43%
- Bottle size: 750 ml
- Age: minimum 3 years in oak
- Finish: French oak casks
- Batch No. 01, first commercial release, limited to 500 bottles
- Every bottle batch-coded for traceability
- Origin: South Africa; category: Premium Collection
- Tasting notes: nose of warm oak, dried apricot, vanilla; palate of caramel, toasted nuts, subtle spice; long smooth finish
- Serving suggestion: neat or over a single clear cube; pairs with dark chocolate or cured biltong
- schema.org SKU is 27293, which is the WordPress post ID, not a real SKU
- Page published 2025-06-17, last modified 2026-02-03

**Batch No. 01 [EN DASH] Premium Set (2-Bottle)**
- URL: /product/batch-no-01-premium-set-2-bottle/
- Price: R850,00
- Contents: 2 x Verboten Premium Brandy Batch No. 01 (3-Year, 750 ml each, 43% ABV)
- Dispatches within 1-2 weeks; tracking provided; age verification required on delivery (18+)
- No bottle count or numbering given for the set despite limited-stock messaging

**Verboten Brandy & Cola** (nav name: Brandy & Cola Cans)
- URL: /product/verboten-brandy-cola/
- Price: R45,00
- Pre-mixed ready-to-drink brandy and cola cans; sold at "local farmers markets, festivals, and events" per the FAQ
- No ABV, can volume, or pack size stated anywhere on the site

**Unreleased**: "proprietary gin and other premium spirits" stated as in development (contact page FAQ). No specs, no dates.

**Spec contradiction (UNVERIFIED which is correct)**: /shipping-returns/ "CURRENT BATCH NOTES" states the current batch is "Aged 5 years, 43% ALC/VOL" while everything else on the site says 3 years. One of these is wrong; the rebuild must resolve it with the client.

### Shipping, returns, policies
- Order processing 1-2 business days; ships within 1-2 weeks; delivery 3-7 business days
- Rates: R150 for orders under R1,000; R100 for R1,000-R2,499; free over R2,500; "Premium members: Always ship free" (premium membership never defined anywhere)
- Cancellations and returns: 14-day windows via email with order number; transit damage must be reported within 48 hours; original packaging required; refunds processed within 30 days of receipt; opened bottles non-returnable
- Privacy policy cites POPIA by name; dated "Last updated: January 2025"
- Responsible Enjoyment page lists help lines: SADAG 0800 456 789 (UNVERIFIED, flagged as a possible placeholder number; verify against SADAG's real lines before reuse), Alcoholics Anonymous SA 0861 HELP AA (435 722), SANCA 011 892 3829

### Contact details
- Phone as displayed sitewide: +27 (075) 387 3456 (malformed format). The WhatsApp link on the event hub uses phone=27753873456, confirming the real number is +27 75 387 3456
- tel: hrefs are inconsistent: tel:0753873456 (header) and tel:%20075%20387%203456 (footer, encoded leading space)
- Emails: info@verboten.co.za (general, header/footer, cancellations, returns), orders@verboten.co.za (shipping team only), privacy@verboten.co.za (privacy policy only). All Cloudflare-obfuscated in the HTML
- Address: Silverton, Pretoria, Gauteng, 0081. No street address anywhere. Privacy policy body omits "Gauteng"
- Support hours: Monday-Friday, 9am-5pm SAST (shipping page only)
- Contact form fields: Your Name, Your Email, Phone Number, Company, Your Message

### Company legal identity
- Legal name: Verboten Pty Ltd, appearing only in the copyright line "Â© 2026 Verboten Pty Ltd. All Rights Reserved. Powered by Mondobase. Drink Responsibly. Not for Sale to Persons Under the Age of 18."
- NO company registration number, NO VAT number, NO liquor licence number anywhere on the site
- Brand story: established 2020 in Pretoria during lockdown, blending "behind closed doors"; partners with unnamed "South Africa's finest master blenders"; no founder names or personnel anywhere
- Claimed stockists: "select quality bars and restaurants throughout Gauteng" (none named, UNVERIFIED); claimed expansion to Johannesburg, Berlin, Amsterdam, Cape Town (own-site marketing claim, UNVERIFIED)
- Third-party footprint: essentially zero. No press, reviews, awards, SA Brandy Foundation listing, or retailer listings found. Do not confuse with Verboten Brewing (Colorado, USA) or Klub Verboten (UK); unrelated entities

### Social links
- Facebook: https://www.facebook.com/verbotenspirits/ (the canonical link used in footer and contact page; page itself behind login wall, UNVERIFIED content)
- Facebook variant: https://www.facebook.com/verboten.spirits (appears in about-us markup and contact page article:publisher meta; inconsistent with the visible link)
- Instagram: https://www.instagram.com/verbotenspirits/ (verified to exist; profile age-restricted, bio not publicly visible)
- WhatsApp: https://api.whatsapp.com/send?phone=27753873456 (event hub only)
- TikTok: none found (UNVERIFIED absence; bot wall blocked confirmation)

### Platform
- WordPress + WooCommerce, Woodmart theme, Elementor, Contact Form 7, Cloudflare email protection, Slim SEO plus a second OpenGraph emitter (duplicate og tags on some pages), og:locale en_US

## 2. Exact brand lines and Afrikaans phrases

**Afrikaans: there is none.** Every page was checked; no Afrikaans copy or accented characters exist anywhere on the site. The brand name "Verboten" is German for forbidden, echoed only by the age-gate heading "Access forbidden". If the rebuild wants Afrikaans flavour, it must be written from scratch.

Exact English brand lines (spelling and punctuation as in source):

- "Pure Spirit. Pure Mischief" (site tagline, schema.org WebSite description; no trailing full stop)
- "BECOME AN ORIGINAL REBEL: LIMITED STOCK AVAILABLE" (header promo bar)
- "LIMITED STOCK: JOIN THE FIRST WAVE" (header CTA)
- "Limited stock available | Ships within 1-2 weeks" (top bar)
- "Uncompromising Quality" (footer badge)
- "The Spirit of Rebellion" (footer badge; has a trailing space in source)
- "Exceptionally Smooth" (footer badge)
- "Verboten Spirits - South African makers of premium beverages. Drink responsibly. Not for sale to persons under 18." (footer blurb, plain hyphen)
- "Drink Responsibly. Not for Sale to Persons Under the Age of 18." (footer legal line)
- "Verboten Spirits: Uncompromising Quality. Pure Mischief." (about page)
- "Because some traditions are meant to be whispered, not shouted." (about page)
- "A QUIET DEFIANCE" (about page h1)
- "South Africa's Rebellious Beverage House" (self-description, home/about)
- "When you pour Verboten, you're not just pouring a drink[EM DASH]you're pouring a philosophy." (about page)
- "No shortcuts, just pure mischief and premium quality." (FAQ)
- "Our quiet rebellion is against mediocrity, not safety." (Responsible Enjoyment)
- "Be a Responsible Rebel" (Responsible Enjoyment section label)
- "From our Silverton workshop to your glass[EM DASH]every bottle tells a story of quiet rebellion." (shipping page)
- "Part of our ongoing rebellion against ordinary" (shipping page)
- "Watch your rebellion arrive at your door." (shipping page)
- "Your satisfaction matters to our rebellion" (shipping page)
- "Join the rebellion. We'll text you the moment new spirits drop. No spam." (event hub)
- "Pure mischief, ready to drink. Order our premium ice-cold cans." (event hub)
- "Not responsible for skinny dipping, spontaneous marriages, or Karaoke." (event hub joke disclaimer)
- "CRAFTED IN PRETORIA | VERBOTEN.CO.ZA" (event hub footer)
- "LOCK IT IN" (event hub VIP form button)
- "Get notified for future events or specials." (newsletter popup h4, subtitle "Future Events")
- Age gate set: "Are you over 18?" / "You must be 18 years of age or older to view page. Please verify your age to enter." / "I am 18 or Older" / "I am Under 18" / "Access forbidden" / "Your access is restricted because of your age."
- Footer quick links: "The Verboten Story", "Order Your Bottle", "Founder's FAQ" (source uses a curly apostrophe in Founder's)

## 3. Full URL inventory

Pages (for the 301 redirect map):
- https://verboten.co.za/ (homepage; referenced as source in search sweep, NOT extracted in this dataset)
- https://verboten.co.za/shop/ (main shop page; referenced in search sweep, NOT extracted in this dataset)
- https://verboten.co.za/product/verboten-premium-brandy-batch-no-01-3-year/ (product: flagship 3-year brandy, R450,00)
- https://verboten.co.za/product/batch-no-01-premium-set-2-bottle/ (product: 2-bottle set, R850,00)
- https://verboten.co.za/product/verboten-brandy-cola/ (product: RTD cans, R45,00; URL confirmed via related-product links, page itself not extracted)
- https://verboten.co.za/product-category/premium-collection/ (WooCommerce category archive, all 3 products)
- https://verboten.co.za/about-us/ (brand story page)
- https://verboten.co.za/contact-us/ (FAQ + contact form)
- https://verboten.co.za/verboten-event-hub/ (single-scroll teaser landing page, dead CTAs)
- https://verboten.co.za/responsible-enjoyment/ (responsible drinking page)
- https://verboten.co.za/shipping-returns/ (shipping and returns policy)
- https://verboten.co.za/privacy-policy/ (POPIA privacy policy)
- UNVERIFIED: footer quick links "The Verboten Story", "Order Your Bottle", "Founder's FAQ" and WooCommerce cart / my-account pages exist as links but their URLs were not captured; crawl before finalizing the redirect map

External / social:
- https://www.facebook.com/verbotenspirits/ (canonical Facebook link)
- https://www.facebook.com/verboten.spirits (inconsistent second Facebook URL in markup/meta)
- https://www.instagram.com/verbotenspirits/ (Instagram)
- https://api.whatsapp.com/send?phone=27753873456 (WhatsApp contact)

Notable assets (evidence of demo leftovers, not redirect targets):
- /wp-content/themes/woodmart/images/payments.png (theme stock payment icons)
- /wp-content/uploads/2021/10/drinks-18.jpg (2021 theme demo stock image on event hub)
- Theme demo assets: wd-cursor-light.svg, wd-envelope-light.svg, wd-phone-light.svg, drinks-bg-whineyard-last.jpg
- vb_brandy2.jpg (real product photography, og:image on the set page; site's own uploads live in /uploads/2025/06)

## 4. Old copy autopsy

**The two-voice problem.** The rebel identity ("BECOME AN ORIGINAL REBEL", "The Spirit of Rebellion", "Pure Spirit. Pure Mischief") lives entirely in header and footer chrome. The product copy itself is restrained and legalistic, so the brand voice and the selling copy never meet on any page.

**Defensive legalese undercuts premium.** The flagship description leads with "Legally produced South African brandy" and "in accordance with applicable regulations", which reads like pre-empting a suspicion the product is bootleg. The 2-bottle set justifies itself with "guaranteed backup", which is equally defensive.

**Internal notes leaked into customer copy.** The shipping page contains "Future batches may have different positioning" and "Orders move to fulfillment queue", strategy-memo language shipped to customers.

**Dated COVID framing.** The about page hangs the origin story on 2020 lockdown: blending "behind closed doors in Pretoria" "while the world was following orders". Six years on this reads stale and mildly political, and it will age worse.

**Abstract with no proof.** The about page has zero founder names, specs, prices, or proof points, while claiming distribution "expanding to Johannesburg, Berlin, Amsterdam, and Cape Town" for a two-product brand, plus "decades of expertise" for a company founded in 2020. Premium is asserted, never substantiated; there is no numbered-bottle proof of the 500-bottle claim outside the flagship page.

**Demo and placeholder leftovers.** Event hub "Order Now" buttons both link to "#" (dead). Its bottom form uses default Contact Form 7 placeholders "Your name" / "Your email". A 2021 Woodmart demo stock image (drinks-18.jpg) and a vineyard demo background are still served. The footer payment icon strip is the theme's stock payments.png, not the store's actual payment methods. The flagship page has a dangling "Purchase note" label glued to the Origin line with no content. Related-product image alt text is just "Vb".

**Awkward compliance copy.** The age-gate rejection reads "Your access is restricted because of your age." Compliance lines repeat five-plus times per page, giving a box-ticking feel.

**Factual rot.** The 3-year vs "Aged 5 years" contradiction; the malformed phone number in three inconsistent formats; two Facebook URLs; the Instagram icon on the event hub pointing at Facebook; a privacy policy dated January 2025 under a 2026 copyright.

**AI-flavoured typography and phrasing.** En dashes in product names, em dashes in body copy ("pouring a drink[EM DASH]you're pouring a philosophy"), a non-breaking hyphen in "3[NBH]year", mirrored "not X, but Y" constructions throughout the about page. All of it violates the no-AI-typography rule and must not survive the rebuild.

**Structural weakness.** Nearly every visible section heading sitewide is a bold paragraph, not a heading tag; several pages have only an h1 plus hidden-popup h4s; the event hub has no h1 at all.

## 5. Old metadata (as-is)

**/product/verboten-premium-brandy-batch-no-01-3-year/**
- Title: Verboten Premium Brandy [EN DASH] Batch No. 01 (3-Year) - Verboten
- Description: A 3[NBH]year South African brandy, matured in oak, finished in French oak, and bottled at 43% ABV for a quietly smooth, refined finish. Limited stock available - on (truncated mid-word by Slim SEO)

**/product/batch-no-01-premium-set-2-bottle/**
- Title: Batch No. 01 [EN DASH] Premium Set (2-Bottle) - Verboten
- Description: Two bottles from Batch No. 01 (3-Year, 43% ABV). Perfect for gifting or personal collection. 18+ Drink responsibly.

**/product-category/premium-collection/**
- Title: Premium Collection Archives - Verboten (raw WooCommerce default)
- Description: none present; no og:description either

**/about-us/**
- Title: About us - Verboten
- Description: Discover the story behind Verboten Spirits. Born from a quiet defiance in Pretoria, we curate and masterfully blend uncompromising South African spirits.

**/contact-us/**
- Title: Contact us - Verboten
- Description: Have questions about your order or want to stock Verboten Spirits? Get in touch with our team today or read our frequently asked questions.
- Note: duplicate og:title/og:description pairs; second og:description is auto-scraped truncated body text

**/verboten-event-hub/**
- Title: Verboten Event Hub - Verboten
- Description: Inaugural Release BATCH NO. 01 BRANDY 3-year matured. French oak finish. Secure your bottle for the shelf. Order Now BRANDY & COLA CANS Pure mischief, ready to (auto-scraped, cuts mid-sentence)

**/responsible-enjoyment/**
- Title: Responsible Enjoyment - Verboten
- Description: Our Commitment to Responsible Enjoyment At Verboten, we believe that exceptional spirits should be enjoyed exceptionally well. Our commitment to quality extends (auto-scraped, truncated)

**/shipping-returns/**
- Title: Shipping & Returns - Verboten
- Description: Shipping & Returns Getting Verboten to Your Door CURRENT RELEASE SHIPPING Your bottles are ready and labeled. Here's what to expect: Order Processing: 1-2 b (auto-scraped, truncated mid-word)

**/privacy-policy/**
- Title: Privacy Policy - Verboten
- Description: Last updated: January 2025 1. Introduction Verboten Pty Ltd ("we", "our", "Verboten") respects your privacy and is committed to protecting your personal informa (auto-scraped, truncated mid-word)

Sitewide metadata notes: og:locale is en_US on a South African site; only 2 of 8 extracted pages have hand-written meta descriptions (the two product pages, plus about and contact); the rest are auto-scraped truncations.

## 6. Gaps

Facts the rebuild needs that the old site does not provide:

1. Company registration number, VAT number, and liquor licence number (mandatory-grade trust signals for a South African Pty Ltd selling liquor online; none exist anywhere)
2. Street address (only "Silverton, Pretoria, Gauteng, 0081" suburb-level)
3. Founder name(s) and any team or master-blender identities (the site sells a founder-led story with zero named humans; footer even links a "Founder's FAQ")
4. Resolution of the age contradiction: 3-year (everywhere) vs "Aged 5 years" (shipping page batch notes)
5. Correct canonical phone format (+27 75 387 3456 inferred from the WhatsApp link; confirm with client)
6. Canonical Facebook URL (verbotenspirits vs verboten.spirits) and access to both social profiles' actual content
7. Brandy & Cola specs: ABV, can volume, pack size, and whether R45,00 is per can or per pack
8. Real SKUs and batch-numbering scheme (schema SKU is just the WP post ID; "batch-coded for traceability" is claimed but no code format shown)
9. Proof for the 500-bottle limited claim (bottle numbering, remaining stock)
10. Actual accepted payment methods (current icons are theme stock art)
11. Named stockists, bars, restaurants, and the farmers-market/event schedule ("throughout Gauteng" claim is unverifiable)
12. Definition of "Premium members" who "Always ship free" (no membership program exists anywhere on the site)
13. Shipping coverage detail (a SHIPPING COVERAGE section exists but its content was not captured; national vs Gauteng-only unknown)
14. Gin and future-release pipeline: names, specs, dates
15. Homepage and /shop/ page content (not in this extraction; crawl before writing the redirect map and copy)
16. Verified help-line numbers for the responsible-drinking page (SADAG number looks like a placeholder)
17. Privacy policy completeness: cookie policy, retention periods, POPIA Information Regulator complaint route, updated date
18. High-resolution brand assets: logo files, full product photography inventory (only vb_brandy2.jpg confirmed as real photography)
19. Any Afrikaans brand language, if desired (none exists to carry over)
20. Business trading hours beyond the shipping team's Mon-Fri 9am-5pm SAST, and whether WhatsApp is an official support channel sitewide or event-hub-only