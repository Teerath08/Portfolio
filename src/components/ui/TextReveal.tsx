"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface TextRevealProps {
  text: string;
  className?: string;
  /**
   * Applied to each animated word, not to the container.
   *
   * Needed for gradient text (`.text-glow`): `background-clip: text` only clips
   * to the glyphs of the element it is set on. On the container the glyphs live
   * in child spans, so the gradient would be clipped to nothing while the
   * children inherited `color: transparent` — an invisible heading.
   */
  wordClassName?: string;
  /** Animates one word at a time rather than one character. */
  byWord?: boolean;
  /** Seconds before the first word or character appears. */
  delay?: number;
  /** Per-item stagger, in seconds. */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}

/**
 * Text that assembles itself.
 *
 * Each word is wrapped in an overflow-hidden span so the lines rise into place
 * rather than fading in — the one motion effect that reads as "carefully set
 * type" instead of "a library was added".
 *
 * The split is done once, and the accessible name of the element is the plain
 * string: the animated per-word nodes are `aria-hidden`, and a screen-reader
 * copy of the sentence sits alongside them. That works on every element this
 * can render as, unlike `aria-label`, which assistive technology is free to
 * ignore on a generic `span` or `p`.
 */

/**
 * The mask each word rises out of.
 *
 * The padding is the descender budget. An inline-block's height is its line
 * box, and the headings this renders into are set at `leading-[1.03]` — tighter
 * than the font's own ascent-plus-descent, so the half-leading is *negative*
 * and the glyph box already overflows the line box by roughly 0.14em above and
 * below. Without the padding the mask shaves the tail off any descender, the
 * "g" in "Jangid" most visibly.
 *
 * The matching negative margin hands that padding straight back, so none of it
 * reaches the flex line. Without it the padding becomes the line's cross size
 * and quietly undoes the tight leading the heading asked for — the reveal would
 * work and the typography would come out at 1.3em no matter what `leading-*`
 * said.
 *
 * Written as literals rather than interpolated: Tailwind finds class names by
 * scanning source text, so a template assembled from a constant would be
 * invisible to it and the utilities would never be generated.
 */
const MASK = "inline-block overflow-hidden pb-[0.3em] -mb-[0.3em]";
export default function TextReveal({
  text,
  className,
  wordClassName,
  byWord = true,
  delay = 0,
  stagger = 0.055,
  as: Component = "span",
}: TextRevealProps) {
  const reduced = usePrefersReducedMotion();

  const items = useMemo(() => {
    const parts = byWord ? text.split(/(\s+)/) : Array.from(text);
    return parts.map((part, index) => ({
      key: `${part}-${index}`,
      part,
      // Whitespace is preserved by the surrounding flex row, never animated.
      space: byWord && /^\s+$/.test(part),
    }));
  }, [text, byWord]);

  const MotionComponent = motion[Component];

  if (reduced) {
    return (
      <Component className={cn(className, wordClassName)}>{text}</Component>
    );
  }

  return (
    <MotionComponent
      /* `flex`, not `inline-flex`. These sit inside a heading as siblings and
         have to be block-level so each takes its own line; an inline-level box
         would ignore `mt-*` and only separate because the pair happens to be too
         wide to share one. */
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      <span className="sr-only">{text}</span>
      {items.map((item) =>
        item.space ? (
          <span key={item.key} aria-hidden="true" className="inline-block">
            {" "}
          </span>
        ) : (
          <span key={item.key} aria-hidden="true" className={MASK}>
            <motion.span
              className={cn("inline-block will-change-transform", wordClassName)}
              variants={{
                hidden: { y: "105%", opacity: 0 },
                show: {
                  y: "0%",
                  opacity: 1,
                  transition: { duration: 0.8, ease: easeOut },
                },
              }}
            >
              {item.part}
            </motion.span>
          </span>
        ),
      )}
    </MotionComponent>
  );
}
