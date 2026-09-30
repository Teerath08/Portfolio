import type { MindsetStage } from "./types";

/**
 * "How I actually build" — five stages, in order, drawn as a connected signal
 * path rather than a row of icons.
 *
 * The wording is deliberately specific and first-person. If a stage does not
 * describe what you really do, rewrite it here; nothing else depends on it.
 */
export const mindsetStages: MindsetStage[] = [
  {
    index: "01",
    title: "Think",
    headline: "Understand the problem first",
    body: "Before any wiring or code, I write down what the thing has to do and what would count as it working. Most of my wasted evenings were me building something before I knew what it was supposed to do.",
  },
  {
    index: "02",
    title: "Build",
    headline: "Get the first version on the bench",
    body: "Breadboard before schematic. A working version with three ugly wires teaches me more than a perfect plan I have not tested. If the first version can't be wrong, it's not a first version.",
  },
  {
    index: "03",
    title: "Test",
    headline: "Break it deliberately",
    body: "Unplug the sensor. Short the line. Pull the Wi-Fi. The failures I plan for are the ones that teach me; the ones that surprise me only cost me time.",
  },
  {
    index: "04",
    title: "Learn",
    headline: "Work out what actually lied to me",
    body: "Is it the code, the wiring, the power rail, or my assumption? Half of debugging is admitting the assumption was never checked. I write down the answer so I stop guessing about it later.",
  },
  {
    index: "05",
    title: "Improve",
    headline: "Build the better version",
    body: "Cleaner wiring, less waiting, a threshold instead of a magic number. The goal isn't to never make version one again — it's to make version two noticeably better.",
  },
];