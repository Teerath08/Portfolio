import type { Project } from "./types";

/**
 * Projects.
 *
 * Every project here already existed on the previous site. Nothing was removed
 * and nothing was invented — the original titles, descriptions, tech stacks,
 * statuses and GitHub links are all intact. What was added is structure:
 * `problem`, `specs`, `signalFlow` and `detail` split the old single paragraph
 * into parts a card can actually display.
 *
 * ── Editing note ──────────────────────────────────────────────────────────────
 *   • Replace `demo` links by adding an entry to `links` with a real URL. A
 *     project without a public build simply has no demo link.
 *   • The last entry is a template. Delete it once you have a real hardware
 *     project — it is the only one flagged `placeholder: true`.
 *   • `specs` and `signalFlow` are optional. Leave them off software-only
 *     builds and the card quietly drops the hardware panel.
 */
export const projects: Project[] = [
  {
    id: "portfolio-website",
    title: "Personal Portfolio Website",
    summary:
      "This site. A portfolio that looks like the work it describes — circuit language, real hardware content, and nothing heavier than it needs to be.",
    problem:
      "Most ECE portfolios are a PDF and a GitHub link. I wanted something that actually shows how I think about a build, and that I could keep changing without it going stale.",
    status: "Live",
    year: "2026",
    accent: "cyan",
    tech: ["Next.js", "React", "Tailwind CSS", "JavaScript"],
    specs: {
      software:
        "Next.js App Router · React · Tailwind CSS · server components by default",
    },
    detail: [
      {
        label: "Shipped",
        value:
          "Static-rendered pages, a floating chat assistant that answers from a bundled knowledge base, and a client-side avatar editor that needs no backend at all.",
      },
      {
        label: "Learned",
        value:
          "Designing the assistant to answer locally first meant it never went silent, even when the free API tier was down. Planning the failure path first was the whole lesson.",
      },
      {
        label: "Keep an eye on",
        value:
          "Bundle size and 3D cost. Anything on this page has to earn its milliseconds.",
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/Teerath08" },
      { label: "Deployed on", href: "https://vercel.com" },
    ],
  },
  {
    id: "ai-website-project",
    title: "AI Website Project",
    summary:
      "A web application that calls an AI API and does something genuinely useful with the response.",
    problem:
      "Mostly an excuse to find out where AI APIs are actually useful in a real product, instead of in a demo that only works on the happy path.",
    status: "In Progress",
    year: "2026",
    accent: "sky",
    tech: ["Python", "AI / ML", "HTML", "CSS", "JavaScript"],
    detail: [
      {
        label: "Intent",
        value:
          "Built to explore practical applications of AI APIs in real-world web solutions.",
      },
      {
        label: "State",
        value:
          "Still in progress — the interesting half is the part where it has to be wrong sometimes and stay usable.",
      },
      {
        label: "Next",
        value: "TODO: replace this line with the next real step.",
      },
    ],
    links: [{ label: "GitHub", href: "https://github.com/Teerath08" }],
  },
  {
    id: "student-productivity",
    title: "Student Productivity Project",
    summary:
      "A task and study-session tracker built around my own timetable, for anyone who has had the same problem.",
    problem:
      "My own week was the test case. Every planner I tried asked for more input than it gave back.",
    status: "In Progress",
    year: "2026",
    accent: "violet",
    tech: ["HTML", "CSS", "JavaScript", "Python"],
    detail: [
      {
        label: "Origin",
        value:
          "Designed for students specifically — organise tasks, schedule study sessions, track academic goals.",
      },
      {
        label: "State",
        value: "In progress.",
      },
      {
        label: "Honest note",
        value:
          "Built because I needed it, not because it was a good portfolio piece. That turned out to be the better reason.",
      },
    ],
    links: [{ label: "GitHub", href: "https://github.com/Teerath08" }],
  },
  {
    id: "hardware-project-template",
    title: "Your hardware project goes here",
    summary:
      "A template card showing the full hardware layout — board, sensors, signal path, and what actually came out of it.",
    problem:
      "Replace this with a real build: a line follower, an IoT sensor node, a line-tracker, whatever you have actually put together.",
    status: "In Progress",
    year: "—",
    accent: "amber",
    tech: ["TODO: add the languages and tools you used"],
    specs: {
      microcontroller: "TODO — e.g. ESP32 / Arduino Uno",
      sensors: "TODO — e.g. HC-SR04 + IR",
      communication: "TODO — e.g. Wi-Fi / Bluetooth",
      software: "TODO — e.g. Arduino IDE / PlatformIO",
      output: "TODO — e.g. servo + buzzer",
    },
    signalFlow: [
      { label: "MCU", detail: "ESP32 — reads and decides" },
      { label: "Sensor", detail: "HC-SR04 — measures distance" },
      { label: "Process", detail: "Filter, threshold, hysteresis" },
      { label: "Radio", detail: "Wi-Fi — push the reading out" },
      { label: "Output", detail: "Servo + dashboard" },
    ],
    detail: [
      { label: "Problem", value: "TODO — what didn't work, or didn't exist." },
      { label: "Result", value: "TODO — what it does now. No numbers you haven't measured." },
      { label: "Learned", value: "TODO — the thing that actually taught you something." },
    ],
    links: [],
    placeholder: true,
  },
];