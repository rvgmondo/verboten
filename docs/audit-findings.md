# Verified audit findings, round two

### 1. [high] [emptystates] src/components/checkout/checkout-form.tsx:146
Checkout server-renders "Your cart is empty" to every shopper before hydration

WHY: This is the money page. A shopper on a mid range Android on mobile data taps "Go to checkout" and the first thing painted is a panel telling them their cart is empty, with a button labelled "Browse the shop" as the only action, until the JS bundle downloads, hydrates and swaps in the form. On a slow connection that window is seconds long. Anyone who believes it and taps the button loses the checkout. Every returning shopper hits this on every visit, and it also means the checkout page has no server-rendered content for the one page where a stall is most expensive.

FIX: Expose `hydrated` on the cart context value in src/lib/cart.tsx line 111, and in checkout-form.tsx gate the empty state on it: render a skeleton of the form and summary while `!hydrated`, and only show "Your cart is empty" once hydration has actually read localStorage. The same guard belongs in the cart drawer's `items.length === 0` branch.

### 2. [high] [emptystates] src/app/(frontend)/not-found.tsx:6
Every 404 serves a blank HTML document with no content, styles or links

WHY: Next falls back to its internal error shell because `not-found.tsx` lives inside the `(frontend)` route group and there is no top-level `src/app/layout.tsx` to anchor a root not-found. A visitor following an old batch-numbered URL or a stale link on a mid range Android gets a white screen for as long as the bundle takes, and with JS blocked or failing gets a permanently blank page with no route back into the shop. Link preview scrapers and crawlers see an empty document.

FIX: Add a top-level `src/app/not-found.tsx` (and the minimal root layout Next needs to render it) that server-renders the same crest, copy and shop/home buttons, so a 404 is real HTML with the stylesheet linked. Then curl a bad URL and confirm the heading appears in the raw response.

### 3. [high] [mobile] src/components/shop/gallery.tsx:34
Product page preloads a 1.49 MB original PNG with no srcset, because next/image is used where images.unoptimized strips it

WHY: This is the LCP image on the R45 impulse product's page, and it is preloaded at highest priority ahead of everything else. On a mid range Android on South African mobile data that is roughly 1.5 MB before the page can paint, for a slot 280 CSS px wide, when 296 KB would already be oversized for it. The rest of the site got this right; the money page is the one place that did not.

FIX: Render the gallery's main shot through CmsImage (or build the set by hand with mediaSrcSet from src/lib/media.ts) so it emits a real srcset from Payload's variants, and pass the Media doc into ProductGallery instead of a pre-resolved 1200px url. Separately, the seeded media has no Payload-generated thumbnail/card/feature/hero variants at all (only the WordPress 400x400 / 768x768 / 1200x630 files), so the widest candidate is the 1066px original and mediaSrcAt(m, 1200) can never do better than that. Re-uploading verboten-brandy-cola-1.png through the admin will generate the WebP variants the collection is already configured for at src/collections/Media.ts:43-49 and drop it another order of magnitude.

### 4. [high] [admin] src/collections/Orders.ts:267
Marking an order Paid or Cancelled in the admin runs no commerce logic, only email

WHY: A one-person SA brandy house takes EFT and cash at markets constantly. The owner opens the order, picks Paid, and the buyer receives the real "Payment received. VB-xxxx is yours." email, so it looks like it worked. Stock is never decremented. Every hand-marked sale inflates inventory permanently, and that drift is exactly what produces the overselling the webhook works hard to detect. The same applies in reverse: hand-cancelling an order never returns the discount use, so a single-use code stays burnt for a sale that never happened. The field description actively teaches the wrong mental model, telling the owner the dropdown is a notification switch.

FIX: Extract the paid-transition side effects from notify/route.ts (decrementStockForOrder, then the oversold flag write) into a shared function and call it from the Orders afterChange hook on any transition into `paid`, guarded by a new readOnly `stockMoved` checkbox so the webhook path cannot double-decrement. Call releaseDiscount on transitions into `cancelled` and `refunded` when order.discountCode is set, guarded by a `discountReleased` flag. Then rewrite Orders.ts:66 to describe what actually happens: that Paid also takes the stock off the shelf, and Cancelled hands the discount code back.

### 5. [high] [admin] src/app/api/payfast/notify/route.ts:81
A payment that needs reconciling is invisible: no alert, and it looks like an abandoned cart

WHY: src/app/actions/checkout.ts:245 creates every order at `pending_payment`, so abandoned checkouts pile up in that state. A real order where PayFast took money that does not match the total sits in the same list, same status, same columns, with zero email and nothing to sort or filter on. The owner's only route to it is opening every pending order one at a time and scrolling to a textarea near the bottom. The code comment at line 117 claims "the order says so on its face" but the face the owner actually reads, the list, says nothing. This is real money going unreconciled, and the server log where it is also recorded is not somewhere a non-developer on cPanel will ever look.

FIX: Add a readOnly sidebar select `needsAttention` to Orders (values: none / amount mismatch / paid after cancellation / oversold), set it in each of the three branches alongside the internalNotes write, and put it in defaultColumns so a flagged order is visible from the list. Send a staff email in those branches too: add a sendStaffReconcileAlert to src/lib/emails.ts, addressed like sendStaffNewOrderAlert (settings.contact.notificationsEmail with the ordersEmail fallback), and call it before the 400 return at line 85 and inside the branches at lines 57 and 123.

### 6. [high] [email] src/lib/emails.ts:54
A declined card emails the buyer "cancelled, refund on its way" when no money was ever taken

WHY: Every failed card on a mid range Android on mobile data now produces an email that says the order is cancelled and implies a refund is coming for money that was never taken. The buyer either waits for a refund that will never arrive and eventually emails to chase it, or reads it as "the shop cancelled my order" and does not come back. Nowhere does it say the payment did not go through, and there is no link to try again, so a recoverable sale is turned into a support ticket. One person answers that inbox.

FIX: Split the two meanings. In the notify route's failed branch, suppress the generic status email (set a flag on req.context that the afterChange hook checks) and send a dedicated payment-failed message instead: say the payment did not go through, that nothing was charged, and give the checkout link so they can retry. Keep the refund sentence only for a genuine staff cancellation of a paid order.

### 7. [high] [email] src/collections/Customers.ts:26
Customer password reset is broken and sends shoppers into the staff admin panel

WHY: A shopper who forgets their password is told a reset email is on its way, receives generic system copy in no brand voice, and the link drops them on the staff admin login area. Even there the token belongs to a customers document while the form submits against the users collection, so it can only ever answer that the token is invalid. The account is permanently unreachable, and the paid confirmation email points people at /account as the place to look their order up.

FIX: Add `forgotPassword: { generateEmailSubject, generateEmailHTML }` to the Customers auth block, in the same voice as the existing verify email, linking to a real customer page such as /account/reset?token=..., and build that page to POST the token and new password to /api/customers/reset-password. Until that page exists, hide the "Forgot your password?" button rather than promising a reset the site cannot deliver.

### 8. [high] [email] src/lib/emails.ts:207
The newsletter has no unsubscribe anywhere, while the site promises one in writing

WHY: The privacy page makes a factual claim about the site's own behaviour that is false, which is exactly the kind of statement POPIA direct marketing complaints turn on, and it is the sort of claim a real business should not publish about itself. Practically, the only way off the list is to email the owner and hope he opens the admin. Mail with no unsubscribe link and no List-Unsubscribe header is also a standard spam signal at Gmail, which will push future release announcements out of the inbox for the whole list.

FIX: Store a stable unsubscribe token on each Subscribers document, add a /newsletter/unsubscribe route that sets status to "unsubscribed" from that token, append the link to sendNewsletterWelcome and to anything else sent to the list, and set a List-Unsubscribe header on those sends. If an unsubscribe is not going to be built, the sentence at src/seed/content.ts:106 and the line at newsletter-form.tsx:58 have to stop claiming one exists.

### 9. [high] [conversion] src/lib/inventory.ts:50
The flagship product page's only upsell to the R850 set renders "Sold out" while the set is in stock

WHY: The flagship at R450 is the page most buyers land on, and the two bottle set at R850 is the single biggest lever on order value on the whole site. Its cross-sell card is struck out as unavailable and greyed to 80% opacity. Worse, src/app/(frontend)/shop/[slug]/page.tsx:75 caps the section with `.slice(0, 2)`, so of four related products only two show, and one of the two is the false sold-out. The flagship effectively carries one working cross-sell. A shopper who wanted two bottles now believes they cannot have them, and the R400 upsell is dead. The same silent degradation will mislabel any batch-mode product nested anywhere on the site, and it fails closed toward "cannot buy".

FIX: Do not let an unresolved relation mean zero stock. In getAvailability, when `product.inventory?.mode === "batch"` but the batch relation came back as a number, return `{ available: null, soldOut: false }` (the untracked case the bundle loop at line 39 already skips cleanly) instead of falling through to stockQty. Then raise the query in src/lib/data.ts:35 to `depth: 3` so nested bundle components resolve their batch for real. Verify by curling /shop/verboten-premium-brandy and confirming the set card no longer carries the Sold out span. Also reconsider `.slice(0, 2)` on line 75 now that four related products are authored.

### 10. [high] [resilience] src/payload.config.ts:93
SQLite runs with no transactions, so an SMTP failure during signup leaves a dead account that permanently blocks that email

WHY: When SMTP is down (a cPanel mail relay hitting its hourly send cap is routine), payload.sendEmail throws, create.js rolls nothing back because there is no transaction, and POST /api/customers returns 500 with the customer row already committed. src/components/account/account-auth.tsx:51-58 then shows the shopper "That account could not be created. The email may already be in use." They retry, and now that message is literally true: the orphan row rejects the email as a duplicate. No verification email was ever sent, there is no resend-verification endpoint or UI anywhere in src (grep for resend/verify-email returns nothing outside the token-consuming page at src/app/(frontend)/account/verify/page.tsx), and login only tells them to use a link that does not exist. That address is locked out of the site forever until the owner, who is not a developer, finds and deletes the row in /admin. The same missing-transaction fact also means the checkout order create and the multi-write ITN webhook sequence are non-atomic.

FIX: Pass transactionOptions to the sqlite adapter so Payload actually opens and rolls back transactions: `sqliteAdapter({ client: { ... }, transactionOptions: {} })`. That alone makes the failed signup roll the row back, so a retry after SMTP recovers works. Belt and braces for the one-person business: create customers from a small server action that calls payload.create with `disableVerificationEmail: true`, then sends the verification mail yourself in a try/catch, and on send failure delete the just-created row and return "We could not send your confirmation email just then. Try again in a few minutes." instead of the misleading duplicate-email copy.

### 11. [high] [resilience] src/app/api/payfast/notify/route.ts:23
A PayFast notification that fails verification is answered 400 and logged nowhere, so a real payment can vanish with no trace

WHY: This is the one branch in the file with no logging, and it is the branch that fires when a dependency fails rather than when an attacker calls. Every other outcome in this route calls payload.logger (lines 40, 53, 72, 122). If the shared cPanel box cannot reach www.payfast.co.za for the server-to-server validate (outbound HTTPS blocked or hanging, PayFast maintenance, DNS wobble), or PAYFAST_PASSPHRASE drifts from the dashboard value, the buyer is charged, the ITN is rejected 400, the order stays pending_payment forever, no staff alert is sent (that only happens on the complete path at line 138), and there is not one line anywhere saying it happened. The owner's first signal is a customer asking where their brandy is. .env is excluded from the rsync in .cpanel.yml:15 and gitignored, so it is hand-maintained on the server and drift is a live possibility.

FIX: Log every rejection with the m_payment_id parsed from the body and the reason (bad signature vs merchant mismatch vs remote validate unreachable) before returning; none of that is sensitive. Have verifyWebhook distinguish "this notification is forged" from "I could not reach PayFast to check" and return 500 for the latter so PayFast retries into a working window, keeping 400 only for genuine signature/merchant failures. Add an AbortSignal.timeout (10s or so) to the validate fetch so a hung connection fails fast instead of holding the request. Since the shop is one person, also email ADMIN_NOTIFICATIONS_EMAIL when a validate call is unreachable, and consider a nightly check for orders left in pending_payment for over an hour.

### 12. [medium] [emptystates] src/app/actions/checkout.ts:292
A PayFast configuration error crashes the whole checkout page after the order is already created

WHY: By line 292 the order row exists at `pending_payment` and `claimDiscount` has already burned a use of the code. A throw here escapes the server action, so instead of the inline red message beside the Pay button the buyer's entire page is replaced by (frontend)/error.tsx: "That was not supposed to happen", with only "Try again" and "Home". Their typed name, address and date of birth are gone, the discount use is spent, an unpaid order sits in the admin, and there is no route to payment. On a cPanel host where env vars are set by hand and can be lost on a restart, this is the failure mode that takes the shop down silently while looking like a generic crash.

FIX: Wrap lines 291 to 296 in try/catch. On failure, call `releaseDiscount` the same way the order-creation catch does, log with `payload.logger.error`, and return `{ ok: false, message: "Payment could not be started just then. Nothing was charged. Try again, or contact us with order " + orderNumber + "." }` so the buyer keeps the filled form and has a reference.

### 13. [medium] [mobile] src/components/ui/sheet.tsx:40
Cart drawer is full bleed on a phone, so its only exit is a 24 x 24 px close button

WHY: On a touch device the cart takes over the whole screen and the only way back out is a 24px square in the corner, with no backdrop to tap and no keyboard for Escape. A shopper who opens the cart to check the total and then wants to keep browsing has one small target to find. The steppers next to it are the controls someone uses to buy a second bottle, which is the single highest value interaction in the drawer, at 36 x 32 and 38 x 30.

FIX: Give the Sheet close a real hit area (h-11 w-11 with the icon centred, e.g. "absolute right-2 top-2 flex h-11 w-11 items-center justify-center"), which also stops it crowding the header text. Raise the quantity buttons in cart-drawer.tsx:129/:143 and add-to-cart.tsx:98/:110 to a minimum 44px box (h-11 w-11, or px-4 py-3 with a larger icon). Consider also leaving the drawer short of full bleed on phones (w-[calc(100%-3rem)] or similar) so the backdrop stays tappable.

### 14. [medium] [admin] src/collections/Batches.ts:20
Batches is world-readable, publishing live stock counts and banned public copy

WHY: The owner's stock ledger and sales velocity are a public JSON endpoint any competitor can poll to watch bottles move. The same endpoint serves batch numbering and "limited edition" framing, which are banned on public surfaces and which the site's own llms.txt explicitly denies exist, so an AI crawler reading both gets a direct contradiction from the same domain. The field description compounds it for the lens that matters here: the owner is told to write a batch narrative for product pages, writes it, and it appears nowhere. Nothing on the site needs this access, because the public read layer in src/lib/data.ts goes through the Payload Local API (payload.find at data.ts:32, depth 2), which bypasses access control by default and populates the batch relation regardless.

FIX: Change Batches.ts:20 to `read: isAdminOrEditor` (already imported at line 3); the shop pages read through data.ts and are unaffected, and getAvailability keeps working off the populated relation. Then either delete the story field or correct its description at line 43 to say it is internal only, since nothing renders it and the copy rules bar that content from public pages anyway.

### 15. [medium] [email] src/collections/Orders.ts:266
A tracking number entered after the order is marked shipped never reaches the customer

WHY: The natural admin workflow is to mark the order shipped when the courier collects and paste the waybill number in later when it comes through. Do it in that order and the customer gets a shipped email with no tracking number, after being explicitly told one is coming, and no further email is ever sent because the status does not change again. The customer has to email to ask where their parcel is, which is the exact support load tracking numbers exist to remove.

FIX: Also fire on the tracking number appearing: in the afterChange hook, when the status is unchanged but `doc.trackingNumber` is newly set and the status is shipped, send the shipped template again (or a short tracking-only message). Add an admin description on trackingNumber telling staff to enter it before switching the status to shipped.
