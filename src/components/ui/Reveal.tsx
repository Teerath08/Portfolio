"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cardIn, revealViewport } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before starting. Used for staggering by hand. */
  delay?: number;
  className?: string;
  /** Rendered as a motion element of this type. */
  as?: "div" | "li" | "section" | "article" | "header" | "footer";
  /** Repeats the animation each time the element re-enters the viewport. */
  repeat?: boolean;
}

/**
 * Scroll-triggered reveal.
 *
 * `once` is the default because a section that re-animates every time it is
 * scrolled past reads as a glitch rather than as polish. Visitors who prefer
 * reduced motion get a short opacity change with no movement.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  repeat = false,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={repeat ? { amount: 0.15, margin: "0px 0px -8% 0px" } : revealViewport}
      transition={{
        duration: reduced ? 0.25 : 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  );
}

/**
 * The same reveal, for a list whose children should cascade.
 *
 * The parent animates only its own opacity; each `<RevealItem>` handles its own
 * movement, which keeps the staggering working even when items mount lazily.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      variants={
        reduced
          ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.25 } } }
          : cardIn
      }
    >
      {children}
    </Component>
  );
}