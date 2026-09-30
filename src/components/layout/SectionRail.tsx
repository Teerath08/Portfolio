"use client";

import { useMemo } from "react";
import { allSections } from "@/data";
import { useActiveSection } from "@/lib/hooks";
import { navigateToSection } from "@/lib/navigate";
import { cn } from "@/lib/cn";

/**
 * Section rail.
 *
 * An upgrade of the previous floating quick-nav pill: the same job — jump to any
 * section from anywhere — but as a thin vertical index down the right edge that
 * stays out of the way of the content and shows where you are in the document.
 *
 * Hidden below `xl`, where it would crowd the page, and hidden entirely from the
 * print and from the screenshot a CV link produces.
 */
export default function SectionRail() {
  const ids = useMemo(() => allSections.map((section) => section.id), []);
  const active = useActiveSection(ids, "-40% 0px -55% 0px");

  return (
    <nav
      aria-label="Section index"
      className="no-print pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ol className="pointer-events-auto flex flex-col items-end gap-1">
        {allSections.map((section, index) => {
          const isActive = active === section.id;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => navigateToSection(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center justify-end gap-2.5 py-1 pl-3"
              >
                {/* Label, revealed on hover or when the section is current. */}
                <span
                  className={cn(
                    "whitespace-nowrap font-mono text-[10px] uppercase tracking-label transition-all duration-300 ease-out",
                    isActive
                      ? "translate-x-0 text-accent opacity-100"
                      : "translate-x-1 text-dim opacity-0 group-hover:translate-x-0 group-hover:text-muted group-hover:opacity-100",
                  )}
                >
                  {section.label}
                </span>

                {/* Node. */}
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full transition-all duration-300 ease-out",
                      isActive
                        ? "h-2 w-2 bg-accent"
                        : "h-1.5 w-1.5 bg-line/30 group-hover:bg-accent/70",
                    )}
                  />
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute h-3.5 w-3.5 rounded-full border border-accent/50 animate-pulse-node"
                    />
                  )}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "index w-4 text-right text-[9px] transition-colors duration-300",
                    isActive ? "text-accent/60" : "text-dim/40",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}