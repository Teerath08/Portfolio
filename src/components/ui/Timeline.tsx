"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  Award,
  GraduationCap,
  Hammer,
  Medal,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { timeline } from "@/data";
import type { TimelineKind } from "@/data/types";
import { accentHex } from "@/lib/accents";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Event kinds and the visual treatment each one gets.
 *
 * These are static class and hex lookups on purpose: Tailwind cannot see a
 * computed class name, and an inline hex is the only place a colour has to
 * cross the CSS-variable boundary.
 */
const KINDS: Record<
  TimelineKind,
  { icon: LucideIcon; hex: string; badge: string; label: string }
> = {
  milestone: {
    icon: GraduationCap,
    hex: accentHex.cyan,
    badge: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    label: "Milestone",
  },
  project: {
    icon: Hammer,
    hex: accentHex.sky,
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    label: "Project",
  },
  workshop: {
    icon: Medal,
    hex: accentHex.violet,
    badge: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    label: "Workshop",
  },
  hackathon: {
    icon: Trophy,
    hex: accentHex.amber,
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    label: "Hackathon",
  },
  certification: {
    icon: Award,
    hex: accentHex.cyan,
    badge: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    label: "Certification",
  },
};

/**
 * The timeline.
 *
 * The spine is drawn twice: once dim, at full height, and once filled by a
 * `scrollYProgress` spring so the line advances as the entries come into view.
 * That single effect is what makes the section feel like a timeline rather than
 * a list — and it costs one scroll listener, not one per entry.
 *
 * Placeholder entries are rendered honestly: dashed node, dashed border, and a
 * line saying which file to edit. An empty section would read as broken.
 */
export default function Timeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 72%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <ol ref={listRef} className="relative space-y-4">
      {/* Spine */}
      <span
        aria-hidden="true"
        className="absolute bottom-6 left-[1.0625rem] top-6 w-px bg-line/12 sm:left-[1.3125rem]"
      >
        <motion.span
          className="absolute inset-x-0 top-0 block origin-top bg-accent/55"
          style={{ height: "100%", scaleY: reduced ? 1 : progress }}
        />
      </span>

      {timeline.map((entry, index) => {
        const kind = KINDS[entry.kind];
        const Icon = kind.icon;

        return (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: reduced ? 0.2 : 0.5,
              delay: reduced ? 0 : Math.min(index * 0.05, 0.25),
              ease: easeOut,
            }}
            className="relative"
          >
            <div
              className={cn(
                "grid grid-cols-[2.125rem_1fr] gap-4 sm:grid-cols-[2.625rem_1fr] sm:gap-5",
              )}
            >
              {/* Node */}
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 mt-4 grid h-[2.125rem] w-[2.125rem] place-items-center rounded-full border bg-canvas sm:h-[2.625rem] sm:w-[2.625rem]",
                  entry.placeholder ? "border-dashed border-line/25" : kind.badge,
                )}
              >
                {entry.placeholder ? (
                  <span className="font-mono text-[11px] text-dim">+</span>
                ) : (
                  <Icon size={15} strokeWidth={1.9} />
                )}
              </span>

              {/* Card */}
              <div
                className={cn(
                  "min-w-0 rounded-xl border p-4 transition-colors duration-500 sm:p-5",
                  entry.placeholder
                    ? "border-dashed border-line/18 bg-surface/25"
                    : "edge-lit tile tile-hover",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="label text-accent/80">{entry.date}</span>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-label",
                      entry.placeholder ? "border-dashed border-line/20 text-dim" : kind.badge,
                    )}
                  >
                    {entry.placeholder ? "Slot" : kind.label}
                  </span>
                </div>

                <h3
                  className={cn(
                    "mt-2 text-base font-semibold tracking-tight",
                    entry.placeholder ? "text-dim" : "text-ink",
                  )}
                >
                  {entry.title}
                </h3>

                <p className="mt-1 font-mono text-[11px] text-dim">{entry.org}</p>

                <p className="mt-3 text-sm leading-relaxed text-muted">{entry.description}</p>

                {entry.tags && entry.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
