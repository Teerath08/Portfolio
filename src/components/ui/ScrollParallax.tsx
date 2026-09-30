"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/cn";

/**
 * Scroll-linked offset and fade for a block of content.
 *
 * This is the DOM half of the hero's scroll animation; the WebGL half lives in
 * `HeroScene`, which reads `window.scrollY` inside its own frame loop. Both are
 * driven by the same scroll and neither touches React state, so a scroll costs
 * two style writes per frame and no renders at all.
 *
 * Framer Motion's scroll values are updated by its own passive listener and
 * pushed straight to the element's transform, which is the important part: the
 * usual way to do this is a `scroll` handler calling `setState` and
 * `getBoundingClientRect`, and that re-renders a component on every frame and
 * forces a layout read per frame.
 *
 * Children arrive as `children` rather than being imported here, so whatever it
 * wraps stays a server component and is still rendered on the server.
 */
interface ScrollParallaxProps {
  children: ReactNode;
  /**
   * How far the block travels, in pixels, by the end of `span`.
   * Negative values move the block down, which is the right choice for content
   * that should feel like it is being left behind.
   */
  distance?: number;
  /** Opacity at the end of the scroll span. */
  endOpacity?: number;
  /** Scroll distance, in pixels, over which the effect plays out. */
  span?: number;
  className?: string;
}

export default function ScrollParallax({
  children,
  distance = 64,
  endOpacity = 1,
  span = 900,
  className,
}: ScrollParallaxProps) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Declared unconditionally so the hook order is identical between the reduced
  // and full-motion branches.
  const y = useTransform(scrollY, [0, span], [0, distance]);
  const opacity = useTransform(scrollY, [0, span], [1, endOpacity]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(endOpacity === 0 && "pointer-events-none", className)}
      style={{ y, opacity }}
    >
      {children}
    </motion.div>
  );
}
