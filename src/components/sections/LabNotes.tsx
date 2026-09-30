import { FlaskConical, Plus } from "lucide-react";

import { labNotes } from "@/data";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/** The four fields of a lab note, in the order they are usually written. */
const FIELDS = [
  { key: "problem", label: "Problem" },
  { key: "experiment", label: "Experiment" },
  { key: "result", label: "Result" },
  { key: "learned", label: "Learned" },
] as const;

/**
 * Lab notes.
 *
 * Built on native `<details>`: the disclosure works with a keyboard, is
 * announced correctly, survives JavaScript being blocked, and costs zero bytes
 * of client bundle. A custom accordion would need all of that reimplemented.
 *
 * The intent of the section is the process — including the versions that did
 * not work. The empty slots at the bottom say so out loud.
 */
export default function LabNotes() {
  const real = labNotes.filter((note) => !note.placeholder).length;

  return (
    <section id="lab-notes" aria-labelledby="lab-notes-title" className="section">
      <div className="shell">
        <SectionHeader
          id="lab-notes-title"
          index="08"
          eyebrow="Lab notes"
          title="Written"
          highlight="down as I went"
          lede="Short records of things that misbehaved and what turned out to be responsible. The failed versions are usually the useful ones."
          aside={
            <div className="flex items-center gap-2.5">
              <FlaskConical size={15} className="text-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-label text-dim">
                {real} logged
              </span>
            </div>
          }
        />

        <Reveal className="mt-12">
          <div className="grid gap-4 lg:grid-cols-2">
            {labNotes.map((note) => (
              <details
                key={note.id}
                className={
                  note.placeholder
                    ? "group rounded-2xl border border-dashed border-line/18 bg-surface/25 open:bg-surface/40"
                    : "edge-lit tile tile-hover group rounded-2xl"
                }
              >
                <summary
                  className={
                    "flex cursor-pointer list-none items-start gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden"
                  }
                >
                  <span
                    className={
                      note.placeholder
                        ? "index mt-0.5 shrink-0 text-lg text-dim/60"
                        : "index mt-0.5 shrink-0 text-lg text-accent/40"
                    }
                    aria-hidden="true"
                  >
                    {note.placeholder ? <Plus size={18} /> : note.index}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={
                        note.placeholder
                          ? "block text-sm font-semibold tracking-tight text-dim"
                          : "block text-base font-semibold tracking-tight text-ink transition-colors duration-300 group-open:text-accent"
                      }
                    >
                      {note.title}
                    </span>
                    <span className="mt-1.5 block font-mono text-[11px] text-dim">{note.rig}</span>
                  </span>

                  {!note.placeholder && (
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-label text-dim transition-colors duration-300 group-open:text-accent"
                    >
                      Open
                    </span>
                  )}
                </summary>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  <dl className="stack-divider">
                    {FIELDS.map((field) => (
                      <div
                        key={field.key}
                        className="grid gap-1 py-2.5 sm:grid-cols-[5.5rem_1fr] sm:gap-4"
                      >
                        <dt className="label pt-0.5">{field.label}</dt>
                        <dd className="text-[13px] leading-relaxed text-muted">
                          {note[field.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>

                  {note.placeholder && (
                    <p className="mt-4 font-mono text-[11px] text-dim">
                      Replace this slot in{" "}
                      <span className="text-accent/80">src/data/labNotes.ts</span>. One
                      problem, one experiment, one thing learned.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
