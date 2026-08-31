import { cn } from "@/lib/utils";

/**
 * The dark opening every page shares: candlelight, the ghost wordmark and
 * film grain, with the eyebrow rule and the display headline.
 *
 * The homepage, shop and gallery each grew their own version of this. Pulling
 * it into one component is what makes the rest of the site look like the same
 * company: one signature, applied everywhere, instead of six near-copies that
 * drift apart the moment one of them is edited.
 *
 * Body content stays on the light canvas below it. Long-form reading belongs
 * on cream, so only the opening is dark unless a page has its own reason to
 * go further (the shop and gallery do, because the photography is shot on
 * black).
 */
export const PageMasthead = ({
  eyebrow,
  title,
  titleAccent,
  lead,
  children,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  /** Second half of the headline, set in gold. */
  titleAccent?: string;
  lead?: string;
  /** Anything that sits under the lead: buttons, a facts row. */
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) => (
  <section
    className={cn(
      "inverse relative overflow-hidden border-b border-line bg-ink",
      className,
    )}
  >
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.13),rgba(205,184,141,0.04)_48%,transparent_74%)]" />
      <span className="text-ghost absolute -bottom-[10%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[21vw] font-bold leading-none tracking-[0.05em]">
        VERBOTEN
      </span>
      <div className="grain absolute inset-0 opacity-[0.05]" />
    </div>

    <div
      className={cn(
        "relative mx-auto max-w-6xl px-6 pb-14 pt-16 lg:pb-18 lg:pt-24",
        align === "center" && "text-center",
      )}
    >
      <p
        className={cn(
          "eyebrow animate-fade-up flex items-center gap-4",
          align === "center" && "justify-center",
        )}
      >
        <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
        {eyebrow}
      </p>
      <h1
        className={cn(
          "animate-fade-up mt-6 max-w-3xl font-display font-semibold leading-[0.99] tracking-tight text-bone text-[clamp(2.4rem,6vw,4.2rem)]",
          align === "center" && "mx-auto",
        )}
        style={{ animationDelay: "80ms" }}
      >
        {title}
        {titleAccent && (
          <>
            {" "}
            <span className="text-gold">{titleAccent}</span>
          </>
        )}
      </h1>
      {lead && (
        <p
          className={cn(
            "animate-fade-up mt-6 max-w-lg text-base leading-relaxed text-parch",
            align === "center" && "mx-auto",
          )}
          style={{ animationDelay: "160ms" }}
        >
          {lead}
        </p>
      )}
      {children && (
        <div className="animate-fade-up mt-9" style={{ animationDelay: "240ms" }}>
          {children}
        </div>
      )}
    </div>
  </section>
);
