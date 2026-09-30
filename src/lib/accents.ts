import type { AccentKey } from "@/data/types";

/**
 * Accent tokens, resolved to literal Tailwind class strings.
 *
 * These must stay static: Tailwind scans source files for complete class
 * names, so a computed `bg-${accent}-500/10` would be purged from the build.
 * Every accent-dependent class in the app comes from this table instead.
 */
export interface AccentTokens {
  /** Small mono badge / pill. */
  badge: string;
  /** Solid icon tile. */
  tile: string;
  /** Text colour that stays legible on the dark canvas. */
  text: string;
  /** Muted version for supporting copy. */
  muted: string;
  /** Hairline border. */
  border: string;
  /** Border that lights up on hover / focus. */
  borderHover: string;
  /** Very low-alpha fill for inactive chips. */
  surface: string;
  /** Soft radial wash used behind a card. */
  glow: string;
  /** Progress / level meter fill. */
  meter: string;
  /** Scrollbar and focus ring colour. */
  ring: string;
}

const accents: Record<AccentKey, AccentTokens> = {
  cyan: {
    badge: "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
    tile: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
    text: "text-cyan-300",
    muted: "text-cyan-300/70",
    border: "border-cyan-400/20",
    borderHover: "border-cyan-400/55",
    surface: "bg-cyan-400/[0.06]",
    glow: "bg-cyan-400/[0.07]",
    meter: "bg-cyan-300",
    ring: "focus-visible:ring-cyan-400/70",
  },
  sky: {
    badge: "bg-sky-400/10 text-sky-300 border-sky-400/25",
    tile: "bg-sky-400/10 text-sky-300 border-sky-400/30",
    text: "text-sky-300",
    muted: "text-sky-300/70",
    border: "border-sky-400/20",
    borderHover: "border-sky-400/55",
    surface: "bg-sky-400/[0.06]",
    glow: "bg-sky-400/[0.07]",
    meter: "bg-sky-300",
    ring: "focus-visible:ring-sky-400/70",
  },
  violet: {
    badge: "bg-violet-400/10 text-violet-300 border-violet-400/25",
    tile: "bg-violet-400/10 text-violet-300 border-violet-400/30",
    text: "text-violet-300",
    muted: "text-violet-300/70",
    border: "border-violet-400/20",
    borderHover: "border-violet-400/55",
    surface: "bg-violet-400/[0.06]",
    glow: "bg-violet-400/[0.07]",
    meter: "bg-violet-300",
    ring: "focus-visible:ring-violet-400/70",
  },
  amber: {
    badge: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    tile: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    text: "text-amber-300",
    muted: "text-amber-300/70",
    border: "border-amber-400/20",
    borderHover: "border-amber-400/55",
    surface: "bg-amber-400/[0.06]",
    glow: "bg-amber-400/[0.07]",
    meter: "bg-amber-300",
    ring: "focus-visible:ring-amber-400/70",
  },
};

export function accent(key: AccentKey | undefined): AccentTokens {
  return accents[key ?? "cyan"];
}

/**
 * CSS custom property values, used where inline style is more practical than a
 * class (SVG strokes, box-shadow colours, canvas fills).
 *
 * The set is cyan, sky, violet and amber. There is deliberately no green or teal
 * in it: next to a cyan accent a teal sibling does not read as a second colour,
 * it reads as the first one gone wrong.
 */
export const accentHex: Record<AccentKey, string> = {
  cyan: "#22d3ee",
  sky: "#38bdf8",
  violet: "#a78bfa",
  amber: "#fbbf24",
};