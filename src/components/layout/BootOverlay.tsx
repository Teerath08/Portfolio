"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const SESSION_KEY = "portfolio-booted";

/**
 * Boot sequence.
 *
 * Three lines of status text and a sweep, held for about 700ms on a first
 * visit and skipped entirely on every later visit in the same session. The page
 * underneath is fully server-rendered and interactive the whole time — this sits
 * over it and then gets out of the way, so it never delays reading.
 *
 * Visitors who prefer reduced motion see the page immediately.
 */
/**
 * Whether the boot sequence has already played in this session.
 *
 * Read as an external store rather than `useState` + `useEffect` so the first
 * render already knows whether to show the overlay — there is no render where it
 * decides to appear, which is what would cause a flash. The server snapshot
 * says "already booted" so the overlay is never part of the server HTML.
 */
function subscribeBootFlag(): () => void {
  return () => {};
}

function readBootFlag(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Private browsing can throw on sessionStorage. Showing the sequence once
    // is harmless, so fall through rather than failing.
    return false;
  }
}

export default function BootOverlay() {
  const reduced = usePrefersReducedMotion();
  const booted = useSyncExternalStore(subscribeBootFlag, readBootFlag, () => true);
  const [dismissing, setDismissing] = useState(false);
  const [finished, setFinished] = useState(false);

  const wanted = !reduced && !booted;

  useEffect(() => {
    if (!wanted || finished) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore — the sequence simply replays next reload */
    }

    const leave = window.setTimeout(() => setDismissing(true), 620);
    const done = window.setTimeout(() => setFinished(true), 900);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, [wanted, finished]);

  if (!wanted || finished) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[95] flex items-center justify-center bg-canvas",
        "transition-opacity duration-300 ease-out",
        dismissing ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      {/* Sweeping highlight. */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-x-0 h-32"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgb(var(--accent) / 0.07), transparent)",
            animation: dismissing ? undefined : "boot-sweep 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative flex w-full max-w-xs flex-col gap-3 px-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-label text-accent">
            Initialising
          </span>
          <span className="font-mono text-[11px] text-dim">v1.0</span>
        </div>

        <div className="h-px w-full overflow-hidden bg-line/12">
          <div
            className="h-full w-full origin-left bg-accent"
            style={{
              animation: dismissing ? undefined : "boot-bar 620ms cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          />
        </div>

        <ol className="space-y-1 font-mono text-[10px] uppercase tracking-label">
          <BootLine delay={60}>Mounting interface</BootLine>
          <BootLine delay={220}>Tracing circuits</BootLine>
          <BootLine delay={380}>Ready</BootLine>
        </ol>
      </div>
    </div>
  );
}

function BootLine({ delay, children }: { delay: number; children: string }) {
  return (
    <li
      className="flex items-center gap-2 text-dim"
      style={{ animation: `backdrop-in 300ms ease-out ${delay}ms both` }}
    >
      <span aria-hidden="true" className="text-accent">
        ›
      </span>
      {children}
    </li>
  );
}