import { cn } from "@/lib/cn";

/**
 * A generated project preview.
 *
 * Rather than ship stock screenshots that go stale, every project card gets a
 * deterministic blueprint derived from its id: the same project always produces
 * the same board. No images to optimise, nothing to lazy-load, and it never
 * lies about what the project is — it is clearly a schematic, not a photo.
 */

/** Small deterministic hash, so a given id always yields the same layout. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic pseudo-random sequence in [0, 1). */
function sequence(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface BlueprintProps {
  /** Stable seed — normally the project id. */
  seed: string;
  /** Accent hex, from `lib/accents`. */
  color: string;
  /** Mono caption in the corner. */
  caption?: string;
  /** Large watermark, usually the project's initials. */
  mark?: string;
  className?: string;
}

const W = 320;
const H = 200;

export default function Blueprint({ seed, color, caption, mark, className }: BlueprintProps) {
  const rand = sequence(hash(seed));

  // Pads around the edge, each routed back to the central module with an
  // orthogonal trace, which is what a real layout looks like at low zoom.
  const pads = Array.from({ length: 9 }, (_, i) => {
    const side = i % 4;
    const t = 0.18 + ((i * 0.11 + rand() * 0.06) % 0.62);
    if (side === 0) return { x: 8, y: Math.round(t * H), h: true };
    if (side === 1) return { x: W - 8, y: Math.round(t * H), h: true };
    if (side === 2) return { x: Math.round(t * W), y: 8, v: true };
    return { x: Math.round(t * W), y: H - 8, v: true };
  });

  const chip = { x: W / 2 - 46, y: H / 2 - 26, w: 92, h: 52 };
  const pins = Array.from({ length: 6 }, (_, i) => chip.x + 10 + i * ((chip.w - 20) / 5));

  return (
    <div className={cn("relative overflow-hidden", className)} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="presentation">
        <defs>
          <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.10" />
            <stop offset="55%" stopColor={color} stopOpacity="0.02" />
            <stop offset="100%" stopColor={color} stopOpacity="0.07" />
          </linearGradient>
          <pattern id={`grid-${seed}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke={color} strokeOpacity="0.13" strokeWidth="0.6" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill={`url(#bg-${seed})`} />
        <rect width={W} height={H} fill={`url(#grid-${seed})`} />

        {/* Traces from each pad to the module. */}
        {pads.map((pad, i) => {
          const midX = chip.x + chip.w / 2;
          const midY = chip.y + chip.h / 2;
          const d = pad.h
            ? `M${pad.x} ${pad.y} H${pad.x + (i % 2 ? 26 : -26)} L${midX + (i % 2 ? -40 : 40)} ${midY - 22 + i * 5} L${midX} ${midY - 22 + i * 5}`
            : `M${pad.x} ${pad.y} V${pad.y + (i % 2 ? 22 : -22)} L${midX - 44 + i * 6} ${midY} L${midX - 44 + i * 6} ${midY + 20 - i * 5} L${midX} ${midY + 20 - i * 5}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Pads and vias. */}
        {pads.map((pad, i) => (
          <g key={`pad-${i}`}>
            <circle
              cx={pad.x}
              cy={pad.y}
              r="3.2"
              fill="none"
              stroke={color}
              strokeOpacity="0.65"
              strokeWidth="1.1"
            />
            <circle cx={pad.x} cy={pad.y} r="1" fill={color} fillOpacity="0.8" />
          </g>
        ))}

        {/* The module itself, with pin pads on the long edges. */}
        <rect
          x={chip.x}
          y={chip.y}
          width={chip.w}
          height={chip.h}
          rx="5"
          fill="rgb(var(--surface))"
          stroke={color}
          strokeOpacity="0.75"
          strokeWidth="1.2"
        />
        {pins.map((x) => (
          <g key={x}>
            <rect x={x - 2} y={chip.y - 5} width="4" height="4" rx="1" fill={color} fillOpacity="0.6" />
            <rect
              x={x - 2}
              y={chip.y + chip.h + 1}
              width="4"
              height="4"
              rx="1"
              fill={color}
              fillOpacity="0.6"
            />
          </g>
        ))}
        <rect
          x={chip.x + 9}
          y={chip.y + 9}
          width="13"
          height="13"
          rx="2"
          fill="none"
          stroke={color}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <path
          d={`M${chip.x + 30} ${chip.y + 15} H${chip.x + chip.w - 12}`}
          stroke={color}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path
          d={`M${chip.x + 30} ${chip.y + 24} H${chip.x + chip.w - 26}`}
          stroke={color}
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* Watermark and caption. */}
        {mark && (
          <text
            x={W / 2}
            y={H / 2 + 7}
            textAnchor="middle"
            className="font-mono"
            fontSize="20"
            fontWeight="600"
            fill={color}
            fillOpacity="0.22"
            letterSpacing="2"
          >
            {mark}
          </text>
        )}
        {caption && (
          <text
            x="10"
            y={H - 9}
            className="font-mono"
            fontSize="7.5"
            letterSpacing="1.4"
            fill="rgb(var(--ink-dim))"
          >
            {caption}
          </text>
        )}
      </svg>

      {/* Vignette so the preview sits behind the card content. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/85 via-transparent to-transparent" />
    </div>
  );
}