import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /**
   * Id for the rendered heading. Pass the value your `<section>` uses for
   * `aria-labelledby` so the accessible name is the heading a visitor can
   * actually see, rather than a second heading hidden with `sr-only`.
   */
  id?: string;
  /** Zero-padded position, e.g. "02". */
  index?: string;
  /** Small mono label above the title. */
  eyebrow: string;
  title: string;
  /** Rendered in accent after the title. */
  highlight?: string;
  lede?: string;
  /** Right-hand slot: a small technical readout, or nothing. */
  aside?: ReactNode;
  className?: string;
}

/**
 * The section header used by every section on the page.
 *
 * Deliberately a server component: it is static markup, and keeping it out of
 * the client bundle means only the small interactive pieces below it ship
 * JavaScript. The one flourish — the rule that draws itself — is a CSS
 * animation triggered by a scroll-linked class, not a JS timeline.
 */
export default function SectionHeader({
  id,
  index,
  eyebrow,
  title,
  highlight,
  lede,
  aside,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <div className="section-eyebrow">
          {index && (
            <span className="text-accent tabular-nums" aria-hidden="true">
              {index}
            </span>
          )}
          <span className="h-px w-6 bg-line/25" aria-hidden="true" />
          <span>{eyebrow}</span>
        </div>

        <h2 id={id} className="section-title mt-4">
          {title}
          {highlight && (
            <>
              {" "}
              <span className="text-accent">{highlight}</span>
            </>
          )}
        </h2>

        {lede && <p className="section-lede">{lede}</p>}
      </div>

      {aside && <div className="shrink-0 md:pb-1">{aside}</div>}
    </header>
  );
}