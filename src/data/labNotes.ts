import type { LabNote } from "./types";

/**
 * Lab notes.
 *
 * The point of this section is to show the actual process — including the
 * versions that did not work. The first three entries describe things that are
 * genuinely in this repository's history; the last two are empty slots.
 *
 * ── Editing note ──────────────────────────────────────────────────────────────
 * Copy a slot, rename the `id`, and fill in the four fields. Short and specific
 * reads far better than long: one problem, one experiment, one thing learned.
 */
export const labNotes: LabNote[] = [
  {
    id: "always-replies",
    index: "01",
    title: "A chatbot that cannot go silent",
    rig: "/api/chat · bundled knowledge base",
    problem:
      "The free model endpoint returns 503 \"high demand\" often enough that a visitor could easily have met an empty reply bubble.",
    experiment:
      "Built a keyword-matched knowledge base out of the site's own content, shipped it to the browser, and made the server fall back to it on any failure, timeout or refusal.",
    result:
      "The assistant always answers. If the server can't be reached at all it replies from the local copy and the header switches to \"Offline mode\" instead of showing an error.",
    learned:
      "Designing the failure path first made the happy path trivial. The fallback stopped being a safety net and became the main path.",
    tags: ["Web", "Resilience", "Shipped"],
  },
  {
    id: "avatar-editor",
    index: "02",
    title: "An avatar editor with no backend",
    rig: "react-easy-crop · canvas · localStorage",
    problem:
      "I wanted people to be able to put a face on the site without shipping an upload endpoint, a database, or a storage bill.",
    experiment:
      "Crop in the browser, downscale to 400×400, encode as a compact JPEG, and keep the result in localStorage.",
    result:
      "The photo survives reloads with zero infrastructure, and the export is small enough that the storage quota is never the thing that breaks.",
    learned:
      "Client-side storage has real limits. Capping the output size is what made this reliable instead of merely working on my machine.",
    tags: ["Browser", "Media", "Shipped"],
  },
  {
    id: "theme-system",
    index: "03",
    title: "Three themes from one set of variables",
    rig: "CSS custom properties · inline boot script",
    problem:
      "Colours were written into the components themselves, so introducing a theme meant opening every file and hoping nothing was missed.",
    experiment:
      "Moved the entire palette into CSS custom properties, then added a small inline script that applies the stored theme before the first paint.",
    result:
      "Retuning or adding a theme is now an edit to a single block. The theme-color meta tag, scrollbars and native controls follow for free.",
    learned:
      "The flash of the wrong theme only exists if the script runs late. A few lines of blocking script at the top of the document bought that back.",
    tags: ["CSS", "Architecture", "Shipped"],
  },
  {
    id: "slot-hardware",
    index: "04",
    title: "TODO: a hardware experiment",
    rig: "TODO: the board, the sensor, the wires",
    problem:
      "Describe the thing that misbehaved, precisely. \"It didn't work\" is not a note, it's a mood.",
    experiment: "What you actually tried, and what you changed between attempts.",
    result: "What it does now. Only measured numbers — no estimated ones.",
    learned: "The part that changed how you think about the next build.",
    tags: [],
    placeholder: true,
  },
  {
    id: "slot-failure",
    index: "05",
    title: "TODO: something that failed",
    rig: "TODO: the setup that broke",
    problem: "The honest version. Everyone has one of these and nobody puts it on their portfolio.",
    experiment: "What you tried before admitting it was your fault.",
    result: "What you learned, ideally the thing nobody else writes down.",
    learned: "Keep it short. This is the entry people actually read.",
    tags: [],
    placeholder: true,
  },
];