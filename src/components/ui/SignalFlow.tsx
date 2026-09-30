import type { SignalNode } from "@/data/types";
import { accentHex } from "@/lib/accents";
import type { AccentKey } from "@/data/types";
import { cn } from "@/lib/cn";

/**
 * The signal path of a hardware project, drawn as a chain.
 *
 * Rendered as a horizontal scroll strip on small screens and a wrapped row from
 * `sm` up. A short light pulse travels each segment, offset by the segment's
 * index, so the chain reads as signal flowing rather than as a progress bar.
 *
 * Everything is CSS and SVG: no JavaScript, no layout thrash, and the whole
 * thing freezes under `prefers-reduced-motion` through the global rule in
 * `globals.css`.
 */
export default function SignalFlow({
  nodes,
  accent = "cyan",
  className,
}: {
  nodes: SignalNode[];
  accent?: AccentKey;
  className?: string;
}) {
  const color = accentHex[accent];

  return (
    <div className={cn("min-w-0", className)}>
      <div className="label mb-3">Signal path</div>

      <ol className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-0 overflow-x-auto px-1 pb-1">
        {nodes.map((node, index) => (
          <li
            key={node.label}
            className="flex shrink-0 snap-start items-center last:pr-1"
          >
            {/* Node */}
            <div className="relative flex w-[10.5rem] flex-col gap-1.5 sm:w-auto sm:flex-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md border"
                  style={{
                    borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse-node rounded-md"
                    style={{
                      boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 35%, transparent)`,
                      animationDelay: `${index * 0.32}s`,
                    }}
                  />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-label text-ink">
                  {node.label}
                </span>
              </div>
              <p className="pl-8 text-[11px] leading-snug text-dim">{node.detail}</p>
            </div>

            {/* Segment to the next node */}
            {index < nodes.length - 1 && (
              <span
                aria-hidden="true"
                className="relative mx-1.5 h-px w-6 shrink-0 overflow-visible bg-line/20 sm:w-4 lg:w-8"
              >
                <span
                  className="absolute inset-y-0 left-0 w-3 animate-signal-run"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    ["--run" as string]: "140%",
                    animationDelay: `${index * 0.32}s`,
                  }}
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
