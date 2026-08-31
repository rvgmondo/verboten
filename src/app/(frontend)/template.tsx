import * as React from "react";

/**
 * Soft fade on route change. Templates remount per navigation by design.
 *
 * Done in CSS, not JavaScript. The previous version rendered the whole page
 * inside a motion div with an inline opacity of 0, which meant the server sent
 * every route as invisible HTML and nothing painted, hero and headline
 * included, until the motion bundle downloaded and hydrated. On a mid-range
 * Android on a South African mobile connection that turns a fast paint into a
 * slow one, and a failed bundle into a blank page. A CSS animation starts on
 * first paint with no JavaScript at all, and the global
 * prefers-reduced-motion rule in globals.css already collapses it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
