Drop the real Verboten logo files here (and one in src/app) so the site
uses them instead of the placeholder crest. Exact names matter.

1. src/app/icon.png
   The app icon (gold crest on the black rounded square), ideally 512x512
   or larger, square. Next.js turns this into the browser-tab favicon
   automatically. When present, delete src/app/icon.svg (the placeholder).

2. public/brand/crest.png
   The crest ONLY (no wordmark), gold, on a TRANSPARENT background. The flat
   gold version reads best at small sizes. Used in the header, footer, age
   gate, 404 page and section dividers.

3. public/brand/lockup-light.png   (optional)
   The full horizontal lockup (crest + VERBOTEN wordmark), light/cream
   wordmark version, transparent background. Only needed if you want the
   real wordmark artwork in the header instead of the League Spartan text.

Brand colours already applied in code:
  Primary gold   #CDB88D
  Secondary ink  #141414
  Cream surface  #F5F1E6
