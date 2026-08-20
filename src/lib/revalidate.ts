import type { CollectionConfig, GlobalConfig } from "payload";

/**
 * Cache invalidation: every front-end query is tagged (see src/lib/data.ts),
 * and every collection change busts its tag, so stock, price and copy are
 * never stale after an admin edit. Wrapped in try/catch because the same
 * hooks fire from seed scripts running outside Next's request scope.
 */
const bust = async (tags: string[]) => {
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of tags) revalidateTag(tag);
  } catch {
    // Outside Next (seed/CLI): nothing to invalidate.
  }
};

export const revalidateHooks = (
  ...tags: string[]
): Pick<NonNullable<CollectionConfig["hooks"]>, "afterChange" | "afterDelete"> => ({
  afterChange: [
    async ({ doc }) => {
      await bust(tags);
      return doc;
    },
  ],
  afterDelete: [
    async ({ doc }) => {
      await bust(tags);
      return doc;
    },
  ],
});

export const revalidateGlobalHooks = (
  ...tags: string[]
): Pick<NonNullable<GlobalConfig["hooks"]>, "afterChange"> => ({
  afterChange: [
    async ({ doc }) => {
      await bust(tags);
      return doc;
    },
  ],
});
