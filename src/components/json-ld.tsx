/**
 * Renders schema.org JSON-LD. The </script sanitisation prevents content
 * (e.g. a product name typed in the admin) from breaking out of the tag.
 */
export const JsonLd = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);
