/**
 * In-memory sliding-window rate limiter for public forms and checkout.
 * Per server instance; on a multi-instance deployment move this to the
 * database or an edge limiter. For this site's traffic profile the simple
 * version is proportionate, and the honeypots do the heavy lifting.
 */

const windows = new Map<string, number[]>();

export const rateLimit = (
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean => {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  // Opportunistic cleanup so the map cannot grow without bound.
  if (windows.size > 10000) {
    for (const [k, v] of windows) {
      if (v.every((t) => now - t >= windowMs)) windows.delete(k);
    }
  }
  return true;
};

/**
 * Who is calling, for rate limiting purposes.
 *
 * This used to read x-forwarded-for, which the caller sets. Every limit on the
 * site was therefore bypassable by varying one header per request: the contact
 * form, the newsletter, the discount preview, registration and the checkout
 * itself. A limiter keyed on a value the attacker chooses is not a limiter.
 *
 * The site sits behind Cloudflare, which overwrites CF-Connecting-IP on every
 * request it proxies, so that header cannot be forged by a client coming the
 * normal way. Anything arriving without it reached the origin directly, which
 * is either a misconfiguration or someone deliberately going around the proxy.
 * Those callers share one bucket per scope, so they are limited collectively
 * rather than trusted individually. Real visitors always carry the header and
 * are unaffected.
 *
 * In development there is no Cloudflare, so the forwarded headers are honoured
 * to keep local testing usable. That branch cannot run in production.
 */
export const clientKey = (headers: Headers, scope: string): string => {
  const trusted = headers.get("cf-connecting-ip")?.trim();
  if (trusted) return `${scope}:${trusted}`;

  if (process.env.NODE_ENV !== "production") {
    const dev =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip")?.trim() ||
      "local";
    return `${scope}:dev:${dev}`;
  }

  // Direct to the origin: one shared bucket, deliberately.
  return `${scope}:direct`;
};
