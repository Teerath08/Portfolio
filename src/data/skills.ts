import type { SkillDomain } from "./types";

/**
 * Skills.
 *
 * These are the two entries that have been on the site since the original
 * version, with their copy unchanged. They are the only skills claimed here:
 * nothing is added to this list that cannot be pointed at something real.
 *
 * If a new area genuinely gets worked on, add it here the same way — with the
 * description of what was actually built, not a list of technologies.
 */

/** Deep-focus domains. Copy preserved verbatim from the original skills data. */
export const skillDomains: SkillDomain[] = [
  {
    name: "Robotics",
    glyph: "R",
    level: "Intermediate",
    category: "Robotics & Hardware",
    tagline: "Autonomous Systems & Kinematics",
    description:
      "Design and prototyping of robotic systems, sensor interfacing (Ultrasonic, IR, IMU), DC/servo/stepper motor control, kinematics, and autonomous navigation.",
    highlights: [
      "Autonomous Navigation",
      "Sensor Fusion & Interfacing",
      "Actuator & Motor Control",
      "Embedded C / Arduino",
      "Robotics Kinematics",
    ],
  },
  {
    name: "Microprocessor",
    glyph: "M",
    level: "Intermediate",
    category: "Architecture & Systems",
    tagline: "8085/8086 & Embedded Architecture",
    description:
      "Deep understanding of 8085 & 8086 internal microprocessor architecture, register sets, bus timing diagrams, assembly language programming, interrupt handling, and memory/IO interfacing.",
    highlights: [
      "8085 / 8086 Architecture",
      "Assembly Language (ALP)",
      "Memory & I/O Interfacing",
      "Interrupt Vector Processing",
      "Bus Timing & Control Signals",
    ],
  },
];

/** How many areas of focus the site currently claims. */
export const skillCount = skillDomains.length;
