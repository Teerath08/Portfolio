/**
 * Shared types for every content module in `src/data`.
 *
 * Content and presentation are deliberately separated: nothing in this folder
 * imports React or touches the DOM, so the same data can be consumed by server
 * components, client components and the chatbot knowledge base.
 */

/** Every anchor that exists on the page. Kept in sync with `site.sections`. */
export type SectionId =
  | "home"
  | "about"
  | "mindset"
  | "projects"
  | "hardware"
  | "skills"
  | "experience"
  | "education"
  | "lab-notes"
  | "contact";

/**
 * A restrained set of accent tokens. Components map these to concrete Tailwind
 * class strings through `lib/accents.ts` — never build class names inline,
 * because Tailwind's content scanner cannot see computed values.
 */
export type AccentKey = "cyan" | "sky" | "violet" | "amber";

export interface NavItem {
  id: SectionId;
  label: string;
}

/** Identity, contact details and the written introduction. */
export interface PersonalInfo {
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  /** Short line used under the hero name. */
  role: string;
  /** The degree itself, e.g. "B.Tech Electronics & Communication Engineering". */
  degree: string;
  /** Compact badge text for the hero status pill. */
  status: string;
  college: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  /** Human handle on GitHub, shown next to the full URL. */
  githubHandle: string;
  /** Human handle on LinkedIn. */
  linkedinHandle: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Introduction, one entry per paragraph. */
  about: string[];
  /** Short, honest facts shown in the profile spec sheet and hero. */
  currently: { label: string; value: string }[];
}

export type ProjectStatus = "Live" | "In Progress" | "Archived";

export interface ProjectLink {
  label: string;
  href: string;
}

/**
 * One hop of a hardware signal path, e.g. an ESP32 reading a sensor and
 * pushing the result over Wi-Fi. Only present on hardware projects.
 */
export interface SignalNode {
  label: string;
  detail: string;
}

/** Technical metadata rows shown on a project card. */
export type ProjectSpecKey =
  | "microcontroller"
  | "sensors"
  | "communication"
  | "software"
  | "output";

export interface Project {
  id: string;
  title: string;
  /** Short line for the collapsed card. */
  summary: string;
  /** What the build is actually for, in one or two sentences. */
  problem: string;
  status: ProjectStatus;
  year: string;
  accent: AccentKey;
  /** Technologies, split from the original `tech` array. */
  tech: string[];
  /** Optional hardware rows. Omit for pure software builds. */
  specs?: Partial<Record<ProjectSpecKey, string>>;
  /** Optional signal path, rendered as an animated chain. */
  signalFlow?: SignalNode[];
  /** Extra rows revealed when the card is expanded. */
  detail: { label: string; value: string }[];
  links: ProjectLink[];
  /**
   * Marks an entry that exists only as a template. Placeholder cards render
   * with a dashed outline and point at this file so they are obvious.
   */
  placeholder?: boolean;
}

/** A deep-focus domain, preserved verbatim from the original skills data. */
export interface SkillDomain {
  name: string;
  glyph: string;
  level: string;
  category: string;
  tagline: string;
  description: string;
  highlights: string[];
}

/** A component on the "Beyond the screen" workbench. */
export interface HardwareComponent {
  id: string;
  label: string;
  /** Short caption under the button. */
  caption: string;
  /** Position of the pad on the board, in percent of the board box. */
  x: number;
  y: number;
  accent: AccentKey;
  category: "compute" | "sense" | "actuate" | "connect" | "bench";
  specs: { label: string; value: string }[];
  note: string;
}

export type TimelineKind =
  | "milestone"
  | "project"
  | "workshop"
  | "hackathon"
  | "certification";

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  date: string;
  title: string;
  org: string;
  description: string;
  tags?: string[];
  placeholder?: boolean;
}

/** The original achievements buckets, kept intact as an editable checklist. */
export interface AchievementItem {
  title: string;
  issuer?: string;
  event?: string;
  platform?: string;
  date: string;
  link?: string;
  placeholder?: boolean;
}

export interface Achievements {
  certifications: AchievementItem[];
  hackathons: AchievementItem[];
  courses: AchievementItem[];
  awards: AchievementItem[];
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  location: string;
  duration: string;
  status: string;
  areas: string[];
  description: string;
  /** Monogram shown on the institution mark. */
  monogram: string;
}

export interface LabNote {
  id: string;
  index: string;
  title: string;
  /** The hardware/software involved, shown as a mono subtitle. */
  rig: string;
  problem: string;
  experiment: string;
  result: string;
  learned: string;
  tags: string[];
  placeholder?: boolean;
}

/** A single stage of the "how I build" section. */
export interface MindsetStage {
  index: string;
  title: string;
  headline: string;
  body: string;
}

export interface HeroSignal {
  label: string;
  /** Vertical placement as a percentage of the hero visual height. */
  offset: number;
}