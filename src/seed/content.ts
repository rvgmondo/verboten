import { doc, h2, p, ul } from "./lexical";

/**
 * The copy rewrite, seeded into the CMS so staff own it from day one.
 * Voice rules apply in full: no banned vocabulary, no defensiveness, no stacked
 * superlatives, no em dashes. Facts come from docs/old-site-recon.md;
 * policy numbers (return windows, fees) carry over from the business's
 * stated policy on the old site.
 */

export const PAGES = [
  {
    slug: "story",
    title: "A house with its name on the door",
    intro:
      "Verboten is an independent beverage house in Pretoria. We make premium brandy in limited editions, and we intend to be poured in places that have never heard an accent like ours.",
    content: doc(
      h2("The start"),
      p(
        "Verboten started in Pretoria in 2020. Not in a boardroom, in a workshop in Silverton, with a conviction that South African brandy could stand next to anything in the world if someone held it to that standard on purpose.",
      ),
      p(
        "We work with master blenders who have spent their lives in South African spirits. The recipes are ours. The standard is not negotiable.",
      ),
      h2("What we make"),
      p(
        "Batch No. 01 is the first release: a three year brandy, matured in oak and finished in French casks, bottled at 43%. A limited edition. When an edition is done, the next one earns its own name and its own story.",
      ),
      p(
        "Brandy & Cola is the same spirit with its collar loosened. Pre-mixed, canned, and served colder than strictly necessary at the markets and events where we pour.",
      ),
      p("A gin is in development. It will announce itself when it is ready."),
      h2("The name"),
      p(
        "Verboten is German for forbidden. The name is a promise about restraint: nothing leaves this house unless it earns the label. South African soul, a German sounding surname, and an Afrikaans undercurrent for the ones who know.",
      ),
      h2("Where this goes"),
      p(
        "South Africa first: Pretoria, then every good back bar in the country. Then outward. The Netherlands and Germany are the first stops abroad, not because it sounds good in a paragraph, but because the plan is already on the wall.",
      ),
      p("Guinness was not built to be a novelty. Neither is this."),
    ),
  },
  {
    slug: "terms-conditions",
    title: "Terms & Conditions",
    intro:
      "The short version: we sell alcohol to adults, we ship what you pay for, and we treat you the way we would want to be treated. The long version follows.",
    updatedNote: "Last updated August 2026",
    content: doc(
      h2("Who we are"),
      p(
        "This site is operated by Verboten Pty Ltd, an independent beverage house in Silverton, Pretoria, South Africa. Questions about these terms go to info@verboten.co.za.",
      ),
      h2("Age restriction"),
      p(
        "We sell alcohol. You must be 18 or older to buy from this site. We confirm age when you enter the site, again at checkout, and our couriers verify identification on delivery. Orders placed by persons under 18 are cancelled and refunded.",
      ),
      h2("Orders and payment"),
      p(
        "Prices are in South African Rand and include VAT. Payment is processed by PayFast, a registered South African payment provider; we never see or store your card details. An order is accepted when payment is confirmed, and you receive a confirmation email with your order number.",
      ),
      p(
        "We may cancel an order where stock has run out, where payment cannot be verified, or where the law requires it. Anything already paid on a cancelled order is refunded in full.",
      ),
      h2("Pricing and stock"),
      p(
        "Batches are limited by design, so stock levels shown on the site are live but not a reservation. A product is yours when your payment is confirmed, not when it enters your cart.",
      ),
      h2("Shipping and returns"),
      p(
        "Shipping times, fees and the returns process are set out on the Shipping & Returns page, which forms part of these terms.",
      ),
      h2("Liability"),
      p(
        "Nothing in these terms limits rights you have under the Consumer Protection Act. Beyond what the law requires, we are not liable for indirect or consequential loss arising from the use of this site or our products. Drink responsibly.",
      ),
      h2("Law"),
      p("These terms are governed by the laws of the Republic of South Africa."),
    ),
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    intro:
      "We collect the minimum we need to sell you a bottle and get it to your door, and we treat that information under the Protection of Personal Information Act (POPIA).",
    updatedNote: "Last updated August 2026",
    content: doc(
      h2("Who is responsible"),
      p(
        "Verboten Pty Ltd, Silverton, Pretoria, is the responsible party for personal information processed on this site. Privacy questions and requests go to privacy@verboten.co.za.",
      ),
      h2("What we collect and why"),
      ul(
        "Orders: your name, email, phone number, delivery address, date of birth confirmation, and order history. We need these to process payment, verify age, deliver, and support your order.",
        "Contact enquiries: your name, contact details, and message, so we can reply.",
        "Newsletter: your email address, with your consent, to send release news. Every email includes an unsubscribe link.",
        "Payments: handled entirely by PayFast. We receive a payment reference, never your card details.",
      ),
      h2("What we do not do"),
      p(
        "We do not sell or rent personal information. We do not send marketing without consent. We do not collect information we have no use for.",
      ),
      h2("Sharing"),
      p(
        "We share what is necessary with the services that make the shop work: our payment provider (PayFast), our delivery partners, and our email service. Each receives only what it needs for its task.",
      ),
      h2("Retention"),
      p(
        "Order records are kept for five years to meet tax and consumer law obligations. Enquiries are kept for one year. Newsletter details are kept until you unsubscribe or ask us to delete them.",
      ),
      h2("Your rights"),
      p(
        "Under POPIA you may ask what we hold about you, ask us to correct it, or ask us to delete it where the law allows. Write to privacy@verboten.co.za and we respond within a reasonable time. If you are not satisfied, you may complain to the Information Regulator of South Africa (inforegulator.org.za).",
      ),
      h2("Cookies"),
      p(
        "The site uses a small number of cookies that make it work: your age confirmation, your cart, and your session if you sign in. No advertising trackers.",
      ),
    ),
  },
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    intro:
      "Bottles are packed properly and shipped across South Africa. Here is exactly what to expect, and what to do if something is wrong.",
    updatedNote: "Last updated August 2026",
    content: doc(
      h2("Shipping"),
      ul(
        "Orders are processed within 1 to 2 business days.",
        "The current release dispatches within 1 to 2 weeks of your order.",
        "Delivery takes 3 to 7 business days from dispatch, anywhere in South Africa.",
        "Delivery costs R150. Orders of R2500 or more ship free.",
        "You receive a tracking number as soon as your order ships.",
      ),
      h2("Age verification on delivery"),
      p(
        "Alcohol is only handed to a person 18 or older. The courier may ask for identification; if nobody of age is available, delivery is reattempted.",
      ),
      h2("Cancellations"),
      p(
        "You can cancel an unshipped order within 14 days of placing it. Email orders@verboten.co.za with your order number and we refund in full.",
      ),
      h2("Damage in transit"),
      p(
        "If anything arrives damaged, tell us within 48 hours at orders@verboten.co.za with a photo and your order number. We replace or refund, your choice.",
      ),
      h2("Returns"),
      p(
        "Unopened bottles in their original packaging can be returned within 14 days of delivery. Once we receive the return, the refund is processed within 30 days. Opened bottles cannot be returned; the law is firm on that, and so is common sense.",
      ),
      h2("Questions"),
      p(
        "The shipping team is at orders@verboten.co.za, Monday to Friday, 9am to 5pm SAST.",
      ),
    ),
  },
  {
    slug: "responsible-enjoyment",
    title: "Responsible Enjoyment",
    intro:
      "We make spirits for people who savour them. That only works when drinking stays a choice, not a problem.",
    content: doc(
      h2("The house position"),
      p(
        "Verboten is enjoyed slowly and in good company. We do not sell to anyone under 18, anywhere, ever: not online, not at markets, not at events. Our couriers verify age on delivery, and our staff are instructed to refuse a sale rather than guess.",
      ),
      h2("Good practice"),
      ul(
        "Eat before and while you drink.",
        "Alternate with water. The brandy is not going anywhere.",
        "Never drive after drinking. Plan the ride home before the first pour.",
        "Alcohol and pregnancy do not mix. At all.",
        "If drinking stops feeling like a choice, take that seriously and talk to someone.",
      ),
      h2("If you need help"),
      p("These services are free, confidential, and used by people from every walk of life:"),
      ul(
        "SADAG Substance Abuse Helpline: 0800 12 13 14 (24 hours)",
        "Alcoholics Anonymous South Africa: 0861 435 722",
        "SANCA (South African National Council on Alcoholism): 011 892 3829",
      ),
      p("Drink responsibly. Not for sale to persons under 18."),
    ),
  },
] as const;

export const SERVES = [
  {
    name: "Neat, one cube",
    description:
      "The house serve. Batch No. 01 was finished in French oak so you could taste it, not bury it.",
    ingredients: [
      { amount: "50ml", item: "Verboten Premium Brandy" },
      { amount: "1", item: "Large clear ice cube, optional" },
    ],
    method:
      "Pour into a heavy tumbler. Add the cube if you want the edges rounded off, skip it if you want the full 43%. Give it two minutes in the glass before the first sip.",
    sortOrder: 1,
  },
  {
    name: "The proper Brandy & Cola",
    description:
      "South Africa's drink, done with intent. Cold glass, good ice, and a brandy that can carry it.",
    ingredients: [
      { amount: "50ml", item: "Verboten Premium Brandy" },
      { amount: "120ml", item: "Cola, properly cold" },
      { amount: "", item: "Ice, more than you think" },
      { amount: "1", item: "Wedge of lime, optional" },
    ],
    method:
      "Fill a tall glass with ice. Brandy first, cola second, poured slowly down the side. Stir once. The lime is for people who like lime.",
    sortOrder: 2,
  },
  {
    name: "The Silverton Old Fashioned",
    description:
      "The classic, moved to Pretoria. Brandy has been doing this job longer than most whiskies.",
    ingredients: [
      { amount: "60ml", item: "Verboten Premium Brandy" },
      { amount: "5ml", item: "Sugar syrup" },
      { amount: "2 dashes", item: "Aromatic bitters" },
      { amount: "1", item: "Strip of orange peel" },
    ],
    method:
      "Stir the brandy, syrup and bitters over ice until properly cold. Strain over one large cube. Express the orange peel over the top and drop it in.",
    sortOrder: 3,
  },
] as const;

export const JOURNAL_POSTS = [
  {
    slug: "batch-no-01-is-open",
    title: "Batch No. 01 is open",
    category: "releases" as const,
    excerpt:
      "A limited edition. Three years in oak, finished in French casks, bottled at 43% in Pretoria. The first Verboten release is shipping now.",
    content: doc(
      p(
        "The first release from this house is a brandy we are prepared to put our name on, which is the whole point of the name.",
      ),
      p(
        "Batch No. 01 spent a minimum of three years in oak before a finish in French casks. It bottles at 43%, in 750ml. A limited edition, made to a standard we hold without apology.",
      ),
      h2("What it tastes like"),
      p(
        "Warm oak, dried apricot and vanilla on the nose. Caramel, toasted nuts and a quiet spice on the palate. The finish is long and does not need help.",
      ),
      h2("How to get one"),
      p(
        "Order from the shop and it ships anywhere in South Africa within one to two weeks. There is also a two bottle set: one to open, one for the shelf. When the batch closes, it closes.",
      ),
    ),
    publishedAt: "2026-08-01T08:00:00.000Z",
  },
] as const;
