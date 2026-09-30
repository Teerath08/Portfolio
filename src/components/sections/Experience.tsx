import { achievementBuckets, achievements } from "@/data";
import Placeholder from "@/components/ui/Placeholder";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import Timeline from "@/components/ui/Timeline";

/**
 * Experience.
 *
 * The timeline holds only what is already true of this site — the degree and
 * the three projects — plus three clearly marked slots for workshops,
 * hackathons and certifications. Nothing here claims an internship, an award
 * or a result that has not happened.
 *
 * The achievements grid below is the same four buckets the previous version of
 * the site carried, kept in place so the structure is ready when there is
 * something real to put in it.
 */
export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section">
      <div className="shell">
        <SectionHeader
          id="experience-title"
          index="06"
          eyebrow="Experience"
          title="What has"
          highlight="happened so far"
          lede="A first-year record, written plainly. The dashed entries are slots, not results — fill them in when there is something to put there."
          aside={
            <span className="chip border-dashed">
              <span aria-hidden="true" className="text-accent/70">
                +
              </span>
              Editing? See <span className="text-accent/80">src/data/experience.ts</span>
            </span>
          }
        />


        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
          {/* ── Timeline ──────────────────────────────────────────────────── */}
          <Reveal>
            <h3 className="label mb-6">Timeline</h3>
            <Timeline />
          </Reveal>

          {/* ── Achievements ──────────────────────────────────────────────── */}
          <div>
            <Reveal delay={0.08}>
              <h3 className="label mb-6">Achievements</h3>
              <div className="space-y-4">
                {achievementBuckets.map((bucket) => (
                  <div key={bucket.id} className="panel overflow-hidden">
                    <div className="border-b border-line/8 px-5 py-3.5">
                      <p className="font-mono text-[10px] uppercase tracking-label text-ink">
                        {bucket.label}
                      </p>
                      <p className="mt-1 text-xs text-dim">{bucket.hint}</p>
                    </div>

                    <ul className="stack-divider">
                      {achievements[bucket.id].map((item, index) => (
                        <li
                          key={`${bucket.id}-${item.title}-${index}`}
                          className="px-5 py-4"
                        >
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-ink transition-colors hover:text-accent"
                            >
                              {item.title}
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : (
                            <p
                              className={
                                item.placeholder ? "text-sm text-dim" : "text-sm text-ink"
                              }
                            >
                              {item.title}
                            </p>
                          )}

                          <p className="mt-1 font-mono text-[11px] text-dim">
                            {[item.issuer, item.event, item.platform, item.date]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <Placeholder
                className="mt-4"
                title="This grid is intentionally sparse. Every bucket is empty until there is a finished course, an entered competition or an award actually received."
                hint="experience.ts → achievements"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
