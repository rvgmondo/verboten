/**
 * Push the current positioning to the LIVE site over Payload's REST API.
 *
 * This revision NORMALISES the catalogue: no more "Batch No. 01" naming and
 * no "limited edition" framing anywhere shoppers see. It renames the flagship
 * and the set (name + slug; the code ships 301s for the old URLs), fills the
 * can's real specs (440ml, 5%), wires the flagship's cross-sell, rewrites the
 * story page and journal, adds two new journal posts, and resets the
 * announcement bar. Touches only content fields; images are never affected.
 * Idempotent: products are found by old OR new slug, posts by slug.
 *
 * Run from the project root with the portable Node:
 *   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
 *   $env:ADMIN_EMAIL = "admin@verboten.co.za"
 *   $env:ADMIN_PASSWORD = "<your admin password>"
 *   node scripts/update-live-copy.mjs
 */

const BASE_URL = (process.env.BASE_URL || "https://verboten.co.za").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first. See the header of this file.");
  process.exit(1);
}

/* ---- minimal Lexical builders (mirror src/seed/lexical.ts) ---- */

const text = (t) => ({ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 });
const p = (t) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", children: [text(t)] });
const h2 = (t) => ({ type: "heading", tag: "h2", format: "", indent: 0, version: 1, direction: "ltr", children: [text(t)] });
const doc = (...children) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } });
const paragraphs = (...texts) => doc(...texts.map(p));

/* ---- target state ---- */

const ANNOUNCEMENT = "Premium South African brandy | Ships nationwide in 1 to 2 weeks";

const PRODUCTS = [
  {
    oldSlug: "verboten-premium-brandy-batch-no-01-3-year",
    slug: "verboten-premium-brandy",
    data: {
      name: "Verboten Premium Brandy",
      slug: "verboten-premium-brandy",
      shortDescription:
        "A three year South African brandy, finished in French oak and bottled at 43% ABV. Born in Pretoria, made for the world.",
      description: paragraphs(
        "Three years in oak, then a finish in French casks. Bottled at 43% ABV in Pretoria.",
        "Neat, it holds its own next to anything on the shelf. Tall, over ice with cola, it is South Africa in a glass. Either way, it was built to be poured far from home.",
      ),
      _status: "published",
    },
  },
  {
    oldSlug: "verboten-brandy-cola",
    slug: "verboten-brandy-cola",
    data: {
      shortDescription:
        "The same brandy, cut with cola and canned. 440ml at 5%. Cold, easy, and unmistakably South African.",
      description: paragraphs(
        "The flagship brandy, cut with cola and canned at 5%, in a 440ml can. Made to be drunk cold, straight from the can or over ice. The national serve, ready when you are.",
      ),
      specs: { abv: 5, volumeMl: 440, origin: "South Africa" },
      _status: "published",
    },
  },
  {
    oldSlug: "batch-no-01-premium-set-2-bottle",
    slug: "verboten-premium-set-2-bottle",
    data: {
      name: "Verboten Premium Set, 2 Bottles",
      slug: "verboten-premium-set-2-bottle",
      shortDescription:
        "Two bottles of Verboten Premium Brandy for R850, fifty rand under buying them one at a time.",
      description: paragraphs(
        "Two bottles, R50 under buying them one at a time. Open one now, keep the second for the night that calls for it.",
      ),
      _status: "published",
    },
  },
];

const JOURNAL_UPDATES = {
  "batch-no-01-is-open": {
    title: "The first Verboten brandy is shipping",
    excerpt:
      "Three years in oak, finished in French casks, bottled at 43% in Pretoria. Verboten Premium Brandy is shipping now.",
    content: doc(
      p("The first release from this house is a brandy we are prepared to put our name on, which is the whole point of the name."),
      p("Verboten Premium Brandy spends a minimum of three years in oak before a finish in French casks. It bottles at 43%, in 750ml. Made to a standard we hold without apology."),
      h2("What it tastes like"),
      p("Warm oak, dried apricot and vanilla on the nose. Caramel, toasted nuts and a quiet spice on the palate. The finish is long and does not need help."),
      h2("How to get one"),
      p("Order from the shop and it ships anywhere in South Africa within one to two weeks. There is also a two bottle set: one to open, one to keep."),
    ),
    _status: "published",
  },
};

const JOURNAL_NEW = [
  {
    slug: "brandy-and-coke-done-properly",
    title: "Brandy and Coke, done properly",
    category: "stories",
    excerpt:
      "South Africa's drink deserves better than a warm glass and a guess. The proper brandy and Coke, step by step, and why the brandy matters more than you think.",
    content: doc(
      p("Brandy and Coke is South Africa's drink. It gets poured at every braai, every match, every family thing, and most of the time it gets poured badly. Warm glass, flat cola, brandy chosen by price alone. The drink deserves better, and so do you."),
      h2("The rules"),
      p("Cold everything. The glass from the freezer if you can manage it, the cola from the fridge, never the pantry. Ice first, more than feels polite. Brandy in before the cola so the pour mixes itself. Cola down the side of the glass, slowly, so the bubbles survive. Stir once. Once."),
      h2("The ratio"),
      p("One part brandy to two and a half parts cola. Stronger and you lose the refreshment, weaker and you are drinking cola with regrets. Fifty millilitres of brandy to about 120 of cola in a tall glass full of ice is the pour we stand behind."),
      h2("Why the brandy matters"),
      p("Cola is loud. A thin brandy disappears under it, which is why so many brandy and Cokes taste like sweet nothing. A brandy with three years in oak and a French cask finish holds its shape: you taste caramel and dried fruit through the cola instead of just sugar. That is the whole argument for pouring something better into the national drink."),
      p("If the fridge is doing the work tonight, our Brandy and Cola comes pre-mixed in a can, cold and ready. Same brandy, collar loosened."),
    ),
    publishedAt: "2026-08-15T08:00:00.000Z",
    _status: "published",
  },
  {
    slug: "what-makes-a-south-african-brandy",
    title: "What makes a South African brandy",
    category: "stories",
    excerpt:
      "South African brandy has beaten the big names in blind tastings for years. What makes it different, why the law here is stricter than cognac's, and how to taste the difference.",
    content: doc(
      p("Here is something most people at the braai do not know: South African law holds brandy to a standard stricter than France holds cognac. Pot-stilled, matured at least three years in oak, nothing rushed. The world's blind tastings have noticed, even when the world's shelves have not caught up yet."),
      h2("The law is the floor"),
      p("To call itself South African brandy, the spirit must be distilled from wine and rested in oak for a minimum of three years. That is not marketing. It is the legal floor, and it is why a properly made local brandy drinks smoother than plenty of imports at twice the price."),
      h2("What oak actually does"),
      p("Three years in a barrel is where a brandy earns its colour and most of its character. The wood breathes, the spirit rounds, the sharp edges go. A finish in French casks on top of that adds the quiet vanilla and spice you taste at the end of a sip. Time is the one ingredient nobody can fake."),
      h2("How to taste it"),
      p("Pour a small glass neat. Let it sit for two minutes, because the first nose out of the bottle is always the roughest. Then look for three things: fruit up front, warmth without burn in the middle, and a finish that stays after you swallow. If all three show up, someone made that brandy with intent."),
      p("That is the standard we hold ours to. Made in Pretoria, aged three years, finished in French oak, and built to stand next to anything in the world."),
    ),
    publishedAt: "2026-08-20T08:00:00.000Z",
    _status: "published",
  },
];

const STORY_PAGE = {
  intro:
    "Verboten is an independent South African brandy house in Pretoria. We make premium brandy, rooted here and built to be poured in places that have never heard an accent like ours.",
  content: doc(
    h2("The start"),
    p("Verboten started in Pretoria in 2020. Not in a boardroom, in a workshop in Silverton, with a conviction that South African brandy could stand next to anything in the world if someone held it to that standard on purpose."),
    p("We work with master blenders who have spent their lives in South African spirits. The recipes are ours. The standard is not negotiable."),
    h2("What we make"),
    p("The flagship is a three year brandy, matured in oak and finished in French casks, bottled at 43%. Made to a standard, not to a schedule."),
    p("Brandy & Cola is the same spirit with its collar loosened. Pre-mixed, canned, and served colder than strictly necessary at the markets and events where we pour."),
    p("A gin is in development. It will announce itself when it is ready."),
    h2("The name"),
    p("Verboten is German for forbidden. The name is a promise about restraint: nothing leaves this house unless it earns the label. South African soul, a German sounding surname, and an Afrikaans undercurrent for the ones who know."),
    h2("Where this goes"),
    p("South Africa first: Pretoria, then every good back bar in the country. Then outward. The Netherlands and Germany are the first stops abroad, not because it sounds good in a paragraph, but because the plan is already on the wall."),
    p("Guinness was not built to be a novelty. Neither is this."),
  ),
  _status: "published",
};

const SERVE_UPDATE = {
  name: "Neat, one cube",
  description:
    "The house serve. The brandy was finished in French oak so you could taste it, not bury it.",
};

/* ---- REST helpers ---- */

let token = null;

const api = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(
      `${method} ${path} -> ${res.status} ${typeof payload === "string" ? payload.slice(0, 200) : JSON.stringify(payload).slice(0, 300)}`,
    );
  }
  return payload;
};

const findBySlug = async (collection, ...slugs) => {
  for (const slug of slugs) {
    const res = await api(
      `/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&depth=0&limit=1&draft=false`,
    );
    if (res?.docs?.[0]) return res.docs[0];
  }
  return null;
};

const run = async () => {
  console.log(`Target: ${BASE_URL}`);

  const login = await api("/api/users/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  token = login.token;
  if (!token) throw new Error("Login succeeded but no token returned.");
  console.log(`Logged in as ${EMAIL}`);

  // 1. Announcement bar.
  await api("/api/globals/site-settings", {
    method: "POST",
    body: { announcement: { enabled: true, text: ANNOUNCEMENT } },
  });
  console.log("Announcement bar updated");

  // 2. Products: rename, re-slug, respec.
  const ids = {};
  for (const prod of PRODUCTS) {
    const found = await findBySlug("products", prod.slug, prod.oldSlug);
    if (!found) {
      console.warn(`SKIP: product not found for ${prod.oldSlug}`);
      continue;
    }
    await api(`/api/products/${found.id}`, { method: "PATCH", body: prod.data });
    ids[prod.slug] = found.id;
    console.log(`Product updated: ${prod.slug}`);
  }

  // 3. Flagship cross-sell (the "Also from the house" section needs this).
  if (ids["verboten-premium-brandy"] && ids["verboten-premium-set-2-bottle"] && ids["verboten-brandy-cola"]) {
    await api(`/api/products/${ids["verboten-premium-brandy"]}`, {
      method: "PATCH",
      body: {
        relatedProducts: [ids["verboten-premium-set-2-bottle"], ids["verboten-brandy-cola"]],
        _status: "published",
      },
    });
    console.log("Flagship cross-sell wired");
  }

  // 4. Journal: update the release post, create the two new posts.
  for (const [slug, data] of Object.entries(JOURNAL_UPDATES)) {
    const found = await findBySlug("journal-posts", slug);
    if (!found) {
      console.warn(`SKIP: journal post ${slug} not found`);
      continue;
    }
    await api(`/api/journal-posts/${found.id}`, { method: "PATCH", body: data });
    console.log(`Journal post updated: ${slug}`);
  }
  for (const post of JOURNAL_NEW) {
    const existing = await findBySlug("journal-posts", post.slug);
    if (existing) {
      await api(`/api/journal-posts/${existing.id}`, { method: "PATCH", body: post });
      console.log(`Journal post refreshed: ${post.slug}`);
    } else {
      await api(`/api/journal-posts`, { method: "POST", body: post });
      console.log(`Journal post created: ${post.slug}`);
    }
  }

  // 4b. Media alt text still naming the batch (screen readers and Google
  // Images read these). Filenames stay as they are; only alt changes.
  const media = await api(
    `/api/media?where[alt][contains]=${encodeURIComponent("Batch No")}&depth=0&limit=50`,
  );
  for (const m of media?.docs ?? []) {
    const alt = m.alt.replace(/,? Batch No\.? 0?1/gi, "").replace(/\s{2,}/g, " ").trim();
    if (alt !== m.alt) {
      await api(`/api/media/${m.id}`, { method: "PATCH", body: { alt } });
      console.log(`Media alt updated: "${m.alt}" -> "${alt}"`);
    }
  }

  // 5. Story page.
  const story = await findBySlug("pages", "story");
  if (story) {
    await api(`/api/pages/${story.id}`, { method: "PATCH", body: STORY_PAGE });
    console.log("Story page updated");
  }

  // 6. The house serve description.
  const serves = await api(
    `/api/serves?where[name][equals]=${encodeURIComponent(SERVE_UPDATE.name)}&depth=0&limit=1`,
  );
  if (serves?.docs?.[0]) {
    await api(`/api/serves/${serves.docs[0].id}`, {
      method: "PATCH",
      body: { description: SERVE_UPDATE.description },
    });
    console.log("House serve description updated");
  }

  console.log("\nDone. The live site refreshes itself within a few minutes.");
};

run().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
