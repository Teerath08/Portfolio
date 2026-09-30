"use client";

import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion.
 *
 * Two rules hold everywhere in this project:
 *   1. Nothing animates on scroll *before* it is on screen — reveals use
 *      `whileInView` with a generous margin, so content is never hidden from a
 *      reader who has simply scrolled fast.
 *   2. Reduced-motion visitors get a plain, non-transformed fade. That is
 *      handled once, here, rather than in twenty components.
 */

/** Easing used across the site. Matches `.ease-out` in the Tailwind config. */
export const easeOut = [0.16, 1, 0.3, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 28 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32 };

/** The standard section reveal. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOut } },
};

/** Same reveal, without the vertical offset — for wide, short elements. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: easeOut } },
};

/** Container that staggers its children. */
export const stagger = (staggerChildren = 0.07, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Card-level entrance used by the project, skill and lab-note grids. */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};

/**
 * The reduced-motion replacement for `fadeUp`.
 *
 * Applied by `Reveal` when the visitor prefers reduced motion: a short opacity
 * change with no movement and no stagger.
 */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

/** Viewport config that reveals a little before the element is fully visible. */
export const revealViewport = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;