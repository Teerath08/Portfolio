"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, Euler, ExtrudeGeometry, Matrix4, MeshStandardMaterial, Quaternion, Shape, Vector3 } from "three";
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

/**
 * The substrate.
 *
 * `thickness` is the number that decides whether this reads as a circuit board or
 * as a panel. At this width, 0.072 was 1.9 mm — thicker than any board sold, and
 * it looked it: the slab read as a solid object with parts resting on top rather
 * than as a laminate with components mounted to one face. 0.044 is 1.16 mm, which
 * is a real thin board and close to the 1.0 mm end of what is manufactured.
 *
 * The lower bound is the milled edge, not the proportion. The rest pitch is what
 * makes the laminate band visible, and that band is `thickness` tall in the frame:
 * 11 px at 700 px here, against 6 px at 0.032. Under about 6 px it stops reading
 * as a cut edge and reverts to a slab with a dark rim, which loses the one detail
 * that makes the board look milled. So this is as thin as it goes while still
 * being visibly a board.
 */
const BOARD = { width: 3.3, thickness: 0.044, depth: 2.05 };

/**
 * Compactness, front-to-back and side-to-side.
 *
 * Applied as a non-uniform scale on one group around the whole board rather than
 * by rewriting every coordinate below, so the parts, the traces and the header
 * stay in register with the substrate. One pair of numbers is all there is to
 * tune, and the layout cannot drift.
 *
 * Compressed slightly along Z as well as X: that reads as a "slim microcontroller
 * board" from the side (shorter, narrower, tidier) instead of a generic rectangle.
 */
const SQUEEZE_X = 0.74;
const SQUEEZE_Z = 0.82;

/**
 * Corner radius of the substrate.
 *
 * Filleted the way a real board is milled rather than die-cut, so the corners are
 * generous. A small radius reads as a chamfer on a rectangle; a large one reads
 * as a PCB, and it is the outline more than anything on the surface that a viewer
 * identifies a board from.
 */
const CORNER = 0.16;

/**
 * How far the board tips forward at rest.
 *
 * Not decoration. A board lying flat to the camera shows nothing but its top face,
 * and the top face is the least characteristic thing about a PCB — a plane of
 * green with parts on it. What says "board" is the edge: the laminate band, the
 * routed corner, the height of the parts standing proud of the surface. All of
 * that is on the silhouette, so the board has to be tipped far enough for the
 * silhouette to show.
 *
 * Kept small. Past about a third of a radian the top face starts to foreshorten
 * faster than the edge gains, and it stops reading as a board and starts reading
 * as a slab seen end-on.
 */
const REST_PITCH = 0.48;

/**
 * Copper pours, and the fake shadow.
 *
 * These are the only geometry that exists purely to make the board read as an
 * object rather than as a flat panel, and they earn their draw calls: without the
 * shadow the board looks pasted onto the page, and without a pour the copper is
 * only ever seen face-on, where a flat plane of any colour just reads as that
 * colour.
 *
 * Sunk almost flush with the deck rather than standing on it. A pour is copper
 * *under* the mask, so the honest placement is level with the surface and a hair
 * proud only to avoid z-fighting. Anything taller would sit on the board like a
 * sheet of foil laid on top of it, which is the opposite of the idea — and it
 * would also cross the silkscreen and the vias, both of which belong above it.
 * At this scale that band is under a pixel of height, so the pour reads as a
 * region of surface rather than as a plate, which is exactly what a pour is.
 */
/**
 * Copper pours, and the fake shadow.
 *
 * The pours are sunk almost flush with the deck rather than standing on it. A
 * pour is copper *under* the mask, so the honest placement is level with the
 * surface and a hair proud only to avoid z-fighting with it. Anything taller
 * would sit on the board like a sheet of foil laid on top, which is the opposite
 * of the idea — and it would bury the silkscreen, the vias and the hole pads,
 * all of which belong above it.
 *
 * The traces take the opposite treatment on purpose, and the contrast is the
 * point. A pour is an unbroken plane of copper; a trace is a routed, exposed
 * track. One reads as a region, the other as a line, and a board where both read
 * as the same thing has lost the distinction that makes it legible as a board.
 * So the pour goes under everything at deck level and the trace stands a
 * millimetre-scale step proud of it.
 */
const POUR = { width: 2.06, depth: 0.92, y: 0.001, thickness: 0.002 };
const POUR2 = { width: 0.96, depth: 0.48, x: -0.72, y: 0.001, thickness: 0.002 };
const SHADOW = { y: -0.62, radius: 1.16 };

/**
 * The laminate core, measured as a fraction of the slab.
 *
 * The solder mask is a coating, not a casing: on a real board it is tens of
 * microns over the glass cloth, so the edge is overwhelmingly laminate with a
 * hairline of mask at the top and bottom. Scaled to a sixth of the thickness, which
 * is thicker than reality but is the least that still reads as two materials
 * rather than one.
 *
 * As a fraction rather than a literal because the slab is now 1.16 mm and
 * shrinking further is the obvious next thing anyone will try. A fixed lip would
 * quietly become a thick casing at that thickness, and nothing would flag it.
 */
const CORE = { lip: BOARD.thickness / 6 };

/**
 * A rounded rectangle, as a `Shape`.
 *
 * Four arcs rather than four boxes and four cylinders, because a cylinder in the
 * corner leaves a visible seam where the two surfaces meet and the fillet reads as
 * a separate part stuck onto the edge. One extruded outline has no seam anywhere.
 *
 * The shape is authored in XY; the board lies in XZ and is laid down by the caller
 * with a rotate, which mirrors it front to back. A rounded rectangle is symmetric
 * under that mirror, so nothing is lost.
 */
function roundedRect(width: number, depth: number, radius: number) {
  const w = width / 2;
  const d = depth / 2;
  const shape = new Shape();
  shape.moveTo(-w + radius, -d);
  shape.lineTo(w - radius, -d);
  shape.absarc(w - radius, -d + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(w, d - radius);
  shape.absarc(w - radius, d - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-w + radius, d);
  shape.absarc(-w + radius, d - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -d + radius);
  shape.absarc(-w + radius, -d + radius, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}

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
      // The laminate core, seen only on the milled edge. Warmer and duller than
      // the mask, and rougher, because it is bare glass cloth rather than
      // pigmented epoxy. On a narrow board the edge is a big part of the read,
      // so this is not a surface that needs to match the top.
      core: { color: "#9a8b74" },
      // Component bodies stay near-black either way. That is true of real
      // boards, and it is the only reason the parts read on a light substrate.
      chip: { color: "#0b0f14" },
      chipTop: { color: "#1d242c" },
      // Moulded component bodies and header plastic. Distinct from `chip`, which
      // is the epoxy of the packages themselves and is near-black; these are the
      // grey of a nylon header and a tact switch.
      plastic: { color: "#242c33" },
      // Silkscreen ink, dark to sit on a light substrate. See `MCU_BORDER`.
      silk: { color: "#2c353d" },
      metal: { color: "#8d99a5" },
      gold: { color: "#d9a441" },
      trace: { color: "#b5713f", emissive: "#4a2415", emissiveIntensity: 0.8 },
      ledOn: { color: "#7a4a12", emissive: "#ffb347", emissiveIntensity: 2 },
      ledOff: { color: "#2b333a" },
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
      // Dark laminate. Warmer than the mask so the edge separates from the top
      // surface under the same key light.
      core: { color: "#3d3529" },
      chip: { color: "#0a0e12" },
      chipTop: { color: "#1a2229" },
      plastic: { color: "#171d22" },
      silk: { color: "#dbe3e9" },
      metal: { color: "#9fadba" },
      gold: { color: "#c9962f" },
      // The glow is dialled well back: a strong emissive on a light page reads
      // as a halo rather than as an indicator.
      trace: { color: "#a8642f", emissive: "#3d1d10", emissiveIntensity: 0.5 },
      ledOn: { color: "#6b3f10", emissive: "#f59e0b", emissiveIntensity: 1.4 },
      ledOff: { color: "#8e9aa4" },
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
  core: MeshStandardMaterial;
  chip: MeshStandardMaterial;
  chipTop: MeshStandardMaterial;
  plastic: MeshStandardMaterial;
  silk: MeshStandardMaterial;
  metal: MeshStandardMaterial;
  gold: MeshStandardMaterial;
  trace: MeshStandardMaterial;
  ledOn: MeshStandardMaterial;
  ledOff: MeshStandardMaterial;
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
  // Rougher and drier than the mask: woven glass has a visible grain and no
  // clear coat. The difference is small but it is the difference between the edge
  // reading as cut laminate and reading as more board.
  core: { roughness: 0.94, metalness: 0.04 },
  chip: { roughness: 0.52, metalness: 0.38 },
  chipTop: { roughness: 0.34, metalness: 0.62 },
  // Matte moulded plastic, and drier still for ink on the surface.
  plastic: { roughness: 0.74, metalness: 0.06 },
  silk: { roughness: 0.92, metalness: 0 },
  metal: { roughness: 0.28, metalness: 0.92 },
  gold: { roughness: 0.34, metalness: 0.85 },
  trace: { roughness: 0.4, metalness: 0.7 },
  ledOn: { roughness: 0.25, metalness: 0.1 },
  ledOff: { roughness: 0.4, metalness: 0.1 },
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

/** Copper traces routed across the top surface. See `TRACE_Y`. */
function Traces({ material }: { material: MeshStandardMaterial }) {
  const runs = useMemo(
    () => [
      { size: [1.1, 0.004, 0.028] as const, position: [-0.62, TRACE_Y, 0.44] as const },
      { size: [1.1, 0.004, 0.028] as const, position: [-0.62, TRACE_Y, -0.52] as const },
      { size: [0.86, 0.004, 0.028] as const, position: [0.58, TRACE_Y, 0.6] as const },
      { size: [0.86, 0.004, 0.028] as const, position: [0.58, TRACE_Y, -0.6] as const },
      { size: [0.026, 0.004, 0.9] as const, position: [-1.32, TRACE_Y, -0.1] as const },
      { size: [0.026, 0.004, 0.9] as const, position: [1.32, TRACE_Y, 0.1] as const },
      { size: [0.026, 0.004, 0.66] as const, position: [-0.15, TRACE_Y, 0.72] as const },
      { size: [0.026, 0.004, 0.66] as const, position: [0.95, TRACE_Y, -0.72] as const },
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

/* ────────────────────────────────────────────────────────────────────────────
   Layout data
   ──────────────────────────────────────────────────────────────────────────── */

/** A primitive placed on the board, in board-local coordinates. */
interface Placed {
  position: [number, number, number];
  size: [number, number, number];
}

/** Top surface of the substrate. Everything below sits on this. */
const DECK = BOARD.thickness / 2;

/**
 * Copper traces routed across the top surface.
 *
 * Height is `DECK` relative rather than a literal. The board got a good deal
 * thinner, and a hard-coded 0.062 was sitting on the deck of a 0.12 slab — on the
 * new one it would leave the copper floating a quarter of the board's thickness
 * above the surface, which from the rest pitch is plainly visible as a detached
 * layer. Keyed off the deck it stays welded to the board at any thickness.
 *
 * `+0.003` is the copper standing slightly proud of the mask under it, which is
 * the opposite of a pour but right for a trace: a routed track is exposed, and an
 * exposed edge catches light.
 */
const TRACE_Y = DECK + 0.003;

/** Module scratch, so building the instance matrices allocates nothing. */
const SET_POSITION = new Vector3();
const SET_SCALE = new Vector3();
const SET_FLAT = new Quaternion();

/**
 * A set of boxes, or of flat discs, drawn as one draw call.
 *
 * Every repeated part on this board — forty-eight leads, sixteen passive bodies,
 * thirty-two end terminations, twelve vias — goes through here rather than being
 * written out as its own `<mesh>`. Twenty separate resistors would be twenty
 * draw calls for something that is geometrically identical each time; one
 * `InstancedMesh` is one. The cost is a matrix per item, written once on mount.
 *
 * `unit` selects the geometry: a 1×1×1 box, or a cylinder of radius ½ and height
 * 1, so `size` is always the object's real extent regardless of which it is.
 */
function BoxSet({
  material,
  items,
  unit = "box",
}: {
  material: MeshStandardMaterial;
  items: Placed[];
  unit?: "box" | "disc";
}) {
  const matrix = useMemo(() => new Matrix4(), []);

  // `onUpdate` fires on mount and whenever the node is replaced, which for a
  // static layout is once. Same pattern as `HeaderPins` above.
  const onUpdate = (self: InstancedMesh | null) => {
    if (!self) return;
    items.forEach((item, index) => {
      SET_POSITION.set(item.position[0], item.position[1], item.position[2]);
      SET_SCALE.set(item.size[0], item.size[1], item.size[2]);
      matrix.compose(SET_POSITION, SET_FLAT, SET_SCALE);
      self.setMatrixAt(index, matrix);
    });
    self.instanceMatrix.needsUpdate = true;
  };

  return (
    <instancedMesh
      args={[undefined, undefined, items.length]}
      material={material}
      onUpdate={(node) => onUpdate(node as unknown as InstancedMesh | null)}
    >
      {unit === "disc" ? (
        <cylinderGeometry args={[0.5, 0.5, 1, 18]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
    </instancedMesh>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The microcontroller
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * The QFP.
 *
 * This is the part that makes the object read as a microcontroller board rather
 * than as a decorated slab. A board is identifiable by its outlines: a square
 * package with four rows of fine leads down the sides, a dimple marking pin one,
 * and a printed border round it saying where the part goes. The leads are 48
 * identical gold bars and are therefore one `InstancedMesh`; the whole package
 * costs four draw calls.
 *
 * Placed between the USB connector and the crystal, which is where the
 * controller sits on a real board and the one place on this substrate with room
 * for it — the module can already owns the centre, and the front-left corner
 * belongs to the antenna and the buttons.
 */
const MCU = {
  x: 0.95,
  z: 0.05,
  /** Package body, edge to edge. */
  body: 0.44,
  /** Height off the deck. */
  tall: 0.075,
  /** Leads per side. 12 is a real count for a 48-pin QFP. */
  pins: 12,
  pitch: 0.045,
  /** How far a lead reaches beyond the body edge. */
  reach: 0.09,
};

const MCU_HALF = MCU.body / 2;

/** Four rows of leads. Long axis follows the side the lead belongs to. */
const MCU_LEADS: Placed[] = (() => {
  const out: Placed[] = [];
  const start = (-(MCU.pins - 1) * MCU.pitch) / 2;
  const y = DECK + 0.035;
  const off = MCU_HALF + MCU.reach / 2;
  for (let i = 0; i < MCU.pins; i += 1) {
    const o = start + i * MCU.pitch;
    out.push({ position: [MCU.x - off, y, MCU.z + o], size: [MCU.reach, 0.014, 0.016] });
    out.push({ position: [MCU.x + off, y, MCU.z + o], size: [MCU.reach, 0.014, 0.016] });
    out.push({ position: [MCU.x + o, y, MCU.z - off], size: [0.016, 0.014, MCU.reach] });
    out.push({ position: [MCU.x + o, y, MCU.z + off], size: [0.016, 0.014, MCU.reach] });
  }
  return out;
})();

/**
 * Silkscreen border round the package.
 *
 * Ink, not metal, and the colour is the opposite value to the substrate rather
 * than the usual white. White silkscreen is right on a green or black board; this
 * substrate is light silver on the dark theme, so white ink on it would be
 * invisible and the outline would cost a draw call to say nothing. It flips with
 * the board instead, which is the same rule the substrate already follows.
 */
const MCU_BORDER: Placed[] = (() => {
  const r = MCU_HALF + MCU.reach + 0.045;
  const t = 0.016;
  const y = DECK + 0.002;
  return [
    { position: [MCU.x - r, y, MCU.z], size: [t, 0.004, r * 2] },
    { position: [MCU.x + r, y, MCU.z], size: [t, 0.004, r * 2] },
    { position: [MCU.x, y, MCU.z - r], size: [r * 2, 0.004, t] },
    { position: [MCU.x, y, MCU.z + r], size: [r * 2, 0.004, t] },
  ];
})();

/* ────────────────────────────────────────────────────────────────────────────
   Passives
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Resistors and capacitors.
 *
 * A board with no passives looks like a board with nothing on it, and these are
 * the parts that give a populated PCB its texture: a lot of very small very
 * ordinary rectangles. Three tidy groups rather than a scatter, because the
 * difference between "detailed" and "cluttered" is that a real board is routed,
 * not random — and three rows read as somebody placed them on purpose.
 *
 * Long axis varies per group so the rows are not all the same shape, which is
 * what stops them reading as a texture.
 */
const PASSIVES: Placed[] = (() => {
  const out: Placed[] = [];

  // A run of eight along the front edge, long in X.
  for (let i = 0; i < 8; i += 1) {
    out.push({
      position: [-1.2 + i * 0.206, DECK + 0.018, 0.36],
      size: [0.115, 0.036, 0.062],
    });
  }

  // Five up the left margin, long in Z, clear of the antenna.
  for (let i = 0; i < 5; i += 1) {
    out.push({
      position: [-1.55, DECK + 0.018, -0.55 + i * 0.225],
      size: [0.062, 0.036, 0.115],
    });
  }

  // Three in the gap between the module can and the header.
  for (let i = 0; i < 3; i += 1) {
    out.push({
      position: [-1.05 + i * 0.22, DECK + 0.016, -0.3],
      size: [0.105, 0.032, 0.055],
    });
  }

  return out;
})();

/**
 * Metal end terminations, derived from the bodies rather than listed beside
 * them.
 *
 * Computing these from `PASSIVES` means the silver bands cannot drift out of
 * step with the packages they cap: change a body's length and its caps follow in
 * the same tick. Thirty-two of them, for one draw call, and the detail that
 * most makes an SMD part look like an SMD part rather than a black grain of rice.
 */
const TERMINATIONS: Placed[] = PASSIVES.flatMap((body) => {
  const along = body.size[0] >= body.size[2] ? 0 : 2;
  const width = 0.024;
  const offset = body.size[along] / 2 - width / 2;
  return [-1, 1].map((sign) => {
    const position: [number, number, number] = [
      body.position[0],
      body.position[1],
      body.position[2],
    ];
    position[along] += sign * offset;
    // A shade taller than the body, because a termination is a band wrapped over
    // the end rather than a flush inlay.
    const size: [number, number, number] = [body.size[0], body.size[1] + 0.006, body.size[2]];
    size[along] = width;
    return { position, size };
  });
});

/**
 * Vias: plated holes joining the two faces.
 *
 * Eight along the back and four along the front, all of them bare copper. They
 * are the cheapest detail on the board and one of the highest-yield ones — a
 * scatter of small gold dots on a large empty substrate is most of what the eye
 * reads as "this is a circuit board" before it has resolved a single component.
 */
const VIAS: Placed[] = (() => {
  const out: Placed[] = [];
  const y = DECK + 0.003;
  for (let i = 0; i < 8; i += 1) {
    out.push({ position: [-1 + i * 0.28, y, -0.78], size: [0.038, 0.006, 0.038] });
  }
  for (let i = 0; i < 4; i += 1) {
    out.push({ position: [-1.15 + i * 0.51, y, 0.78], size: [0.038, 0.006, 0.038] });
  }
  return out;
})();

/**
 * Corner mounting holes: a plated annulus with the bore punched through.
 *
 * Set in from the edge rather than hard into the corner, because the corner is
 * now filleted and a pad centred on the outline would cross it. Insetting is what
 * a milled board does anyway — the hole needs land around it, and land does not
 * survive a radius.
 */
const HOLES: [number, number][] = [
  [-1.4, -0.84],
  [1.4, -0.84],
  [-1.4, 0.84],
  [1.4, 0.84],
];

const HOLE_PADS: Placed[] = HOLES.map(([x, z]) => ({
  position: [x, DECK + 0.003, z],
  size: [0.23, 0.006, 0.23],
}));

const HOLE_BORES: Placed[] = HOLES.map(([x, z]) => ({
  position: [x, DECK + 0.007, z],
  size: [0.12, 0.014, 0.12],
}));

/** Two tactile switches — reset and user, as every dev board has. */
const BUTTON_BODIES: Placed[] = [-1.3, -0.86].map((x) => ({
  position: [x, DECK + 0.045, 0.6],
  size: [0.2, 0.09, 0.2],
}));

const BUTTON_CAPS: Placed[] = [-1.3, -0.86].map((x) => ({
  position: [x, DECK + 0.105, 0.6],
  size: [0.115, 0.03, 0.115],
}));

/**
 * The plastic body the header pins push through.
 *
 * The pins were there before this, standing on their own like a comb. Twenty bare
 * bars is what a header looks like *without* its body, and adding the body is the
 * whole difference between "gold comb" and "2×10 header". Sized to swallow the
 * lower two thirds of each pin, which is exactly how much of a real header pin
 * is exposed above the plastic.
 */
const HEADER_BODY: [number, number, number] = [0.01, DECK + 0.055, -0.54];
const HEADER_BODY_SIZE: [number, number, number] = [2.72, 0.11, 0.38];
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

/** Drag-to-rotate. */
const DRAG = {
  /** Radians per pixel of pointer travel. */
  turn: 0.0088,
  /**
   * How fast a released board unwinds back to its default orientation, radians
   * per second.
   *
   * The board is a turntable, not a held object. Letting go hands the orientation
   * back rather than leaving it wherever it was last parked, because a hero
   * visual that stays twisted over from one interaction is decoration that has
   * stopped resetting — and every later visitor inherits whatever angle the last
   * one left it at.
   *
   * Constant angular rate, not a spring and not an easing curve, because the
   * return has to look the same however far the drag went. A spring would overshoot
   * a small drag and barely move on a large one; this unwinds a quarter turn in
   * about a fifth of a second and a full turn in a little over two, and the board
   * always arrives travelling the same speed. Expressed per second, so it is the
   * same on a 60 Hz and a 144 Hz panel.
   */
  settle: 2.6,
  /**
   * Below this the remaining angle is under a tenth of a degree, which is less
   * than one pixel of movement, so it is snapped to rest rather than integrated
   * toward it forever.
   */
  rest: 0.0015,
};

/** Scratch, so a drag allocates nothing. */
const DRAG_AXIS = new Vector3();
const DRAG_STEP = new Quaternion();
const DRAG_BASE = new Quaternion();
const DRAG_EULER = new Euler();

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
  // reassigned, so it always points at the same instances the meshes use.
  const materialRef = useRef(m);

  // Everything that is smoothed lives in a ref. Scroll position is read from
  // `window` inside the frame loop rather than being pushed down from a scroll
  // listener, so there is exactly one source of truth and no listener at all:
  // scrolling causes zero React renders, zero layout reads outside the loop, and
  // therefore no thrash.
  const eased = useRef({ leanX: 0, leanZ: 0, scroll: 0, spin: 0 });

  /**
   * Where the visitor has turned the board to.
   *
   * A quaternion, not two Euler angles, and that is the whole design. A drag is
   * not two independent values: pulling the pointer diagonally should roll the
   * board as well as turn it, which is what a trackball does and what two Euler
   * numbers cannot express without gimbal artefacts. Each pointer move contributes
   * one small rotation about an axis perpendicular to the movement, and those
   * compose — so every orientation is reachable, roll included, and there is no
   * axis you can reach that behaves differently from the others.
   *
   * It multiplies in front of the idle turn, the pointer lean and the scroll path,
   * which means the drag is resolved in screen space. Behind them it would be
   * resolved in the board's own frame, so "right" would mean a different thing
   * depending on which way the idle spin had turned it.
   *
   * Held at identity while nobody is touching it, and eased back there on release
   * rather than left parked. That is what makes it a turntable: the board is
   * always on its way back to the default orientation, and no visitor inherits
   * the angle the last one happened to leave it at.
   */
  const turn = useRef(new Quaternion());

  const grab = useRef({ down: false, x: 0, y: 0 });

  /**
   * The substrate solid.
   *
   * An extrusion rather than a box, which is the only way to get filleted corners
   * without either four extra cylinders in the corners or a texture. `rotateX`
   * lays the extruded shape down from XY onto the XZ plane the board occupies; the
   * solid then spans y from 0 to the thickness, which is why the mesh sits at
   * `-half`.
   *
   * Disposed on unmount rather than left to the renderer: the canvas is torn down
   * whenever the hero scrolls out of view, so this is built and dropped repeatedly
   * over a visit and would otherwise leak a geometry buffer each time.
   */
  const substrate = useMemo(() => {
    const solid = new ExtrudeGeometry(roundedRect(BOARD.width, BOARD.depth, CORNER), {
      depth: BOARD.thickness,
      bevelEnabled: false,
      curveSegments: 12,
    });
    solid.rotateX(-Math.PI / 2);
    return solid;
  }, []);

  useEffect(() => () => substrate.dispose(), [substrate]);

  /**
   * Grab the board.
   *
   * The pointer is captured so the drag survives leaving the slab — otherwise it
   * would end the moment the pointer crossed the board's edge, which is exactly
   * the motion everyone makes when turning something like this.
   *
   * Touch is declined rather than captured, and no `touch-action` is set on the
   * canvas. A precise-pointer device can still be a touchscreen, and swallowing
   * its scroll would be a far worse failure than a page that pans instead of
   * rotating under a fingertip.
   */
  const onGrabDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.pointerType === "touch") return;
    const held = grab.current;
    held.down = true;
    held.x = event.clientX;
    held.y = event.clientY;
    (event.target as Element).setPointerCapture(event.pointerId);
  };

  const onGrabMove = (event: ThreeEvent<PointerEvent>) => {
    const held = grab.current;
    if (!held.down) return;

    const dx = event.clientX - held.x;
    const dy = event.clientY - held.y;
    held.x = event.clientX;
    held.y = event.clientY;
    if (dx === 0 && dy === 0) return;

    // The axis perpendicular to the drag, in the screen plane: dragging right
    // turns it about +Y, dragging down about +X, and a diagonal about both at
    // once — which is where the roll comes from.
    DRAG_AXIS.set(dy, dx, 0).normalize();
    DRAG_STEP.setFromAxisAngle(DRAG_AXIS, Math.hypot(dx, dy) * DRAG.turn);
    turn.current.premultiply(DRAG_STEP).normalize();
  };

  /**
   * Let go.
   *
   * Only the flag is dropped. The orientation is left where it is and unwound by
   * the frame loop, because unwinding from here would mean deciding the whole
   * remaining path in one event, and a release that snapped would read as the
   * board being taken away rather than as a turntable being let go of.
   *
   * The capture is released rather than left to the browser, so a drag that ends
   * outside the board does not keep the pointer redirected at a canvas the
   * pointer has left.
   */
  const onGrabUp = (event: ThreeEvent<PointerEvent>) => {
    grab.current.down = false;
    (event.target as Element).releasePointerCapture(event.pointerId);
  };

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const e = eased.current;
    const k = themeLerp(delta);

    // ── Theme ─────────────────────────────────────────────────────────────
    // One `Color.lerp` per material, plus a scalar nudge for the emissive ones.
    // This is the only per-frame work the theme costs, it allocates nothing
    // (`SCRATCH` is reused), and it is why the materials never have to be
    // rebuilt.
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

    // ── Returning to rest ─────────────────────────────────────────────────
    // Once the pointer is gone, the drag's contribution unwinds to nothing and
    // the board returns to the orientation it would have had if nobody had
    // touched it. The idle turn, the pointer lean and the scroll path below are
    // all still running underneath, so what it returns to is the live default
    // rather than a stored one — the board keeps breathing and keeps turning on
    // the way home, instead of arriving somewhere frozen.
    //
    // The step is a fixed angle per second, taken along the inverse of the
    // quaternion's own axis, so the board retraces the exact path it came out
    // on. Any other route back — a fresh shortest-arc interpolation, or damping
    // the components — would visibly jump, because a quaternion that has
    // accumulated several drags is nowhere near the identity and the straight
    // line between the two orientations passes through a different set of angles
    // than the one the drag took.
    //
    // `w` is the cosine of half the remaining angle, and it is negated when
    // negative so this always takes the short way round. A quaternion and its
    // negation are the same rotation, so which sign is present is arbitrary, and
    // unwinding towards -1 instead of +1 would send the board the long way
    // round through a full extra half turn.
    const t = turn.current;
    if (!grab.current.down && t.w < 1) {
      if (t.w < 0) {
        t.set(-t.x, -t.y, -t.z, -t.w);
      }
      const remaining = 2 * Math.acos(Math.min(1, t.w));
      if (remaining < DRAG.rest) {
        t.identity();
      } else {
        DRAG_STEP.setFromAxisAngle(
          DRAG_AXIS.set(t.x, t.y, t.z).normalize(),
          -Math.min(remaining, DRAG.settle * delta),
        );
        t.premultiply(DRAG_STEP).normalize();
      }
    }

    // Orientation, as an absolute assignment from three sources summed once.
    // Euler order is YXZ so that the idle turn is the outermost axis: yaw applies
    // first in the object's own frame, which is what stops the turntable from
    // gimbal-flipping as the board passes through vertical.
    DRAG_EULER.set(
      // The rest pitch, under the visitor's lean and under the exit tilt, so all
      // three tip the same way and the board never rolls back past level while
      // being moved around.
      REST_PITCH + e.leanX + p * SCROLL.tilt,
      e.spin + p * SCROLL.spin,
      e.leanZ + p * SCROLL.roll,
      "YXZ",
    );
    DRAG_BASE.setFromEuler(DRAG_EULER);
    g.quaternion.copy(turn.current).multiply(DRAG_BASE);

    g.position.set(p * SCROLL.x, breathe + p * SCROLL.y, p * SCROLL.z);
    g.scale.setScalar(1 - p * SCROLL.scale);
  });

  const half = BOARD.thickness / 2;

  return (
    <group ref={group}>
      {/* Substrate. Extruded from a rounded outline rather than a box, so the
          corners are a real fillet. Built once per mount — see `substrate`. */}
      <mesh material={m.board} geometry={substrate} position={[0, -half, 0]} />

      {/* The laminate core, showing as a band around all four edges.
          Inset from the mask on every side, so the top surface stands proud of it
          all the way round and the edge reads as two distinct materials rather
          than one slab with a darker stripe painted on. The rest pitch is what
          makes that band visible at all: it is 11px tall in a 700px frame, which is
          enough to say "cut board" and not enough to look like a stack of coins.

          The lip above and below the core is a *fraction* of the slab rather than
          the 0.004 this used to be. Fixed, it was right for a 0.072 board and
          would have become a tenth of the thickness here — the mask would have been
          a thick casing around a wafer instead of a coating on a laminate, which
          is the opposite of how a board is made and reads as a sandwich rather
          than a milled edge.

          The planar inset is 0.062 for the same reason it was before: the core is a
          box, and at 0.055 its square corner cleared the board's fillet by less
          than a quarter of a pixel. That margin only exists until someone changes
          a constant. */}
      <mesh material={m.core} position={[0, -half + CORE.lip, 0]}>
        <boxGeometry args={[BOARD.width - 0.124, BOARD.thickness - CORE.lip * 2, BOARD.depth - 0.124]} />
      </mesh>

      {/* Copper pours, the two-plane ground on the top face. Coplanar with the
          silkscreen but 0.004 proud of the mask, so the key light catches them at
          a different angle than the surface they sit on. This is the only reason
          the copper is legible as copper rather than as a printed colour: face on,
          a flat plane of any colour just reads as that colour. */}
      <mesh material={m.gold} position={[0, half + POUR.y, 0]}>
        <boxGeometry args={[POUR.width, POUR.thickness, POUR.depth]} />
      </mesh>
      <mesh material={m.gold} position={[POUR2.x, half + POUR2.y, 0]}>
        <boxGeometry args={[POUR2.width, POUR2.thickness, POUR2.depth]} />
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

      {/* Crystal oscillator. Sits at the front right rather than at the back,
          because the back of the board is now the header body. */}
      <mesh material={m.metal} position={[1.3, half + 0.06, 0.6]}>
        <boxGeometry args={[0.28, 0.12, 0.11]} />
      </mesh>

      {/* Status LEDs — one lit, one dark */}
      <mesh material={m.ledOn} position={[0.42, half + 0.07, 0.66]}>
        <sphereGeometry args={[0.06, 14, 12]} />
      </mesh>
      <mesh material={m.ledOff} position={[0.62, half + 0.06, 0.66]}>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>

      {/* ── Populated detail ────────────────────────────────────────────────
          Ordered back to front so the flat printed things go down before the
          parts that stand on top of them. Nothing here is depth-sorted per
          frame; the draw order only has to be stable, not optimal. */}

      {/* Silkscreen border round the controller, printed on the substrate */}
      <BoxSet material={m.silk} items={MCU_BORDER} />

      {/* Copper vias and plated corner holes, both flush with the surface */}
      <BoxSet material={m.gold} items={VIAS} unit="disc" />
      <BoxSet material={m.gold} items={HOLE_PADS} unit="disc" />
      <BoxSet material={m.chip} items={HOLE_BORES} unit="disc" />

      {/* Traces, which now read as routing between the parts rather than as
          decoration on an empty board */}
      <Traces material={m.trace} />

      {/* Passives: sixteen bodies and their silver end bands */}
      <BoxSet material={m.plastic} items={PASSIVES} />
      <BoxSet material={m.metal} items={TERMINATIONS} />

      {/* ── The controller ───────────────────────────────────────────────── */}
      <mesh material={m.chip} position={[MCU.x, DECK + MCU.tall / 2, MCU.z]}>
        <boxGeometry args={[MCU.body, MCU.tall, MCU.body]} />
      </mesh>
      {/* Laser marking on the package lid */}
      <mesh material={m.chipTop} position={[MCU.x, DECK + MCU.tall + 0.003, MCU.z]}>
        <boxGeometry args={[0.3, 0.006, 0.3]} />
      </mesh>
      {/* The dimple that marks pin one */}
      <BoxSet
        material={m.plastic}
        unit="disc"
        items={[{ position: [MCU.x - 0.15, DECK + MCU.tall + 0.008, MCU.z + 0.15], size: [0.07, 0.008, 0.07] }]}
      />
      <BoxSet material={m.gold} items={MCU_LEADS} />

      {/* Tactile switches */}
      <BoxSet material={m.plastic} items={BUTTON_BODIES} />
      <BoxSet material={m.chipTop} items={BUTTON_CAPS} unit="disc" />

      {/* The pin header, at last, with the plastic body it is actually set in */}
      <mesh material={m.plastic} position={HEADER_BODY}>
        <boxGeometry args={HEADER_BODY_SIZE} />
      </mesh>
      <HeaderPins material={m.gold} />

      {/* Grab surface.
          An invisible slab across the board's footprint, and the only thing on this
          canvas that takes pointer events. The board is dozens of separate meshes,
          so putting the handlers on any one of them would end the drag the moment
          the pointer crossed a gap between parts — you would have to grab a
          specific component. One slab means you can grab the board anywhere.

          Transparent with `depthWrite` off rather than `visible={false}`, because
          an invisible object is skipped by the raycaster and could then never be
          hit at all. It is inset slightly inside the substrate, so what is grabbable
          is visibly the board and not the empty space beside it. */}
      <mesh
        onPointerDown={onGrabDown}
        onPointerMove={onGrabMove}
        onPointerUp={onGrabUp}
        onPointerCancel={onGrabUp}
      >
        <boxGeometry args={[BOARD.width - 0.1, BOARD.thickness + 0.34, BOARD.depth - 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
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

      {/* Fake contact shadow. Sized to the board as drawn rather than to the
          layout width, so it still lands under the substrate at the current
          squeeze instead of spilling out past both ends. */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, SHADOW.y, 0]}>
        <circleGeometry args={[SHADOW.radius, 32]} />
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
        // Far enough back that the board fits at every canvas aspect, including
        // the 5/4 it becomes on wide viewports, and with room for the width it
        // projects to when the visitor yaws it. The pitch at rest costs horizontal
        // room too, since tipped depth adds to the silhouette.
        camera={{ position: [0, 1.15, 4.15], fov: 32, near: 0.1, far: 40 }}
        // Multisampling off, supersampling on instead. Running the framebuffer
        // above CSS resolution and skipping MSAA produces the same edge quality
        // for a fraction of the fill-rate cost, which is the difference between
        // a smooth scroll and a stuttering one on an integrated GPU.
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        // The canvas has to take pointer events for the board to be draggable.
        // Nothing else lives over it: the technical labels and the corner readout
        // are already `pointer-events-none`, and the hero's own copy sits in a
        // sibling grid column rather than underneath this one.
        style={{ pointerEvents: "auto", userSelect: "none", WebkitUserSelect: "none" }}
      >
        <Lighting theme={theme} />

        {/* One group, so narrowing the substrate narrows everything on it. Placed
            here rather than inside `Board` so the lights, which are not part of
            the object, keep their positions. */}
        <group scale={[SQUEEZE_X, 1, SQUEEZE_Z]}>
          <Board theme={theme} />
        </group>
      </Canvas>
    </div>
  );
}
