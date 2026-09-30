import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";

import { heroFacts, heroMeta, heroSignals, personalInfo, site } from "@/data";
import HeroVisual from "@/components/hero/HeroVisual";
import Magnetic from "@/components/ui/Magnetic";
import ScrollParallax from "@/components/ui/ScrollParallax";
import TextReveal from "@/components/ui/TextReveal";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { SectionLink } from "@/components/layout/SectionLink";

/**
 * Hero.
 *
 * A server component. The only JavaScript it pulls in is the hero visual (which
 * is itself lazy), the magnetic wrapper on the two primary buttons, and the
 * scroll-linked wrapper that carries the copy and the visual away at different
 * rates as the section leaves.
 *
 * Layout: copy on the left at every breakpoint, visual on the right from
 * `lg` up. On smaller screens the visual comes *after* the headline but *above*
 * the supporting rows, because the headline plus the two calls to action are
 * the only things a visitor on a phone must scroll past.
 */
export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24"
    >
      {/* Faint concentric rings, so the visual has something to sit on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120vw] w-[120vw] max-h-[68rem] max-w-[68rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] [background:radial-gradient(circle_at_center,transparent_38%,rgb(var(--line)/0.35)_38.2%,transparent_38.6%,rgb(var(--line)/0.22)_39%,transparent_39.4%,rgb(var(--line)/0.14)_39.8%,transparent_40.2%)]"
      />

      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          {/* ── Copy ─────────────────────────────────────────────────────── */}
          {/* Moves at a third of the visual's rate: the further away a plane is,
              the less it should shift, and that difference is what reads as
              depth rather than as two things sliding at once. */}
          <ScrollParallax distance={54} endOpacity={0.18} span={760} className="max-w-2xl">
            {/* Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-line/12 bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-label text-muted">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {personalInfo.status}
              </span>
              <span className="label hidden sm:inline">{site.tagline}</span>
            </div>

            {/* Name */}
            <h1
              id="hero-title"
              className="mt-7 text-[clamp(2.4rem,7vw,4.4rem)] font-semibold leading-[1.03] tracking-tight text-ink"
            >
              <TextReveal as="span" delay={0.05} text="Hi, I’m" />
              <TextReveal
                as="span"
                delay={0.18}
                className="mt-1 font-semibold"
                wordClassName="text-glow"
                text={`${personalInfo.firstName} ${personalInfo.lastName}.`}
              />
            </h1>

            {/* Role + tagline */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink sm:text-xl">
              <span className="font-mono text-[13px] uppercase tracking-label text-accent">
                {personalInfo.role}
              </span>
              <span className="mx-2 text-dim" aria-hidden="true">
                /
              </span>
              <span className="text-muted">{personalInfo.tagline}</span>
            </p>

            {/* Calls to action */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic as="div" strength={5}>
                <SectionLink
                  sectionId="projects"
                  label="View my work"
                  className="btn-primary"
                >
                  View my work
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </SectionLink>
              </Magnetic>

              <Magnetic as="div" strength={5}>
                <SectionLink
                  sectionId="contact"
                  label="Connect with me"
                  className="btn-ghost"
                >
                  Connect with me
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </SectionLink>
              </Magnetic>

              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet ml-1"
                aria-label={`${site.name} on GitHub — opens in a new tab`}
              >
                <GitHubIcon size={15} />
                GitHub
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet"
                aria-label={`${site.name} on LinkedIn — opens in a new tab`}
              >
                <LinkedInIcon size={15} />
                LinkedIn
              </a>
            </div>

            {/* Technical detail strip */}
            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line/8 pt-7 sm:grid-cols-3">
              {heroMeta.map((entry) => (
                <div key={entry.label}>
                  <dt className="label">{entry.label}</dt>
                  <dd className="mt-1.5 font-mono text-[12px] leading-relaxed text-ink/85">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollParallax>

          {/* ── Visual ───────────────────────────────────────────────────── */}
          <ScrollParallax distance={150} endOpacity={0} span={620} className="order-first lg:order-none">
            <HeroVisual className="mx-auto w-full max-w-xl lg:max-w-none" />
          </ScrollParallax>
        </div>

        {/* ── Bottom row: fact strip + scroll cue ────────────────────────── */}
        <div className="mt-14 flex flex-col gap-8 border-t border-line/8 pt-8 lg:mt-20 lg:flex-row lg:items-end lg:justify-between">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:max-w-2xl lg:flex-1">
            {heroFacts.map((fact) => (
              <li key={fact.label} className="min-w-0">
                <p className="label">{fact.label}</p>
                <p className="mt-1 text-sm font-medium tracking-tight text-ink">
                  {fact.value}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-dim">{fact.hint}</p>
              </li>
            ))}
          </ul>

          <a
            href="#about"
            className="group hidden shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-label text-dim transition-colors duration-300 hover:text-accent lg:inline-flex"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line/12">
              <ArrowDown
                size={15}
                aria-hidden="true"
                className="animate-float-soft transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </span>
            Scroll
            <span className="sr-only">to the About section</span>
          </a>
        </div>
      </div>

      {/* Screen-reader summary of what the visual shows. The visual itself is
          decorative, but the technical labels around it are real content and
          are already in the document. */}
      <p className="sr-only">
        An illustration of a microcontroller development board, annotated with the
        areas covered on this site:{" "}
        {heroSignals.map((signal) => signal.label).join(", ")}.
      </p>

      {/* Mobile call to action, shown only where the desktop scroll cue is not. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center lg:hidden">
        <div className="shell flex justify-between py-5">
          <a href={`mailto:${personalInfo.email}`} className="btn-quiet">
            <Mail size={15} aria-hidden="true" />
            Email
          </a>
          <a href="#about" className="btn-quiet">
            About
            <ArrowDown size={15} aria-hidden="true" />
            <span className="sr-only">section</span>
          </a>
        </div>
      </div>
    </section>
  );
}
