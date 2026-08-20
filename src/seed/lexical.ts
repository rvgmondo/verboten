/** Build minimal Lexical richText JSON from plain paragraphs (seed use only). */
export const paragraphs = (...texts: string[]) => ({
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: texts.map((text) => ({
      type: "paragraph",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "text",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text,
          version: 1,
        },
      ],
    })),
  },
});
