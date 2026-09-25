// Portfolio chatbot knowledge base.
//
// Every answer the bot can give is derived from `src/data.js`, so the bot can
// never drift from the content that is actually on the page. Update `data.js`
// and the chatbot follows automatically — no extra editing needed here.
//
// This module is shared by the browser (instant offline replies) and the
// server route handler (grounding context for the optional LLM), so it must
// stay free of DOM and Node-specific APIs.

import { personalInfo, skills, projects, education, achievements } from "../data";

/** Anchors that the chatbot is allowed to navigate the visitor to. */
export const CHAT_SECTIONS = [
  "home",
  "about",
  "education",
  "skills",
  "projects",
  "achievements",
  "contact",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/**
 * Strips the "add your stuff here" placeholder entries from data.js so the bot
 * never presents an empty placeholder as a real credential.
 */
const realEntries = (list = []) => (list || []).filter((item) => !item?.placeholder);

const bullets = (items = []) => (items || []).map((item) => `- ${item}`).join("\n");

/** Trims long prose so chat answers stay scannable. */
const summarize = (text, limit = 240) => {
  const flat = clean(text);
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${lastStop > 80 ? cut.slice(0, lastStop + 1) : cut.trimEnd()}…`;
};

/**
 * Builds the grounding document handed to the LLM. Kept as plain markdown so
 * it is cheap to send and easy to audit.
 */
export function buildContext() {
  const lines = [];

  lines.push("## Identity");
  lines.push(`Name: ${personalInfo.name}`);
  lines.push(`Role: ${personalInfo.role}`);
  lines.push(`College: ${personalInfo.college}`);
  lines.push(`Location: ${personalInfo.location}`);
  lines.push(`Email: ${personalInfo.email}`);
  lines.push(`LinkedIn: ${personalInfo.linkedin}`);
  lines.push(`GitHub: ${personalInfo.github}`);
  lines.push(`Bio: ${summarize(personalInfo.about, 700)}`);

  lines.push("");
  lines.push("## Skills");
  for (const skill of skills) {
    lines.push(
      `- ${skill.name} (${skill.level}, ${skill.category}): ${skill.tagline}. ${summarize(skill.description, 220)} Key areas: ${(skill.highlights || []).join(", ")}.`,
    );
  }

  lines.push("");
  lines.push("## Projects");
  for (const project of projects) {
    lines.push(
      `- ${project.title} [${project.status}]: ${summarize(project.description, 220)} Built with ${(project.tech || []).join(", ")}. Repo: ${project.github}`,
    );
  }

  lines.push("");
  lines.push("## Education");
  for (const item of education) {
    lines.push(
      `- ${item.degree} in ${item.field} at ${item.institution}, ${item.location}. ${item.duration} (${item.status}). Subjects: ${(item.areas || []).join(", ")}.`,
    );
  }

  lines.push("");
  lines.push("## Achievements");
  const buckets = [
    ["Certifications", realEntries(achievements.certifications).map((a) => a.title)],
    ["Hackathons", realEntries(achievements.hackathons).map((a) => a.title)],
    ["Courses", realEntries(achievements.courses).map((a) => a.title)],
    ["Awards", realEntries(achievements.awards).map((a) => a.title)],
  ];
  for (const [label, titles] of buckets) {
    lines.push(titles.length ? `- ${label}: ${titles.join("; ")}` : `- ${label}: none listed yet`);
  }

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Offline intent matching                                             */
/* ------------------------------------------------------------------ */

/**
 * Visitor-voiced follow-up chips, shared across intents so the phrasing stays
 * consistent. Deliberately free of gendered pronouns -- the assistant talks
 * about the portfolio owner in a neutral voice.
 */
const ask = {
  skills: "What skills are listed?",
  projects: "Show me the projects",
  education: "College and degree details?",
  contact: "How do I get in touch?",
  location: "Where is this based?",
  robotics: "Tell me about the robotics work",
  microprocessor: "Tell me about the microprocessor work",
  links: "Share the profile links",
  achievements: "Any certifications or awards?",
  freeChat: "What have you been up to lately?",
};

/**
 * Each intent declares trigger words, a reply builder, and a `weight`.
 *
 * The weight is what keeps vague conversational intents from hijacking
 * specific questions: "tell me about robotics" contains "tell me about", but
 * the robotics intent is weighted higher, so the visitor gets robotics. Topic
 * intents use 2; catch-all conversational intents use 1. Add a new intent
 * anywhere in the list — the scorer does not depend on ordering.
 */
const INTENTS = [
  {
    id: "robotics",
    weight: 2,
    keywords: [
      "robotics",
      "robot",
      "robots",
      "autonomous",
      "sensor",
      "sensors",
      "arduino",
      "motor",
      "motors",
      "embedded c",
      "kinematic",
      "kinematics",
      "automation",
      "servo",
      "ultrasonic",
      "imu",
      "actuator",
      "navigation",
    ],
    answer: () => {
      const skill = skills.find((s) => s.name.toLowerCase().includes("robot"));
      if (!skill) return "Robotics isn't listed in the skills section yet.";
      return `**${skill.name}** — ${skill.level} · ${skill.category}\n${summarize(skill.description, 320)}\n\nHands-on areas:\n${bullets(skill.highlights)}`;
    },
    section: "skills",
    suggestions: [ask.microprocessor, ask.projects, ask.education],
  },
  {
    id: "microprocessor",
    weight: 2,
    keywords: [
      "microprocessor",
      "microprocessors",
      "microcontroller",
      "8085",
      "8086",
      "assembly",
      "assembly language",
      "bus timing",
      "interrupt",
      "interrupts",
      "architecture",
      "embedded",
      "register",
      "registers",
      "alp",
      "memory interfacing",
    ],
    answer: () => {
      const skill = skills.find((s) => s.name.toLowerCase().includes("microprocessor"));
      if (!skill) return "Microprocessor content isn't listed in the skills section yet.";
      return `**${skill.name}** — ${skill.level} · ${skill.category}\n${summarize(skill.description, 320)}\n\nCore areas:\n${bullets(skill.highlights)}`;
    },
    section: "skills",
    suggestions: [ask.robotics, ask.education, ask.projects],
  },
  {
    id: "education",
    weight: 2,
    keywords: [
      "education",
      "college",
      "university",
      "school",
      "degree",
      "study",
      "studying",
      "student",
      "subject",
      "subjects",
      "btech",
      "b.tech",
      "ece",
      "jecrc",
      "graduate",
      "graduating",
      "cgpa",
      "marks",
      "coursework",
      "2026",
      "2030",
    ],
    answer: () => {
      const item = education[0];
      if (!item) return "Education details haven't been added yet.";
      return `**${item.degree}** — ${item.field}\n**${item.institution}**, ${item.location}\n${item.duration} · ${item.status}\n\nSubjects covered:\n${bullets(item.areas)}\n\n${summarize(item.description, 220)}`;
    },
    section: "education",
    suggestions: [ask.skills, ask.projects, ask.location],
  },
  {
    id: "projects",
    weight: 2,
    keywords: [
      "project",
      "projects",
      "built",
      "build",
      "builds",
      "app",
      "apps",
      "application",
      "applications",
      "website",
      "websites",
      "repo",
      "repos",
      "repository",
      "code",
      "portfolio project",
      "made",
      "showcase",
      "demo",
      "working on",
      "working on now",
    ],
    answer: () =>
      `${projects.length} projects on the site right now:\n\n${projects
        .map(
          (project) =>
            `**${project.title}** _(${project.status})_\n${summarize(project.description, 190)}\n- Stack: ${(project.tech || []).join(", ")}`,
        )
        .join("\n\n")}\n\nSource code is on ${personalInfo.github}.`,
    section: "projects",
    suggestions: ["What tech stack is used?", ask.skills, ask.contact],
  },
  {
    id: "contact",
    weight: 2,
    keywords: [
      "contact",
      "contacts",
      "get in touch",
      "email",
      "emails",
      "reach",
      "reach out",
      "hire",
      "hiring",
      "collaborate",
      "collaboration",
      "collaborating",
      "talk",
      "message",
      "connect",
      "opportunity",
      "opportunities",
      "work with",
      "available",
      "freelance",
      "send",
      "inquiry",
      "phone",
      "call",
    ],
    answer: () =>
      `The best way to reach ${personalInfo.firstName}:\n\n- **Email** — ${personalInfo.email}\n- **LinkedIn** — ${personalInfo.linkedin}\n- **GitHub** — ${personalInfo.github}\n- **Based in** — ${personalInfo.location}\n\nOpen to collaborations on robotics, embedded systems, and web projects.`,
    section: "contact",
    suggestions: [ask.skills, ask.projects, ask.location],
  },
  {
    id: "links",
    weight: 2,
    keywords: [
      "link",
      "links",
      "profile",
      "profiles",
      "social",
      "linkedin",
      "github",
      "cv",
      "resume",
      "url",
      "find you",
      "follow",
    ],
    answer: () =>
      `Here are the direct links:\n\n- **GitHub** — ${personalInfo.github}\n- **LinkedIn** — ${personalInfo.linkedin}\n- **Email** — ${personalInfo.email}`,
    section: "contact",
    suggestions: [ask.projects, ask.skills, ask.education],
  },
  {
    id: "achievements",
    weight: 2,
    keywords: [
      "achievement",
      "achievements",
      "certification",
      "certifications",
      "certificate",
      "certificates",
      "hackathon",
      "hackathons",
      "award",
      "awards",
      "credential",
      "credentials",
      "accomplishment",
      "accomplishments",
    ],
    answer: () => {
      const filled = realEntries([
        ...achievements.certifications,
        ...achievements.hackathons,
        ...achievements.courses,
        ...achievements.awards,
      ]);
      if (filled.length === 0) {
        return "Certifications, hackathons, courses, and awards are **not filled in yet** — that section is still a placeholder on the site.\n\nThe strongest signal so far is the hands-on work: robotics and microprocessor projects, plus shipped web builds.";
      }
      return `Recorded so far:\n\n${bullets(
        filled.map(
          (item) =>
            `${item.title}${item.issuer ? ` (${item.issuer})` : ""}${item.platform ? ` (${item.platform})` : ""}`,
        ),
      )}`;
    },
    section: "achievements",
    suggestions: [ask.projects, ask.skills, ask.contact],
  },
  {
    id: "location",
    weight: 2,
    keywords: [
      "location",
      "where are you",
      "where is he",
      "where is she",
      "based",
      "city",
      "jaipur",
      "india",
      "rajasthan",
      "lives",
      "live in",
    ],
    answer: () =>
      `${personalInfo.firstName} is based in ${personalInfo.location}, currently studying at ${personalInfo.college}.`,
    section: "about",
    suggestions: [ask.education, ask.contact, ask.projects],
  },
  {
    id: "skills",
    weight: 2,
    keywords: [
      "skill",
      "skills",
      "stack",
      "tech",
      "technology",
      "technologies",
      "tools",
      "expertise",
      "strong",
      "good at",
      "proficient",
      "specialise",
      "specialize",
      "what do you know",
      "learning",
    ],
    answer: () =>
      `The focus is on two pillars:\n\n${skills
        .map(
          (skill) =>
            `**${skill.name}** (${skill.level}) — ${skill.tagline}\n${bullets(skill.highlights)}`,
        )
        .join("\n\n")}\n\nAlongside that, the focus extends to web apps and integrating AI into them.`,
    section: "skills",
    suggestions: [ask.robotics, ask.microprocessor, ask.projects],
  },
  {
    id: "about",
    weight: 1,
    keywords: [
      "about you",
      "about him",
      "about her",
      "about them",
      "about this",
      "about the portfolio",
      "who is",
      "introduce",
      "yourself",
      "tell me about",
      "bio",
      "background",
      "summary",
      "story",
    ],
    answer: () =>
      `${personalInfo.name} is a ${personalInfo.role} at ${personalInfo.college}, based in ${personalInfo.location}.\n\n${summarize(personalInfo.about, 420)}`,
    section: "about",
    suggestions: [ask.skills, ask.education, ask.projects],
  },
  {
    id: "persona",
    weight: 2,
    keywords: [
      "who are you",
      "what are you",
      "your name",
      "what is your name",
      "vegapunk",
      "are you ai",
      "are you real",
      "are you human",
      "are you a bot",
      "are you a robot",
      "are you a person",
      "introduce yourself",
    ],
    answer: () =>
      `I'm **Vegapunk**, the assistant that lives in this portfolio.\n\nI know ${personalInfo.firstName}'s work in detail — the skills, the projects, the degree, the contact details — because all of it is right here on the page. Ask me anything about it, or just chat; I'm happy to talk about anything else too.`,
    suggestions: [ask.skills, ask.projects, ask.freeChat],
  },
  {
    id: "capabilities",
    weight: 1,
    keywords: [
      "what can you do",
      "help",
      "options",
      "how do you work",
      "capabilities",
      "what do you do",
      "what should i ask",
    ],
    answer: () =>
      `Two things, and the second one is the fun one:\n\n- **The portfolio** — skills, projects, education, and how to get in touch, answered from the site's own content\n- **Anything else** — feel free to chat about technology, science, study or career advice, or whatever's on your mind`,
    suggestions: [ask.skills, ask.projects, ask.freeChat],
  },
  {
    id: "smalltalk",
    weight: 1,
    keywords: [
      "how are you",
      "how are you doing",
      "how you doing",
      "how is it going",
      "tell me a joke",
      "are you alive",
      "do you have feelings",
      "are you happy",
      "are you bored",
    ],
    answer: () =>
      `Running hot and slightly over-caffeinated, thanks for asking.\n\nAsk me about the portfolio and I'll have specifics, or tell me what's actually on your mind and we'll talk about that instead.`,
    suggestions: [ask.projects, ask.freeChat],
  },
  {
    id: "greeting",
    weight: 1,
    keywords: [
      "hi",
      "hii",
      "hey",
      "hello",
      "yo",
      "namaste",
      "good morning",
      "good evening",
      "good afternoon",
      "sup",
    ],
    answer: () =>
      `Hey! I'm **Vegapunk**.\n\nI can fill you in on the **skills**, **projects**, and **college** bits of this portfolio, or we can just talk about something else entirely — your call.`,
    suggestions: [ask.skills, ask.projects, ask.contact],
  },
  {
    id: "thanks",
    weight: 1,
    keywords: ["thanks", "thank you", "thx", "cheers", "appreciate", "nice", "cool", "awesome", "great", "perfect"],
    answer: () => "Happy to help. Anything else you'd like to know?",
    suggestions: [ask.projects, ask.contact],
  },
  {
    id: "bye",
    weight: 1,
    keywords: ["bye", "goodbye", "see you", "later", "gtg"],
    answer: () => "See you around. Good luck with your project!",
    suggestions: [ask.projects],
  },
];

const FALLBACK = {
  id: "fallback",
  answer: () =>
    `I'm running in **offline mode**, so right now I can only answer from the portfolio itself — I'm not connected to a language model, which means I can't hold up my end of a general conversation. Add a Gemini API key to switch that on.\n\nUntil then, ask me about:\n- **Skills** in robotics and microprocessors\n- **Projects** and the stack behind them\n- **Education** at ${personalInfo.college}\n- **Contact** details`,
  suggestions: [ask.skills, ask.projects, ask.contact],
};

/** Lowercase, strip punctuation, collapse whitespace — for keyword matching. */
const normalize = (text) =>
  clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Weight of a single keyword hit. Phrases are worth more than bare words. */
const PHRASE_SCORE = 4;
const WORD_SCORE = 2;
const SUBSTRING_SCORE = 1;

/**
 * Scores every intent against the message and returns the best match.
 *
 * Three rules keep this predictable:
 *   - multi-word phrases must match as whole phrases, and score highest;
 *   - short keywords (<= 3 chars) only ever match whole words, so "hi" can
 *     never fire on "which";
 *   - ties are broken by intent weight, not by declaration order.
 */
function scoreIntents(message) {
  const normalized = ` ${normalize(message)} `;
  const words = normalized.split(" ").filter(Boolean);

  let best = FALLBACK;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let raw = 0;

    for (const keyword of intent.keywords) {
      const needle = normalize(keyword);
      if (!needle) continue;

      if (needle.includes(" ")) {
        if (normalized.includes(` ${needle} `)) raw += PHRASE_SCORE;
        continue;
      }

      if (words.includes(needle)) {
        raw += WORD_SCORE;
      } else if (needle.length > 3 && normalized.includes(needle)) {
        // Longer words are allowed to match inside a token, which is what
        // catches "skills" from the keyword "skill".
        raw += SUBSTRING_SCORE;
      }
    }

    const score = raw * (intent.weight ?? 1);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  // One solid full-word hit is enough to be worth answering; weaker signals
  // are treated as "the visitor is asking something else entirely".
  return { intent: bestScore >= 2 ? best : FALLBACK };
}

/**
 * Offline answer used when no LLM key is configured, and as the safety net if
 * the LLM call fails. Always returns a shaped reply, never throws.
 */
export function getOfflineReply(message) {
  const text = clean(message);
  if (!text) {
    return {
      reply: "I didn't catch that — ask me about the skills, projects, or education, or just say hello.",
      section: null,
      suggestions: FALLBACK.suggestions,
      source: "offline",
    };
  }

  const { intent } = scoreIntents(text);
  return {
    reply: intent.answer(),
    section: intent.section ?? null,
    suggestions: intent.suggestions ?? FALLBACK.suggestions,
    source: "offline",
  };
}

/** Opening message shown when the panel is first opened. */
export function getGreeting() {
  return `Hey, I'm **Vegapunk**. I know this portfolio inside out — skills, projects, education, contact — and I'm happy to just talk as well.\n\nWhat do you want to get into?`;
}

/** Quick-reply chips for the empty state. */
export function getStarterSuggestions() {
  return [
    "Who are you?",
    "What skills are listed?",
    "Show me the projects",
    "How do I get in touch?",
  ];
}
