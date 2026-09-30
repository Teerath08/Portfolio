import { BookOpen, Building2, CalendarClock } from "lucide-react";

import { education, educationFacts } from "@/data";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Education.
 *
 * One entry today, but the layout and the data shape are already an array, so a
 * second programme or a certification with real content slots in without any
 * structural change.
 */
export default function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="section">
      <div className="shell">
        <SectionHeader
          id="education-title"
          index="07"
          eyebrow="Education"
          title="The"
          highlight="degree"
          lede="A B.Tech in Electronics & Communication Engineering, with the curriculum treated as a set of tools rather than a list of subjects."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
          {education.map((entry) => (
            <Reveal key={entry.institution}>
              <article className="edge-lit tile tile-hover h-full overflow-hidden">
                {/* Head */}
                <div className="flex flex-col gap-5 border-b border-line/8 p-6 sm:flex-row sm:items-start">
                  <span
                    aria-hidden="true"
                    className="index grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/[0.07] text-xl text-accent"
                  >
                    {entry.monogram}
                  </span>

                  <div className="min-w-0">
                    <p className="label">{entry.degree}</p>
                    <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
                      {entry.field}
                    </h3>

                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                      <li className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-dim" aria-hidden="true" />
                        {entry.institution}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CalendarClock size={14} className="text-dim" aria-hidden="true" />
                        {entry.duration}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                        />
                        {entry.status}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-muted">{entry.description}</p>

                  <div className="mt-6">
                    <p className="label mb-3 flex items-center gap-2">
                      <BookOpen size={12} aria-hidden="true" />
                      Areas of study
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {entry.areas.map((area) => (
                        <li key={area} className="chip chip-interactive">
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          {/* Quick facts */}
          <Reveal delay={0.08}>
            <div className="grid h-full grid-rows-[auto_1fr] gap-4">
              <div className="panel overflow-hidden">
                <p className="label border-b border-line/8 px-5 py-3.5">At a glance</p>
                <dl className="stack-divider">
                  {educationFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="grid grid-cols-[7rem_1fr] items-baseline gap-3 px-5 py-3"
                    >
                      <dt className="label pt-0.5">{fact.label}</dt>
                      <dd className="font-mono text-[12px] text-ink/90">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="panel flex flex-col justify-between overflow-hidden p-5">
                <div>
                  <p className="label">Self-taught alongside</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Web development and applied AI are not on the syllabus. They
                    are here because a build that cannot be opened by anyone else
                    is only half a build.
                  </p>
                </div>

                <p className="mt-5 font-mono text-[11px] text-dim">
                  Curriculum subjects from the ECE programme; web and AI work is
                  self-directed.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
