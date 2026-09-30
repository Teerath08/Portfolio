"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { useFinePointer, usePrefersReducedMotion, useTabVisible } from "@/lib/hooks";

/**
 * The page-wide 3D layer: the world behind the page.
 *
 * The hero has its own board, which is a specific object and belongs to that
 * section. This is the other half — a volume of low-poly solids that the reader
 * travels through as the page scrolls, rather than a picture of something sitting
 * behind the text. It is kept independent of the page's own motion, which is the
 * `revolve` rule in `globals.css`: that one tilts each section on a drum, this
 * one moves the camera down Z. They are separate effects on purpose — a section
 * being turned over and the world flowing past it are two different things, and
 * coupling them would mean every scroll parameter controlled both.
 *
 * Nothing here is required to read the page. The CSS depth in `globals.css` —
 * the grid wash, the section rules, the glows — is always present, and the Z
 * travel itself sits behind an `@supports`, so this layer only ever adds to a page
 * that already works. Which is why the gate is aggressive: fine pointers with
 * motion allowed, and a visible tab. Everywhere else the component renders `null`
 * and the cost is one boolean check.
 *
 * The scene itself is behind a `dynamic` import so that three.js and
 * react-three-fiber stay out of the initial bundle. This file is the small shell
 * that decides whether to fetch it at all; `ScrollFieldScene` is the part that
 * actually needs the WebGL runtime.
 *
 * It must be mounted as a *sibling* of `<main>`, not inside it. `main` is
 * `position: relative`, which makes it the containing block for any fixed
 * descendant — the layer would then be as tall as the whole document instead of
 * the viewport, and the world would not be around the reader.
 */
const ScrollFieldScene = dynamic(() => import("./ScrollFieldScene"), {
  ssr: false,
  loading: () => null,
});

export default function ScrollField() {
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const tabVisible = useTabVisible();

  // Every one of these reads `false` on the server and on the first client
  // render, so nothing expensive is ever created during hydration.
  if (!finePointer || reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-0 print:hidden"
    >
      <Suspense fallback={null}>
        <ScrollFieldScene active={tabVisible} />
      </Suspense>
    </div>
  );
}
