import * as React from "react";

/**
 * PLACEHOLDER CREST. A geometric V monogram in a double-ruled roundel,
 * standing in until the client's real crest artwork arrives (listed on the
 * content shot list). Inherits currentColor so it works in gold or bone.
 */
export const Crest = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="25.5" stroke="currentColor" strokeWidth="0.75" />
    <path
      d="M20 21 L32 45 L44 21"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path d="M32 10.5 L34 13.5 L32 16.5 L30 13.5 Z" fill="currentColor" />
    <path d="M32 47.5 L34 50.5 L32 53.5 L30 50.5 Z" fill="currentColor" />
  </svg>
);
