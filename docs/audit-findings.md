# Verified audit findings, round three

### 1. [high] [regression-commerce] src/app/actions/checkout.ts:212
The new quoted-total guard is an unrecoverable dead end at checkout

WHY: The hidden quotedTotalCents input (checkout-form.tsx:196) is computed from cart prices snapshotted into localStorage at add-to-cart time; src/lib/cart.tsx never re-prices stored items on load, and the failure shape (CheckoutResult, checkout.ts:75) carries only message and fieldErrors, so nothing in the response updates the number on screen. The moment a price goes up in the admin, every shopper already holding that item is refused, the summary still shows the old total, and pressing the button again reproduces the identical refusal. The message tells them to look at an updated amount that never appears and never says to empty the cart, so the sale is lost with no route forward. The same trap catches a code typed into the box but not applied: at a subtotal just over the R2500 free-delivery line (say R2550 with a R100-off code) the post-discount goods drop under the threshold, delivery is re-added, and the server total lands above the quoted one, which is exactly the case the comment two lines above claims is safe because the total can only go down.

FIX: Do not hard-refuse. Return the recomputed total (and the per-line prices) in the failure result and have the checkout form write them back into cart state so the summary actually changes, then let the buyer confirm the new number. At minimum, only refuse when the difference is not explained by the client's own stale discount state, and tell the buyer the concrete new amount in the message.

### 2. [high] [regression-frontend] src/components/checkout/checkout-form.tsx:130
Stale discount preview plus the new quotedTotalCents guard permanently blocks checkout after a cart edit

WHY: `discount` holds an absolute cents amount frozen at the moment Apply was pressed. It is invalidated when the code text changes but never when the cart changes. Shopper on /checkout applies a 10 percent code at R1350 (discount R135), then opens the cart drawer in the header and removes a bottle. Subtotal is now R900 but the summary still shows -R135, so quotedTotalCents is submitted as 900 - 135 + 150 = R915. The server recomputes 10 percent of R900 = R90, totalCents = R960, which is greater than R915, so it refuses. Pressing Pay again submits the identical stale quotedTotalCents and fails identically, forever. The error text tells the buyer to look at the updated amount and place the order again, but the amount on screen never updates. The only escape is to edit the discount box or reload. Before this diff there was no quotedTotalCents field, so the same stale display simply resulted in the correct server total being charged; the new guard turns a cosmetic drift into an unrecoverable dead end on the one page that takes money. The summary also shows a discount and a total that are both wrong.

FIX: Invalidate the preview whenever the cart changes, not just when the code text changes. Add `React.useEffect(() => setDiscount(null), [subtotalCents])` (or re-run previewDiscount against the new subtotal), so the summary and the hidden quotedTotalCents always describe the cart actually being submitted.

### 3. [high] [catalogue] src/app/(frontend)/page.tsx:197
The site invents a founding team: "Two founders" is published on the homepage, the story page and llms.txt

WHY: The business is run by one person. "Two founders" is a fabricated fact about the company, published on the two highest-traffic pages and, worse, in llms.txt, which is the file that exists specifically so AI assistants repeat the house's facts instead of guessing. Once an assistant reads it, the invented headcount propagates into answers about the brand that Verboten cannot correct. The copy rules forbid invented facts about the company outright, and the recon dossier the copy claims to be sourced from explicitly flags this as unknown.

FIX: Remove the founder count from all four surfaces. The sentence works without it: "Pretoria, 2020. A conviction that the best traditions start with someone breaking the rules, and a spirit made to prove it." Update src/app/(frontend)/page.tsx:197, src/app/(frontend)/story/page.tsx:15, src/seed/content.ts:16 and :20, src/app/llms.txt/route.ts:34, and scripts/update-live-copy.mjs:213 and :219 together, then re-run the copy script so the live database matches. Do not replace it with "a founder" or any other headcount until the client states one.

### 4. [medium] [regression-commerce] src/app/actions/checkout.ts:306
A discount use can be handed back twice, freeing a code past its cap

WHY: By this point payload.create has already succeeded, so the order row exists with discountCode set and discountReleased still false (default in Orders.ts:112-120). Nothing marks the release on the order. When the owner later cancels that stale pending order, the Orders afterChange hook calls applyCancelledSideEffects, whose only guard is `if (!order.discountCode || order.discountReleased) return;` (src/lib/commerce/lifecycle.ts:82) — it passes, and releaseDiscountUse decrements used_count a second time for a single claim. Concretely: SUMMER is capped at 1 use; buyer A's redirect build throws, claim 1 is taken and given back (used_count 0); buyer B redeems it properly (used_count 1); the owner cancels A's abandoned order and used_count drops back to 0, so SUMMER is live again for a third shopper. applyCancelledSideEffects has the same shape internally: releaseDiscount runs at line 84 and the discountReleased flag is only written afterwards at line 85, so a failure of that second write leaves the same double-release open.

FIX: Make the release and the flag one operation keyed on the order: in the checkout catch, set discountReleased: true on the created order (with context skipLifecycle) in the same step as releaseDiscount; in applyCancelledSideEffects, claim the flag with a guarded update first and only release the code if that update actually matched a row.

### 5. [medium] [regression-commerce] src/app/api/payfast/notify/route.ts:105
Amount-mismatch ITNs re-alert staff and wipe internalNotes on every redelivery

WHY: This is the only branch that returns a non-200 for a notification that passed verification, and the file's own comment at line 54 says PayFast retries notifications. The order is deliberately left at pending_payment, so the guard at line 56 does not catch the retry: each redelivery re-enters this branch, re-sends the staff reconcile alert added in this change, and rewrites internalNotes with the template at line 97 — which, unlike the paid_after_cancel branch at line 73, does not prepend order.internalNotes, so anything the owner typed into that box while investigating is destroyed on the next retry. One mismatched payment therefore produces a run of identical alert emails and silently erases the owner's own working notes on the record. needsAttention is already set to amount_mismatch on the first pass and is not consulted.

FIX: Guard the branch on the order not already being flagged (order.needsAttention !== "amount_mismatch" or payment.reference already equal to verified.reference) before writing and alerting, prepend to internalNotes the way the paid_after_cancel branch does, and return 200 so PayFast stops retrying a notification a human now owns.

### 6. [medium] [regression-frontend] src/app/(frontend)/[...notfound]/page.tsx:20
Catch-all not-found answers missing static asset paths with a 200 HTML document

WHY: The route was written for mistyped page URLs and /wp-admin probing, and NotFoundPanel documents the 200-instead-of-404 trade-off for HTML pages. But a root catch-all also swallows every unmatched non-HTML path. A missing JS chunk, favicon, or image now returns a 39.7 KB fully server-rendered HTML page with a 200 status instead of a cheap 404. Practical consequences on a shared cPanel host: every bot probe for an asset costs a full React render plus 40 KB of egress rather than a near-free 404; a browser asking for a script gets text/html and, with the X-Content-Type-Options: nosniff header this app sets, the load is blocked rather than cleanly missing; broken <img> and <link> URLs each pull 40 KB; and uptime or Search Console tooling can no longer tell a missing asset from a live page.

FIX: Keep the panel for document requests only. Either move the catch-all behind a segment that cannot match asset paths, or gate it in middleware/the component so paths with a file extension and /_next/* fall through to a real 404 instead of rendering the panel.

### 7. [medium] [regression-frontend] src/app/(frontend)/story/page.tsx:21
/story renders the not-found panel while still declaring itself indexable with a canonical URL

WHY: story/page.tsx is the only route that swapped notFound() for NotFoundPanel without moving to a generateMetadata that can return NOT_FOUND_METADATA. If the `story` CMS page is ever unpublished, renamed, or missing after a restore, /story serves a 200 with the not-found panel as its body while advertising the Our Story title, description and a self-canonical. Previously notFound() returned a real 404 and nothing was indexable. Google indexes it as a soft 404 against a page the shop actively links to from the header and footer.

FIX: Convert the static `metadata` export to `generateMetadata` that fetches the page and returns `NOT_FOUND_METADATA` when it is missing, matching what [slug], shop/[slug] and journal/[slug] already do.

### 8. [medium] [regression-email] src/collections/Customers.ts:36
The password reset email ships HTML only; its plain text part is dead code

WHY: src/lib/emails.ts:22-25 states the invariant for this whole module: "The text part is not vestigial. It is what spam filters read... Both parts must always say the same thing." The one email that must land in the inbox, for a customer already locked out of the shop, is the single one sent as a lone HTML part. A single-part text/html message scores worse on spam filters than multipart/alternative, and renders as nothing usable in a text-only client.

FIX: Payload gives no text hook here, so either wrap the adapter: in payload.config.ts keep the nodemailerAdapter but return a sendEmail that fills in a derived `text` when a message arrives with `html` and no `text`, or take the send over yourself: set `forgotPassword.disableEmail` (or use the afterForgotPassword hook) and call payload.sendEmail with subject, text and html from accountResetEmail(link), the way sendAccountVerification already does.

### 9. [medium] [regression-email] src/lib/emails.ts:280
The customer's note is dropped from the staff alert's plain text part

WHY: The customer note is where "leave it with the neighbour at number 12" or "gift, no invoice in the box" arrives. The module header at lines 22-25 promises the two parts can never end up saying different things, and this is the only content block where they do. A note read only in the HTML view is a note the owner can miss on the version his phone or his filter shows him, and the order ships wrong.

FIX: Add the note to the text body next to the shipping block, for example insert `${order.customerNote ? `Note from the customer:\n  ${order.customerNote}\n\n` : ""}` immediately before the `Open the admin` sentence, mirroring the conditional the HTML already uses.

### 10. [medium] [regression-email] src/lib/emails.ts:397
Banned middot character in the customer-facing email footer

WHY: The house copy rule is absolute and is repeated in AGENTS.md: no em dashes, en dashes, ellipsis characters or middots anywhere, and it names the exact grep to run before delivering. Writing it as an HTML entity rather than the literal character slips past that grep but reaches the reader as the identical glyph, so the rule is broken in the one place nobody looks at again after it is sent.

FIX: Use a separator the rules allow. In ackFooterHtml join with `" / "` or `"<br>"`, and at line 352 write `` muted(`${esc(order.customerName)}, ${esc(order.email)}`) ``. Then widen the pre-delivery grep to catch the entity forms as well as the raw characters.

### 11. [medium] [compliance] src/seed/content.ts:66
Terms state courier ID verification as fact; the rest of the site says "may"

WHY: The terms of sale claim a third age-verification control as something that happens on every delivery, while the operational page incorporated into those same terms, and the email the buyer actually receives, describe it as optional. One of the two is wrong on a page a regulator or a complainant would read first, and the strong version is a guarantee a generic South African courier does not provide unless that service is specifically bought. Overstating an age control in binding terms is a worse position than stating the real one.

FIX: Bring line 66 and line 176 into line with what actually happens: say the courier may ask for identification and that alcohol is handed only to someone 18 or older, matching line 148 and the shipped email. If ID-on-delivery is genuinely purchased from the courier, keep the strong wording and record which service provides it, so the claim can be evidenced.
