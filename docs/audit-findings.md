# Verified audit findings, round four

### 1. [high] [a11y] src/components/checkout/checkout-form.tsx:287
Alpha-modified text tokens (parch/80, parch/60) fall to 3.4–3.7:1 and placeholders to 2.5:1, failing 1.4.3

EVIDENCE: The token comment in src/app/globals.css:12-14 claims "WCAG 2.2 AA verified. Light: ink text 16.3:1, muted 5.1:1". The base tokens do pass — I computed --color-parch #6c6559 on --color-ink #f5f1e6 = 5.11:1. But every place the palette is thinned with a Tailwind alpha modifier was never re-checked, and those are the places carrying the legally required copy.

checkout-form.tsx:287 (verbatim): `              <p id="co-dob-why" className="text-[0.6875rem] text-parch/80">` — the text is "Alcohol law: we confirm you are 18 or older." Checkout is the light theme (src/app/(frontend)/checkout/page.tsx:15 `<main className="mx-auto max-w-6xl px-6 py-16 lg:py-20">`, no `inverse`).

Maths (sRGB relative luminance, WCAG formula, computed with python):
- parch/80 composited = 0.8*#6c6559 + 0.2*#f5f1e6 = #878175. L=0.2196. Against ink #f5f1e6 (L=0.8497): (0.8497+0.05)/(0.2196+0.05) = 3.43:1. Needs 4.5:1 at 11px.
- checkout-form.tsx:449 `        <p className="text-[0.6875rem] leading-relaxed text-parch/80">` ("Drink responsibly. Not for sale to persons under 18. Someone 18 or older must receive the delivery.") sits inside `<aside className="h-fit space-y-6 border border-line bg-coal p-6 ...">` (line 366), so bg is --color-coal #ffffff: 0.8*#6c6559 + 0.2*#fff = #89847a → 3.72:1. Still short of 4.5:1.
- src/components/ui/input.tsx:13 `        "placeholder:text-parch/60",` → 0.6*#6c6559 + 0.4*#ffffff = #a7a39b → 2.51:1 on the white field, and 3.48:1 in the dark theme (parch #b0a891 over coal #1b1b19). This is not decorative on book-the-bar: src/components/booking-form.tsx:87 `          <Input id="bk-date" name="eventDate" placeholder="12 December, or a rough month" />` — the placeholder is the only statement of the accepted date format.
- src/components/home/hero-cinema.tsx:277 `            className="ml-2 flex h-11 items-center justify-center px-3 text-[0.625rem] uppercase tracking-[0.2em] text-parch/60 transition-colors hover:text-parch"` — this is the Play/Pause control the 2.2.2 fix added. Hero is `.inverse` (line 123), so 0.6*#b0a891 + 0.4*#141414 = #726d5f on #141414 → 3.57:1 at 10px.

WHY: On a mid-range Android in daylight the age-verification note, the responsible-drinking statement, the date-format hint and the carousel's own pause control are the four bits of text a low-vision shopper most needs, and they are the four rendered lightest. These are 1.4.3 failures on regulated alcohol copy, so it is a compliance problem as well as an accessibility one.

FIX: Drop the alpha modifiers on text. Replace `text-parch/80` with plain `text-parch` (5.11:1 on ink, 5.76:1 on coal) at checkout-form.tsx:287 and :449, and everywhere else it appears on a light surface. For placeholders, darken to a dedicated token: on #ffffff a placeholder needs roughly #767065 or darker to clear 4.5:1 — set `placeholder:text-parch` in input.tsx:13 and textarea.tsx:13 rather than thinning it. For the hero control at hero-cinema.tsx:277 use `text-parch` (7.77:1 on the dark ink) so the pause affordance is at least as legible as the content it pauses.

### 2. [high] [a11y] src/components/ui/input.tsx:12
Every form field boundary and every outline button fails 1.4.11: input borders at 1.34:1, outline buttons at 1.79:1

EVIDENCE: src/components/ui/input.tsx:12 (verbatim): `        "h-11 w-full rounded-xs border border-line bg-coal px-4 text-base text-bone sm:text-sm",`

I confirmed this reaches the browser. `curl -s http://localhost:3001/contact` renders:
`<input class="h-11 w-full rounded-xs border border-line bg-coal px-4 text-base text-bone sm:text-sm placeholder:text-parch/60 ... " id="contact-name" required="" autoComplete="name" name="name"/>`
and that page's `<main>` carries no class (light theme), so the tokens resolve to their `:root` values in globals.css:20-23.

Maths:
- Border --color-line #e4decd (L=0.7378) against the field's own fill --color-coal #ffffff (L=1.0): (1.05)/(0.7878) = 1.34:1.
- Same border against the page --color-ink #f5f1e6 (L=0.8497): 1.19:1.
- The fill itself only differs from the page by #ffffff vs #f5f1e6 = 1.13:1.
So all three cues that say "a text box lives here" land between 1.13:1 and 1.34:1, against a 3:1 requirement.

src/components/ui/button.tsx:24 (verbatim): `          "border border-gold-dim/70 text-bone hover:border-gold-dim hover:text-gold",` — the outline variant has no fill, so that border is its only boundary.
- Light: 0.7*#b89a5f + 0.3*#f5f1e6 = #cab488 → 1.79:1 on ink, 1.94:1 on the white checkout card (the "Apply" discount button, checkout-form.tsx:396-404).
- Dark (.inverse, gold-dim #8a784f): 0.7*#8a784f + 0.3*#141414 = #675a3d → 2.73:1 on #141414. That is the footer newsletter's "Keep me posted" on every page, and "WhatsApp us" on book-the-bar.

WHY: 1.4.11 exists precisely for this: a shopper with reduced contrast sensitivity has to guess where the checkout fields are, because the box outline, the box fill and the page are all within 1.34:1 of each other. The same defect hides the secondary call to action on every page. Nothing in the earlier passes touched non-text contrast; the globals.css header only ever audited text colours.

FIX: These are two token decisions, not per-component edits. Give form controls a boundary token that clears 3:1 against both #ffffff and #f5f1e6 — around #949087 or darker — and use it for `border-line` on interactive elements (keep the softer #e4decd for purely decorative hairlines and section rules, which 1.4.11 does not cover). For the outline button, stop thinning the border: `border-gold-dim` at full strength is still only 2.38:1 in light, so the outline variant needs its own darker border token (roughly #8a7440 on cream, and lighten the dark-theme gold-dim toward #a08d5e) to reach 3:1 in both themes.

### 3. [high] [performance] src/lib/media.ts:39
The un-converted original upload is the widest srcset candidate and the src fallback, putting a 1,485,953-byte PNG on a 360px DPR3 phone

EVIDENCE: variantsOf() appends the raw original upload as the top candidate whenever it is wider than the largest named variant:

  src/lib/media.ts:39   if (media.width > widest) out.push({ url: originalUrl, width: media.width });

src/collections/Media.ts:35-50 sets formatOptions: WEBP on each entry of imageSizes but has NO top-level formatOptions or resizeOptions on `upload`, so Payload never converts or bounds the stored original. It stays exactly as uploaded.

Measured on disk (ls -l media/):
  verboten-brandy-cola-1-400x400.webp        10,006
  verboten-brandy-cola-1-768x768.webp        23,792
  verboten-brandy-cola-1.png              1,485,953   <- original, 1066px wide

Because the cola source is only 1066px wide, Payload skips the feature (1280) and hero (1920) sizes, so the widest named variant is card at 768. 1066 > 768, so line 39 pushes the 1,485,953-byte PNG in as the 1066w candidate. Verbatim from the served HTML of the running production build:

  /shop:  src="/api/media/file/verboten-brandy-cola-1.png"
          srcSet="...-400x400.png 400w, ...-768x768.png 768w, ....png 1066w"
          sizes="(min-width: 1024px) 560px, 100vw"
  /shop/verboten-brandy-cola:  sizes="(min-width: 1024px) 600px, 100vw"

(The 400w/768w entries have since been regenerated to .webp by another process; grep -a on verboten.db confirms the DB now records verboten-brandy-cola-1-768x768.webp. The 1066w entry is still verboten-brandy-cola-1.png and cannot change, because nothing converts the original.)

On a 360px viewport the slot is 360 CSS px (100vw):
  DPR 2  -> 720 device px -> picks 768w      =    23,792 bytes
  DPR 3  -> 1080 device px -> no candidate >= 1080, so the browser takes the largest = 1066w = 1,485,953 bytes

A 62x cliff at DPR 3, which is the most common mid-range SA Android profile (1080x1920 physical reported as 360x640 CSS px).

The product page is worse than the listing. src/components/shop/gallery.tsx:31 calls mediaSrcAt(active, 1200); no variant is >= 1200, so mediaSrcAt falls through to `variants[variants.length - 1]`, the original PNG. That URL is then rendered at gallery.tsx:55-57 with loading="eager" fetchPriority="high" decoding="sync". The LCP element of the RTD product page is a 1.49MB PNG fetched at highest priority with synchronous decode. src/components/media/cms-image.tsx:34 has the same fallthrough (slotWidth 768 * 2 = 1536, no variant that wide, so it returns the original).

WHY: On South African mobile data this is roughly 1.5MB for one product photo, at highest priority, blocking the largest paint on the page where the purchase decision happens. The Media.ts comment already names this exact failure ("a 768px PNG can of ours is 1.1MB") and the gallery.tsx docblock says "1.49 MB of PNG, preloaded at the highest priority" was fixed, but the fix only covered the generated variants. The original was never converted, and line 39 puts it straight back at the top of every srcset. Every future upload inherits the same trap: any image whose source is wider than 768 and narrower than 1280 will hand its raw original to high-DPR phones.

FIX: Two changes. (1) In src/collections/Media.ts, add top-level `formatOptions: WEBP` and a `resizeOptions` width cap to the `upload` object so the stored original is itself WebP and bounded, then re-save the media docs so the originals regenerate. (2) In src/lib/media.ts, stop trusting the original as a layout candidate: either drop the `out.push` at line 39 entirely and let the largest named variant be the ceiling, or only push it when its byte size is known to be sane. Also give mediaSrcAt a floor so it returns the largest *variant* rather than the original when nothing matches, which fixes cms-image.tsx:34 and gallery.tsx:31 in one place.

### 4. [high] [forms] src/app/actions/contact.ts:66
A booking rejected on the guest count says "Check the highlighted fields" and highlights nothing

EVIDENCE: contact.ts:23 is `  eventGuests: z.coerce.number().int().min(0).max(100000).optional(),` but ContactResult at line 31 is `  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;`. Lines 62 to 66 write any issue path into that map and return `    return { ok: false, message: "Check the highlighted fields.", fieldErrors };`. booking-form.tsx renders FieldError only at lines 66, 79 and 115 (name, email, message); the bk-guests Input at line 95, bk-date at 87 and bk-location at 91 have no aria-invalid and no error element at all. The form is `noValidate` (line 52) so the `pattern="[0-9]*"` at line 99 is never enforced in the browser. I ran the exact schema from contact.ts against a booking with eventGuests `"80-100"` using the repo's own zod; output: `success: false` and `[{"path":["eventGuests"],"message":"Invalid input: expected number, received NaN"}]`.

WHY: The label on that field is "Roughly how many people", which invites "80-100", "about 80" or "~100". Any of those is silently accepted by the browser, rejected by the server, and the rejection lands in a field error slot that does not exist. The shopper sees "Check the highlighted fields." with zero fields highlighted and, because of the reset above, an empty form. There is no way to work out what was wrong and nothing left to correct.

FIX: Either widen the field to free text like eventDate and eventLocation already are (parse the number server side and drop it if it is not clean), or extend the fieldErrors key union in contact.ts:31 to include eventDate, eventLocation and eventGuests and render a FieldError under bk-guests, bk-date and bk-location in booking-form.tsx. Also add a fallback in the action so an issue on a path with no error slot is surfaced in the top level message rather than swallowed.

### 5. [high] [security2] src/lib/rate-limit.ts:34
Every rate limit is keyed on a header the caller sets, so all five limiters are bypassed with one line of curl

EVIDENCE: src/lib/rate-limit.ts:32-37, verbatim:

export const clientKey = (headers: Headers, scope: string): string => {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
};

Cloudflare appends the connecting IP to any X-Forwarded-For the client already sent, so `.split(",")[0]` is the attacker's own string, not the client IP. `cf-connecting-ip` is never read anywhere in the repo:

  $ grep -rn "cf-connecting-ip\|CF-Connecting-IP" src/
  (no output)

Nothing normalises the header before it reaches this code. server.cjs:42 is `createServer((req, res) => handle(req, res)).listen(port, ...)` with no proxy-trust layer, and there is no middleware.ts in the repo (`find src -name "middleware.ts"` returns nothing).

All five public entry points key off this one function:
  src/app/actions/account.ts:49    rateLimit(clientKey(hdrs, "register"), { limit: 5, windowMs: 15 * 60 * 1000 })
  src/app/actions/checkout.ts:106  rateLimit(clientKey(hdrs, "checkout"), { limit: 10, windowMs: 10 * 60 * 1000 })
  src/app/actions/checkout.ts:368  rateLimit(clientKey(hdrs, "discount"), { limit: 20, windowMs: 10 * 60 * 1000 })
  src/app/actions/contact.ts:39    rateLimit(clientKey(await headers(), "contact"), { limit: 5, windowMs: 10 * 60 * 1000 })
  src/app/actions/newsletter.ts:32 rateLimit(clientKey(await headers(), "newsletter"), { limit: 6, windowMs: 10 * 60 * 1000 })

WHY: The discount limiter is the expensive one. previewDiscount is a public server action that returns a clean yes/no plus the rand value (src/lib/commerce/discounts.ts:47-62: a miss returns "That code is not valid.", a hit returns `{ ok: true, ..., discountCents }`). Twenty guesses per ten minutes makes brute-forcing a code pointless; with a rotating X-Forwarded-For there is no ceiling at all, and every code the owner ever issues is discoverable and then spendable. The same header defeats the contact and newsletter limiters, which turns the shared cPanel SMTP relay (the one whose hourly cap account.ts:19-24 is written around) into a free mail cannon, and defeats the checkout limiter that stops junk pending orders filling the order table. The failure also runs the other way: if the header ever arrives absent (a direct origin hit, or Cloudflare bypassed), every visitor collapses into the single bucket `contact:unknown`, and five contact submissions in ten minutes locks the form for the whole country until launch day is over.

FIX: Read `cf-connecting-ip` first, then `x-real-ip`, and only fall back to X-Forwarded-For, and when you do, take the LAST entry rather than the first (that is the hop Cloudflare added, the one a caller cannot forge). Drop the `|| "unknown"` shared bucket: when no trustworthy IP is available, key on something per-request rather than one global bucket, or fail the request rather than lumping everyone together. Separately, the limiter is per-process (src/lib/rate-limit.ts:8, `const windows = new Map<string, number[]>()`), which is fine for one Passenger instance, but it resets on every deploy restart, so the discount oracle deserves a database-backed counter rather than an in-memory Map.

### 6. [high] [security2] src/app/(frontend)/account/page.tsx:68
A customer can change their own email after verifying and inherit a stranger's guest order history

EVIDENCE: The account page trusts `_verified` as proof that the address on the record belongs to this person. src/app/(frontend)/account/page.tsx:60-70, verbatim:

    // That branch is only safe once the address has been proven to belong to
    // this person. Without the check, registering with someone else's email
    // would display their purchase history and delivery address. Login already
    // requires verification, so this is the second lock on the same door.
    where: {
      or: [
        { customer: { equals: customer.id } },
        ...(customer._verified ? [{ email: { equals: customer.email } }] : []),
      ],
    },

But the email on the record is editable by the record's owner after verification. src/collections/Customers.ts:54-60, verbatim:

  access: {
    admin: () => false,
    read: staffOrSelfCustomer,
    create: anyone,
    update: staffOrSelfCustomer,
    delete: isAdmin,
  },

staffOrSelfCustomer grants a signed-in customer update on their own row (src/access/access.ts:82-84: `if ((user as { collection?: string }).collection === "customers") { return { id: { equals: user.id } }; }`), and Customers.ts declares no field-level access on `email`. Payload's own email field carries none either (node_modules/payload/dist/auth/baseFields/email.js has only a lowercase/trim beforeChange hook, no `access` block), and Payload never resets verification when the address changes:

  $ grep -rn "email !== \|emailChanged\|shouldReVerify\|_verified = false" node_modules/payload/dist/
  (no output)

The REST surface is live: src/app/(payload)/api/[...slug]/route.ts:16 exports `export const PATCH = REST_PATCH(config);`.

WHY: The exploit is four steps with no tooling: register with your own address, click the verification link, PATCH /api/customers/<your id> with {"email":"victim@gmail.com"}, reload /account. `_verified` is still true, the or-branch now matches on the victim's address, and the page renders their guest orders: order number, date, every line item and quantity, fulfilment status and total (page.tsx:101-115). Guest checkout is first-class here and creates no customer row, so almost every real buyer's address is unclaimed and therefore free to take. The unique constraint on email means a failed PATCH also answers "does this address have an account here", which is a quiet enumeration oracle on the same endpoint. This is a different door from the unverified-signup path that was already closed: that one was `_verified` being false, this one is `_verified` surviving a change of the very address it was granted for.

FIX: Two things, either of which closes it, both of which are cheap. In src/collections/Customers.ts add a beforeChange hook on the collection that sets `_verified: false` and re-issues verification whenever `data.email` differs from `originalDoc.email`. And lock the field down so the change cannot be made silently over REST at all: give the auth email field `access: { update: isStaffField }` (or route email changes through a server action that re-verifies), the same way Orders.ts:266 and :286 already fence staff-only fields.

### 7. [medium] [a11y] src/components/account/account-auth.tsx:86
Account tabs: ARIA tab role with no tabpanel, no aria-controls, a colour-only selected state at 1.13:1, and no selected tab in forgot mode

EVIDENCE: src/components/account/account-auth.tsx:86 (verbatim):
`      <div className="flex gap-6 border-b border-line pb-4" role="tablist" aria-label="Account">`
with children at lines 95-96 and 102-103 (verbatim):
`            role="tab"`
`            aria-selected={mode === key}`
`            className={\`text-xs uppercase tracking-[0.18em] transition-colors ${`
`              mode === key ? "text-gold" : "text-parch hover:text-bone"`

Three separate defects in that block:

1. There is no tabpanel. `grep -rn "tabpanel\|aria-controls" src/ --include=*.tsx` returns nothing across the whole repo. The `<form>` at line 111 that the tabs actually control is not associated with either tab, so a screen reader announces "Sign in, tab, selected" and then a form with no stated relationship to it.

2. The selected state is carried by colour alone. Selected is `text-gold` #6f5b2e, unselected is `text-parch` #6c6559, both on the light page. I computed the contrast between the two states: L(#6f5b2e)=0.1064, L(#6c6559)=0.1440 → (0.1440+0.05)/(0.1064+0.05) = 1.13:1. There is no underline, no weight change, no background, no border. That is SC 1.4.1 Use of Color, and 1.13:1 means it is invisible to most people, not only to colour-blind users.

3. A third mode exists that the tablist cannot express. Line 160 (verbatim): `            onClick={() => setMode("forgot")}` — when the "Forgot your password?" button is pressed, `mode` becomes "forgot", so `aria-selected={mode === key}` is false on both tabs. A tablist reporting zero selected tabs is an invalid ARIA state, and meanwhile the password field is removed from the form with no live announcement and no focus move.

Rendered confirmation from `curl -s http://localhost:3001/account`:
`<div class="flex gap-6 border-b border-line pb-4" role="tablist" aria-label="Account"><button role="tab" aria-selected="true" class="text-xs uppercase tracking-[0.18em] transition-colors text-gold">Sign in</button><button role="tab" aria-selected="false" class="text-xs uppercase tracking-[0.18em] transition-colors text-parch hover:text-bone">Create account</button></div><form class="space-y-6">`

WHY: This is the door to order history. A shopper who cannot tell which of the two tabs is live fills in the wrong form and gets "Email or password did not match" (line 71) when they were actually trying to register, or accidentally creates a second account. Declaring the tab role without the panel half of the pattern is worse than using plain buttons, because it promises a structure to assistive technology that does not exist.

FIX: Simplest correct fix: drop the tab pattern. Two plain `<button>`s plus an `aria-pressed` state, or a real pair of links, describes this honestly. If the tabs stay, give the `<form>` `id="account-panel" role="tabpanel"` with `aria-labelledby` pointing at the selected tab, add `aria-controls="account-panel"` to each tab, add arrow-key roving focus, and move "forgot" out of the tablist into its own state so a tab is always selected. Independently of which route you take, add a non-colour cue for the active item — a gold underline via `border-b-2` on the selected button, or a font-weight change — so the state does not depend on a 1.13:1 hue shift.

### 8. [medium] [visual] src/app/(frontend)/shop/[slug]/page.tsx:234
Product page cross-sell puts 3 cards in a 2-column grid: orphan last row, 860px-tall cards, and a 400px image in a 534px slot

EVIDENCE: Line 234 verbatim: `<div className="grid gap-8 sm:grid-cols-2">`. The list feeding it is capped at three (line 85: `.slice(0, 3);`) and the comment at lines 82-84 says `// Three fits the row without crowding the page. Two was leaving authored / // cross-sells unseen, and on the flagship one of the two was the set,`. The row is two columns, not three. Measured live in the browser on http://localhost:3001/shop/verboten-premium-brandy at 1440x900 (getComputedStyle + getBoundingClientRect on the grid after the 'Also from the house' heading): cols = "536px 536px"; cards = [{name:'Verboten Premium Set, 2 Bottles', w:536, h:860, x:163, y:1268}, {name:'Verboten Brandy & Cola', w:536, h:860, x:731, y:1268}, {name:'Verboten NYX', w:536, h:841, x:163, y:2160}]. The third card sits alone on row two at half width, and each card is 860px tall, taller than the 900px viewport. The same measurement returned imgW:534 with currentSrc:"verboten-brandy-cola-1-400x400.png", because src/components/shop/product-card.tsx line 35 declares `sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 640px) 320px, 100vw"}` and line 36 `slotWidth={featured ? 640 : 320}`: the card was built for a 3-up row, so it tells the browser the slot is 320px while it actually paints at 534px.

WHY: This is the flagship's cross-sell block, the largest order-value lever on the site, and it is visibly wrong at both 768px and 1440px: a lopsided last row, cards taller than the screen, and an upscaled 400px image on the money page. On a mid range Android at DPR 2-3 the card image is noticeably soft.

FIX: Make the grid match the three items: `grid gap-8 sm:grid-cols-2 lg:grid-cols-3`, which is the pattern already used on /journal (line 46), /gallery (line 117) and the home ritual row (page.tsx line 130). Then the card's existing `sizes` and `slotWidth={320}` become truthful again. If two columns are wanted on purpose, drop the slice to 2 and raise the card's slotWidth/sizes to about 560.

### 9. [medium] [visual] src/app/(frontend)/serves/page.tsx:81
/serves legal line sits outside the page container and runs flush to both viewport edges

EVIDENCE: The padded container opens at line 28 (`<div className="mx-auto max-w-6xl space-y-16 px-6 py-16 lg:py-20">`) and closes at line 79 (`</div>`). Lines 81-83 then sit as a direct child of `<main>` (opened line 20, closed line 84): `<p className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-parch/80">` / `Drink responsibly. Not for sale to persons under 18.` / `</p>`. There is no `mx-auto`, no `max-w-*` and no `px-6`, and `<main>` on this page carries no class at all (line 20 is just `<main>`), so the paragraph is full viewport width with zero side gutter. The same sentence everywhere else on the site is inside the container, for example shop/page.tsx line 148 (`<p className="mx-auto max-w-lg pt-6 text-xs leading-relaxed text-parch/80">`).

WHY: The mandatory responsible-drinking line touches both screen edges on a 360px phone and stretches its rule across the full 1440px window on desktop, while every other paragraph on the page is inset 24px and capped at 1152px. It also gets `mt-16` on top of the container's own `py-16`/`lg:py-20`, so there is a 128px to 144px dead gap above it. It is the one piece of copy on the page that is legally required to look deliberate.

FIX: Move the paragraph inside the closing `</div>` at line 79, or wrap it in `<div className="mx-auto max-w-6xl px-6">`, and drop `mt-16` down to something like `mt-10` now that it no longer stacks on the container padding.

### 10. [medium] [forms] src/components/account/account-auth.tsx:36
Forgot password always claims the email is sent, even when the send failed

EVIDENCE: account-auth.tsx lines 36 to 41, verbatim:
        await fetch("/api/customers/forgot-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setNotice("If that address has an account, a reset email is on its way.");
The Response is discarded, so `res.ok` is never checked and only a network level throw reaches the catch at line 78. Payload does not swallow a send failure: node_modules/payload/dist/auth/operations/forgotPassword.js:116 is `            await email.sendEmail({` with no try/catch around it, and the operation's catch at line 150 rethrows, so an SMTP failure returns a 500 from that endpoint. Production uses a real relay (payload.config.ts:109 `  email: process.env.SMTP_HOST`).

WHY: This is the same class of failure the signup path was already hardened against, and account.ts:20 to 21 calls the cause routine: "a shared cPanel relay hitting its hourly cap is routine". When the relay is down, a locked out customer is told a reset link is on the way, waits for an email that will never arrive, and retries into the same false success. There is no error, no retry prompt, and nothing on screen that tells them to contact the shop instead.

FIX: Capture the response and branch on it: on a non-ok status set an error such as "We could not send that reset email just then. Try again in a few minutes, or email us." and only show the existing notice on a 200. Keep the notice deliberately vague about whether the address exists, which it already is.

### 11. [medium] [forms] src/components/account/account-auth.tsx:36
Forgot password is the one public form with no rate limit, and it sends mail on every hit

EVIDENCE: account-auth.tsx:36 posts straight at `"/api/customers/forgot-password"` from the browser, bypassing every server action. Every other public write path in the repo is limited: contact.ts:39 `rateLimit(clientKey(await headers(), "contact"), { limit: 5, windowMs: 10 * 60 * 1000 })`, newsletter.ts:32 `{ limit: 6, windowMs: 10 * 60 * 1000 }`, account.ts:49 `rateLimit(clientKey(hdrs, "register"), { limit: 5, windowMs: 15 * 60 * 1000 })`, checkout.ts:368 `rateLimit(clientKey(hdrs, "discount"), { limit: 20, windowMs: 10 * 60 * 1000 })`. `grep -n "rateLimit\|maxLoginAttempts\|lockTime" src/payload.config.ts` returned nothing, and Payload 3 has no throttle of its own on that endpoint. Each accepted call writes a reset token to the customer row (forgotPassword.js:79 `user = await payload.update({`) and sends an email (line 116).

WHY: An unauthenticated caller can loop that endpoint as fast as the box answers. Two outcomes, both real for a one person shop: the shared cPanel relay burns its hourly cap, which silently takes down order confirmations, signup verifications and enquiry acknowledgements for everyone else, and any known customer address can be mail bombed with reset links from the brand's own domain. SQLite transactions are off here, so each token write commits regardless.

FIX: Move the forgot password call behind a server action the way register already is, and gate it with the existing helper, for example `rateLimit(clientKey(hdrs, "forgot"), { limit: 3, windowMs: 15 * 60 * 1000 })`, then call `payload.forgotPassword` from there. That also gives you the response to check for the false success above, so both are fixed in one move.
