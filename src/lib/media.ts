/**
 * Payload returns media URLs absolute (serverURL + /api/media/file/...).
 * next/image only accepts hosts in remotePatterns, so same-origin media is
 * normalised to its relative path, which works in every environment without
 * coupling image config to the deploy URL.
 */
export const mediaSrc = (url?: string | null): string | null => {
  if (!url) return null;
  if (!/^https?:\/\//.test(url)) return url;
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
};
