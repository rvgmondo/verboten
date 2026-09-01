/**
 * Measure what a page actually costs a phone.
 *
 * Guessing at performance is how a 1.49 MB PNG ended up preloaded on the
 * product page. This fetches a page, pulls out every asset it references,
 * asks the server for each one's size, and reports the total a 360px phone
 * would download on a cold visit.
 *
 * For images it follows the srcset and picks the candidate a 360px viewport at
 * 2x would actually choose, rather than the largest, so the number reflects
 * what a person on mobile data pays rather than a worst case nobody hits.
 *
 *   $env:Path = "C:\CC\verboten\vendor\node;$env:Path"
 *   node scripts/measure-weight.mjs
 */

import http from "node:http";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/shop", "/shop/verboten-premium-brandy", "/checkout", "/story", "/find-us"];

/** A 360px phone at 2x asks for roughly 720 CSS pixels of image. */
const TARGET_WIDTH = 720;

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

/**
 * One request at a time, with a retry. Measuring a connection storm tells you
 * how the server copes under load, not how heavy the page is.
 *
 * Note for anyone passing paths on the command line from Git Bash: it rewrites
 * a leading slash into a Windows path, so `measure-weight.mjs /` arrives as
 * "C:/Program Files/Git/". Use MSYS_NO_PATHCONV=1, or no arguments at all.
 */
/**
 * Bytes actually received, with compression left on.
 *
 * fetch() decompresses transparently, so measuring with it reports what the
 * file weighs on disk rather than what a phone pays for it. Half a megabyte of
 * JavaScript is closer to 150KB over the wire, and reporting the larger number
 * would send someone optimising the wrong thing. This counts the raw bytes off
 * the socket instead.
 */
const sizeOf = (url, attempt = 0) =>
  new Promise((resolve) => {
    const target = new URL(url, BASE);
    const req = http.get(
      target,
      { headers: { "accept-encoding": "gzip, deflate, br" } },
      (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          resolve(0);
          return;
        }
        let bytes = 0;
        res.on("data", (chunk) => {
          bytes += chunk.length;
        });
        res.on("end", () => resolve(bytes));
      },
    );
    req.on("error", async (err) => {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 150));
        resolve(await sizeOf(url, attempt + 1));
        return;
      }
      console.error(`  could not measure ${url}: ${err.message}`);
      resolve(0);
    });
  });

/** The candidate a phone would pick out of a srcset. */
const pickFromSrcSet = (srcset) => {
  const candidates = srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/))
    .map(([url, w]) => ({ url, width: Number(String(w).replace("w", "")) || 0 }))
    .filter((c) => c.url)
    .sort((a, b) => a.width - b.width);
  return (candidates.find((c) => c.width >= TARGET_WIDTH) ?? candidates[candidates.length - 1])?.url;
};

const measure = async (path) => {
  const res = await fetch(new URL(path, BASE)).catch(async (err) => {
    await new Promise((r) => setTimeout(r, 300));
    return fetch(new URL(path, BASE)).catch(() => {
      throw new Error(`could not fetch ${path}: ${err.message}`);
    });
  });
  const html = await res.text();
  // Counted over the wire, like every other asset.
  const htmlBytes = await sizeOf(path);

  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const fonts = [...html.matchAll(/href="(\/_next\/static\/media\/[^"]+\.woff2)"/g)].map((m) => m[1]);

  // Images: prefer the srcset candidate a phone would take.
  const imgs = new Set();
  for (const m of html.matchAll(/<img[^>]*>/g)) {
    const tag = m[0];
    const srcset = tag.match(/srcSet="([^"]+)"|srcset="([^"]+)"/);
    if (srcset) {
      const picked = pickFromSrcSet(srcset[1] ?? srcset[2]);
      if (picked) imgs.add(picked);
      continue;
    }
    const src = tag.match(/src="([^"]+)"/);
    if (src && !src[1].startsWith("data:")) imgs.add(src[1]);
  }
  for (const m of html.matchAll(/<link[^>]+rel="preload"[^>]+as="image"[^>]*>/g)) {
    const tag = m[0];
    const ss = tag.match(/imageSrcSet="([^"]+)"/);
    if (ss) {
      const picked = pickFromSrcSet(ss[1]);
      if (picked) imgs.add(picked);
    } else {
      const href = tag.match(/href="([^"]+)"/);
      if (href) imgs.add(href[1]);
    }
  }

  const group = async (urls) => {
    const out = [];
    for (const u of new Set(urls)) out.push([u, await sizeOf(u)]);
    return out;
  };

  const js = await group(scripts);
  const css = await group(styles);
  const font = await group(fonts);
  const img = await group([...imgs]);

  const sum = (list) => list.reduce((t, [, n]) => t + n, 0);
  const total = htmlBytes + sum(js) + sum(css) + sum(font) + sum(img);

  return { path, htmlBytes, js, css, font, img, sum, total };
};

const run = async () => {
  console.log(`Measuring ${BASE}, as a 360px phone at 2x\n`);
  const heavy = [];

  for (const p of PAGES) {
    const r = await measure(p);
    console.log(`${r.path}`);
    console.log(`  html   ${kb(r.htmlBytes).padStart(8)}`);
    console.log(`  css    ${kb(r.sum(r.css)).padStart(8)}  (${r.css.length} files)`);
    console.log(`  js     ${kb(r.sum(r.js)).padStart(8)}  (${r.js.length} files)`);
    console.log(`  fonts  ${kb(r.sum(r.font)).padStart(8)}  (${r.font.length} files)`);
    console.log(`  images ${kb(r.sum(r.img)).padStart(8)}  (${r.img.length} files)`);
    console.log(`  TOTAL  ${kb(r.total).padStart(8)}`);
    for (const [u, n] of [...r.js, ...r.img, ...r.css, ...r.font]) {
      if (n > 200 * 1024) heavy.push([r.path, u, n]);
    }
    console.log("");
  }

  if (heavy.length) {
    console.log("Assets over 200KB a phone downloads:");
    for (const [p, u, n] of heavy) console.log(`  ${kb(n).padStart(8)}  ${p}  ${u}`);
  } else {
    console.log("No single asset over 200KB.");
  }
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
