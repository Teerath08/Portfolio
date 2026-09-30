"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, Euler, Matrix4, Quaternion, Vector3 } from "three";
import type {
  AmbientLight,
  DirectionalLight,
  Fog,
  Group,
  InstancedMesh,
  MeshLambertMaterial,
  PerspectiveCamera,
} from "three";

import { useTheme } from "@/lib/hooks";

/**
 * The world behind the page — and the only part of the site that reacts to you.
 *
 * The page does not scroll *past* a background, it travels *into* one. This
 * canvas is a volume of low-poly solids, four different solids, spread through
 * three dimensions and wrapping around the camera forever. Scrolling drives the
 * camera down Z and you pass *between* the objects rather than looking at a
 * picture of them.
 *
 * What makes it dynamic is that nothing here runs on a clock alone. Four inputs
 * drive it and they are deliberately given different amounts of authority:
 *
 *   - **The cursor** turns your head. The camera leans toward the pointer and
 *     rotates to look past it, and the whole volume tips with it, so moving the
 *     mouse feels like leaning around something large rather than like dragging a
 *     slider. Damped at 3.2/s, which is the difference between a world with mass
 *     and a world snapping to the mouse.
 *
 *   - **Scroll distance** moves the camera and orbits the volume.
 *
 *   - **Scroll velocity** pushes everything else at once — the camera jumps
 *     forward, the fog reaches further so you can suddenly see further, the key
 *     light lifts, and each solid stretches along the travel axis. Stretched
 *     solids rather than blurred ones, because a blur would cost a render pass
 *     and stretching is free in a matrix that is already being written. It is the
 *     only cue that makes a fast flick feel faster than a slow one; dolly alone
 *     reads as distance, not as speed.
 *
 *   - **The theme** sets the key light, the ambient level, the opacity and the
 *     fog colour, all lerped so switching themes is a transition rather than a
 *     jump.
 *
 * It is lit, which is worth defending. The void that used to live here was unlit
 * on purpose, because a void has no surface. Floating solids have surfaces, and
 * an unlit solid is a flat silhouette however many faces it has — so this uses
 * Lambert with flat shading and two lights, which costs one dot product per
 * vertex and is the cheapest way to get facets to read as facets. Faceting is the
 * entire reason for choosing low-poly geometry at all.
 *
 * Cost, which is the constraint everything else answers to: four `InstancedMesh`
 * objects, so four draw calls for the entire world; two lights; device pixel
 * ratio 1; and 1,450 instances sharing four geometry buffers. Every instance
 * matrix is rewritten per frame — 1,450 of them, about 93 KB of buffer — which is
 * the one genuinely per-frame cost, and is why the count stops where it does.
 * Nothing else allocates in the loop: the scratch vectors, the matrices and the
 * eased values are all module-level or refs.
 *
 * The objects wrap rather than being re-seeded. One whose depth passes the near
 * plane is handed back to the far end, so the volume is endless with no seam and
 * no allocation: the field arrays are laid out once and thereafter only read.
 */

/** Depth of the world. Everything wraps within this, so the field never ends. */
const FIELD = 130;
/** How far the page's full scroll drives the camera down Z. */
const DEPTH = 340;
/** Drift at rest, so the world is alive on a page nobody is scrolling. */
const DRIFT = 3.2;

/**
 * Fog. The far value is what hides the wrap — you never see the far plane — and it
 * is also what sets the visible width of the world, because at 54 units the
 * frustum is about 86 units across. Which is why `WIDE` is 40 rather than
 * something smaller: a narrow field inside a wide frustum reads as a sparse column
 * in the middle of the frame with dead space either side.
 */
const FOG_NEAR = 6;
const FOG_FAR = 54;
/** How much further the fog reaches at full scroll speed. */
const FOG_RUSH = 40;
const WIDE = 40;
const TALL = 22;

/** How far the camera leans toward the pointer, and how hard it turns to look. */
const LEAN_X = 2.6;
const LEAN_Y = 1.6;
const GLANCE_X = 0.075;
const GLANCE_Y = 0.05;
/** How far the volume itself tips toward the pointer. */
const TIP_Y = 0.11;
const TIP_X = 0.075;

/** Solids stretch along the travel axis by up to this much at full speed. */
const STREAK = 2.6;

/**
 * The solids.
 *
 * Four geometries rather than one, because a field of identical shapes reads as
 * noise and a field of varied shapes reads as a place. The ring is the odd one out
 * and earns its cost twice over: a hole in the middle of the frame gives the eye
 * something to look *through*, which is most of what makes depth legible, and a
 * non-uniform scale turns it into an ellipse and then a circle as it turns.
 *
 * `flat` marks which get flat shading. Faceting helps the convex solids and hurts
 * the ring and the box, where a visible facet edge just looks like a low-poly
 * artefact rather than a deliberate plane.
 */
const KINDS = [
  { count: 480, size: 0.5, flat: true },
  { count: 380, size: 0.62, flat: true },
  { count: 330, size: 0.8, flat: false },
  { count: 260, size: 0.75, flat: false },
] as const;

/** Copper inside the world, so it is made of the same stuff as the hero board. */
const COPPER = new Color("#c2703a");
const CYAN = new Color("#3fd8ef");
const VIOLET = new Color("#8b7fe8");

/** Scratch objects. The frame loop must not allocate. */
const MATRIX = new Matrix4();
const POSITION = new Vector3();
const ROTATION = new Euler();
const QUATERNION = new Quaternion();
const SCALE = new Vector3();
const WRITE = new Color();

/**
 * Per-theme treatment.
 *
 * The fog colour is not in here: it is read from the page's own `--canvas` so the
 * world dissolves into the background rather than into a grey, and so it follows
 * the theme without a second copy of the palette to keep in sync.
 */
const TREATMENT: Record<string, { opacity: number; key: number; fill: number }> = {
  dark: { opacity: 0.6, key: 1.3, fill: 0.45 },
  light: { opacity: 0.38, key: 0.85, fill: 0.95 },
};

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

/** Frame-rate independent damping, expressed in seconds. */
const damp = (delta: number, rate: number) => 1 - Math.exp(-Math.min(delta, 0.1) * rate);

/**
 * A deterministic hash, used as a random number.
 *
 * Not `Math.random`, because the world has to be the same world on every mount. A
 * field that reshuffles when the theme changes or the tab regains focus reads as a
 * bug rather than as motion, and it makes the layout impossible to reason about.
 * This is not a good hash statistically and does not need to be: it needs to be
 * stable, and scattered enough to look random.
 */
const noise = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Reads an `R G B` custom property off the document.
 *
 * The tokens are declared as space-separated channels so CSS can write
 * `rgb(var(--accent) / 0.5)`, which means three needs the numbers split back out.
 * Reading them instead of duplicating the hexes is the point: the world then
 * follows the theme automatically, including any future edit to `globals.css`.
 */
function readToken(name: string, fallback: string): Color {
  if (typeof window === "undefined") return new Color(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) {
    return new Color(fallback);
  }
  return new Color(parts[0] / 255, parts[1] / 255, parts[2] / 255);
}

function World() {
  const root = useRef<Group>(null);
  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const skins = useRef<(MeshLambertMaterial | null)[]>([]);
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<AmbientLight>(null);
  const lens = useRef<PerspectiveCamera>(null);
  const fog = useRef<Fog>(null);
  const theme = useTheme();

  const range = useRef(1);
  /**
   * Theme colours, read once per theme change and then only ever lerped toward.
   *
   * These were originally read from the document inside the frame loop, which
   * looked harmless and was not: `getComputedStyle().getPropertyValue()` forces
   * style resolution for the whole document, and doing that twice a frame on a
   * page that also runs scroll-driven animations is exactly the kind of cost
   * that shows up as jank on the machines least able to absorb it. The reason for
   * reading the token rather than hardcoding the hex — the world follows any
   * future edit to `globals.css` — survives caching, because the cache is
   * invalidated on the one thing that can change the token.
   */
  const keyTarget = useRef(new Color("#22d3ee"));
  const hazeTarget = useRef(new Color("#05080b"));
  // `seen`/`punch` are the scroll's own easing; `x`/`y` are the pointer's, damped
  // separately because they want a different time constant — the pointer needs to
  // lag noticeably, the scroll needs to glide.
  const eased = useRef({ progress: 0, lastY: 0, punch: 0, x: 0, y: 0 });

  /**
   * The world, built once.
   *
   * Position, size, starting orientation, spin rate and colour are all laid out
   * here and never again. The frame loop only moves each solid along Z, turns it,
   * and stretches it — which is the difference between rewriting 1,450 matrices a
   * frame and regenerating geometry every frame.
   *
   * Geometry is authored at unit size and scaled by the instance matrix, so
   * `size` is the object's real size in world units exactly once.
   */
  const field = useMemo(
    () =>
      KINDS.map((kind, index) => {
        const size = new Float32Array(kind.count * 3);
        const place = new Float32Array(kind.count * 3);
        const turn = new Float32Array(kind.count * 3);
        const spin = new Float32Array(kind.count * 3);
        const tint = new Float32Array(kind.count * 3);
        const work = new Color();

        for (let i = 0; i < kind.count; i += 1) {
          // Each kind is offset into its own quarter of the depth, so the four
          // populations interleave through the volume instead of sitting in four
          // separate sheets a reader could learn.
          const seed = index * 4096 + i;

          place[i * 3] = (noise(seed + 11) * 2 - 1) * WIDE;
          place[i * 3 + 1] = (noise(seed + 23) * 2 - 1) * TALL;
          place[i * 3 + 2] =
            -FIELD + index * (FIELD / 4) + noise(seed + 29) * (FIELD / 4);

          // Non-uniform, so a box is not a cube and a ring is not a washer. The
          // floor of 0.45 keeps the extremes from producing slivers.
          size[i * 3] = kind.size * (0.5 + noise(seed + 31));
          size[i * 3 + 1] = kind.size * (0.45 + noise(seed + 37) * 1.3);
          size[i * 3 + 2] = kind.size * (0.5 + noise(seed + 41) * 0.9);

          turn[i * 3] = noise(seed + 53) * Math.PI * 2;
          turn[i * 3 + 1] = noise(seed + 59) * Math.PI * 2;
          turn[i * 3 + 2] = noise(seed + 61) * Math.PI * 2;

          spin[i * 3] = (noise(seed + 71) * 2 - 1) * 0.24;
          spin[i * 3 + 1] = (noise(seed + 73) * 2 - 1) * 0.24;
          spin[i * 3 + 2] = (noise(seed + 79) * 2 - 1) * 0.24;

          // Roughly two-thirds accent, a quarter copper, the rest violet. The
          // violet is there so the world does not fade to a single hue as fog eats
          // it, and it is only ever visible on a handful of solids.
          const pick = noise(seed + 83);
          work.copy(pick < 0.24 ? COPPER : pick < 0.9 ? CYAN : VIOLET);
          tint[i * 3] = work.r;
          tint[i * 3 + 1] = work.g;
          tint[i * 3 + 2] = work.b;
        }
        return { size, place, turn, spin, tint };
      }),
    [],
  );

  /**
   * Routed through a ref so the writes are visibly not render state: `field`
   * itself is never reassigned, and the React Compiler's immutability rule is right
   * that a memoised value should not change under it, just wrong about what these
   * arrays are for.
   */
  const fieldRef = useRef(field);

  // Refresh the cached theme colours when the theme changes — and only then. The
  // effect writes the *target* and never the live colour: assigning the light
  // directly here would make a theme switch a cut, whereas lerping toward the new
  // target over the next few frames is what makes it read as the room changing
  // rather than a stylesheet being swapped.
  useEffect(() => {
    keyTarget.current.copy(readToken("--accent", "#22d3ee"));
    hazeTarget.current.copy(readToken("--canvas", "#05080b"));
  }, [theme]);

  // Instance colours are set once, after mount, and never again. Doing this in the
  // frame loop would upload 17 KB of colour per frame for no reason.
  useEffect(() => {
    field.forEach((kind, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;
      const total = kind.tint.length / 3;
      for (let i = 0; i < total; i += 1) {
        WRITE.setRGB(kind.tint[i * 3], kind.tint[i * 3 + 1], kind.tint[i * 3 + 2]);
        mesh.setColorAt(i, WRITE);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [field]);

  // The scrollable distance changes when the viewport resizes and when the
  // document grows — a late webfont, a chatbot reply, an expanded card — so it is
  // measured on both rather than once on mount.
  useEffect(() => {
    const measure = () => {
      range.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  useFrame((state, delta) => {
    const view = lens.current;
    const volume = root.current;
    if (!view || !volume) return;
    const e = eased.current;
    const k = damp(delta, 5);
    const treatment = TREATMENT[theme] ?? TREATMENT.dark;

    // ── Theme ─────────────────────────────────────────────────────────────
    // The directional light's colour is the theme accent, which is what ties the
    // world to the palette without painting any object a flat accent colour.
    const spot = key.current;
    if (spot) {
      spot.color.lerp(keyTarget.current, k);
      // Lifted by scroll speed as well as theme, which is why the target is
      // recomputed here rather than read from the table directly.
      const wanted = treatment.key * (1 + e.punch * 0.55);
      spot.intensity += (wanted - spot.intensity) * k;
    }
    if (fill.current) {
      fill.current.intensity += (treatment.fill - fill.current.intensity) * k;
    }
    for (const skin of skins.current) {
      if (skin) skin.opacity += (treatment.opacity - skin.opacity) * k;
    }
    const haze = fog.current;
    if (haze) {
      haze.color.lerp(hazeTarget.current, k);
      // Absolute assignment, not an accumulation: the reach is a pure function of
      // how fast the page is currently moving, and an accumulating `far += ...`
      // would drift and then need a matching decay term to stop drifting.
      haze.near = FOG_NEAR;
      haze.far = FOG_FAR + e.punch * FOG_RUSH;
    }

    // ── Scroll ────────────────────────────────────────────────────────────
    // 0 to 1 across the whole document, eased so a flick of the wheel glides
    // rather than snaps.
    const top = typeof window === "undefined" ? 0 : window.scrollY;
    const progress = clamp(top / range.current, 0, 1);
    e.progress += (progress - e.progress) * damp(delta, 6);

    // ── Velocity ──────────────────────────────────────────────────────────
    // Absolute pixels moved since the last frame, damped. A flick downward must
    // punch forward exactly as a flick upward does, hence the absolute value, and
    // the damping stops a single dropped frame from reading as a lurch.
    const moved = Math.abs(top - e.lastY);
    e.lastY = top;
    const speed = clamp(moved * 0.06, 0, 1);
    e.punch += (speed - e.punch) * damp(delta, 5);

    // ── Pointer ───────────────────────────────────────────────────────────
    // R3F normalises the pointer to −1…1 on both axes and keeps it current without
    // this component subscribing to anything. Damped well below the scroll's rate
    // on purpose: the world is meant to have mass, and a lean that tracked the
    // mouse exactly would feel like a cursor dragging a plane rather than like
    // turning your head inside something large.
    e.x += (state.pointer.x - e.x) * damp(delta, 3.2);
    e.y += (state.pointer.y - e.y) * damp(delta, 3.2);

    // ── The flight ────────────────────────────────────────────────────────
    const elapsed = state.clock.elapsedTime;
    // Wrapped into the field, so this stays small forever and the arithmetic below
    // never grows a precision problem over a long visit.
    const travel = (e.progress * DEPTH + elapsed * DRIFT) % FIELD;
    // A fast scroll adds a burst of travel on top. Capped, because a trackpad throw
    // produces a velocity far beyond a deliberate scroll and without a cap the
    // world tears past at a speed that reads as a glitch.
    const rush = e.punch * 30;

    // Lean *and* turn: the translation is what actually moves you, and the small
    // rotation is what makes it read as looking rather than sliding. A rotation
    // large enough to matter on its own would swing the far end of the field out
    // of frame, so it stays under four degrees.
    view.position.set(
      e.x * LEAN_X + Math.sin(elapsed * 0.05) * 1.2,
      e.y * LEAN_Y + Math.cos(elapsed * 0.037) * 0.8,
      0,
    );
    view.rotation.set(-e.y * GLANCE_Y, -e.x * GLANCE_X, 0);

    // The volume tips toward the pointer as well as the camera. Doing both is
    // redundant in the strict sense and worth it in the felt one: the camera moves
    // you past the field, the tilt moves the field around you, and a viewer reads
    // that pair as depth rather than as one offset sprite.
    volume.rotation.set(
      Math.sin(elapsed * 0.021) * 0.06 - e.y * TIP_X,
      elapsed * 0.028 + e.progress * 0.6 + e.x * TIP_Y,
      Math.cos(elapsed * 0.017) * 0.035,
    );

    // ── The solids ────────────────────────────────────────────────────────
    // Stretched along the local Z axis, which is the travel axis. A solid that
    // grows reads as approaching; a solid that lengthens reads as going past.
    const streak = 1 + e.punch * (STREAK - 1);

    for (let g = 0; g < fieldRef.current.length; g += 1) {
      const mesh = meshes.current[g];
      if (!mesh) continue;
      const { size, place, turn, spin } = fieldRef.current[g];

      for (let i = 0; i < mesh.count; i += 1) {
        // Depth relative to the camera. Once it passes the near plane — which is
        // *behind* the camera, because the camera looks down -Z — the solid is
        // handed back to the far end. This wrap is what makes the world endless.
        let depth = place[i * 3 + 2] + travel + rush;
        if (depth > 6) depth -= FIELD;

        ROTATION.set(
          turn[i * 3] + elapsed * spin[i * 3],
          turn[i * 3 + 1] + elapsed * spin[i * 3 + 1],
          turn[i * 3 + 2] + elapsed * spin[i * 3 + 2],
        );
        QUATERNION.setFromEuler(ROTATION);
        POSITION.set(place[i * 3], place[i * 3 + 1], depth);
        SCALE.set(size[i * 3], size[i * 3 + 1], size[i * 3 + 2] * streak);
        MATRIX.compose(POSITION, QUATERNION, SCALE);
        mesh.setMatrixAt(i, MATRIX);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Real depth fog, so the far end of the world dissolves into the page
          rather than ending at a hard edge the reader would take for a wall. */}
      <fog ref={fog} attach="fog" args={["#05080b", FOG_NEAR, FOG_FAR]} />

      {/* Two lights and no more. The ambient carries the faces turned away from the
          key light, so a solid never goes fully black against a near-black page. */}
      <ambientLight ref={fill} intensity={0.45} color="#9fb6c4" />
      <directionalLight ref={key} position={[9, 13, 8]} intensity={1.3} color="#22d3ee" />

      {/* Everything lives under one group, because the whole volume has to tip
          with the pointer — and there is no cheaper way to transform 1,450
          instances as one thing than to put them all under a single parent. */}
      <group ref={root}>
        {KINDS.map((kind, index) => (
          <instancedMesh
            key={index}
            ref={(node) => {
              meshes.current[index] = node;
            }}
            args={[undefined, undefined, kind.count]}
            frustumCulled={false}
          >
            {index === 0 && <tetrahedronGeometry args={[1, 0]} />}
            {index === 1 && <octahedronGeometry args={[1, 0]} />}
            {index === 2 && <boxGeometry args={[1, 1, 1]} />}
            {index === 3 && <torusGeometry args={[1, 0.3, 6, 16]} />}
            <meshLambertMaterial
              ref={(node) => {
                skins.current[index] = node;
              }}
              color="#ffffff"
              flatShading={kind.flat}
              transparent
              opacity={0.6}
            />
          </instancedMesh>
        ))}
      </group>
    </>
  );
}

interface ScrollFieldSceneProps {
  /** Pauses the frame loop while the tab is in the background. */
  active: boolean;
}

export default function ScrollFieldScene({ active }: ScrollFieldSceneProps) {
  return (
    <Canvas
      dpr={1}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 0], fov: 52, near: 0.1, far: 220 }}
      // No multisampling: these are low-poly silhouettes behind text, and at device
      // pixel ratio 1 it buys nothing.
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <World />
    </Canvas>
  );
}
