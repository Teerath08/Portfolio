/**
 * Theme tokens.
 *
 * Two themes share one variable set — see the `:root[data-theme]` blocks in
 * `globals.css`. `bootScript()` is serialised into the document head so the
 * stored theme is applied before first paint; it is the reason the site never
 * flashes the wrong colours.
 *
 * A third theme, "Lab", was removed. It was a second dark theme rather than a
 * different idea, and its distinguishing feature was a teal secondary wash that
 * read as a green cast over the whole page.
 */

export const THEME_STORAGE_KEY = "portfolio-theme";

export interface ThemeDefinition {
  id: string;
  /** Name shown in the toggle's tooltip and accessible label. */
  label: string;
  /** The colour the theme paints its meta tag with. */
  meta: string;
  /** Icon key, resolved to a component by the toggle. */
  icon: "board" | "blueprint";
}

export const THEMES: ThemeDefinition[] = [
  { id: "dark", label: "Workbench", meta: "#05080b", icon: "board" },
  { id: "light", label: "Blueprint", meta: "#f4f7f9", icon: "blueprint" },
];

export const DEFAULT_THEME = THEMES[0].id;

const THEME_IDS = THEMES.map((theme) => theme.id);

/** Applies a theme to the document. Client-side only. */
export function applyTheme(id: string): void {
  if (typeof document === "undefined") return;
  if (!THEME_IDS.includes(id)) return;

  const root = document.documentElement;
  root.dataset.theme = id;
  root.style.colorScheme = id === "light" ? "light" : "dark";

  const meta = document.querySelector('meta[name="theme-color"]');
  const definition = THEMES.find((theme) => theme.id === id);
  meta?.setAttribute("content", definition?.meta ?? "#05080b");
}

export function nextTheme(id: string): string {
  const index = THEME_IDS.indexOf(id);
  return THEME_IDS[(index + 1) % THEME_IDS.length] ?? DEFAULT_THEME;
}

/**
 * The inline boot script.
 *
 * Runs before the body paints so the stored theme — or the system preference,
 * when nothing is stored — is already in place. It is what stops the site
 * flashing the wrong colours on load.
 *
 * The migration map is what keeps a stored theme that no longer exists from
 * stranding the visitor. The previous site's "neon" key pointed at the removed
 * "Lab" theme, so it is remapped onto "dark" — still a dark theme, which is what
 * someone who chose neon actually wanted.
 */
export function bootScript(): string {
  return `(function(){try{
var ids=${JSON.stringify(THEME_IDS)};
var legacy={neon:"dark"};
var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(stored&&legacy[stored]){stored=legacy[stored];localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},stored);}
var theme=ids.indexOf(stored)!==-1?stored:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
var root=document.documentElement;
root.dataset.theme=theme;
root.style.colorScheme=theme==="light"?"light":"dark";
var meta=document.querySelector('meta[name="theme-color"]');
if(meta){var defs=${JSON.stringify(THEMES.map((t) => [t.id, t.meta]))};
meta.setAttribute("content",(defs.filter(function(d){return d[0]===theme})[0]||[])[1]||"#05080b");}
}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}";}})();`;
}