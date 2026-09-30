import { GraduationCap, Mail, MapPin, Cpu, Code2 } from "lucide-react";

import { personalInfo } from "@/data";
import ProfileAvatar from "@/components/layout/ProfileAvatar";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * About, laid out as a spec sheet.
 *
 * The intent is a datasheet rather than a biography: the writing stays in the
 * owner's voice on the left, and the right column is a two-column table of
 * facts a reader might otherwise have to ask for. Nothing here is aspirational
 * — every row is a fact that is also stored somewhere else in `src/data`.
 */
export default function About() {
  const specs: { label: string; value: string }[] = [
    { label: "Name", value: personalInfo.name },
    { label: "Degree", value: personalInfo.degree },
    { label: "Institution", value: personalInfo.college },
    { label: "Location", value: personalInfo.location },
    { label: "Email", value: personalInfo.email },
    { label: "GitHub", value: `@${personalInfo.githubHandle}` },
    { label: "LinkedIn", value: `@${personalInfo.linkedinHandle}` },
    { label: "Year of study", value: "1st — B.Tech ECE, 2026–2030" },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="shell">
        <SectionHeader
          id="about-title"
          index="01"
          eyebrow="About"
          title="The short"
          highlight="version"
          lede="First-year ECE at JECRC University, most of the time spent with a breadboard, a datasheet and something that was not behaving as advertised."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          {/* ── Written introduction ─────────────────────────────────────── */}
          <div>

            <div className="space-y-5">
              {personalInfo.about.map((paragraph, index) => (
                <Reveal key={paragraph} delay={index * 0.06}>
                  <p
                    className={
                      index === 0
                        ? "text-lg leading-relaxed text-ink sm:text-xl"
                        : "text-[15px] leading-relaxed text-muted sm:text-base"
                    }
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Currently */}
            <Reveal delay={0.1}>
              <div className="panel mt-10 overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-line/8 px-5 py-3.5">
                  <Cpu size={14} className="text-accent" aria-hidden="true" />
                  <h3 className="font-mono text-[10px] uppercase tracking-label text-dim">
                    Currently
                  </h3>
                </div>
                <dl className="stack-divider">
                  {personalInfo.currently.map((entry) => (
                    <div
                      key={entry.label}
                      className="grid grid-cols-[5.5rem_1fr] items-baseline gap-4 px-5 py-3"
                    >
                      <dt className="label pt-0.5">{entry.label}</dt>
                      <dd className="text-sm leading-relaxed text-ink/90">
                        {entry.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          {/* ── Spec sheet ──────────────────────────────────────────────── */}
          {/* `lg:sticky lg:top-28` used to live here and had to be removed: the
              `revolve` rule in globals.css puts a `transform` on every section,
              and a transformed ancestor becomes the containing block for
              `position: sticky`, which pins the card to the section box instead
              of to the viewport — i.e. it stops sticking at all. `lg:self-start`
              stays, so in a two-column grid the sheet still sits at the top of
              its column rather than stretching to the height of the prose beside
              it. */}
          <Reveal delay={0.12} className="lg:self-start">
            <div className="panel overflow-hidden">
              {/* Identity card */}
              <div className="flex items-start gap-4 border-b border-line/8 p-5">
                <ProfileAvatar size="md" interactive hint={false} />
                <div className="min-w-0 pt-1">
                  <p className="text-base font-semibold tracking-tight text-ink">
                    {personalInfo.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{personalInfo.role}</p>
                  <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-dim">
                    <MapPin size={12} aria-hidden="true" />
                    {personalInfo.location}
                  </p>
                </div>
              </div>

              {/* Spec rows */}
              <dl className="stack-divider">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 px-5 py-2.5"
                  >
                    <dt className="label pt-0.5">{spec.label}</dt>
                    <dd className="break-words font-mono text-[12px] leading-relaxed text-ink/85">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-line/8 p-5">
                <a href={`mailto:${personalInfo.email}`} className="chip-interactive">
                  <Mail size={13} aria-hidden="true" />
                  Email
                </a>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip-interactive"
                >
                  <Code2 size={13} aria-hidden="true" />
                  GitHub
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip-interactive"
                >
                  <GraduationCap size={13} aria-hidden="true" />
                  LinkedIn
                </a>
              </div>
            </div>

            <p className="mt-4 px-1 font-mono text-[10px] leading-relaxed text-dim">
              Tip: click the avatar to replace it with a photo. It is cropped in
              your browser and stored locally — nothing is uploaded.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
