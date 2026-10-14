"use client";

import Script from "next/script";

/**
 * Botpress Webchat.
 *
 * Replaces the hand-rolled "Vegapunk" assistant. The two URLs below are the
 * standard Botpress embed, kept in the same order the snippet ships them in:
 * `inject.js` builds the widget and defines `window.botpress`, and the second
 * script is an `init({...})` call against it.
 *
 * In the plain snippet the ordering is free — `inject.js` is parser-blocking and
 * the config is `defer`, so the loader always wins. `next/script` gives no such
 * promise between two of its tags, so the config is chained off the loader's
 * `onLoad` instead: it cannot run before `window.botpress` exists.
 *
 * The loader is ~1.7 MB, so it loads `afterInteractive` rather than blocking
 * first paint, which is also why this is not inlined into `<head>`.
 */

const INJECT_SRC = "https://cdn.botpress.cloud/webchat/v5.0/inject.js";
const CONFIG_SRC =
  "https://files.bpcontent.cloud/2026/09/17/05/20260917053059-CGPRCGR8.js";

/**
 * The name the widget presents the assistant under.
 *
 * The generated Botpress config carries no `botName`, so the header would fall
 * back to the generic default. It is set from here instead, through the public
 * API: `window.botpress.config()` deep-merges into the live configuration, so
 * every other value in the remote config — avatar, welcome copy, feature flags —
 * is left untouched.
 */
const BOT_NAME = "Vegapunk";

/** The slice of the `window.botpress` API this component uses. */
interface BotpressApi {
  on: (event: string, handler: () => void) => void;
  config: (input: { configuration?: Record<string, unknown> }) => void;
}

export default function BotpressChat() {
  return (
    <Script
      id="botpress-inject"
      src={INJECT_SRC}
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
            botpress.config({ configuration: { botName: BOT_NAME } });
          });
        }

        const config = document.createElement("script");
        config.id = "botpress-config";
        config.src = CONFIG_SRC;
        document.body.appendChild(config);
      }}
    />
  );
}
