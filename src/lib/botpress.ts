/**
 * Botpress Webchat embed.
 *
 * The URLs live here rather than in the component because two consumers need
 * them: `BotpressChat` loads the widget, and the root layout uses the same URLs
 * for resource hints. That split matters — the loader is ~1.7 MB and is loaded
 * `afterInteractive` so it never blocks first paint, which means without a hint
 * the download only *starts* once the page has hydrated. The layout preloads it
 * so the fetch overlaps the initial page load instead.
 *
 * `next/script` gives no ordering guarantee between two of its tags, so the
 * config script is still chained off the loader's `onLoad` in the component;
 * these constants only describe *what* to fetch, never *when*.
 */

/** Builds the widget and defines `window.botpress`. */
export const BOTPRESS_INJECT_SRC =
  "https://cdn.botpress.cloud/webchat/v5.0/inject.js";

/** The generated `init({...})` call. Must run after `inject.js`. */
export const BOTPRESS_CONFIG_SRC =
  "https://files.bpcontent.cloud/2026/09/17/05/20260917053059-CGPRCGR8.js";

/**
 * Origins the widget contacts: the two script CDNs, plus the API it calls once
 * initialised. Preconnecting moves the DNS/TLS setup off the widget's critical
 * path.
 */
export const BOTPRESS_ORIGINS = [
  "https://cdn.botpress.cloud",
  "https://files.bpcontent.cloud",
  "https://webchat.botpress.cloud",
] as const;

/**
 * Display name for the assistant.
 *
 * The generated config carries no `botName`, so the widget would fall back to
 * the generic default. `BotpressChat` applies this through the public API after
 * initialisation (`window.botpress.config()` deep-merges into the live
 * configuration, so nothing else is affected).
 */
export const BOTPRESS_BOT_NAME = "Vegapunk";
