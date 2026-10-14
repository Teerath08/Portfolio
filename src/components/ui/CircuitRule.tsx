import { cn } from "@/lib/cn";

/**
 * A circuit trace used as a divider.
 *
 * Pure SVG with a CSS dash animation, so it costs nothing to render and stops
 * animating under `prefers-reduced-motion` through the global rule in
 * `globals.css`.
 */
export default function CircuitRule({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-8 w-full overflow-hidden", className)} aria-hidden="true">
      <svg
        viewBox="0 0 800 32"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <path
          d="M0 16 H140 L170 6 H330 L360 16 H520 L550 26 H690 L720 16 H800"
          stroke="currentColor"
          strokeWidth="1"
          className="animate-dash-flow text-accent/35"
          strokeDasharray="7 6"
          style={{ strokeDashoffset: 0 }}
        />
        <path
          d="M0 16 H800"
          stroke="currentColor"
          strokeWidth="1"
          className="text-line/15"
        />
        {[
          [140, 16],
          [520, 16],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" className="fill-accent/60" />
        ))}
      </svg>
    </div>
  );
}
