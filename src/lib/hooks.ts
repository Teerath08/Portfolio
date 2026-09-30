"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { DEFAULT_THEME } from "@/lib/theme";

/**
 * Shared browser hooks.
 *
 * Every hook here is SSR-safe: it reports a conservative default on the server
 * and reconciles after hydration, so the server-rendered markup and the first
 * client render always agree.
 *
 * Browser state that used to live in components (media queries, tab visibility,
 * a hydration flag) is read through `useSyncExternalStore` instead of
 * `useState` + `useEffect`. Same behaviour, but no cascading second render and
 * no chance of an effect writing a ref during render.
 */

/**
 * One `MediaQueryList` per query, shared by every component that asks for it.
 *
 * Caching matters: `matchMedia` returns a fresh object each call, and a fresh
 * object would make `useSyncExternalStore` believe the value changed on every
 * render.
 */
const mediaQueryCache = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  let list = mediaQueryCache.get(query);
  if (!list) {
    list = window.matchMedia(query);
    mediaQueryCache.set(query, list);
  }
  return list;
}

/**
 * Subscribes to a media query.
 *
 * `false` on the server and on the very first client render, then the real
 * value. Components that must not flash expensive work (3D scenes, custom
 * cursors) are therefore off by default and opt in.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = getMediaQueryList(query);
      if (!list) return () => {};
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => getMediaQueryList(query)?.matches ?? false,
    () => false,
  );
}

/**
 * True when the visitor has asked the OS to reduce motion.
 *
 * Used to skip 3D entirely, disable the custom cursor, and collapse reveal
 * animations to a plain fade.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True only on devices with a precise pointer — a mouse or a trackpad. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * True while the tab is in front.
 *
 * The 3D scene is the reason this exists: a WebGL renderer left running in a
 * background tab burns battery for a frame nobody sees.
 */
export function useTabVisible(): boolean {
  return useSyncExternalStore(
    useCallback((onChange: () => void) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    }, []),
    () => document.visibilityState === "visible",
    () => true,
  );
}

/**
 * The active theme id.
 *
 * `data-theme` on the document element is the single source of truth, because
 * the inline boot script in `theme.ts` is what actually decides the theme — it
 * runs before React and reads localStorage and the system preference itself.
 * Mirroring that into React state would need an effect to copy it in on mount
 * and would go stale the moment another tab changed it, so this subscribes to
 * the attribute instead. There is no copy to keep in sync.
 *
 * Shared by the toggle and by the WebGL scene, which repaints the board when
 * this changes.
 */
export function useTheme(): string {
  return useSyncExternalStore(
    useCallback((onChange: () => void) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    }, []),
    () => document.documentElement.dataset.theme || DEFAULT_THEME,
    () => DEFAULT_THEME,
  );
}

/**
 * Tracks which section is currently the dominant one on screen.
 *
 * Uses IntersectionObserver rather than scroll maths, which means it costs
 * nothing per scroll event and stays correct when sections change height.
 */
export function useActiveSection(ids: readonly string[], rootMargin = "-45% 0px -50% 0px") {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }

        if (visible.size === 0) return;

        // The section covering the most of the band wins; ties break toward the
        // section further down the page, which is what the reader expects.
        let best = active;
        let bestRatio = -1;
        for (const [id, ratio] of visible) {
          const index = ids.indexOf(id);
          const bestIndex = best ? ids.indexOf(best) : -1;
          if (ratio > bestRatio || (ratio === bestRatio && index > bestIndex)) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best && best !== active) setActive(best);
      },
      { rootMargin, threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
    // `active` is intentionally read but not a dependency: including it would
    // tear down and rebuild the observer on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, rootMargin]);

  return active;
}

/**
 * True while the returned ref's element intersects the viewport.
 *
 * The observer is disconnected once it has fired, so long sections do not keep
 * a live observer alive for the rest of the session.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05, ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView] as const;
}

/**
 * Runs a callback on every animation frame while the element is on screen.
 *
 * Intended for effects that write to `style.transform` directly. Nothing is
 * stored in React state, so a mouse move cannot trigger a re-render — which is
 * the whole point of using this over a pointer-tracking state variable.
 */
export function useAnimationFrame(
  callback: (deltaMs: number, elapsedMs: number) => void,
  active = true,
) {
  const savedRef = useRef(callback);

  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let last = performance.now();
    const start = last;

    const tick = (now: number) => {
      savedRef.current(now - last, now - start);
      last = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}

/** Locks body scroll while `locked` is true, compensating for the scrollbar. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}

