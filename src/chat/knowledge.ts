import {
  achievements,
  education,
  hardwareComponents,
  labNotes,
  mindsetStages,
  personalInfo,
  projects,
  skillDomains,
  timeline,
} from "@/data";

/**
 * The chatbot's knowledge base.
 *
 * Every answer the bot can give is derived from `src/data`, so it can never
 * drift from what is actually on the page. Update a data module and the chatbot
 * follows — there is no second copy of the content to keep in sync.
 *
 * This module is imported by the browser (instant offline replies) and by the
 * server route (grounding context for the optional model), so it must stay free
 * of DOM and Node APIs.
 */

/** Anchors the chatbot is allowed to navigate the visitor to. */
export const CHAT_SECTIONS = [
  "home",
  "about",
  "mindset",
  "projects",
  "hardware",
  "skills",
  "experience",
  "education",
  "lab-notes",
  "contact",
] as const;

export type ChatSection = (typeof CHAT_SECTIONS)[number];

export interface ChatReply {
  reply: string;
  /** Anchor to offer as a "take me there" button. */
  section: string | null;
  suggestions: string[];
  source: "ai" | "offline";
}

const clean = (value: unknown): string => String(value ?? "").replace(/\s+/g, " ").trim();

/** Placeholder entries describe a gap; they are never presented as content. */
const realEntries = <T extends { placeholder?: boolean }>(list: T[] | undefined): T[] =>
  (list ?? []).filter((item) => !item?.placeholder);

const bullets = (items: string[] = []): string => items.map((item) => `- ${item}`).join("\n");

/** Trims long prose so chat answers stay scannable. */
const summarize = (text: unknown, limit = 240): string => {
  const flat = clean(text);
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${lastStop > 80 ? cut.slice(0, lastStop + 1) : cut.trimEnd()}…`;
};

/** Joins the About paragraphs back into one string for a chat-sized answer. */
const aboutText = (limit: number): string => summarize(personalInfo.about.join(" "), limit);

/**
 * The grounding document handed to the model. Plain markdown: cheap to send and
 * easy to audit. Nothing here is invented — it is a rendering of `src/data`.
 */
export function buildContext(): string {
  const lines: string[] = [];

  lines.push("## Identity");
  lines.push(`Name: ${personalInfo.name}`);
  lines.push(`Role: ${personalInfo.role}`);
  lines.push(`Degree: ${personalInfo.degree}`);
  lines.push(`College: ${personalInfo.college}`);
  lines.push(`Location: ${personalInfo.location}`);
  lines.push(`Email: ${personalInfo.email}`);
  lines.push(`LinkedIn: ${personalInfo.linkedin}`);
  lines.push(`GitHub: ${personalInfo.github}`);
  lines.push(`Tagline: ${personalInfo.tagline}`);
  lines.push(`Bio: ${aboutText(700)}`);

  lines.push("");
  lines.push("## Skills");
  for (const domain of skillDomains) {
    lines.push(
      `### ${domain.name} (${domain.level}, ${domain.category}) — ${domain.tagline}`,
    );
    lines.push(summarize(domain.description, 220));
    lines.push(`Areas: ${domain.highlights.join(", ")}.`);
  }
  lines.push(
    "- Note: only these two areas are listed. The site does not claim a broader toolkit.",
  );

  lines.push("");
  lines.push("## Projects");
  for (const project of realEntries(projects)) {
    lines.push(
      `- ${project.title} [${project.status}, ${project.year}]: ${summarize(project.problem, 200)} ${summarize(project.summary, 200)} Built with ${project.tech.join(", ")}.`,
    );
    for (const link of project.links) {
      lines.push(`  - ${link.label}: ${link.href}`);
    }
  }
  if (realEntries(projects).length < projects.length) {
    lines.push("- Note: the projects section also contains an unfilled template card.");
  }

  lines.push("");
  lines.push("## Hardware on the bench");
  for (const component of hardwareComponents) {
    lines.push(
      `- ${component.label} (${component.caption}): ${summarize(component.note, 200)} Specs: ${component.specs.map((spec) => `${spec.label} = ${spec.value}`).join("; ")}.`,
    );
  }

  lines.push("");
  lines.push("## Approach");
  for (const stage of mindsetStages) {
    lines.push(`- ${stage.index} ${stage.title} — ${stage.headline}: ${summarize(stage.body, 220)}`);
  }

  lines.push("");
  lines.push("## Education");
  for (const item of education) {
    lines.push(
      `- ${item.degree} in ${item.field} at ${item.institution}, ${item.location}. ${item.duration} (${item.status}). Subjects: ${item.areas.join(", ")}.`,
    );
  }

  lines.push("");
  lines.push("## Timeline");
  for (const entry of realEntries(timeline)) {
    lines.push(`- [${entry.date}] ${entry.title} — ${entry.org}: ${summarize(entry.description, 200)}`);
  }

  lines.push("");
  lines.push("## Achievements");
  // Labels only — the entries themselves are pulled from `achievements` below so
  // that placeholders and real items are filtered in exactly one place.
  for (const label of ["certifications", "hackathons", "courses", "awards"] as const) {
    const titles = realEntries(achievements[label]).map((item) => item.title);
    const name = label[0].toUpperCase() + label.slice(1);
    lines.push(titles.length ? `- ${name}: ${titles.join("; ")}` : `- ${name}: none listed yet`);
  }

  lines.push("");
  lines.push("## Lab notes");
  for (const note of realEntries(labNotes)) {
    lines.push(`- ${note.title} (${note.rig}): ${summarize(note.problem, 180)} → ${summarize(note.learned, 200)}`);
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Offline intent matching                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Visitor-voiced follow-up chips, shared across intents so the phrasing stays
 * consistent. Deliberately free of gendered pronouns — the assistant talks about
 * the portfolio owner in a neutral voice.
 */
const ask = {
  skills: "What skills are listed?",
  projects: "Show me the projects",
  education: "College and degree details?",
  contact: "How do I get in touch?",
  location: "Where are you based?",
  robotics: "Tell me about the robotics work",
  microprocessor: "Tell me about the microprocessor work",
  hardware: "What hardware do you work with?",
  links: "Share the profile links",
  achievements: "Any certifications or awards?",
  approach: "How do you actually build things?",
  notes: "Any lab notes?",
  freeChat: "What have you been up to lately?",
} as const;

interface Intent {
  id: string;
  /** Topic intents use 2; broad conversational intents use 1. */
  weight: number;
  keywords: string[];
  answer: () => string;
  section?: string;
  suggestions?: string[];
}

/**
 * Each intent declares trigger words, a reply builder and a weight.
 *
 * The weight is what stops a vague conversational phrase from hijacking a
 * specific question: "tell me about robotics" contains "tell me about", but the
 * robotics intent outweighs the "about" intent. Ordering is irrelevant.
 */
const INTENTS: Intent[] = [
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
      const domain = skillDomains.find((item) => item.name.toLowerCase().includes("robot"));
      if (!domain) return "Robotics isn't listed in the skills section yet.";
      return `**${domain.name}** — ${domain.level} · ${domain.category}\n${summarize(domain.description, 320)}\n\nHands-on areas:\n${bullets(domain.highlights)}`;
    },
    section: "skills",
    suggestions: [ask.microprocessor, ask.hardware, ask.projects],
  },
  {
    id: "microprocessor",
    weight: 2,
    keywords: [
      "microprocessor",
      "microprocessors",
      "microcontroller",
      "microcontrollers",
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
      const domain = skillDomains.find((item) =>
        item.name.toLowerCase().includes("microprocessor"),
      );
      if (!domain) return "Microprocessor content isn't listed in the skills section yet.";
      return `**${domain.name}** — ${domain.level} · ${domain.category}\n${summarize(domain.description, 320)}\n\nCore areas:\n${bullets(domain.highlights)}`;
    },
    section: "skills",
    suggestions: [ask.robotics, ask.education, ask.projects],
  },
  {
    id: "hardware",
    weight: 2,
    keywords: [
      "hardware",
      "board",
      "boards",
      "breadboard",
      "esp32",
      "arduino uno",
      "components",
      "parts",
      "on the bench",
      "beyond the screen",
      "workbench",
      "gear",
      "equipment",
    ],
    answer: () =>
      `The **Beyond the screen** section lists ${hardwareComponents.length} parts actually used on the bench:\n\n${bullets(
        hardwareComponents.map(
          (component) => `${component.label} (${component.caption}) — ${summarize(component.note, 120)}`,
        ),
      )}`,
    section: "hardware",
    suggestions: [ask.robotics, ask.projects, ask.skills],
  },
  {
    id: "approach",
    weight: 2,
    keywords: [
      "approach",
      "mindset",
      "process",
      "method",
      "methodology",
      "workflow",
      "how do you build",
      "how do you work",
      "how you work",
      "philosophy",
      "thinking",
    ],
    answer: () =>
      `How a build goes, in order:\n\n${mindsetStages
        .map((stage) => `**${stage.index} ${stage.title}** — ${stage.headline}\n${summarize(stage.body, 180)}`)
        .join("\n\n")}`,
    section: "mindset",
    suggestions: [ask.projects, ask.notes, ask.skills],
  },
  {
    id: "notes",
    weight: 2,
    keywords: [
      "lab note",
      "lab notes",
      "notes",
      "journal",
      "log",
      "logs",
      "experiment",
      "experiments",
      "what went wrong",
      "failures",
      "debugging",
    ],
    answer: () => {
      const real = realEntries(labNotes);
      if (real.length === 0) return "No lab notes are written up yet.";
      return `**Lab notes** — short write-ups of things that misbehaved:\n\n${bullets(
        real.map((note) => `${note.title} (${note.rig}) — ${summarize(note.learned, 160)}`),
      )}`;
    },
    section: "lab-notes",
    suggestions: [ask.projects, ask.approach, ask.contact],
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
    answer: () => {
      const real = realEntries(projects);
      return `${real.length} projects listed on the site right now:\n\n${real
        .map(
          (project) =>
            `**${project.title}** _(${project.status})_\n${summarize(project.summary, 190)}\n- Stack: ${project.tech.join(", ")}`,
        )
        .join("\n\n")}\n\nSource code is on ${personalInfo.github}.`;
    },
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
      `The best way to reach ${personalInfo.firstName}:\n\n- **Email** — ${personalInfo.email}\n- **LinkedIn** — ${personalInfo.linkedin}\n- **GitHub** — ${personalInfo.github}\n- **Based in** — ${personalInfo.location}\n\nOpen to collaborations on robotics, embedded systems and web projects.`,
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
        return "Certifications, hackathons, courses and awards are **not filled in yet** — that part of the site is an explicit placeholder rather than a claim.\n\nThe strongest signal so far is the hands-on work: robotics and microprocessor projects, the hardware on the bench, and shipped web builds.";
      }
      return `Recorded so far:\n\n${bullets(
        filled.map(
          (item) =>
            `${item.title}${item.issuer ? ` (${item.issuer})` : ""}${item.platform ? ` (${item.platform})` : ""}`,
        ),
      )}`;
    },
    section: "experience",
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
      "language",
      "languages",
    ],
    answer: () =>
      `Two areas of focus, which is the complete list:\n\n${skillDomains
        .map(
          (domain) =>
            `**${domain.name}** — ${domain.level}, ${domain.category}\n${domain.tagline}\n${summarize(domain.description, 260)}\n${bullets(domain.highlights)}`,
        )
        .join("\n\n")}\n\nAnything outside these two isn't claimed on the site.`,
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
      `${personalInfo.name} is a ${personalInfo.role} at ${personalInfo.college}, based in ${personalInfo.location}.\n\n${aboutText(420)}`,
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
      `I'm **Vegapunk**, the assistant that lives in this portfolio.\n\nI know ${personalInfo.firstName}'s work in detail — the skills, the projects, the hardware, the degree, the contact details — because all of it is right here on the page. Ask me anything about it, or just chat; I'm happy to talk about anything else too.`,
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
      `Two things, and the second one is the fun one:\n\n- **The portfolio** — skills, projects, hardware, education, approach and contact details, answered from the site's own content\n- **Anything else** — feel free to chat about technology, science, study or career advice, or whatever's on your mind`,
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
      `Hey! I'm **Vegapunk**.\n\nI can fill you in on the **skills**, **projects**, and **hardware** bits of this portfolio, or we can just talk about something else entirely — your call.`,
    suggestions: [ask.skills, ask.projects, ask.contact],
  },
  {
    id: "thanks",
    weight: 1,
    keywords: [
      "thanks",
      "thank you",
      "thx",
      "cheers",
      "appreciate",
      "nice",
      "cool",
      "awesome",
      "great",
      "perfect",
    ],
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

const FALLBACK: Intent = {
  id: "fallback",
  // Never matched by keyword — it is returned when nothing else scores.
  weight: 0,
  keywords: [],
  answer: () =>
    `I'm running in **offline mode**, so right now I can only answer from the portfolio itself — I'm not connected to a language model, which means I can't hold up my end of a general conversation. Add a Gemini API key to switch that on.\n\nUntil then, ask me about:\n- **Skills** in robotics and microprocessors\n- **Projects** and the stack behind them\n- **Hardware** on the bench\n- **Education** at ${personalInfo.college}\n- **Contact** details`,
  suggestions: [ask.skills, ask.projects, ask.contact],
};

/** Lowercase, strip punctuation, collapse whitespace — for keyword matching. */
const normalize = (text: unknown): string =>
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
 *   - short keywords (3 characters or fewer) only ever match whole words, so
 *     "hi" can never fire inside "which";
 *   - ties are broken by intent weight, not by declaration order.
 */
function scoreIntents(message: string): Intent {
  const normalized = ` ${normalize(message)} `;
  const words = normalized.split(" ").filter(Boolean);

  let best: Intent = FALLBACK;
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
        // Longer words may match inside a token, which is what catches "skills"
        // from the keyword "skill".
        raw += SUBSTRING_SCORE;
      }
    }

    const score = raw * (intent.weight ?? 1);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  // One solid full-word hit is enough to be worth answering; anything weaker is
  // treated as "the visitor is asking something else entirely".
  return bestScore >= 2 ? best : FALLBACK;
}

/**
 * The offline answer, used when no model key is configured and as the safety
 * net if the model call fails. Always returns a shaped reply, never throws.
 */
export function getOfflineReply(message: string): ChatReply {
  const text = clean(message);
  if (!text) {
    return {
      reply:
        "I didn't catch that — ask me about the skills, projects, or hardware, or just say hello.",
      section: null,
      suggestions: FALLBACK.suggestions ?? [],
      source: "offline",
    };
  }

  const intent = scoreIntents(text);
  return {
    reply: intent.answer(),
    section: intent.section ?? null,
    suggestions: intent.suggestions ?? FALLBACK.suggestions ?? [],
    source: "offline",
  };
}

/** Opening message shown when the panel is first opened. */
export function getGreeting(): string {
  return `Hey, I'm **Vegapunk**. I know this portfolio inside out — skills, projects, hardware, education, contact — and I'm happy to just talk as well.\n\nWhat do you want to get into?`;
}

/** Quick-reply chips for the empty state. */
export function getStarterSuggestions(): string[] {
  return [
    "Who are you?",
    "What skills are listed?",
    "Show me the projects",
    "How do I get in touch?",
  ];
}
