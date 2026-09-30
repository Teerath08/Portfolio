"use client";

import type { MouseEvent, ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { navigateToSection } from "@/lib/navigate";
import { cn } from "@/lib/cn";

/**
 * An in-page link.
 *
 * Renders a real `<a href="#id">` so it is keyboard reachable, copyable and
 * announced correctly, then handles the click itself for a smooth scroll that
 * clears the sticky header. Without JavaScript the href still works.
 */
export default function SectionLink({
  sectionId,
  label,
  className,
  children,
  trailing = false,
}: {
  sectionId: string;
  label: string;
  className?: string;
  children?: ReactNode;
  /** Shows an upward arrow, for "back to top". */
  trailing?: boolean;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle modified clicks (new tab, download, etc.).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigateToSection(sectionId);
  };

  return (
    <a
      href={`#${sectionId}`}
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-accent",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-px w-3 bg-current opacity-40 transition-all duration-300 group-hover:w-5 group-hover:opacity-100"
      />
      {children ?? label}
      {trailing && (
        <ArrowUp
          size={13}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:-translate-y-0.5"
        />
      )}
    </a>
  );
}

/** Named alias, so either import style works. */
export { SectionLink };