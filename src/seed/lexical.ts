/**
 * Minimal Lexical JSON builders for seeding richText fields.
 * Only what the seed copy needs: paragraphs, headings, and bullet lists.
 */

type LexicalNode = { type: string; version: number; [k: string]: unknown };

const text = (t: string): LexicalNode => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: t,
  version: 1,
});

export const p = (t: string): LexicalNode => ({
  type: "paragraph",
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: [text(t)],
});

export const h2 = (t: string): LexicalNode => ({
  type: "heading",
  tag: "h2",
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: [text(t)],
});

export const h3 = (t: string): LexicalNode => ({
  type: "heading",
  tag: "h3",
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: [text(t)],
});

export const ul = (...items: string[]): LexicalNode => ({
  type: "list",
  listType: "bullet",
  tag: "ul",
  start: 1,
  format: "",
  indent: 0,
  version: 1,
  direction: "ltr",
  children: items.map((item, i) => ({
    type: "listitem",
    value: i + 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [text(item)],
  })),
});

/** Wrap block nodes into a full richText document. */
export const doc = (...children: LexicalNode[]) => ({
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children,
  },
});

/** Back-compat helper: a document of plain paragraphs. */
export const paragraphs = (...texts: string[]) => doc(...texts.map(p));
