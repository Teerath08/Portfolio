"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Layers } from "lucide-react";

import type { Project } from "@/data/types";
import { accent, accentHex } from "@/lib/accents";
import Blueprint from "@/components/ui/Blueprint";
import Placeholder from "@/components/ui/Placeholder";
import SignalFlow from "@/components/ui/SignalFlow";
import { useFinePointer } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const SPEC_LABELS: Record<string, string> = {
  microcontroller: "MCU",
  sensors: "Sensors",
  communication: "Link",
  software: "Software",
  output: "Output",
};

const STATUS_TONE: Record<Project["status"], string> = {
  Live: "border-accent/40 bg-accent/10 text-accent",
  // Amber rather than the teal this used to be: it is the one status colour that
  // reads as "unfinished" without introducing a hue that is not in the palette,
  // and it stays clear of the cyan that means "Live".
  "In Progress": "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Archived: "border-line/20 bg-surface/70 text-dim",
};

/**
 * One project.
 *
 * Two interactions, both deliberately small:
 *   • depth — the card tilts a few degrees toward the pointer on precise
 *     pointers only, driven by rAF and written straight to the node;
 *   • expand — the detail rows and signal path collapse behind a disclosure,
 *     so four cards still fit above the fold.
 *
 * The tilt is capped at 5°. Anything larger turns a reading surface into a
 * toy, and it makes the text harder to read, which is the opposite of the
 * point.
 */
export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const tiltEnabled = finePointer && !reduced;

  const tokens = accent(project.accent);
  const specRows = project.specs
    ? Object.entries(project.specs).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      )
    : [];
  const hasDetails = specRows.length > 0 || Boolean(project.signalFlow) || project.detail.length > 0;

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!tiltEnabled) return;
      const node = cardRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.transform = `perspective(1000px) rotateX(${(-py * 5).toFixed(
          2,
        )}deg) rotateY(${(px * 5).toFixed(2)}deg) translate3d(0, -2px, 0)`;
      });
    },
    [tiltEnabled],
  );

  const resetTilt = useCallback(() => {
    const node = cardRef.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0)";
    });
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: reduced ? 0 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : index * 0.06 }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        className="edge-lit tile tile-hover group flex h-full flex-col overflow-hidden will-change-transform"
        style={{ transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* ── Preview ────────────────────────────────────────────────────── */}
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-48">
          <Blueprint
            seed={project.id}
            color={accentHex[project.accent]}
            caption={`${project.year} · ${project.status}`}
            mark={project.title
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          />
          {/* Status */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-label",
                STATUS_TONE[project.status],
              )}
            >
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
              {project.status}
            </span>
            {project.placeholder && (
              <span className="rounded-md border border-dashed border-amber-400/50 px-2 py-1 font-mono text-[10px] uppercase tracking-label text-amber-300">
                Template
              </span>
            )}
          </div>

          {/* Year */}
          <span className="index absolute right-4 top-4 text-[11px] text-dim">
            {project.year}
          </span>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{project.title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">{project.summary}</p>

          {/* Tech chips */}
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <li key={tech} className={cn("chip", tokens.badge)}>
                {tech}
              </li>
            ))}
          </ul>

          {/* Disclosure */}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={`project-detail-${project.id}`}
              className={cn(
                "mt-6 inline-flex items-center gap-2 self-start rounded-lg border border-line/12 bg-surface/50 px-3 py-2",
                "font-mono text-[10px] uppercase tracking-label text-muted",
                "transition-colors duration-300 hover:border-accent/45 hover:text-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
              )}
            >
              <Layers size={13} aria-hidden="true" />
              {open ? "Hide details" : "Open the log"}
              <ChevronDown
                size={13}
                aria-hidden="true"
                className={cn("transition-transform duration-300", open && "rotate-180")}
              />
            </button>
          )}

          {/* Expanded detail */}
          <div
            id={`project-detail-${project.id}`}
            hidden={!open}
            className="mt-5 space-y-5 border-t border-line/8 pt-5"
          >
            <p className="text-sm leading-relaxed text-muted">{project.problem}</p>

            {specRows.length > 0 && (
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {specRows.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <dt className="label">{SPEC_LABELS[key] ?? key}</dt>
                    <dd className="font-mono text-[11px] leading-relaxed text-ink/80">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {project.signalFlow && (
              <SignalFlow nodes={project.signalFlow} accent={project.accent} />
            )}

            <dl className="stack-divider">
              {project.detail.map((row) => (
                <div key={row.label} className="grid gap-1 py-2.5 sm:grid-cols-[7rem_1fr] sm:gap-4">
                  <dt className="label pt-0.5">{row.label}</dt>
                  <dd className="text-[13px] leading-relaxed text-muted">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Links */}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            {project.links.length > 0 ? (
              project.links.map((link) => (
                <a
                  key={link.label + link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("chip-interactive group/link")}
                >
                  {link.label}
                  <ArrowUpRight
                    size={12}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))
            ) : (
              <span className="chip border-dashed text-dim">No public link yet</span>
            )}
          </div>
        </div>
      </div>

      {project.placeholder && (
        <Placeholder
          className="mt-4"
          title="This card is a template, not a project. It exists so the layout has a working hardware example — replace it with a real build."
          hint="projects.ts"
        />
      )}
    </motion.article>
  );
}
