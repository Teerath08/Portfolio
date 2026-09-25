"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, User, RotateCcw, ArrowRight } from "lucide-react";
import { navigateToSection } from "../utils/thunder";
import { getGreeting, getStarterSuggestions, getOfflineReply } from "../chat/knowledge";

let messageId = 0;
const nextId = () => `msg-${++messageId}`;

/**
 * Vegapunk's face. Served from /public rather than hotlinked, because Pinterest
 * CDN URLs are not stable and reject some referrers.
 */
const AVATAR = "/vegapunk.jpg";

/**
 * Minimal inline markdown: **bold** and _italic_. Enough for the reply
 * formatting the bot produces, and it keeps the component dependency-free.
 */
function renderInline(text, keyPrefix) {
  const parts = [];
  const pattern = /\*\*(.+?)\*\*|_(.+?)_/g;
  let cursor = 0;
  let index = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-bold text-zinc-100">
          {match[1]}
        </strong>,
      );
    } else {
      parts.push(
        <em key={`${keyPrefix}-i${index}`} className="italic text-zinc-300">
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
function MessageBody({ text }) {
  const blocks = String(text || "").split(/\n{2,}/);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");
    const isList = lines.length > 0 && lines.every((line) => /^\s*[-*]\s+/.test(line));

    if (isList) {
      return (
        <ul key={blockIndex} className="my-1.5 space-y-1.5 first:mt-0 last:mb-0">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex} className="flex gap-1.5">
              <span aria-hidden="true" className="text-red-500 select-none leading-snug">
                ▸
              </span>
              <span className="min-w-0">{renderInline(line.replace(/^\s*[-*]\s+/, ""), `${blockIndex}-${lineIndex}`)}</span>
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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" role="status" aria-label="Assistant is typing">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="w-1.5 h-1.5 rounded-full bg-red-500"
          style={{ animation: `chatTyping 1.2s ease-in-out ${dot * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const openedOnce = useRef(false);

  /* Keep the transcript pinned to the newest message. */
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isThinking]);

  /* Focus the composer on open, restore focus to the bubble on Escape. */
  useEffect(() => {
    if (!isOpen) return;

    if (!openedOnce.current) {
      openedOnce.current = true;
      setMessages([{ id: nextId(), role: "assistant", text: getGreeting() }]);
    }
    inputRef.current?.focus();

    const handleKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (raw) => {
      const text = String(raw || "").trim();
      if (!text || isThinking) return;

      const history = messages
        .filter((message) => message.text)
        .map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          text: message.text,
        }))
        .slice(-6);

      setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
      setInput("");
      setIsThinking(true);

      const pushReply = (reply) =>
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", ...reply }]);

      try {
        // Bound the wait, so a request that never resolves cannot leave the
        // typing dots on screen forever.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25_000);

        let payload;
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
          clearTimeout(timer);
        }

        if (!payload) throw new Error("The server sent a reply the widget could not read.");

        setAiEnabled(Boolean(payload.aiEnabled));
        pushReply({
          text: payload.reply || "I'm not sure how to answer that.",
          section: payload.section || null,
          suggestions: payload.suggestions || null,
        });
      } catch (error) {
        if (error?.fatal) {
          pushReply({ text: error.message, isError: true });
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
            error?.message || error,
          );
        }
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{ id: nextId(), role: "assistant", text: getGreeting() }]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleJump = (section) => {
    setIsOpen(false);
    navigateToSection(section);
  };

  const latestSuggestions = (() => {
    if (messages.length === 0) return getStarterSuggestions();
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].suggestions?.length) return messages[i].suggestions;
    }
    return null;
  })();

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {/* ─── Panel ───
          Only one class from each conflicting group (`flex`/`hidden`, the
          height utilities) is ever mounted at a time. Relying on Tailwind's
          source order to decide which of two same-property utilities wins is
          fragile, and here it silently kept the closed-state transform. */}
      <div
        className={`w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-2xl border border-red-900/60 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-red-950/50 ${
          isOpen ? "flex h-[min(70vh,540px)] animate-fade-in" : "hidden"
        }`}
        role="dialog"
        aria-label="Portfolio assistant"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-red-950/70 bg-gradient-to-r from-red-950/50 to-zinc-950/20 shrink-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center border border-red-400/30 shadow-lg shadow-red-900/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AVATAR} alt="Vegapunk" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white leading-tight truncate">Vegapunk</p>
            <p className={`text-[10px] font-mono truncate ${aiEnabled ? "text-zinc-400" : "text-amber-400/90"}`}>
              {aiEnabled ? "Online · ask me anything" : "Offline mode · portfolio answers only"}
            </p>
          </div>

          <button
            onClick={handleReset}
            title="Clear conversation"
            aria-label="Clear conversation"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              triggerRef.current?.focus();
            }}
            title="Close chat"
            aria-label="Close chat"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Transcript */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
          aria-live="polite"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border ${
                    isUser
                      ? "bg-zinc-800 border-red-950 text-zinc-300"
                      : "bg-gradient-to-br from-red-600 to-red-800 border-red-400/30"
                  }`}
                >
                  {isUser ? (
                    <User size={13} />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={AVATAR} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className={`min-w-0 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl rounded-tr-md shadow-lg shadow-red-900/30"
                        : message.isError
                          ? "bg-rose-950/50 border border-rose-800/60 text-rose-200 rounded-2xl rounded-tl-md"
                          : "bg-zinc-900/90 border border-red-950/70 text-zinc-300 rounded-2xl rounded-tl-md"
                    }`}
                  >
                    {isUser ? message.text : <MessageBody text={message.text} />}
                  </div>

                  {!isUser && message.section && (
                    <button
                      onClick={() => handleJump(message.section)}
                      className="mt-1.5 self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/60 text-[11px] font-semibold text-red-300 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
                    >
                      Jump to {message.section}
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-600 to-red-800 border border-red-400/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={AVATAR} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="bg-zinc-900/90 border border-red-950/70 rounded-2xl rounded-tl-md">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* Quick replies */}
        {latestSuggestions && !isThinking && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {latestSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900 border border-red-950 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-red-950/70 shrink-0">
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
            tabIndex={isOpen ? 0 : -1}
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-red-950 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white border border-red-400/30 shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-red-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* ─── Bubble ─── */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close portfolio assistant" : "Open portfolio assistant"}
        aria-expanded={isOpen}
        className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center border border-red-400/40 shadow-2xl shadow-red-900/50 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
        )}
        {isOpen ? (
          <X size={22} className="text-white relative" />
        ) : (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-background" />
            <img
              src={AVATAR}
              alt=""
              className="w-full h-full rounded-full object-cover relative ring-1 ring-red-400/30"
            />
          </>
        )}
      </button>
    </div>
  );
}
