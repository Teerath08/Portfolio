"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, Matrix4, MeshStandardMaterial } from "three";
import type {
  AmbientLight,
  DirectionalLight,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  PointLight,
} from "three";

import { useTheme } from "@/lib/hooks";

/**
 * The hero's 3D object: a microcontroller development board.
 *
 * Built from primitives rather than a loaded model, which keeps it at roughly
 * a dozen draw calls with no textures, no environment map and no shadow maps.
 * Everything else on this page is CSS or SVG; this is the only place the
 * renderer runs, and it is skipped entirely on touch devices and for
 * reduced-motion visitors.
 */

const BOARD = { width: 3.3, thickness: 0.12, depth: 2.05 };

/** A surface the palette can recolour. */
interface Surface {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}

type LightSpec = Surface & { intensity: number };

/**
 * How the board is painted in each theme.
 *
 * The renderer cannot read the CSS custom properties, and a canvas is opaque to
 * the page background, so a board that ignores the theme is the one thing on
 * the screen that refuses to follow it. These mirror the tokens in
 * `globals.css`, with the reasoning behind the non-obvious ones:
 *
 *  - The board is a *physical object*, so it is not recoloured to match the page.
 *    But the first attempt at that went too far the other way and gave every
 *    dark theme a dark teal board, which put it within a couple of values of its
 *    own canvas: `#0a1f24` on `rgb(5 8 11)` and `#0b1526` on `rgb(4 7 14)`. The
 *    object was technically correct and visually absent. So the substrate now
 *    takes the *opposite* value to whatever it is sitting on — light on the dark
 *    themes, dark on the light one. Contrast is relative, and no single fixed
 *    board colour survives all three.
 *
 *  - What does not change is the hardware. Copper traces, gold pads, amber
 *    indicators, black component bodies and silver connectors are the same on
 *    every theme, and they are what makes the board recognisable as a board
 *    rather than as a coloured rectangle. Warm metal against the page's cool
 *    charcoal-and-cyan is the separation that does the work: temperature, not
 *    brightness, so it holds up on a light background too.
 *
 *  - The traces used to be the page's own cyan, which put the circuitry in the
 *    same hue family as the accent and dissolved the detail. Copper is also
 *    what is actually under the solder mask.
 *
 *  - The rim light keeps each theme's accent. Cyan against a warm object is a
 *    deliberate edge rather than a wash, so the board still belongs to the page
 *    without being painted in it.
 *
 *  - Unlit LEDs are dark grey on a light substrate and light grey on a dark one.
 *    Carrying either across would put dots that read as holes.
 *
 *  - The contact shadow drops on a light background. Black at the dark theme's
 *    opacity reads as grime on white.
 */
interface BoardPalette {
  surfaces: Record<string, Surface>;
  lights: {
    ambient: LightSpec;
    key: LightSpec;
    rim: LightSpec;
    accent: LightSpec;
  };
  shadowOpacity: number;
}

const PALETTES: Record<string, BoardPalette> = {
  dark: {
    surfaces: {
      // Light silver-slate substrate. The single biggest reason the board reads
      // as an object here: it is the opposite value to the canvas.
      board: { color: "#a8b2b8" },
      solderMask: { color: "#bcc5ca" },
      // Component bodies stay near-black either way. That is true of real
      // boards, and it is the only reason the parts read on a light substrate.
      chip: { color: "#0b0f14" },
      chipTop: { color: "#1d242c" },
      metal: { color: "#8d99a5" },
      gold: { color: "#d9a441" },
      trace: { color: "#b5713f", emissive: "#4a2415", emissiveIntensity: 0.8 },
      ledOn: { color: "#7a4a12", emissive: "#ffb347", emissiveIntensity: 2 },
      ledOff: { color: "#2b333a" },
      pulse: { color: "#ffd08a", emissive: "#ffb347", emissiveIntensity: 2.8 },
    },
    lights: {
      ambient: { color: "#8fa6bd", intensity: 0.5 },
      key: { color: "#ffffff", intensity: 1.15 },
      rim: { color: "#22d3ee", intensity: 0.7 },
      accent: { color: "#ffb347", intensity: 1.8 },
    },
    shadowOpacity: 0.4,
  },

  light: {
    surfaces: {
      // Inverted: off-white page, so the board goes deep. Warm-neutral rather
      // than navy, which would put it back in the theme's own blue family.
      board: { color: "#26313a" },
      solderMask: { color: "#323f49" },
      chip: { color: "#0a0e12" },
      chipTop: { color: "#1a2229" },
      metal: { color: "#9fadba" },
      gold: { color: "#c9962f" },
      // The glow is dialled well back: a strong emissive on a light page reads
      // as a halo rather than as an indicator.
      trace: { color: "#a8642f", emissive: "#3d1d10", emissiveIntensity: 0.5 },
      ledOn: { color: "#6b3f10", emissive: "#f59e0b", emissiveIntensity: 1.4 },
      ledOff: { color: "#8e9aa4" },
      pulse: { color: "#fcd34d", emissive: "#f59e0b", emissiveIntensity: 1.7 },
    },
    lights: {
      ambient: { color: "#e8eef3", intensity: 0.8 },
      key: { color: "#ffffff", intensity: 1.25 },
      rim: { color: "#0891b2", intensity: 0.5 },
      accent: { color: "#ffb347", intensity: 1.5 },
    },
    shadowOpacity: 0.18,
  },
};

/** Scratch colour, so the per-frame tween allocates nothing. */
const SCRATCH = new Color();

/**
 * Rate at which the board crossfades between themes.
 *
 * Long enough to read as the object being re-lit rather than as a glitch, short
 * enough that it is finished before anyone can click the toggle again. Damped in
 * seconds, so it takes the same time at 60 Hz and at 144 Hz.
 */
const themeLerp = (delta: number) => 1 - Math.exp(-Math.min(delta, 0.05) * 7);

interface Materials {
  board: MeshStandardMaterial;
  solderMask: MeshStandardMaterial;
  chip: MeshStandardMaterial;
  chipTop: MeshStandardMaterial;
  metal: MeshStandardMaterial;
  gold: MeshStandardMaterial;
  trace: MeshStandardMaterial;
  ledOn: MeshStandardMaterial;
  ledOff: MeshStandardMaterial;
  pulse: MeshStandardMaterial;
}

type MaterialKey = keyof Materials;

/**
 * PBR response, which is a property of the *material* and not of the theme.
 *
 * Roughness and metalness stay fixed across themes on purpose: a solder mask is
 * matte FR-4 whether the page behind it is black or white. Only the colours
 * below move, which is also why a theme change does not have to rebuild
 * anything.
 */
const FINISH: Record<MaterialKey, { roughness: number; metalness: number }> = {
  // Matte FR-4, almost no specular response, so it reads as board and not as
  // moulded plastic.
  board: { roughness: 0.82, metalness: 0.12 },
  // Copper pours, slightly more reflective than the mask they sit in.
  solderMask: { roughness: 0.7, metalness: 0.25 },
  chip: { roughness: 0.52, metalness: 0.38 },
  chipTop: { roughness: 0.34, metalness: 0.62 },
  metal: { roughness: 0.28, metalness: 0.92 },
  gold: { roughness: 0.34, metalness: 0.85 },
  trace: { roughness: 0.4, metalness: 0.7 },
  ledOn: { roughness: 0.25, metalness: 0.1 },
  ledOff: { roughness: 0.4, metalness: 0.1 },
  pulse: { roughness: 0.25, metalness: 0.1 },
};

const MATERIAL_KEYS = Object.keys(FINISH) as MaterialKey[];

/**
 * The palette for a theme id.
 *
 * Not a hook, and deliberately so: `PALETTES` is a module constant, so this
 * returns a stable reference and needs no memo. `Lighting` needs the palette but
 * not the materials, and calling `useMaterials` from it would build a second,
 * entirely unused set of ten materials per mount.
 *
 * An unknown id falls back to the default rather than leaving the board
 * uncoloured, so a renamed theme degrades instead of breaking.
 */
function paletteFor(theme: string): BoardPalette {
  return PALETTES[theme] ?? PALETTES.dark;
}

/**
 * One set of materials, created once, recoloured in place on a theme change.
 *
 * Rebuilding them instead would mean the meshes have to be re-pointed and the
 * old set disposed on every switch, and a hard cut looks like a glitch. Here
 * the instances are stable for the life of the canvas and `useFrame` eases the
 * colours towards whatever the palette says, so switching themes reads as the
 * object being re-lit.
 *
 * The set is also seeded into a ref inside `Board`, because the frame loop has
 * to write to these objects every frame. A three.js material is a mutable GPU
 * resource rather than render output, and routing the per-frame writes through
 * a ref says so — it keeps the React Compiler from reading a `useFrame`
 * callback as a render-phase mutation of something it might depend on.
 */
function useMaterials(theme: string): { materials: Materials; palette: BoardPalette } {
  const palette = paletteFor(theme);

  const materials = useMemo<Materials>(() => {
    const build = (key: MaterialKey) => {
      const surface = PALETTES.dark.surfaces[key];
      const material = new MeshStandardMaterial({
        color: surface.color,
        roughness: FINISH[key].roughness,
        metalness: FINISH[key].metalness,
      });
      if (surface.emissive) material.emissive.set(surface.emissive);
      if (surface.emissiveIntensity !== undefined) {
        material.emissiveIntensity = surface.emissiveIntensity;
      }
      return material;
    };

    // Every material starts on the dark palette, then crossfades to the active
    // one over the first frames. That way a visitor who lands on "Blueprint"
    // sees the board arrive rather than snap, and it costs nothing.
    return Object.fromEntries(
      MATERIAL_KEYS.map((key) => [key, build(key)]),
    ) as unknown as Materials;
  }, []);

  // Disposed when the canvas goes away, so cycling themes a hundred times never
  // grows the material count.
  useEffect(
    () => () => {
      for (const key of MATERIAL_KEYS) materials[key].dispose();
    },
    [materials],
  );

  return { materials, palette };
}

/** Header pins, drawn as one instanced mesh rather than twenty meshes. */
function HeaderPins({ material }: { material: MeshStandardMaterial }) {
  const transforms = useMemo(() => {
    const items: { position: [number, number, number] }[] = [];
    const count = 10;
    for (let row = 0; row < 2; row += 1) {
      for (let i = 0; i < count; i += 1) {
        items.push({
          position: [
            -1.28 + i * 0.285,
            BOARD.thickness / 2 + 0.11,
            -0.68 + row * 0.28,
          ],
        });
      }
    }
    return items;
  }, []);

  const matrix = useMemo(() => new Matrix4(), []);

  // Matrices have to be written imperatively — instanced geometry cannot be
  // described declaratively per instance. `onUpdate` fires on mount and whenever
  // the node is replaced, which is exactly once for a static pin grid.
  const onUpdate = (self: InstancedMesh | null) => {
    if (!self) return;
    transforms.forEach((item, index) => {
      matrix.makeTranslation(item.position[0], item.position[1], item.position[2]);
      self.setMatrixAt(index, matrix);
    });
    self.instanceMatrix.needsUpdate = true;
  };

  return (
    <instancedMesh
      args={[undefined, undefined, transforms.length]}
      material={material}
      onUpdate={(node) => onUpdate(node as unknown as InstancedMesh | null)}
    >
      <boxGeometry args={[0.05, 0.24, 0.05]} />
    </instancedMesh>
  );
}

/** Copper traces routed across the top surface. */
function Traces({ material }: { material: MeshStandardMaterial }) {
  const runs = useMemo(
    () => [
      { size: [1.1, 0.004, 0.028] as const, position: [-0.62, 0.062, 0.44] as const },
      { size: [1.1, 0.004, 0.028] as const, position: [-0.62, 0.062, -0.52] as const },
      { size: [0.86, 0.004, 0.028] as const, position: [0.58, 0.062, 0.6] as const },
      { size: [0.86, 0.004, 0.028] as const, position: [0.58, 0.062, -0.6] as const },
      { size: [0.026, 0.004, 0.9] as const, position: [-1.32, 0.062, -0.1] as const },
      { size: [0.026, 0.004, 0.9] as const, position: [1.32, 0.062, 0.1] as const },
      { size: [0.026, 0.004, 0.66] as const, position: [-0.15, 0.062, 0.72] as const },
      { size: [0.026, 0.004, 0.66] as const, position: [0.95, 0.062, -0.72] as const },
    ],
    [],
  );

  return (
    <group>
      {runs.map((run, index) => (
        <mesh
          key={index}
          material={material}
          position={[run.position[0], run.position[1], run.position[2]]}
        >
          <boxGeometry args={[run.size[0], run.size[1], run.size[2]]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A pulse of "signal" running a racetrack around the board.
 *
 * One moving object is enough to imply that the board is live; a particle
 * system would cost far more and read as decoration rather than signal.
 */
function SignalPulse({ material }: { material: MeshStandardMaterial }) {
  const ref = useRef<Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.32) % 1;
    const node = ref.current;
    if (!node) return;

    // Racetrack: alternate between two straight runs, joined instantly.
    const p = t.current * 2;
    const phase = p % 2;
    const u = phase < 1 ? phase : 2 - phase;
    const x = -1.32 + u * 2.64;
    const z = phase < 1 ? -0.86 : 0.86;
    node.position.set(x, BOARD.thickness / 2 + 0.05, z);
  });

  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[0.045, 12, 12]} />
    </mesh>
  );
}

/**
 * How far the board travels as the hero scrolls out, in world units.
 *
 * The board does not spin off on its own when you start reading: it recedes,
 * tips over towards a top-down view and lifts away along a designed path, while
 * the pointer lean and the slow idle turn keep it alive underneath. The
 * movement is entirely transform-only — position, rotation, scale — so it costs
 * the same on a phone as at rest, and the vertex and material data is never
 * touched after mount.
 */
const SCROLL = {
  /** Lateral drift, right and away from the copy. */
  x: 0.95,
  /** Lift. Large enough to leave the frame before the next section arrives. */
  y: 2.5,
  /** Recession, which is what actually sells the depth. */
  z: -1.3,
  /** Tip towards the reader's eye, then past it. */
  tilt: 0.8,
  /** Extra turn on top of the idle spin. */
  spin: 1.15,
  /** Slight roll, so the exit is not a straight vertical lift. */
  roll: -0.2,
  /** Shrink on the way out. */
  scale: 0.3,
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * Frame-rate independent damping.
 *
 * A plain `+= (target - current) * 0.1` is per-frame, so the same code glides on
 * a 60 Hz panel and snaps on a 144 Hz one. Expressing the rate in seconds and
 * converting it to a per-frame factor makes the motion identical on both.
 */
const damp = (delta: number, rate: number) => 1 - Math.exp(-Math.min(delta, 0.05) * rate);

/**
 * The whole assembly.
 *
 * Three inputs are summed here and written as absolute values, never
 * accumulated: the idle turn, the pointer lean and the scroll path. Anything
 * added to a rotation each frame compounds, and after a few seconds of scrolling
 * the board is tumbling out of the scene.
 */
function Board({ theme }: { theme: string }) {
  const group = useRef<Group>(null);
  const { materials: m, palette } = useMaterials(theme);

  // The frame loop writes to the materials every frame, so it reads them through
  // a ref rather than off the render-scope value. Seeded from the memo and never
  // reassigned, so it always points at the same ten instances the meshes use.
  const materialRef = useRef(m);

  // Everything that is smoothed lives in a ref. Scroll position is read from
  // `window` inside the frame loop rather than being pushed down from a scroll
  // listener, so there is exactly one source of truth and no listener at all:
  // scrolling causes zero React renders, zero layout reads outside the loop, and
  // therefore no thrash.
  const eased = useRef({ leanX: 0, leanZ: 0, scroll: 0, spin: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const e = eased.current;
    const k = themeLerp(delta);

    // ── Theme ─────────────────────────────────────────────────────────────
    // Ten `Color.lerp` calls and ten scalar nudges. This is the only per-frame
    // work the theme costs, it allocates nothing (`SCRATCH` is reused), and it
    // is why the materials never have to be rebuilt.
    for (const key of MATERIAL_KEYS) {
      const material = materialRef.current[key];
      const target = palette.surfaces[key];
      material.color.lerp(SCRATCH.set(target.color), k);
      if (target.emissive) material.emissive.lerp(SCRATCH.set(target.emissive), k);
      if (target.emissiveIntensity !== undefined) {
        material.emissiveIntensity +=
          (target.emissiveIntensity - material.emissiveIntensity) * k;
      }
    }

    // ── Scroll ────────────────────────────────────────────────────────────
    // 0 at the top of the page, 1 once the hero has scrolled past. The hero is
    // one viewport tall, so scrollY over the viewport height is the natural
    // progress. Clamped: overscroll on macOS must not throw the board away.
    const viewport = window.innerHeight || 1;
    e.scroll += (clamp01(window.scrollY / viewport) - e.scroll) * damp(delta, 5.5);
    const p = e.scroll;

    // ── Idle ──────────────────────────────────────────────────────────────
    e.spin += delta * 0.22;

    // ── Pointer lean ──────────────────────────────────────────────────────
    e.leanX += (state.pointer.y * 0.22 - e.leanX) * damp(delta, 8);
    e.leanZ += (-state.pointer.x * 0.28 - e.leanZ) * damp(delta, 8);

    // A slow vertical breathe, so the object never looks frozen when idle.
    const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.045;

    g.rotation.set(e.leanX + p * SCROLL.tilt, e.spin + p * SCROLL.spin, e.leanZ + p * SCROLL.roll);
    g.position.set(p * SCROLL.x, breathe + p * SCROLL.y, p * SCROLL.z);
    g.scale.setScalar(1 - p * SCROLL.scale);
  });

  const half = BOARD.thickness / 2;

  return (
    <group ref={group}>
      {/* Substrate */}
      <mesh material={m.board}>
        <boxGeometry args={[BOARD.width, BOARD.thickness, BOARD.depth]} />
      </mesh>

      {/* Copper pour on the underside edge, catching a highlight */}
      <mesh material={m.solderMask} position={[0, -half + 0.012, 0]}>
        <boxGeometry args={[BOARD.width - 0.14, 0.012, BOARD.depth - 0.14]} />
      </mesh>

      {/* Module can with its keep-out antenna */}
      <mesh material={m.chip} position={[-0.05, half + 0.045, 0]}>
        <boxGeometry args={[0.92, 0.09, 0.6]} />
      </mesh>
      <mesh material={m.chipTop} position={[-0.05, half + 0.093, 0]}>
        <boxGeometry args={[0.72, 0.008, 0.44]} />
      </mesh>

      {/* Antenna: a folded PCB trace, the giveaway that this is a Wi-Fi module */}
      <group position={[-1.28, half + 0.006, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={m.gold} position={[0, 0, -0.22 + i * 0.18]}>
            <boxGeometry args={[0.3, 0.006, 0.03]} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh key={side} material={m.gold} position={[side * 0.15, 0, 0.05]}>
            <boxGeometry args={[0.03, 0.006, 0.22]} />
          </mesh>
        ))}
      </group>

      {/* USB connector */}
      <mesh material={m.metal} position={[1.52, half + 0.06, 0]}>
        <boxGeometry args={[0.28, 0.24, 0.46]} />
      </mesh>
      <mesh material={m.ledOff} position={[1.44, half + 0.12, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.3]} />
      </mesh>

      {/* Bulk capacitor */}
      <mesh material={m.ledOff} position={[0.98, half + 0.14, 0.62]}>
        <cylinderGeometry args={[0.15, 0.15, 0.28, 14]} />
      </mesh>

      {/* Crystal oscillator */}
      <mesh material={m.metal} position={[0.98, half + 0.06, -0.5]}>
        <boxGeometry args={[0.28, 0.12, 0.11]} />
      </mesh>

      {/* Status LEDs — one lit, one dark */}
      <mesh material={m.ledOn} position={[0.42, half + 0.07, 0.66]}>
        <sphereGeometry args={[0.06, 14, 12]} />
      </mesh>
      <mesh material={m.ledOff} position={[0.62, half + 0.06, 0.66]}>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>

      <Traces material={m.trace} />
      <HeaderPins material={m.gold} />
      <SignalPulse material={m.pulse} />
    </group>
  );
}

/**
 * Lighting: one ambient fill, two cheap directionals for shape, and a single
 * accent point light. No shadow maps — a fake contact shadow below the board
 * does the same job for a fraction of the cost.
 *
 * Lights are theme-aware for the same reason the materials are: the same cyan
 * that worked against a near-black page is wrong against white, where it needs
 * to be dimmer and where a black contact shadow at 0.35 reads as dirt. Colours
 * and intensities ease in step with the board.
 */
function Lighting({ theme }: { theme: string }) {
  const palette = paletteFor(theme);
  const ambient = useRef<AmbientLight>(null);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const accent = useRef<PointLight>(null);
  const shadow = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const k = themeLerp(delta);
    const lights = palette.lights;

    const ease = (light: AmbientLight | DirectionalLight | PointLight | null, spec: LightSpec) => {
      if (!light) return;
      light.color.lerp(SCRATCH.set(spec.color), k);
      light.intensity += (spec.intensity - light.intensity) * k;
    };

    ease(ambient.current, lights.ambient);
    ease(key.current, lights.key);
    ease(rim.current, lights.rim);
    ease(accent.current, lights.accent);

    const material = shadow.current?.material as MeshBasicMaterial | undefined;
    if (material) {
      material.opacity += (palette.shadowOpacity - material.opacity) * k;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.55} color="#9fd8e8" />
      <directionalLight ref={key} position={[4, 6, 4]} intensity={1.15} color="#ffffff" />
      <directionalLight ref={rim} position={[-5, 2, -4]} intensity={0.55} color="#22d3ee" />
      <pointLight
        ref={accent}
        position={[0, 1.4, 1.6]}
        intensity={2.2}
        distance={7}
        color="#22d3ee"
      />

      {/* Fake contact shadow. */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

interface HeroSceneProps {
  /** Pauses rendering when the hero is off screen or the tab is hidden. */
  active: boolean;
  className?: string;
}

export default function HeroScene({ active, className }: HeroSceneProps) {
  // The single source of truth is the `data-theme` attribute the boot script
  // already wrote, read through the same subscription the theme toggle uses. A
  // second copy of the theme in React state could disagree with the document,
  // and the whole point is that the board follows the page.
  const theme = useTheme();

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 1.35, 3.9], fov: 32, near: 0.1, far: 40 }}
        // Multisampling off, supersampling on instead. Running the framebuffer
        // above CSS resolution and skipping MSAA produces the same edge quality
        // for a fraction of the fill-rate cost, which is the difference between
        // a smooth scroll and a stuttering one on an integrated GPU.
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Lighting theme={theme} />
        <Board theme={theme} />
      </Canvas>
    </div>
  );
}
