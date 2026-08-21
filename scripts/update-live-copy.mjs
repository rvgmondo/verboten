/**
 * Push the current brand copy to the LIVE site over Payload's REST API.
 *
 * Why this exists: the deploy preserves the live database (verboten.db is never
 * overwritten), so CMS-stored copy (product descriptions, batch story, journal,
 * the story page, the announcement bar) does not change when you deploy code.
 * This script updates those fields in place. It touches ONLY text fields, so it
 * cannot break image references. Each update runs through the live Payload
 * instance, which fires the cache-revalidation hooks, so the site refreshes
 * itself within moments (no rebuild, no database upload).
 *
 * Run it from the project root with the portable Node:
 *   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
 *   $env:ADMIN_EMAIL = "admin@verboten.co.za"
 *   $env:ADMIN_PASSWORD = "<your admin password>"
 *   node scripts/update-live-copy.mjs
 *
 * Optional: set BASE_URL to target something other than https://verboten.co.za.
 */

const BASE_URL = (process.env.BASE_URL || "https://verboten.co.za").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables first. See the header of this file.",
  );
  process.exit(1);
}

/* ---- minimal Lexical builders (must match src/seed/lexical.ts) ---- */

const text = (t) => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: t,
  version: 1,
});

const p = (t) => ({
  type: "paragraph",
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: [text(t)],
});

const h2 = (t) => ({
  type: "heading",
  tag: "h2",
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: [text(t)],
});

const doc = (...children) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children,
  },
});

const paragraphs = (...texts) => doc(...texts.map(p));

/* ---- the copy (kept in step with src/seed) ---- */

const ANNOUNCEMENT = "Limited edition, from Pretoria | Ships nationwide in 1 to 2 weeks";

const BATCH_STORY = paragraphs(
  "This is the first one. A limited edition, matured at least three years in oak and finished in French casks. Made to a standard, not to a schedule.",
  "We started in Pretoria with one idea: a South African brandy good enough to stand anywhere in the world. When this edition is gone, the next one earns its own name.",
);

const PRODUCTS = {
  "verboten-premium-brandy-batch-no-01-3-year": {
    shortDescription:
      "A three year South African brandy, finished in French oak and bottled at 43% ABV. Born in Pretoria, made for the world.",
    description: paragraphs(
      "Three years in oak, then a finish in French casks. Bottled at 43% ABV in Pretoria. A brandy that drinks like it has somewhere to be.",
      "Neat, it holds its own next to anything on the shelf. Tall, over ice with cola, it is South Africa in a glass. Either way, it was built to be poured far from home.",
    ),
  },
  "verboten-brandy-cola": {
    shortDescription:
      "The same brandy, cut with cola and canned. Cold, easy, and unmistakably South African.",
    description: paragraphs(
      "The flagship brandy, cut with cola and canned. Made to be drunk cold, straight from the can or over ice. The national serve, ready when you are.",
    ),
  },
  "batch-no-01-premium-set-2-bottle": {
    shortDescription:
      "Two bottles of Verboten Premium Brandy, Batch No. 01. One to open now, one to keep.",
    description: paragraphs(
      "Two bottles from the same limited edition. Open one now, keep the second for the night that calls for it.",
    ),
  },
};

const JOURNAL = {
  "batch-no-01-is-open": {
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
        "Order from the shop and it ships anywhere in South Africa within one to two weeks. There is also a two bottle set: one to open, one to keep. When this edition is gone, the next one earns its own name.",
      ),
    ),
  },
};

const STORY_PAGE = {
  intro:
    "Verboten is an independent South African brandy house in Pretoria. We make premium brandy in limited editions, rooted here and built to be poured in places that have never heard an accent like ours.",
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
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(
      `${method} ${path} -> ${res.status} ${typeof payload === "string" ? payload.slice(0, 200) : JSON.stringify(payload).slice(0, 300)}`,
    );
  }
  return payload;
};

const findId = async (collection, field, value) => {
  const q = `where[${field}][equals]=${encodeURIComponent(value)}`;
  const res = await api(`/api/${collection}?${q}&depth=0&limit=1`);
  const first = res?.docs?.[0];
  if (!first) throw new Error(`No ${collection} found where ${field}=${value}`);
  return first.id;
};

const run = async () => {
  console.log(`Target: ${BASE_URL}`);

  // 1. Log in.
  const login = await api("/api/users/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  token = login.token;
  if (!token) throw new Error("Login succeeded but no token was returned.");
  console.log(`Logged in as ${EMAIL}`);

  // 2. Announcement bar (global).
  await api("/api/globals/site-settings", {
    method: "POST",
    body: { announcement: { enabled: true, text: ANNOUNCEMENT } },
  });
  console.log("Updated announcement bar");

  // 3. Batch No. 01 story.
  const batchId = await findId("batches", "batchNumber", 1);
  await api(`/api/batches/${batchId}`, { method: "PATCH", body: { story: BATCH_STORY } });
  console.log("Updated Batch No. 01 story");

  // 4. Products.
  for (const [slug, data] of Object.entries(PRODUCTS)) {
    const id = await findId("products", "slug", slug);
    await api(`/api/products/${id}`, {
      method: "PATCH",
      body: { ...data, _status: "published" },
    });
    console.log(`Updated product ${slug}`);
  }

  // 5. Journal posts.
  for (const [slug, data] of Object.entries(JOURNAL)) {
    const id = await findId("journal-posts", "slug", slug);
    await api(`/api/journal-posts/${id}`, {
      method: "PATCH",
      body: { ...data, _status: "published" },
    });
    console.log(`Updated journal post ${slug}`);
  }

  // 6. Story page.
  const storyId = await findId("pages", "slug", "story");
  await api(`/api/pages/${storyId}`, {
    method: "PATCH",
    body: { ...STORY_PAGE, _status: "published" },
  });
  console.log("Updated story page");

  console.log("\nDone. The live site refreshes itself within a few minutes.");
};

run().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
