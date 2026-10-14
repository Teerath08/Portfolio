"use client";

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

/** Viewport config that reveals a little before the element is fully visible. */
export const revealViewport = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;
