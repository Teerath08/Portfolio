import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PlaceholderProps {
  /** What is missing, in the owner's words. */
  title: string;
  /** Where the replacement goes. */
  hint?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Marks content that does not exist yet.
 *
 * Placeholders are rendered openly rather than hidden: an empty section reads
 * as broken, whereas a dashed card that says exactly which file to edit reads
 * as a to-do list. Every entry currently carrying one is a genuine gap in the
 * source material, not a placeholder the assistant could have filled in
 * honestly.
 */
export default function Placeholder({ title, hint, children, className }: PlaceholderProps) {
  return (
    <div
      className={cn(
        "tile dashed-edge flex flex-col gap-3 border-dashed border-line/20 bg-surface/30 p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-dashed border-accent/40 font-mono text-[11px] text-accent/80"
        >
          +
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-muted">{title}</p>
          {hint && (
            <p className="mt-2 font-mono text-[11px] text-dim">
              Add it in <span className="text-accent/80">src/data/</span> → {hint}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/** Compact inline variant, for a single line inside an existing list. */
export function PlaceholderChip({ label }: { label: string }) {
  return (
    <span className="chip border-dashed border-accent/30 text-dim">
      <span aria-hidden="true" className="text-accent/70">
        +
      </span>
      {label}
    </span>
  );
}