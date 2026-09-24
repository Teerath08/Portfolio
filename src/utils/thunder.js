// Clean, high-performance instant navigation utility (No lag, no sounds, no canvas effects)
export function smoothScrollTo(targetY) {
  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "smooth",
  });
}

/**
 * Instantly and smoothly navigates to the target section with zero lag
 * @param {string} targetId - ID of section without '#' (e.g. 'about', 'skills')
 */
export function navigateToSection(targetId) {
  const cleanId = targetId.replace("#", "");
  const targetEl = document.getElementById(cleanId);

  if (targetEl) {
    const navbarHeight = 70;
    const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  }
}

// Backwards-compatible alias for existing component imports
export const triggerThunderNav = navigateToSection;

// No-op for any residual audio or overlay hooks
export function playThunderAudio() {}
export function subscribeToThunder() {
  return () => {};
}
