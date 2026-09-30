"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";

import { heroSignals } from "@/data/personal";
import { cn } from "@/lib/cn";
import { useAnimationFrame, usePrefersReducedMotion, useFinePointer, useTabVisible } from "@/lib/hooks";

/**
 * The hero's right-hand visual.
 *
 * Three layers, cheapest first:
 *   1. a static SVG schematic, painted on the server and on every device that
 *      should not be running a renderer at all;
 *   2. the technical labels, plain HTML positioned over the visual — these
 *      carry the actual information, so they are never inside the canvas;
 *   3. the WebGL board, lazily loaded, and only once the hero is actually on
 *      screen on a device with a precise pointer.
 *
 * The result is that the page renders instantly on a phone, costs nothing for a
 * visitor who never scrolls, and still gets the 3D object on a desktop.
 */

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Static top-down schematic of the same board, used as the fallback and as
 * the placeholder while the WebGL bundle is in flight. Pure SVG: no runtime
 * cost, themeable through `currentColor`, and it scales to any container.
 */
function BoardSchematic({ className }: { className?: string }) {
  const traces = [
    "M40 58 H150 L176 84 H236",
    "M40 96 H138 L160 118 H300",
    "M300 46 H214 L196 70 H96",
    "M300 84 H228 L206 108 H74",
    "M74 150 V132 H180",
    "M232 150 V128 H332",
  ];

  return (
    <svg
      viewBox="0 0 380 190"
      className={cn("h-full w-full text-accent", className)}
      role="img"
      aria-label="Schematic of a microcontroller development board with a Wi-Fi module, header pins, a USB connector and copper traces."
    >
      <defs>
        <pattern id="hero-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke="currentColor" strokeOpacity="0.10" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="380" height="190" rx="14" fill="currentColor" fillOpacity="0.03" />
      <rect width="380" height="190" rx="14" fill="url(#hero-grid)" />
      <rect
        x="2"
        y="2"
        width="376"
        height="186"
        rx="13"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />

      {/* Copper traces */}
      <g stroke="currentColor" strokeOpacity="0.42" strokeWidth="1.4" fill="none" strokeLinejoin="round">
        {traces.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Vias */}
      {[
        [150, 58],
        [138, 96],
        [214, 46],
        [228, 84],
        [180, 132],
        [232, 128],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="3" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="1.1" fill="currentColor" fillOpacity="0.75" />
        </g>
      ))}

      {/* Wi-Fi module with its folded antenna */}
      <rect x="150" y="76" width="96" height="46" rx="6" fill="rgb(var(--surface-2))" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <path d="M164 92 H206 M164 102 H224 M164 112 H198" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M62 66 H120 V80 M62 78 H104 V92 M120 96 H96" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" fill="none" strokeLinejoin="round" />

      {/* Header pins, two rows of ten */}
      {[0, 1].map((row) =>
        Array.from({ length: 10 }, (_, i) => (
          <rect
            key={`${row}-${i}`}
            x={168 + i * 11}
            y={52 + row * 96}
            width="5"
            height="5"
            rx="1.2"
            fill="currentColor"
            fillOpacity="0.5"
          />
        )),
      )}

      {/* USB connector */}
      <rect x="300" y="72" width="42" height="52" rx="5" fill="rgb(var(--surface-2))" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <rect x="334" y="82" width="12" height="32" rx="2" fill="currentColor" fillOpacity="0.28" />

      {/* Status LEDs */}
      <circle cx="286" cy="52" r="5" fill="currentColor" fillOpacity="0.85" />
      <circle cx="300" cy="52" r="4.4" fill="currentColor" fillOpacity="0.22" />

      {/* Capacitor and crystal */}
      <circle cx="262" cy="142" r="11" fill="rgb(var(--surface-2))" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.1" />
      <rect x="236" y="34" width="30" height="13" rx="3" fill="rgb(var(--surface-2))" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.1" />

      {/* Mounting holes */}
      {[
        [18, 18],
        [362, 18],
        [18, 172],
        [362, 172],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/**
 * Technical labels ringing the visual.
 *
 * These are real content — the areas this portfolio actually covers — so they
 * live in HTML rather than in the canvas, where they would be invisible to
 * assistive technology and to anyone who lands on a reduced-motion build.
 */
function TechLabels({
  reducedMotion,
  finePointer,
}: {
  reducedMotion: boolean;
  finePointer: boolean;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const parallax = reducedMotion || !finePointer;

  useAnimationFrame(
    (delta) => {
      const layer = layerRef.current;
      if (!layer) return;

      const k = 1 - Math.exp(-delta / 120);
      eased.current.x += (pointer.current.x - eased.current.x) * k;
      eased.current.y += (pointer.current.y - eased.current.y) * k;

      const children = layer.children;
      for (let i = 0; i < children.length; i += 1) {
        // Labels nearer the outside of the box travel further, which reads as
        // depth without needing a real 3D transform.
        const depth = 6 + (i % 3) * 4;
        const child = children[i] as HTMLElement;
        child.style.transform = `translate3d(${(-eased.current.x * depth).toFixed(2)}px, ${(
          -eased.current.y * depth
        ).toFixed(2)}px, 0)`;
      }
    },
    !parallax,
  );

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      onPointerMove={
        parallax
          ? undefined
          : (event) => {
              const host = event.currentTarget.getBoundingClientRect();
              pointer.current.x = (event.clientX - host.left) / host.width - 0.5;
              pointer.current.y = (event.clientY - host.top) / host.height - 0.5;
            }
      }
    >
      {heroSignals.map((signal, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        return (
          <span
            key={signal.label}
            className={cn(
              "absolute font-mono text-[10px] uppercase tracking-label transition-colors duration-500",
              side === "left" ? "left-0 sm:left-1" : "right-0 sm:right-1",
            )}
            style={{ top: `${signal.offset}%`, transform: "translate3d(0,0,0)" }}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md border border-line/10 bg-surface/70 px-2 py-1",
                side === "left" ? "flex-row" : "flex-row-reverse",
              )}
            >
              <span className="h-1 w-1 rounded-full bg-accent/70" />
              <span className="text-muted">{signal.label}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function HeroVisual({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const tabVisible = useTabVisible();
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  // The renderer only runs where it can be seen, on a precise pointer, with the
  // tab in front, and when the visitor has not asked for less motion. Every one
  // of these reads `false` on the first render, so nothing expensive is ever
  // created during hydration.
  const useWebGL = finePointer && !reducedMotion && onScreen && tabVisible;

  return (
    <div ref={hostRef} className={cn("relative", className)}>
      {/* Ambient glow, CSS only. Present in every mode. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(var(--accent)/0.13),transparent)]"
      />

      <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
        <BoardSchematic
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            useWebGL ? "opacity-0" : "opacity-100",
          )}
        />

        {useWebGL && (
          <Suspense fallback={null}>
            <HeroScene active={onScreen && tabVisible} className="absolute inset-0" />
          </Suspense>
        )}

        <TechLabels reducedMotion={reducedMotion} finePointer={finePointer} />

        {/* Corner readout: makes the visual read as an instrument, not decoration. */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[9px] uppercase tracking-label text-dim sm:flex">
          <span className="h-px w-6 bg-line/25" />
          <span>Board / rev 01</span>
          <span className="h-px w-6 bg-line/25" />
        </div>
      </div>
    </div>
  );
}
