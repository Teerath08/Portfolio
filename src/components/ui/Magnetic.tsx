"use client";

import type {
  ComponentType,
  ElementType,
  PointerEvent,
  ReactNode,
  Ref,
} from "react";
import { useRef } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

type MagneticProps<T extends ElementType> = {
  children: ReactNode;
  /** How far the element is allowed to travel, in pixels. */
  strength?: number;
  className?: string;
  as?: T;
};

/**
 * The only props `Magnetic` ever sets on whatever element it wraps.
 *
 * Spelling them out is what keeps the component type-safe: casting `as` to a
 * bare `ElementType` makes TypeScript intersect the props of *every* possible
 * element, which collapses to `never` and rejects the element's own `children`.
 */
type WrappedElementProps = {
  ref?: Ref<HTMLElement>;
  className?: string;
  children?: ReactNode;
  onPointerMove?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
  onBlur?: () => void;
};

/**
 * A magnet.
 *
 * The element leans toward the pointer while it is inside, and springs back on
 * exit. Movement is written straight to `style.transform` inside the pointer
 * handler — no React state, no re-render, so a fast mouse cannot cost a single
 * extra render. Capped at a few pixels on purpose: a button that chases the
 * cursor across the screen is a gimmick, not a detail.
 *
 * Disabled entirely for touch devices and for reduced-motion visitors.
 *
 * Wraps a single element and sets no props beyond `className` — extra props go
 * on `className` or on the child, not on `Magnetic` itself.
 */
export default function Magnetic<T extends ElementType = "div">({
  children,
  strength = 6,
  className,
  as,
}: MagneticProps<T>) {
  const Component = (as ?? "div") as ComponentType<WrappedElementProps>;
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  // Cancels the pending frame *and* clears the frame id, so a cancelled frame
  // can never be mistaken for the one still in flight.
  const settle = (x: number, y: number) => {
    const node = ref.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const handleMove = (event: PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    settle(dx * strength, dy * strength);
  };

  const reset = () => settle(0, 0);

  return (
    <Component
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onBlur={reset}
      className={cn("will-change-transform", className)}
    >
      {children}
    </Component>
  );
}
