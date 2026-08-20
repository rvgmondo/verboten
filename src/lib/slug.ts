import type { FieldHook } from "payload";

export const slugify = (val: string): string =>
  val
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/** Field hook: use the given value, else derive the slug from another field. */
export const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === "string" && value.length > 0) return slugify(value);
    const fallback = data?.[fallbackField];
    if (typeof fallback === "string" && fallback.length > 0) return slugify(fallback);
    return value;
  };
