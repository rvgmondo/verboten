import fs from "fs";
import path from "path";

import Image from "next/image";

import { Crest } from "@/components/brand/crest";
import { cn } from "@/lib/utils";

/**
 * The brand crest. Renders the real artwork from public/brand/crest.png when
 * it exists, and falls back to the placeholder SVG until it is added. The
 * file check runs once at module load (server components only), so dropping
 * the real file in lights it up everywhere on the next build with no code
 * change. Decorative: it always sits next to the VERBOTEN wordmark.
 */
const crestFile = path.join(process.cwd(), "public", "brand", "crest.png");
const hasRealCrest = fs.existsSync(crestFile);

export const BrandCrest = ({ className }: { className?: string }) => {
  if (!hasRealCrest) return <Crest className={className} />;
  return (
    <span className={cn("relative inline-block", className)} aria-hidden="true">
      <Image src="/brand/crest.png" alt="" fill sizes="80px" className="object-contain" />
    </span>
  );
};
