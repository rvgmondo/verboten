/* Phase 1 placeholder. The real home page (cinematic hero, flagship features,
 * story teaser) is built in Phase 4 against CMS data. */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-gold)]">
        Verboten Spirits
      </p>
      <h1 className="text-3xl font-semibold">Stack scaffold running</h1>
      <p className="max-w-md text-sm opacity-70">
        Next.js 15, Payload CMS 3 and PostgreSQL are wired. Build phases 2 to 8
        replace this page.
      </p>
    </main>
  );
}
