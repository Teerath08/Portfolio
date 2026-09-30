import type { NavItem, SectionId } from "./types";

/**
 * Site-wide configuration: canonical URL, navigation order and SEO defaults.
 *
 * `url` falls back to localhost so the build never fails on a missing
 * environment variable. Set `NEXT_PUBLIC_SITE_URL` on the host (Vercel) to the
 * real domain and the canonical tags, sitemap and share image all follow.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const site = {
  name: "Teerath Jangid",
  shortName: "Teerath",
  /** Used in the wordmark lockup: "TEERATH — ECE / 2026". */
  tagline: "ECE · Embedded · Robotics",
  url: rawUrl.replace(/\/$/, ""),
  locale: "en_IN",
  themeColor: "#05080b",
  /**
   * Page order. Drives the navbar, the section rail, the footer links and the
   * order sections appear in — one list to keep in sync instead of four.
   */
  sections: [
    { id: "home", label: "Home", nav: true },
    { id: "about", label: "About", nav: true },
    { id: "mindset", label: "Approach", nav: false },
    { id: "projects", label: "Projects", nav: true },
    { id: "hardware", label: "Hardware", nav: false },
    { id: "skills", label: "Skills", nav: true },
    { id: "experience", label: "Experience", nav: true },
    { id: "education", label: "Education", nav: true },
    { id: "lab-notes", label: "Lab Notes", nav: false },
    { id: "contact", label: "Contact", nav: true },
  ] satisfies { id: SectionId; label: string; nav: boolean }[],
};

export const navItems: NavItem[] = site.sections
  .filter((section) => section.nav)
  .map((section) => ({ id: section.id, label: section.label }));

/** Sections the floating section rail and footer jump to, in order. */
export const allSections: NavItem[] = site.sections.map((section) => ({
  id: section.id,
  label: section.label,
}));

export const seo = {
  title: `${site.name} — B.Tech ECE · Embedded Systems & Robotics`,
  description:
    "Portfolio of Teerath Jangid, a B.Tech Electronics & Communication Engineering student at JECRC University, Jaipur. Microcontrollers, sensors, 8085/8086 architecture, robotics and the web work that puts it all on screen.",
  keywords: [
    "Teerath Jangid",
    "B.Tech ECE student",
    "JECRC University",
    "Electronics and Communication Engineering",
    "Embedded systems",
    "Microcontrollers",
    "8085",
    "8086",
    "Robotics",
    "IoT",
    "Portfolio",
  ],
};