"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { hardwareCategories, hardwareComponents } from "@/data/hardware";
import type { HardwareComponent } from "@/data/types";
import { accent, accentHex } from "@/lib/accents";
import { cn } from "@/lib/cn";

/**
 * "Beyond the screen" — an interactive bench.
 *
 * On `lg` and up the components are pads on a board illustration, positioned
 * from the `x` / `y` values in `data/hardware.ts`, wired together by traces.
 * Below that the same data is rendered as a list, because a target the size of a
 * fingertip is not a target.
 *
 * Selection is plain React state with `aria-pressed` on each pad and a polite
 * live region on the detail panel: it works with a keyboard, and it is
 * announced by a screen reader when the selection changes.
 */
export default function HardwareBench() {
  const [selectedId, setSelectedId] = useState<string>(hardwareComponents[0].id);
  const reduced = useReducedMotion();

  const selected = useMemo(
    () => hardwareComponents.find((item) => item.id === selectedId) ?? hardwareComponents[0],
    [selectedId],
  );

  const select = (component: HardwareComponent) => setSelectedId(component.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
      {/* ── The board ────────────────────────────────────────────────────── */}
      <div className="panel relative overflow-hidden p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="label">Bench layout</span>
          <span className="font-mono text-[10px] uppercase tracking-label text-dim">
            {hardwareComponents.length} parts
          </span>
        </div>

        {/* Interactive board — desktop and tablet. */}
        <div className="relative hidden aspect-[4/3] w-full sm:block">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full text-line/25"
            aria-hidden="true"
          >
            {/* Board substrate */}
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="4"
              fill="rgb(var(--surface-2) / 0.5)"
              stroke="currentColor"
              strokeWidth="0.3"
            />
            {/* Mounting holes */}
            {[
              [6, 8],
              [94, 8],
              [6, 92],
              [94, 92],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" fill="none" stroke="currentColor" strokeWidth="0.3" />
            ))}
            {/* Traces between pads, sorted so the drawing is deterministic. */}
            {hardwareComponents.slice(1).map((component, index) => {
              const from = hardwareComponents[index];
              const mx = (from.x + component.x) / 2;
              return (
                <path
                  key={`trace-${component.id}`}
                  d={`M${from.x} ${from.y} H${mx} V${component.y} H${component.x}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.25"
                  strokeLinecap="round"
                  className={cn(index % 2 === 0 ? "animate-dash-flow" : undefined)}
                />
              );
            })}
          </svg>

          {/* Pads */}
          {hardwareComponents.map((component) => {
            const tokens = accent(component.accent);
            const isSelected = component.id === selected.id;

            return (
              <button
                key={component.id}
                type="button"
                onClick={() => select(component)}
                aria-pressed={isSelected}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-canvas/90",
                  "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                  isSelected
                    ? `${tokens.badge} scale-110 border-current shadow-[0_0_0_4px_rgb(var(--canvas))]`
                    : "border-line/20 hover:scale-105 hover:border-accent/50",
                )}
                style={{ left: `${component.x}%`, top: `${component.y}%` }}
              >
                <span className="sr-only">{`${component.label} — ${component.caption}`}</span>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center font-mono text-[9px] uppercase text-current sm:h-9 sm:w-9"
                >
                  {component.label.slice(0, 2)}
                </span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 animate-pulse-node rounded-full"
                    style={{ boxShadow: `0 0 0 6px ${hexToRgba(accentHex[component.accent], 0.14)}` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* List fallback — phones. Same data, same selection, no tiny targets. */}
        <div className="sm:hidden">
          {hardwareCategories.map((category) => {
            const items = hardwareComponents.filter(
              (component) => component.category === category.id,
            );
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="mb-4 last:mb-0">
                <p className="label mb-2">{category.label}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {items.map((component) => {
                    const isSelected = component.id === selected.id;
                    return (
                      <li key={component.id}>
                        <button
                          type="button"
                          onClick={() => select(component)}
                          aria-pressed={isSelected}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-300",
                            isSelected
                              ? accent(component.accent).badge
                              : "border-line/12 bg-surface/60 text-muted hover:border-accent/45 hover:text-accent",
                          )}
                        >
                          {component.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail ───────────────────────────────────────────────────────── */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="panel flex flex-col p-5 sm:p-6"
      >
        <div aria-live="polite" className="flex h-full flex-col">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={cn("h-2 w-2 rounded-full", accent(selected.accent).meter)}
            />
            <h3 className="text-lg font-semibold tracking-tight text-ink">{selected.label}</h3>
            <span className="label ml-auto">{selected.caption}</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{selected.note}</p>

          <dl className="stack-divider mt-5">
            {selected.specs.map((spec) => (
              <div key={spec.label} className="grid gap-0.5 py-2.5 sm:grid-cols-[6rem_1fr] sm:gap-4">
                <dt className="label pt-0.5">{spec.label}</dt>
                <dd className="font-mono text-[11px] leading-relaxed text-ink/85">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </div>
  );
}

/** `#22d3ee` + alpha → `rgba(...)`. Small enough not to warrant a dependency. */
function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
