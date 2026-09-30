import type { EducationEntry } from "./types";

/** Academic record. Carried over from the previous site, restructured only. */
export const education: EducationEntry[] = [
  {
    degree: "Bachelor of Technology (B.Tech)",
    field: "Electronics & Communication Engineering (ECE)",
    institution: "JECRC University",
    location: "Jaipur, Rajasthan",
    duration: "2026 – 2030 (Expected)",
    status: "Pursuing",
    monogram: "JU",
    areas: [
      "Embedded Systems",
      "Digital Electronics",
      "Signal Processing",
      "Robotics & Automation",
      "AI & Machine Learning",
      "Web Technologies",
      "Python Programming",
      "Digital Communication",
      "Microprocessor Architecture (8085 / 8086)",
      "Assembly Language Programming",
    ],
    description:
      "Pursuing a B.Tech in ECE with a strong focus on emerging technologies, AI integration, and practical engineering applications. Complementing core curriculum with self-learning in web development and AI.",
  },
];

/** Quick facts rendered as small technical cards under the degree. */
export const educationFacts = [
  { label: "Institution", value: "JECRC University" },
  { label: "Programme", value: "B.Tech ECE" },
  { label: "Graduation expected", value: "2030" },
];