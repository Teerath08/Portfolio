import type { HeroSignal, PersonalInfo } from "./types";

/**
 * Identity, contact details and every piece of prose written in first person.
 *
 * `about` is an array of paragraphs rather than one blob so the About section
 * can lay them out without re-splitting a string, and so the chatbot can quote
 * them one at a time.
 *
 * ── Editing note ──────────────────────────────────────────────────────────────
 * The introduction is deliberately plain and first-person. If you would rather
 * describe yourself differently, rewrite the three paragraphs below — they are
 * the only place your voice lives, and nothing else depends on their wording.
 */
export const personalInfo: PersonalInfo = {
  name: "Teerath Jangid",
  firstName: "Teerath",
  lastName: "Jangid",
  initials: "TJ",
  role: "B.Tech ECE Student",
  degree: "B.Tech Electronics & Communication Engineering",
  status: "ECE Student · Jaipur, India",
  college: "JECRC University",
  location: "Jaipur, Rajasthan, India",
  email: "teerathjangid08@gmail.com",
  linkedin: "https://www.linkedin.com/in/teerath-jangid-116174421",
  github: "https://github.com/Teerath08",
  githubHandle: "Teerath08",
  linkedinHandle: "teerath-jangid",

  tagline: "Building at the intersection of electronics, embedded systems and software.",

  about: [
    "First-year B.Tech in Electronics & Communication Engineering at JECRC University, Jaipur. Most of what I know about electronics, I know because something didn't behave and I had to work out why.",
    "I like the part of engineering where the circuit has an opinion. An 8086 timing diagram that won't line up, a distance sensor that reads three centimetres short, a page that lands half a beat late — I'd rather know exactly which part is lying to me than guess. Breadboard first, theory second, and I write down what went wrong, because that's usually the useful part.",
    "Most of my time goes into microcontrollers, sensor interfacing and assembly, plus enough web work to put the results somewhere other people can actually open. I learn by building, and the failed versions usually stay around.",
  ],

  currently: [
    { label: "Learning", value: "8086 architecture & assembly language" },
    { label: "Building", value: "This portfolio, in Next.js" },
    { label: "Exploring", value: "Microcontroller + sensor projects" },
    { label: "Into", value: "Web development and applied AI" },
  ],
};

/** Small fact strip under the hero. All of these are factual, not aspirational. */
export const heroFacts = [
  { label: "Year", value: "1st", hint: "B.Tech ECE" },
  { label: "Focus", value: "Hardware", hint: "Sensors to actuators" },
  { label: "Core", value: "8085 / 8086", hint: "Architecture + ALP" },
  { label: "Cadence", value: "Daily", hint: "Small builds, often" },
];

/**
 * Technical labels that orbit the hero visual. They read as part of an
 * engineering interface rather than as marketing tags, so they stay mono,
 * short and uppercase.
 */
export const heroSignals: HeroSignal[] = [
  { label: "ESP32", offset: 8 },
  { label: "GPIO", offset: 27 },
  { label: "SENSORS", offset: 68 },
  { label: "EMBEDDED", offset: 88 },
  { label: "IoT", offset: 48 },
  { label: "ECE", offset: 18 },
];

/** Small links under the hero copy. */
export const heroMeta = [
  { label: "Microcontrollers", value: "8085 · 8086 · Arduino · ESP32" },
  { label: "Sensors", value: "Ultrasonic · IR · IMU" },
  { label: "Actuation", value: "DC · Servo · Stepper" },
];