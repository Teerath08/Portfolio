// Smooth Navigation Utility — buttery scroll + arrival heading highlight

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
 * Estimates how long a smooth scroll will take based on distance.
 * Native smooth scroll duration varies by browser; we approximate.
 * @param {number} distance - absolute pixel distance
 * @returns {number} ms to wait before triggering arrival animation
 */
function estimateScrollDuration(distance) {
  // Most browsers finish smooth scroll in ~300–900ms depending on distance
  // We clamp to a safe range so short hops feel instant, long ones feel smooth
  return Math.min(900, Math.max(300, distance * 0.4));
}

/**
 * Triggers the section heading highlight animation on arrival.
 * Targets the .section-heading-spotlight inside the given element.
 * @param {HTMLElement} sectionEl
 */
function highlightSectionHeading(sectionEl) {
  if (!sectionEl) return;

  // Find the heading inside this section — SectionHeader adds data-section-heading
  const heading =
    sectionEl.querySelector("[data-section-heading]") ||
    sectionEl.querySelector(".floating-3d-heading") ||
    sectionEl.querySelector("h2") ||
    sectionEl.querySelector("h1");

  if (!heading) return;

  // Remove any existing animation so re-triggering restarts it
  heading.classList.remove("section-arrive-highlight");
  // Force reflow to restart animation
  void heading.offsetWidth;
  heading.classList.add("section-arrive-highlight");

  // Clean up class after animation completes (2.2s to be safe)
  setTimeout(() => {
    heading.classList.remove("section-arrive-highlight");
  }, 2200);
}

/**
 * Smoothly navigates to a section and highlights its heading on arrival.
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

  const distance = Math.abs(targetY - currentScrollY);

  // Scroll smoothly
  window.scrollTo({ top: targetY, behavior: "smooth" });

  // Trigger heading highlight after scroll arrives
  const delay = estimateScrollDuration(distance);
  setTimeout(() => {
    highlightSectionHeading(targetEl);
  }, delay);
}

// Backwards-compatible alias
export const triggerThunderNav = navigateToSection;

// No-op stubs for any residual imports
export function playThunderAudio() {}
export function subscribeToThunder() {
  return () => {};
}
