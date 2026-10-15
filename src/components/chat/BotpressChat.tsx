"use client";

import { preload } from "react-dom";
import Script from "next/script";

import {
  BOTPRESS_BOT_NAME,
  BOTPRESS_CONFIG_SRC,
  BOTPRESS_INJECT_SRC,
} from "@/lib/botpress";

/**
 * Botpress Webchat.
 *
 * Replaces the hand-rolled "Vegapunk" assistant. The URLs come from
 * `@/lib/botpress` and are the standard embed, kept in the order the snippet
 * ships them in: `inject.js` builds the widget and defines `window.botpress`,
 * and the second script is an `init({...})` call against it.
 *
 * In the plain snippet the ordering is free — `inject.js` is parser-blocking and
 * the config is `defer`, so the loader always wins. `next/script` gives no such
 * promise between two of its tags, so the config is chained off the loader's
 * `onLoad` instead: it cannot run before `window.botpress` exists.
 *
 * The loader is ~1.7 MB, so it loads `afterInteractive` rather than blocking
 * first paint. To keep that from becoming a visible wait, both scripts are
 * preloaded — `next/script` hints the loader, and the `preload` call below
 * starts the config fetch in parallel — while the root layout warms the
 * connections. Nothing blocks paint; the downloads overlap it.
 */

/** The slice of the `window.botpress` API this component uses. */
interface BotpressApi {
  on: (event: string, handler: () => void) => void;
  config: (input: { configuration?: Record<string, unknown> }) => void;
}

export default function BotpressChat() {
  /*
   * Start fetching the config now. It cannot run until the loader has defined
   * `window.botpress`, so left to itself its request would only begin on the
   * loader's `onLoad` — a full round-trip after the widget has booted. React's
   * `preload` emits a single deduplicated `<link>` (the same mechanism
   * `next/script` uses for the loader), so the file is fetched once, early.
   */
  preload(BOTPRESS_CONFIG_SRC, { as: "script" });

  return (
    <Script
      id="botpress-inject"
      src={BOTPRESS_INJECT_SRC}
      strategy="afterInteractive"
      onLoad={() => {
        // Idempotent: a remount or a second `onLoad` must not initialise twice.
        if (document.getElementById("botpress-config")) return;

        const botpress = (window as Window & { botpress?: BotpressApi }).botpress;

        /*
         * `config()` merges into the store's configuration, so it must run
         * *after* `init()` has applied the remote config — calling it sooner
         * would simply be overwritten. `webchat:initialized` fires at the end of
         * that sequence, which is the earliest safe point.
         */
        if (botpress) {
          botpress.on("webchat:initialized", () => {
            botpress.config({ configuration: { botName: BOTPRESS_BOT_NAME } });
          });
        }

        const config = document.createElement("script");
        config.id = "botpress-config";
        config.src = BOTPRESS_CONFIG_SRC;
        document.body.appendChild(config);
      }}
    />
  );
}
