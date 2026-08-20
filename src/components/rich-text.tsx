import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { cn } from "@/lib/utils";

/**
 * Renders Payload lexical content with the site's long-form styles: bone
 * headings in the display face, parchment body, gold links.
 */
export const RichText = ({
  data,
  className,
}: {
  data: SerializedEditorState;
  className?: string;
}) => (
  <div
    className={cn(
      "space-y-5 text-[0.9375rem] leading-relaxed text-parch",
      "[&_h2]:font-display [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-bone",
      "[&_h3]:font-display [&_h3]:pt-2 [&_h3]:text-xl [&_h3]:text-bone",
      "[&_strong]:font-semibold [&_strong]:text-bone",
      "[&_a]:text-gold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-gold-bright",
      "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
      "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
      "[&_blockquote]:border-l [&_blockquote]:border-gold-dim [&_blockquote]:pl-5 [&_blockquote]:font-display [&_blockquote]:italic [&_blockquote]:text-bone",
      className,
    )}
  >
    <LexicalRichText data={data} />
  </div>
);
