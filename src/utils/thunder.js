// Smooth Navigation Utility

/**
 * Smoothly scrolls to a Y position using native smooth behavior.
 * @param {number} targetY
 */
export function smoothScrollTo(targetY) {
  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "smooth",
  });
}

/**
 * Smoothly navigates to a section by ID.
 * @param {string} targetId - Section ID without '#' (e.g. 'about', 'skills')
 */
export function navigateToSection(targetId) {
  const cleanId = targetId.replace("#", "");
  const targetEl = document.getElementById(cleanId);

  if (!targetEl) return;

  const navbarHeight = 70;
  const rect = targetEl.getBoundingClientRect();
  const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const targetY = Math.max(0, rect.top + currentScrollY - navbarHeight);

  window.scrollTo({ top: targetY, behavior: "smooth" });
}

// Backwards-compatible alias
export const triggerThunderNav = navigateToSection;

// No-op stubs for any residual imports
export function playThunderAudio() {}
export function subscribeToThunder() {
  return () => {};
}
