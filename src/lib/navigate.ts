/**
 * Smooth in-page navigation.
 *
 * Uses native `scroll-behavior: smooth` plus `scroll-margin-top` on the
 * sections themselves, so this helper only has to deal with two things the
 * platform cannot: honouring the reduced-motion preference, and compensating
 * for the sticky navbar height.
 */

/** Height of the sticky header plus a little breathing room. */
export const NAV_OFFSET = 84;

/**
 * Scrolls a section into view under the sticky header.
 * No-ops when the target does not exist, so callers never have to check.
 */
export function navigateToSection(targetId: string): void {
  if (typeof window === "undefined") return;

  const cleanId = targetId.replace(/^#/, "");
  const target = document.getElementById(cleanId);
  if (!target) return;

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (reduced) {
    const top = window.scrollY + target.getBoundingClientRect().top - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    return;
  }

  const top = window.scrollY + target.getBoundingClientRect().top - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

/** Scrolls back to the very top of the document. */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}