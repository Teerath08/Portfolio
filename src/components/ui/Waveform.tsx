import { cn } from "@/lib/cn";

/**
 * Oscilloscope trace, used sparingly as background texture.
 *
 * Draws itself once with a dash-offset animation and then stops. There is no
 * loop, no canvas and no JavaScript — under `prefers-reduced-motion` it simply
 * renders complete.
 */
export default function Waveform({
  className,
  /** Turns the drawing animation off entirely. */
  static: isStatic = false,
  opacity = 0.5,
}: {
  className?: string;
  static?: boolean;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={cn("h-full w-full text-accent", className)}
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <path
        d="M0 62 L60 62 L72 30 L86 92 L100 62 L180 62 L192 44 L204 80 L216 62 L300 62
           L312 20 L326 100 L340 62 L430 62 L442 48 L454 76 L466 62 L560 62
           L572 34 L586 88 L600 62 L700 62 L712 42 L724 82 L736 62 L840 62
           L852 26 L866 96 L880 62 L980 62 L992 46 L1004 78 L1016 62 L1100 62
           L1112 52 L1124 72 L1136 62 L1200 62"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="2600"
        strokeDashoffset={isStatic ? 0 : 2600}
        style={
          isStatic
            ? undefined
            : { animation: "waveform-draw 2.4s cubic-bezier(0.16,1,0.3,1) forwards" }
        }
      />
    </svg>
  );
}