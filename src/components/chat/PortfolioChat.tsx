"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, RotateCcw, Send, X } from "lucide-react";

import { getGreeting, getOfflineReply, getStarterSuggestions } from "@/chat/knowledge";
import { navigateToSection } from "@/lib/navigate";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * Vegapunk, the portfolio assistant.
 *
 * The behaviour is unchanged from the previous version of this site and is
 * worth preserving exactly: the server answers when it can, and when it cannot
 * — no key, a timeout, an unreachable endpoint — the bundled knowledge base
 * answers from the browser instead. The assistant never goes silent, and the
 * header says which of the two is happening rather than hiding it.
 *
 * Only the presentation is new: the old red-on-zinc panel is now built from the
 * same tokens as the rest of the page.
 */

/** Served from /public rather than hotlinked: third-party CDN URLs are not stable. */
const AVATAR = "/vegapunk.jpg";

let messageCounter = 0;
const nextId = () => `msg-${++messageCounter}`;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  section?: string | null;
  suggestions?: string[] | null;
  isError?: boolean;
}

/**
 * Minimal inline markdown: **bold** and _italic_. That is the whole of what the
 * bot emits, and doing it here keeps a markdown dependency out of the bundle.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|_(.+?)_/g;
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-semibold text-ink">
          {match[1]}
        </strong>,
      );
    } else {
      parts.push(
        <em key={`${keyPrefix}-i${index}`} className="italic text-muted">
          {match[2]}
        </em>,
      );
    }
    cursor = match.index + match[0].length;
    index += 1;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

/** Renders a bot reply as paragraphs and bullet lists. */
function MessageBody({ text }: { text: string }) {
  const blocks = String(text || "").split(/\n{2,}/);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");
    const isList = lines.length > 0 && lines.every((line) => /^\s*[-*]\s+/.test(line));

    if (isList) {
      return (
        <ul key={blockIndex} className="my-1.5 space-y-1.5 first:mt-0 last:mb-0">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex} className="flex gap-2">
              <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
              <span className="min-w-0">
                {renderInline(line.replace(/^\s*[-*]\s+/, ""), `${blockIndex}-${lineIndex}`)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className="mb-2 last:mb-0 first:mt-0">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInline(line, `${blockIndex}-${lineIndex}`)}
          </span>
        ))}
      </p>
    );
  });
}

/**
 * Vegapunk's avatar.
 *
 * Deliberately small in both the header and the transcript. A large avatar in
 * the header eats the vertical space the conversation needs on short screens,
 * and one avatar per message made the transcript read as a column of portraits
 * rather than a conversation.
 *
 * `block` is load-bearing and is not decoration. A `<span>` is an inline box by
 * default, and `width`, `height` and `overflow` do not apply to one — so without
 * it the 28px frame is ignored, `overflow-hidden` never engages, and the
 * `h-full` on the image resolves against an indefinite height and falls back to
 * `auto`, which renders the 736px source at its intrinsic size, unclipped. In the
 * header that frame sits inside a plain `<span>` rather than a flex row, so
 * nothing blockifies it and the bug is live. The oversized image then paints over
 * the whole conversation.
 */
function Avatar() {
  return (
    <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-lg border border-line/12 bg-surface2">
      {/* A user-supplied static asset; next/image would add a loader for nothing.
          The intrinsic size is declared so the browser reserves the 28px box
          before the 736px source decodes, and `overflow-hidden` above is what
          stops it mattering if the sizing ever fails to resolve. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={AVATAR} alt="" width={736} height={736} decoding="async" className="h-full w-full object-cover" />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5" role="status">
      <span className="sr-only">Assistant is typing</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-accent/80"
          style={{ animation: `chat-typing 1.2s ease-in-out ${dot * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const reduced = usePrefersReducedMotion();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /**
   * The fixed wrapper that holds both the panel and the launcher.
   *
   * "Did the user click outside the chatbot?" is answered against this, not
   * against the panel. The wrapper is the only element that contains both, so it
   * is the only box the answer is true of — clicking the gap between the panel
   * and the bubble is still a click outside the panel, and should be treated as
   * one. Its children carry `pointer-events-auto`, so hit-testing already
   * reports the real target and `contains()` agrees with what was clicked.
   */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);

  /* Keep the transcript pinned to the newest message. */
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isThinking]);

  /* Focus the composer on open. Escape and clicks outside both dismiss. */
  useEffect(() => {
    if (!isOpen) return;

    if (!openedOnce.current) {
      openedOnce.current = true;
      setMessages([{ id: nextId(), role: "assistant", text: getGreeting() }]);
    }
    inputRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      // Escape is a keyboard gesture, so focus has to go back to the launcher.
      // Without that it lands on `<body>`, and a keyboard user loses their place
      // entirely with nothing left to announce the change.
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    /*
     * Clicking anywhere else on the page dismisses the panel.
     *
     * `pointerup` rather than `pointerdown`, and only after a `pointerdown` that
     * also landed outside. Both halves are load-bearing. A single `pointerdown`
     * would dismiss the instant a finger touched the page, so a phone user
     * could not scroll the document with the panel open without losing it every
     * time. And a lone `pointerup` test would dismiss when the user began
     * selecting text inside the panel and finished the drag outside it — which
     * is exactly how you copy an answer out of a chatbot. Requiring the gesture
     * to both start and end outside leaves both cases alone.
     *
     * Focus is deliberately not restored here. The click landed on something,
     * and that thing is where focus belongs; pulling it back to the launcher
     * would take it away from whatever the user just activated.
     */
    const isInside = (event: PointerEvent) =>
      wrapperRef.current?.contains(event.target as Node) ?? false;
    let beganOutside = false;

    const handleDown = (event: PointerEvent) => {
      beganOutside = !isInside(event);
    };

    const handleUp = (event: PointerEvent) => {
      if (beganOutside && !isInside(event)) setIsOpen(false);
      beganOutside = false;
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isOpen]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = String(raw || "").trim();
      if (!text || isThinking) return;

      const history = messages
        .filter((message) => message.text)
        .map((message) => ({
          role: message.role === "user" ? ("user" as const) : ("assistant" as const),
          text: message.text,
        }))
        .slice(-6);

      setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
      setInput("");
      setIsThinking(true);

      const pushReply = (reply: Omit<ChatMessage, "id" | "role">) =>
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", ...reply }]);

      try {
        // Bound the wait, so a request that never resolves cannot leave the
        // typing dots on screen forever.
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 25_000);

        let payload: {
          reply?: string;
          section?: string | null;
          suggestions?: string[] | null;
          aiEnabled?: boolean;
          error?: string;
        } | null;

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ message: text, history }),
            signal: controller.signal,
          });

          // A dev-server or proxy error page arrives as HTML, which would make
          // .json() throw and hide the real status code.
          payload = await response.json().catch(() => null);

          if (!response.ok) {
            // A real HTTP reply. Show it, because messages like "slow down" or
            // "message too long" are things the visitor can act on.
            throw Object.assign(
              new Error(payload?.error || `The server replied with ${response.status}.`),
              { fatal: true },
            );
          }
        } finally {
          window.clearTimeout(timer);
        }

        if (!payload) throw new Error("The server sent a reply the widget could not read.");

        setAiEnabled(Boolean(payload.aiEnabled));
        pushReply({
          text: payload.reply || "I'm not sure how to answer that.",
          section: payload.section || null,
          suggestions: payload.suggestions || null,
        });
      } catch (error) {
        const fatal = Boolean((error as { fatal?: boolean })?.fatal);
        if (fatal) {
          pushReply({ text: (error as Error).message, isError: true });
        } else {
          // The knowledge base is already in the browser bundle, so an
          // unreachable API does not have to mean silence. Answer from it
          // directly and let the header switch to "Offline mode", which keeps
          // the limitation visible instead of mysterious.
          const offline = getOfflineReply(text);
          setAiEnabled(false);
          pushReply({
            text: offline.reply,
            section: offline.section,
            suggestions: offline.suggestions,
          });
          console.warn(
            "[chat] /api/chat unreachable, answered from the local knowledge base:",
            (error as Error)?.message || error,
          );
        }
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages],
  );

  const latestSuggestions = useMemo(() => {
    if (messages.length === 0) return getStarterSuggestions();
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].suggestions?.length) return messages[i].suggestions!;
    }
    return null;
  }, [messages]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const jump = (section: string) => {
    setIsOpen(false);
    navigateToSection(section);
  };

  const sectionLabel = (id: string) =>
    id.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div
      ref={wrapperRef}
      className="no-print pointer-events-none fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 print:hidden"
    >
      {/* ── Panel ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.99 }}
            transition={{ duration: reduced ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Portfolio assistant"
            className={cn(
              "glass pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm origin-bottom-right",
              "flex-col overflow-hidden rounded-2xl border border-line/12",
              // `svh`, not `vh`: on a phone the browser chrome changes the
              // visible height as you scroll, and `vh` is the height with the
              // chrome *hidden*, which makes the panel taller than the space
              // actually available. The `max-h` is the backstop for short
              // windows — without it the fixed-height panel grows off the top of
              // the screen and takes the transcript with it. No `min-h`: a floor
              // here would win over the cap and reintroduce the same overflow.
              "h-[min(74svh,36rem)] max-h-[calc(100svh-7.5rem)]",
            )}
            style={{ animation: "backdrop-in 220ms ease-out" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line/8 px-4 py-3">
              <span className="relative shrink-0">
                <Avatar />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas",
                    aiEnabled ? "bg-accent" : "bg-amber-400",
                  )}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight tracking-tight text-ink">
                  Vegapunk
                </p>
                <p
                  className={cn(
                    "truncate font-mono text-[10px]",
                    aiEnabled ? "text-dim" : "text-amber-400/90",
                  )}
                >
                  {aiEnabled
                    ? "Online · ask me anything"
                    : "Offline mode · portfolio answers only"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMessages([{ id: nextId(), role: "assistant", text: getGreeting() }]);
                  setInput("");
                  inputRef.current?.focus();
                }}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="rounded-lg p-1.5 text-dim transition-colors duration-300 hover:bg-surface2 hover:text-ink"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={close}
                title="Close chat"
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-dim transition-colors duration-300 hover:bg-surface2 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {/* Transcript.
                `min-h-0` is load-bearing: a flex item's automatic minimum size is
                its content, so without it this box refuses to shrink, grows past
                the panel, and pushes the composer out of view. */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
              aria-live="polite"
            >
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
                  >
                    {isUser ? (
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-line/12 bg-surface2 text-dim"
                      >
                        <Bot size={13} />
                      </span>
                    ) : (
                      <Avatar />
                    )}

                    <div
                      className={cn(
                        "flex min-w-0 max-w-[85%] flex-col",
                        isUser ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          isUser
                            ? "rounded-tr-md bg-accent/15 text-ink"
                            : message.isError
                              ? "rounded-tl-md border border-amber-400/30 bg-amber-400/[0.07] text-amber-200"
                              : "rounded-tl-md border border-line/10 bg-surface/80 text-muted",
                        )}
                      >
                        {isUser ? message.text : <MessageBody text={message.text} />}
                      </div>

                      {!isUser && message.section && (
                        <button
                          type="button"
                          onClick={() => jump(message.section!)}
                          className="mt-1.5 inline-flex items-center gap-1.5 self-start rounded-lg border border-accent/25 bg-accent/[0.07] px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-accent transition-colors duration-300 hover:border-accent/50 hover:bg-accent/10"
                        >
                          Jump to {sectionLabel(message.section)}
                          <ArrowRight size={11} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex gap-2.5">
                  <Avatar />
                  <div className="rounded-2xl rounded-tl-md border border-line/10 bg-surface/80">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {latestSuggestions && !isThinking && (
              <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-2">
                {latestSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="chip-interactive shrink-0 whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              className="flex shrink-0 items-center gap-2 border-t border-line/8 px-4 py-3"
            >
              <label htmlFor="chat-input" className="sr-only">
                Message the portfolio assistant
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about the portfolio, or just chat…"
                maxLength={1000}
                autoComplete="off"
                className="field min-w-0 flex-1 py-2.5"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-canvas transition-all duration-300 hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bubble ── */}
      {/*
        `overflow-hidden` and the absolutely-positioned image are both load-bearing.

        This button is `grid place-items-center`, and `place-items-center` sets
        `align-items: center`, which means a grid item is *not* stretched to its
        area. The row is therefore sized by the image, and `h-full` on the image
        resolves against an indefinite height and falls back to `auto` — so it
        renders at its intrinsic 736×736 and bursts straight out of a 48px
        button. `rounded-full` does not stop it: border-radius only clips once
        something is already clipping.

        That matters far more than it looks, because the bubble is the *last*
        child of the fixed wrapper and the panel is the first. With no stacking
        context either side, later DOM order paints on top, so a 736px avatar
        ended up drawn over the conversation the button is supposed to open.

        `absolute inset-0` gives the image a definite containing block to
        resolve against, `overflow-hidden` is the backstop, and the intrinsic
        `width`/`height` let the browser reserve the right box before the image
        loads.
      */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close portfolio assistant" : "Open portfolio assistant"}
        aria-expanded={isOpen}
        className={cn(
          "pointer-events-auto relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full",
          "border border-accent/30 bg-surface/90 backdrop-blur transition-transform duration-300 ease-out",
          "hover:scale-105 active:scale-95 sm:h-14 sm:w-14",
        )}
      >
        {!isOpen && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-accent/20"
          />
        )}
        {isOpen ? (
          <X size={20} className="relative text-accent" aria-hidden="true" />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 rounded-full border-2 border-canvas bg-accent"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AVATAR}
              alt=""
              width={736}
              height={736}
              decoding="async"
              className="absolute inset-0 h-full w-full rounded-full object-cover"
            />
          </>
        )}
      </button>
    </div>
  );
}
