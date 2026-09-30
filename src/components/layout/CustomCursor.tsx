"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Robotic reticle.
 *
 * The system pointer stays exactly where the OS put it — this never sets
 * `cursor: none`. Pointing at a 10px control, selecting a line of text, and
 * dragging a slider all keep native behaviour, which is the part a replacement
 * cursor always gets worse.
 *
 * What sits on top is an instrument reticle: four corner brackets around a
 * hollow centre, the shape used for framing a measurement. It trails the pointer
 * by a few pixels and, over anything interactive, the brackets pull outward and
 * the accent fills in. The centre is left empty on purpose so text underneath
 * stays readable.
 *
 * One `pointermove` listener and one animation frame, both writing
 * `style.transform` directly — pointer movement causes zero React renders.
 *
 * Fine pointers with motion allowed only. On touch, reduced motion, or if this
 * component fails to mount, the result is simply the normal cursor.
 */
export default function CustomCursor() {
  const reticleRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    const reticle = reticleRef.current;
    if (!enabled || !reticle) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { ...pointer };
    let interactive = false;
    let visible = false;
    let frame = 0;

    const setInteractive = (next: boolean) => {
      if (next === interactive) return;
      interactive = next;
      reticle.dataset.state = next ? "locked" : "idle";
    };

    const setVisible = (next: boolean) => {
      if (next === visible) return;
      visible = next;
      reticle.dataset.visible = String(next);
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      setVisible(true);

      const target = event.target;
      if (!(target instanceof Element)) return;
      setInteractive(
        Boolean(
          target.closest('a, button, [role="button"], summary, label, [data-cursor="hover"]'),
        ),
      );
    };

    const tick = () => {
      // Frame-rate independent easing, so the trail settles at the same rate on
      // a 60 Hz and a 120 Hz display rather than lagging further on the latter.
      trail.x += (pointer.x - trail.x) * 0.22;
      trail.y += (pointer.y - trail.y) * 0.22;
      reticle.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  const bracket =
    "absolute h-2.5 w-2.5 border-accent/70 transition-all duration-300 ease-out";

  return (
    <div
      data-cursor-layer
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] hidden lg:block"
    >
      <div
        ref={reticleRef}
        data-state="idle"
        data-visible="false"
        className="absolute left-0 top-0 h-9 w-9 will-change-transform
                   data-[visible=false]:opacity-0
                   data-[state=locked]:h-14 data-[state=locked]:w-14"
      >
        {/* Framing brackets — the reticle reads as a measurement, not a blob. */}
        <span className={`${bracket} left-0 top-0 border-l border-t`} />
        <span className={`${bracket} right-0 top-0 border-r border-t`} />
        <span className={`${bracket} bottom-0 left-0 border-l border-b`} />
        <span className={`${bracket} bottom-0 right-0 border-r border-b`} />

        {/* Centre pip. Hollow by default so selected text stays legible. */}
        <span
          data-cursor-pip
          className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2
                     rounded-full bg-accent/70 transition-all duration-300 ease-out
                     data-[state=locked]:h-1.5 data-[state=locked]:w-1.5
                     data-[state=locked]:bg-accent"
        />
      </div>
    </div>
  );
}
