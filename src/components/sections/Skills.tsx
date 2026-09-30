import { skillCount, skillDomains } from "@/data";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Skills.
 *
 * Two areas of focus, and only two — the ones that have been listed here since
 * the beginning, with their original descriptions intact. There is deliberately
 * no broader "toolkit" grid: a longer list would say more about the list than
 * about the work, and nothing on this page needs to be padded to look full.
 *
 * No client components: the whole section is markup plus CSS hover states, so it
 * renders on the server and costs nothing to scroll.
 */
export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section">
      <div className="shell">
        <SectionHeader
          id="skills-title"
          index="05"
          eyebrow="Skills"
          title="Two areas"
          highlight="of focus"
          lede="Robotics, and the microprocessor architecture underneath it. Everything listed here is something that has actually been built or studied — the list stays short on purpose."
          aside={
            <div className="text-right">
              <p className="index text-2xl text-ink">{skillCount}</p>
              <p className="label mt-1">Areas of focus</p>
            </div>
          }
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {skillDomains.map((domain, index) => (
            <Reveal key={domain.name} delay={index * 0.08}>
              <article className="edge-lit tile tile-hover relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
                <div
                  aria-hidden="true"
                  className="dots pointer-events-none absolute inset-0 opacity-40"
                />

                <div className="relative flex items-start gap-4">
                  <span className="index grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/[0.07] text-lg text-accent">
                    {domain.glyph}
                  </span>
                  <div className="min-w-0">
                    <p className="label">{domain.category}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                      {domain.name}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-label text-accent/80">
                      {domain.tagline}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 rounded-md border border-line/12 bg-surface/60 px-2 py-1 font-mono text-[10px] uppercase tracking-label text-muted">
                    {domain.level}
                  </span>
                </div>

                <p className="relative mt-5 text-sm leading-relaxed text-muted">
                  {domain.description}
                </p>

                <div className="relative mt-6 flex-1" />

                <ul className="relative mt-6 flex flex-wrap gap-1.5">
                  {domain.highlights.map((highlight) => (
                    <li key={highlight} className="chip">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
