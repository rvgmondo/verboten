/**
 * The brand lines on a slow loop: the site's recurring signature device.
 * Decorative for screen readers (the same lines exist as real content
 * elsewhere); reduced-motion visitors get a static, centered strip via the
 * global animation kill switch, which freezes the track at its start.
 */
const LINES = ["PURE SPIRIT. PURE MISCHIEF.", "VIR DIÉ WAT WEET", "MEMORIES NOT REGRETS"];

const Run = () => (
  <span className="flex shrink-0 items-center">
    {LINES.map((line) => (
      <span key={line} className="flex items-center">
        <span className="font-display text-sm font-semibold tracking-motto text-gold">
          {line}
        </span>
        <span aria-hidden="true" className="mx-8 text-[0.5rem] text-gold-dim">
          ✦
        </span>
      </span>
    ))}
  </span>
);

export const Marquee = () => (
  <div
    aria-hidden="true"
    className="inverse overflow-hidden border-b border-line bg-ink py-4"
  >
    <div className="animate-marquee flex w-max">
      {/* Two identical runs make the -50% loop seamless. */}
      <Run />
      <Run />
      <Run />
      <Run />
    </div>
  </div>
);
