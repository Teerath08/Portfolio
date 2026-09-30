"use client";

import { motion } from "framer-motion";

import { mindsetStages } from "@/data";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { easeOut } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * "How I actually build" — five stages on one signal path.
 *
 * The trace is a single SVG path with `pathLength` animated from 0 to 1 once,
 * when the section scrolls into view. Each node lights up in sequence, so the
 * section explains itself the same way a schematic does: signal travels left to
 * right and each stage is downstream of the last.
 *
 * Reduced motion renders the trace fully drawn and every node lit, because the
 * point of the diagram is the relationship, not the animation.
 */
export default function EngineeringMindset() {
  const reduced = usePrefersReducedMotion();

  const nodes = mindsetStages.length;
  // Node centres, in the 1000-wide viewBox, evenly spaced with margins.
  const first = 100;
  const last = 900;
  const step = (last - first) / (nodes - 1);
  const positions = mindsetStages.map((_, index) => first + step * index);

  // Orthogonal trace: straight between nodes, with a small step up and down
  // between them so it reads as a routed PCB track rather than a ruler.
  const trace = positions
    .slice(0, -1)
    .map((x, index) => {
      const next = positions[index + 1];
      const mid = x + step / 2;
      const drop = index % 2 === 0 ? -22 : 22;
      return `L${mid} 56 L${mid + step * 0.22} ${56 + drop} L${next - step * 0.22} ${
        56 + drop
      } L${next} 56`;
    })
    .join(" ");

  return (
    <section id="mindset" aria-labelledby="mindset-title" className="section">
      <div className="shell">
        <SectionHeader
          id="mindset-title"
          index="02"
          eyebrow="Engineering mindset"
          title="How a build"
          highlight="actually goes"
          lede="Five stages, in the order they really happen. The useful version of the process is the one that includes the part where it goes wrong."
        />

        {/* ── The trace ─────────────────────────────────────────────────── */}
        <div className="relative mt-14">
          <svg
            viewBox="0 0 1000 112"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-0 hidden h-28 w-full text-accent lg:block"
            aria-hidden="true"
          >
            {/* Dim rail the signal runs along. */}
            <path
              d={`M${first} 56 ${trace} L${last} 56`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1.25"
            />

            {/* The signal itself. */}
            <motion.path
              d={`M${first} 56 ${trace} L${last} 56`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.75"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduced ? 0 : 2.2, ease: easeOut }}
            />
          </svg>

          {/* ── Stages ───────────────────────────────────────────────────── */}
          <ol className="relative grid gap-5 lg:grid-cols-5 lg:gap-4">
            {mindsetStages.map((stage, index) => (
              <motion.li
                key={stage.index}
                initial={{ opacity: 0, y: reduced ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: reduced ? 0.2 : 0.55,
                  delay: reduced ? 0 : 0.18 + index * 0.12,
                  ease: easeOut,
                }}
                className="relative"
              >
                {/* Node: sits on the trace on desktop, inline with the index on
                    smaller screens. */}
                <div className="flex items-center gap-3 lg:block">
                  <div className="flex items-center gap-3 lg:h-28 lg:flex-col lg:items-start lg:justify-center">
                    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/35 bg-canvas font-mono text-[11px] tabular-nums text-accent">
                      {stage.index}
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden h-px w-8 bg-line/20 lg:block"
                    />
                  </div>

                  <div className="min-w-0 lg:mt-5">
                    <h3 className="text-base font-semibold tracking-tight text-ink">
                      {stage.title}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-label text-accent/80">
                      {stage.headline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {stage.body}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
