import { doc, h2, p, ul } from "./lexical";

/**
 * The copy rewrite, seeded into the CMS so staff own it from day one.
 * Voice rules apply in full: no banned vocabulary, no defensiveness, no stacked
 * superlatives, no em dashes. Facts come from docs/old-site-recon.md;
 * policy numbers (return windows, fees) carry over from the business's
 * stated policy on the old site.
 */

/**
 * The privacy policy's body. It says what the site actually does, so it has
 * to change whenever measurement does: consent-gated Google Analytics and
 * Meta Pixel, server-side sale reports for buyers who allowed them, the date
 * of birth that the age gate checks and throws away, and every cookie by name.
 */
const PRIVACY_BLOCKS = [
  h2("Who is responsible"),
  p(
    "Verboten Pty Ltd, Silverton, Pretoria, is the responsible party for personal information processed on this site. Privacy questions and requests go to privacy@verboten.co.za.",
  ),
  h2("What we collect and why"),
  ul(
    "Orders: your name, email, phone number, delivery address, date of birth, and order history. We need these to take payment, confirm your age, deliver, and look after your order, including when you look it up on the order tracking page.",
    "Accounts: if you open one, your email address and a password we store only in scrambled form, so your orders appear in one place.",
    "Contact and booking enquiries: your name, contact details and message, so we can reply.",
    "Newsletter: your email address, with your confirmed consent, to send release news and where we are pouring next. Every email includes an unsubscribe link.",
    "Back in stock requests: your email address and the product, used for the one email that tells you it has returned, and nothing else.",
    "Payments: handled entirely by PayFast. We receive a payment reference, never your card details.",
  ),
  h2("The age check"),
  p(
    "When you enter the site you give your date of birth and country. It is checked in your browser and then discarded. We keep only a note that the check was passed, for your visit, or for 30 days if you ask us to remember you.",
  ),
  h2("Where a visit came from"),
  p(
    "When you arrive through a link that carries a campaign name, or from another website, we note the campaign and the referring site for the length of your visit. If you place an order, that note is kept with it, so we can tell which of our posts and ads actually lead to sales. It says where the link was, not who you are.",
  ),
  h2("Analytics and advertising, only if you agree"),
  p(
    "The site asks before loading anything that sets cookies to measure visits or to advertise. You can accept, refuse, or choose, and change your mind at any time with Cookie choices at the foot of every page. Refusing changes nothing about how the shop works.",
  ),
  p(
    "Our hosting network, Cloudflare, may also count page visits with its Web Analytics. It sets no cookies, does not follow you across other websites and does not identify you, so it runs without asking.",
  ),
  ul(
    "Analytics: Google Analytics counts visits and the pages and products people look at, so we can see what works. It sets cookies named _ga.",
    "Advertising: the Meta Pixel, and Google's advertising signals, record that you visited and what you looked at, so our ads can reach people who have already been here and a sale can be credited to the ad that led to it. The Pixel sets cookies named _fbp and _fbc.",
    "Sales: when an order is paid, we tell Google Analytics about the sale if you allowed analytics when you ordered, and Meta if you allowed advertising. For Meta this includes your email, phone number, name, city and postal code in scrambled (hashed) form, and your IP address and browser details, which is how Meta matches a sale to an ad without being sent your details in the clear.",
  ),
  p(
    "Google and Meta process this information on servers outside South Africa, under their own privacy terms. We only send it with your consent, and you can withdraw that consent from Cookie choices or by writing to us.",
  ),
  h2("What we do not do"),
  p(
    "We do not sell or rent personal information. We do not send marketing without consent. We do not collect information we have no use for.",
  ),
  h2("Sharing"),
  p(
    "We share what is necessary with the services that make the shop work: our payment provider (PayFast), our delivery partners, and our email service, and, only with your consent as described above, Google and Meta. Each receives only what it needs for its task.",
  ),
  h2("Retention"),
  p(
    "Order records are kept for five years to meet tax and consumer law obligations. The identifiers saved with an order for reporting a sale (IP address, browser details, ad click ids and analytics ids) are deleted as soon as the sale has been reported, or when the order is cancelled. Enquiries are kept for one year. Newsletter details are kept until you unsubscribe or ask us to delete them. Analytics data is kept by Google for the period set in our Google Analytics account.",
  ),
  h2("Your rights"),
  p(
    "Under POPIA you may ask what we hold about you, ask us to correct it, or ask us to delete it where the law allows, and you may object to direct marketing at any time. Write to privacy@verboten.co.za and we respond within a reasonable time. If you are not satisfied, you may complain to the Information Regulator of South Africa (inforegulator.org.za).",
  ),
  h2("Cookies and browser storage"),
  ul(
    "vb_age_ok: remembers that you passed the age check. Always on.",
    "vb_consent: remembers your cookie choices, including a refusal, so we do not ask on every page. Always on.",
    "payload-token: keeps you signed in to your account, if you have one. Always on.",
    "Your cart and the note of where your visit came from are kept in your own browser's storage, not in cookies, and are never sent anywhere until you check out.",
    "_ga and _ga_ cookies (Google Analytics) and _fbp and _fbc (Meta): only if you allow them.",
  ),
] as const;

export const PAGES = [
  {
    slug: "story",
    title: "Some rules are meant to be questioned",
    intro:
      "Silverton, Pretoria, since 2020. An independent brandy house with a German name, a Pretoria accent, and a seat at the table for you.",
    content: doc(
      h2("The start"),
      p(
        "Verboten started with one stubborn idea: brandy does not have to taste the way brandy has always tasted.",
      ),
      p(
        "It is still a Pretoria house, and the idea has not changed. Make it properly, pour it for people we are glad to see, and let what is in the glass do the talking.",
      ),
      h2("The name"),
      p(
        "Verboten is German for forbidden, which suits a house that likes to ask why things are done the way they are. The house line is Afrikaans: vir dié wat weet, for those who know.",
      ),
      h2("What we make"),
      p(
        "The flagship is a three year brandy, matured in oak and finished in French casks. Made to a standard, not to a schedule.",
      ),
      p(
        "Brandy & Cola is the same spirit with its collar loosened. Pre-mixed, canned, and served colder than strictly necessary at the markets and events where we pour.",
      ),
      p("Alongside the brandy there is NYX, liquorice and anise in the Greek style, and a blood orange gin that travels with the bar. Both come in 750ml bottles, and a canned NYX & cola and a canned gin & tonic are on the way."),
      p("A beer is in development. It will announce itself when it is ready."),
      h2("Where to find us"),
      ul(
        "At your door: order from the shop and we deliver anywhere in South Africa.",
        "At your event: we bring the bar to your wedding, birthday, corporate day or market, anywhere in Gauteng.",
        "Out and about: when we are pouring in public, the Find Us page says where and when.",
      ),
      h2("Where this goes"),
      p(
        "Born in Pretoria. Made for the world. However far it goes, the welcome goes with it.",
      ),
      p("Thanks for stopping by. Gesondheid, which is how Pretoria says cheers."),
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
        "We sell alcohol. You must be 18 or older to buy from this site. We confirm age when you enter the site and again at checkout, alcohol is only handed to a person 18 or older, and the courier may ask for identification on delivery. Orders placed by persons under 18 are cancelled and refunded.",
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
        "Stock levels shown on the site are live, but they are not a reservation. A product is yours when your payment is confirmed, not when it enters your cart.",
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
    updatedNote: "Last updated September 2026",
    // Keep in step with scripts/update-live-copy.mjs, which carries it live.
    content: doc(...PRIVACY_BLOCKS),
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
        "Verboten is enjoyed slowly and in good company. We do not sell to anyone under 18, anywhere, ever: not online, not at markets, not at events. The courier may ask for identification on delivery, and our staff are instructed to refuse a sale rather than guess.",
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
      p("Not for Persons Under the Age of 18. Don't Drink and Drive. Pregnant Women Should Not Drink Alcohol."),
    ),
  },
] as const;

export const SERVES = [
  {
    name: "Neat, one cube",
    description:
      "The house serve. The brandy was finished in French oak so you could taste it, not bury it.",
    ingredients: [
      { amount: "50ml", item: "Verboten Premium Brandy" },
      { amount: "1", item: "Large clear ice cube, optional" },
    ],
    method:
      "Pour into a heavy tumbler. Add the cube if you want the edges rounded off, skip it if you want every bit of the oak. Give it two minutes in the glass before the first sip.",
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
      "The classic, moved to Silverton. Stirred properly, never rushed.",
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
    slug: "the-first-verboten-brandy-is-shipping",
    title: "The first Verboten brandy is shipping",
    category: "releases" as const,
    excerpt:
      "Three years in oak, finished in French casks, bottled in Pretoria. Verboten Premium Brandy is shipping now.",
    content: doc(
      p(
        "The first release from this house is a brandy we are prepared to put our name on, which is the whole point of the name.",
      ),
      p(
        "Verboten Premium Brandy spends a minimum of three years in oak before a finish in French casks, and it comes in a 750ml bottle. It does not need a longer introduction than that.",
      ),
      h2("What it tastes like"),
      p(
        "Warm oak, dried apricot and vanilla on the nose. Caramel, toasted nuts and a quiet spice on the palate. The finish is long and does not need help.",
      ),
      h2("How to get one"),
      p(
        "Order from the shop and we deliver it anywhere in South Africa. There is also a two bottle set: one to open, and one for when people come round.",
      ),
    ),
    publishedAt: "2026-08-01T08:00:00.000Z",
  },
  {
    slug: "brandy-and-coke-done-properly",
    title: "Brandy and Coke, done properly",
    category: "stories" as const,
    excerpt:
      "South Africa's drink deserves better than a warm glass and a guess. The proper brandy and Coke, step by step, and why the brandy matters.",
    content: doc(
      p(
        "Brandy and Coke is South Africa's drink. It gets poured at every braai, every match, every family thing, and most of the time it gets poured badly. Warm glass, flat cola, brandy chosen by price alone. The drink deserves better, and so do you.",
      ),
      h2("The rules"),
      p(
        "Cold everything. The glass from the freezer if you can manage it, the cola from the fridge, never the pantry. Ice first, more than feels polite. Brandy in before the cola so the pour mixes itself. Cola down the side of the glass, slowly, so the bubbles survive. Stir once. Once.",
      ),
      h2("The ratio"),
      p(
        "One part brandy to two and a half parts cola. Stronger and you lose the refreshment, weaker and you are drinking cola with regrets. Fifty millilitres of brandy to about 120 of cola in a tall glass full of ice is the pour we stand behind.",
      ),
      h2("Why the brandy matters"),
      p(
        "Cola is loud. A thin brandy disappears under it, which is why so many brandy and Cokes taste like sweet nothing. A brandy with three years in oak and a French cask finish holds its shape: you taste caramel and dried fruit through the cola instead of just sugar. That is the whole argument for pouring something better into the national drink.",
      ),
      p(
        "If the fridge is doing the work tonight, our Brandy and Cola comes pre-mixed in a can, cold and ready. Same brandy, collar loosened.",
      ),
      p("Rather have someone else do the pouring? Book the bar and we bring it to your event, anywhere in Gauteng."),
    ),
    publishedAt: "2026-08-15T08:00:00.000Z",
  },
  {
    slug: "what-makes-a-south-african-brandy",
    title: "What makes a South African brandy",
    category: "stories" as const,
    // Checked against regulations 12, 13 and 14 under the Liquor Products Act,
    // as amended by GN R.5976 (14 March 2025), and the SA Brandy Foundation's
    // guide. The earlier version said all South African brandy is pot stilled
    // and rested three years, which is only true of one class of three. Keep
    // this in step with scripts/update-live-copy.mjs, which carries it live.
    excerpt:
      "South African law sorts brandy into three classes, and the word on the label tells you how the spirit was made and how long it rested. What each class means, what changed in 2025, and how to taste the difference.",
    content: doc(
      p(
        "In South Africa, brandy is not a loose word. The regulations under the Liquor Products Act decide what may be called brandy, and they sort it into three classes. The class printed on the label tells you more about what is in the bottle than anything written on the back of it.",
      ),
      h2("Pot still brandy"),
      p(
        "Pot still brandy is distilled in a pot still from fermented grape juice, and all of it is pot still spirit. It has to mature for at least three years in oak casks of no more than 340 litres. It is the class the local industry points to when it talks about South African brandy at its most serious.",
      ),
      h2("Vintage brandy"),
      p(
        "Vintage brandy blends pot still spirit, between 30 and 80 per cent of it, with wine spirit or grape spirit making up the rest. Every part of it matures for at least eight years in the same small oak casks. On a label, an age in years may stand in for the word vintage, and that age describes the youngest spirit in the bottle.",
      ),
      h2("Brandy"),
      p(
        "The class simply called brandy is the blended one, and it is the bottle most people mean. At least 30 per cent of it has to be pot still brandy, which has done its three years in oak. The rest, up to 70 per cent, may be wine spirit that has not been matured at all. The SA Brandy Foundation describes it as the style made for mixing, with cola, ginger ale or fruit juice.",
      ),
      h2("What changed in 2025"),
      p(
        "In March 2025, Government Notice R.5976 amended the rules for blended brandy. Its minimum alcohol content came down to 40 per cent, or 35 per cent for a flavoured brandy, and residual sugar is now capped at 15 grams a litre, or 100 grams if flavoured. Plenty of pages online still quote the old figure, so check the date on anything you read about it.",
      ),
      h2("What oak actually does"),
      p(
        "Time in a barrel is where a brandy earns its colour and most of its character. The wood breathes, the spirit rounds out, the sharp edges go. A finish in a different cask on top of that adds the quiet vanilla and spice you notice at the end of a sip. Time is the one ingredient nobody can fake, which is why the law measures it.",
      ),
      h2("How to taste it"),
      p(
        "Pour a small measure neat. Let it sit for two minutes, because the first nose out of the bottle is always the roughest. Then look for three things: fruit up front, warmth without burn in the middle, and a finish that stays after you swallow. If all three show up, someone made that brandy with intent.",
      ),
      p(
        "The rules themselves are published by the Department of Agriculture, and the SA Brandy Foundation explains the classes for drinkers at sabrandy.co.za.",
      ),
    ),
    publishedAt: "2026-08-20T08:00:00.000Z",
  },
] as const;
