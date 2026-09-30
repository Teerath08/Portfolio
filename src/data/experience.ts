import type { Achievements, TimelineEntry } from "./types";

/**
 * Experience timeline.
 *
 * The first four entries restate things that are already true of this site —
 * the degree, and the three projects. Nothing about a job, an internship, a
 * competition or an award has been invented.
 *
 * ── Editing note ──────────────────────────────────────────────────────────────
 * The last three entries are templates for workshops, hackathons and
 * certifications. Add a real entry above them and it will slot into the
 * timeline in date order. `kind` picks the node colour and icon.
 */
export const timeline: TimelineEntry[] = [
  {
    id: "degree-start",
    kind: "milestone",
    date: "2026",
    title: "Started B.Tech in Electronics & Communication Engineering",
    org: "JECRC University, Jaipur",
    description:
      "First year. Core subjects are digital electronics, network theory and signals; everything I build afterwards is an excuse to use them on something that moves.",
    tags: ["ECE", "First year", "Digital electronics"],
  },
  {
    id: "portfolio-website",
    kind: "project",
    date: "2026",
    title: "Shipped this portfolio",
    org: "Next.js · React · Tailwind CSS",
    description:
      "A portfolio that shows engineering work rather than a list of technologies. Static-rendered, keyboard accessible, and it still answers questions with the network unplugged.",
    tags: ["Next.js", "Web", "Shipped"],
  },
  {
    id: "ai-website",
    kind: "project",
    date: "2026",
    title: "AI Website Project — in progress",
    org: "Python · JavaScript",
    description:
      "Building a web app that uses an AI API for something a person would actually use, and finding out where it fails.",
    tags: ["Python", "AI", "In progress"],
  },
  {
    id: "productivity",
    kind: "project",
    date: "2026",
    title: "Student Productivity Project — in progress",
    org: "HTML · CSS · JavaScript · Python",
    description:
      "A task and study-session tracker designed around a real timetable instead of a feature list.",
    tags: ["Productivity", "In progress"],
  },
  {
    id: "slot-workshop",
    kind: "workshop",
    date: "—",
    title: "TODO: add a workshop you attended",
    org: "TODO: organiser or college cell",
    description:
      "Workshops, college tech events, or anything where you learned a tool in a room with other people. Copy this entry, fill it in, and delete this one.",
    placeholder: true,
  },
  {
    id: "slot-hackathon",
    kind: "hackathon",
    date: "—",
    title: "TODO: add a hackathon",
    org: "TODO: event name",
    description:
      "If you have entered one, it belongs here — including the version that did not win. What you built and what you learned is the whole entry.",
    placeholder: true,
  },
  {
    id: "slot-certification",
    kind: "certification",
    date: "—",
    title: "TODO: add a certification",
    org: "TODO: issuer",
    description:
      "Courses and certificates go here, with a link if you have one. Same rule: only list what you have actually finished.",
    placeholder: true,
  },
];

/**
 * The achievements checklist, carried over from the previous site unchanged in
 * structure. All four buckets are still empty on purpose — replace a
 * placeholder entry with a real one and it appears in the Experience grid and
 * in the chatbot's answers automatically.
 */
export const achievements: Achievements = {
  certifications: [
    {
      title: "Add your certifications here",
      issuer: "e.g. Google, Coursera, NPTEL",
      date: "—",
      placeholder: true,
    },
  ],
  hackathons: [
    {
      title: "Hackathon participations coming soon",
      event: "Stay tuned!",
      date: "—",
      placeholder: true,
    },
  ],
  courses: [
    {
      title: "Online courses & learning milestones",
      platform: "e.g. Udemy, Coursera, YouTube",
      date: "—",
      placeholder: true,
    },
  ],
  awards: [
    {
      title: "Awards & recognitions will appear here",
      event: "Academic & Extra-curricular",
      date: "—",
      placeholder: true,
    },
  ],
};

export const achievementBuckets = [
  {
    id: "certifications",
    label: "Certifications",
    hint: "Courses and exams actually finished.",
  },
  {
    id: "hackathons",
    label: "Hackathons",
    hint: "Competitions entered, won or not.",
  },
  {
    id: "courses",
    label: "Courses",
    hint: "Self-taught learning milestones.",
  },
  {
    id: "awards",
    label: "Awards",
    hint: "Academic and extra-curricular recognition.",
  },
] as const satisfies readonly {
  id: keyof Achievements;
  label: string;
  hint: string;
}[];