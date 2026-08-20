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

/** Best-effort client key from proxy headers; falls back to a shared bucket. */
export const clientKey = (headers: Headers, scope: string): string => {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
};
