# Launch checklist: what only the owner can do

The code side of launch is done and committed. Everything below needs an
account login, a legal answer, or a fact only the house knows. Work top to
bottom: the first section blocks launch, the rest decides how fast it grows.

Sources for every rule quoted here are in the research run of 15 September
2026: the DF-SA Alcohol Industry Communications Code of Conduct (2026 edition),
the CPA regulations of 15 April 2026 (GN R.7380), the Information Regulator's
direct marketing guidance note (December 2024), the Liquor Products Act brandy
regulations as amended by GN R.5976, and Google's and Meta's own documentation.

---

## 1. Before launch (blocking)

### Security
- [ ] **Change the live admin password.** The old development password was
      published in the public GitHub repo's history. Treat it as known.
- [ ] **Make the GitHub repo private** (github.com/rvgmondo/verboten, Settings,
      Danger zone). It is public and is the top search result for "verboten
      spirits". cPanel then needs a deploy key: cPanel, Git Version Control,
      Manage, copy the SSH key into the repo's Settings, Deploy keys.

### Facts the site states that only you can confirm
- [ ] **Which legal class is Verboten Premium Brandy?** Pot still brandy, vintage
      brandy, or brandy (the blended class). The site says "three years in oak".
      That is true of the whole bottle only for pot still brandy. If it is the
      blended class, the product copy has to change.
- [ ] **Does NYX qualify as a liqueur?** The regulations require at least 75 g
      of sugar per litre for anything called a liqueur. The site calls NYX a
      liquorice liqueur and is selling it now.
- [ ] **Settle the Shipping & Returns page.** It says orders are "processed
      within 1 to 2 business days" and, in the next line, that the release
      "dispatches within 1 to 2 weeks". Pick one. Google Merchant Center settings
      must match whatever the page says.
- [ ] **Gin ABV.** Not on the site because it was never supplied.

### Direct marketing law (before the first newsletter goes out)
- [ ] **Register as a direct marketer on the National Consumer Commission's
      opt-out registry**, and renew yearly. Since 15 April 2026 this applies to
      anyone sending direct marketing, with no stated carve-out for people who
      subscribed. Reported fees: about R2,574 to register, R1,930.50 a year to
      renew, R0.12 per address checked. Confirm with the NCC or an attorney.
- [ ] **Check the newsletter list against the registry every month.**
- [ ] **Add a street address.** Every marketing email must show a physical
      address. Site Settings, Contact, Address currently holds only "Silverton,
      Pretoria, Gauteng, 0184". Emails print whatever is there.
- [ ] **Make sure privacy@verboten.co.za receives mail.** The privacy policy
      sends requests there.
- [ ] **Register an Information Officer** with the Information Regulator
      (inforegulator.org.za), as POPIA requires of every responsible party.
- [ ] Send marketing email only inside the consumer protection windows:
      weekdays 08:00 to 20:00, Saturdays 09:00 to 13:00, never Sundays or public
      holidays. Whether this covers email is unsettled, so stay inside it.

---

## 2. Deploy this release

In the order AGENTS.md gives, with these specifics:

- [ ] `node scripts/ensure-schema.mjs` on the server. This release adds the
      stock alerts table, order attribution columns, the sale reporting guard and
      the Site Settings measurement fields. The app errors on orders without it.
- [ ] `node scripts/update-live-copy.mjs`. Carries the rewritten brandy article,
      the new privacy policy, the responsibility wording and the product copy
      without alcohol strength.
- [ ] `node scripts/rebuild-image-variants.mjs --write` if not already run.
- [ ] Kill node, restart, purge Cloudflare, check twice.
- [ ] Set up the nightly backup cron (see Backups in AGENTS.md) if it is not
      already there.

---

## 3. Measurement

Nothing loads for a visitor until they accept it in the cookie banner, and the
banner only appears once at least one ID below is filled in.

### Google Analytics 4
- [ ] Create a GA4 property (analytics.google.com), time zone South Africa,
      currency ZAR. Create a Web data stream for https://verboten.co.za.
- [ ] Paste the measurement ID (starts with G-) into **Site Settings,
      Measurement**. No deploy needed.
- [ ] In the stream, Measurement Protocol API secrets, create a secret and set
      it as **GA_API_SECRET** in the cPanel app's environment variables, then
      restart. This is what reports sales from the server when PayFast confirms
      payment, so sales count even when the buyer never returns to the site.
- [ ] Admin, Data streams, Configure tag settings, **List unwanted referrals**:
      add `payfast.co.za` and `payfast.io`. Without this, every buyer returning
      from PayFast is counted as a new visit from PayFast and the Instagram or
      ad that brought them is lost.
- [ ] Mark **purchase** as a key event.
- [ ] Set data retention to 14 months (Admin, Data collection and modification,
      Data retention). The privacy policy refers to this setting.

### Search Console
- [ ] Add a **Domain property** for verboten.co.za. Verify with the TXT record it
      gives you, added in Cloudflare DNS. Covers www and http and survives any
      rebuild.
- [ ] Submit `https://verboten.co.za/sitemap.xml`.
- [ ] Link Search Console to the GA4 property (GA Admin, Product links).
- [ ] Once the repo is private, use **Remove outdated content**
      (search.google.com/search-console/remove-outdated-content) for the GitHub
      URL that ranks for the brand.
- [ ] Optional: Bing Webmaster Tools, import from Search Console in one click.

### Meta (Facebook and Instagram ads)
- [ ] Meta Business Suite, Events Manager, create a **Pixel** (dataset). Paste
      the Pixel ID into **Site Settings, Measurement**.
- [ ] In the dataset settings, generate a **Conversions API access token** and
      set it as **META_CAPI_TOKEN** in cPanel, then restart. Sales are reported
      from the server for buyers who allowed advertising cookies.
- [ ] Verify the domain verboten.co.za in Business Settings, Brand safety.
- [ ] Catalogue: Commerce Manager, add a catalogue, data source, scheduled feed,
      URL `https://verboten.co.za/feeds/products.xml`, daily. Connect the Pixel
      to the catalogue. Meta forbids selling alcohol through Facebook or
      Instagram Shops, so this catalogue is for ads only.

### Google Merchant Center
- [ ] Create an account, verify and claim verboten.co.za (it can use the Search
      Console verification).
- [ ] Products, Add products from a file, scheduled fetch, URL
      `https://verboten.co.za/feeds/products.xml`, daily.
- [ ] Shipping: South Africa, R150 flat, free from R2,500, with the handling time
      you settled above.
- [ ] Returns: 14 days for unopened bottles, matching the Shipping & Returns page.
- [ ] **GTINs.** If the bottles carry barcodes, add them per product (tell the
      developer, the feed will pick them up). Google says products with missing
      or wrong GTINs may get limited visibility.

---

## 4. Advertising rules that now apply to every post and ad

The DF-SA code binds non-members through the Advertising Regulatory Board, and
Google and Meta both require compliance with local industry codes.

- **No alcohol strength** (43%, 5%) in ads, social posts, emails or catalogue
  text. The product page spec row stays as factual label information.
- **Every post and ad carries a responsibility message**, in the code's exact
  wording: "Not for Persons Under the Age of 18", "Don't Drink and Drive." or
  "Pregnant Women Should Not Drink Alcohol." On Instagram-sized formats the
  "Not for Persons Under the Age of 18" token is enough.
- **Audience at least 70% adult.** On Meta, target 18+ and exclude nothing that
  widens it. On Google Ads, alcohol ads are allowed in South Africa; Google
  changes its alcohol policy on 30 September 2026, so re-read it before
  spending.
- **Paid influencers** must look at least 25, have audiences confirmed 70% or
  more adult, a written contract, and label posts #ad. Use Meta's branded
  content tool, age restricted to 18+.
- **Competitions** must state that under 18s cannot enter.
- Nothing that encourages fast or heavy drinking. No health, social or
  performance claims. Tasting samples at events: 100 ml at most.
- Campaign links: add `utm_source`, `utm_medium` and `utm_campaign` to every ad
  and bio link. Each order records them in the admin (Orders, Where this order
  came from), so you can see which posts actually sell.

---

## 5. Growth work that needs you

- [ ] **Product photography for NYX and the blood orange gin.** Until then their
      pages, structured data and feed entries use a text share card, which
      Google and Meta rank below a real bottle shot. JPEG or PNG, at least
      1024 px square, on black like the others.
- [ ] **Google Business Profile is not available** without a staffed storefront
      customers can visit. If the house ever opens a tasting room, list it then.
- [ ] Ask the **SA Brandy Foundation** about listing Verboten. None of its 20
      Brandy Homes is in Gauteng, which is a story worth telling them.
- [ ] Check **Cloudflare, Security, Bots**: if AI crawler blocking is on, confirm
      Googlebot and Bingbot are still allowed.
- [ ] Journal topics with little competition, from the search research: how to
      read a South African brandy label, brandy gifts, a Gauteng brandy house,
      mobile bar hire in Pretoria and Johannesburg.
