// Server-side chat endpoint.
//
// The LLM key lives here, never in the browser bundle. Two behaviours:
//   1. GEMINI_API_KEY set   -> "Vegapunk" answers freely, grounded in the
//                             portfolio content supplied below.
//   2. no key / call fails  -> falls back to the offline knowledge base, which
//                             only covers the portfolio itself.
//
// Because the endpoint is public, it also carries a small in-memory rate
// limiter. That is per-instance and resets on redeploy, which is the right
// trade-off for a portfolio site.

import { buildContext, getOfflineReply, CHAT_SECTIONS } from "../../../chat/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
// `flash-lite` rather than plain `flash`: on the free tier the larger Flash
// model returns 503 "high demand" very regularly, while the lite tier stayed
// reliable across every payload shape tested. Pinned names like
// `gemini-2.5-flash` have been retired by Google and now 404 for new keys,
// which would silently drop the widget back to offline answers.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
// Per-attempt ceiling for a single Gemini call.
const REQUEST_TIMEOUT_MS = 8000;
// Ceiling for the whole request, retries included. Serverless hosts kill a
// function that overruns its limit, and a killed function surfaces in the
// browser as "Failed to fetch" rather than as an error message. Staying well
// under the platform ceiling means a slow upstream degrades into an offline
// answer instead of a dropped connection.
const TOTAL_BUDGET_MS = 18_000;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 12;
const RATE_LIMIT = { windowMs: 60_000, max: 20 };
// The free tier is flaky under load, so a single transient 503 should not cost
// the visitor a real answer.
const GEMINI_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 600;

// Ask the host for enough room to use the budget above. Ignored by `next dev`.
export const maxDuration = 30;

/** In-memory token buckets, keyed by client IP. */
const buckets = new Map();
let lastSweep = 0;

function rateLimited(key) {
  const now = Date.now();

  // Expired buckets are swept lazily rather than on a timer. A module-scope
  // setInterval holds the event loop open, which stops a serverless instance
  // from ever being frozen and reused, so on a host like Vercel it shows up as
  // random hangs and dropped connections rather than as a tidy cleanup.
  if (now - lastSweep > RATE_LIMIT.windowMs) {
    lastSweep = now;
    for (const [id, entry] of buckets) {
      if (now > entry.resetAt) buckets.delete(id);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT.max;
}

const SYSTEM_INSTRUCTION = `You are Vegapunk, the AI companion built into a personal software portfolio website. You are the site's guide, its shopkeeper, and its conversational partner all at once.

## 1. Portfolio facts are grounded
The CONTEXT below is the authoritative content of the site: the owner's identity, skills, projects, education, achievements, and contact details.
- Answer questions about the owner, the site, or the work from CONTEXT.
- Never invent projects, jobs, certifications, dates, skills, or contact details. If CONTEXT does not cover it, say plainly that it isn't listed on the site yet. Guessing here is the one unforgivable mistake.
- Refer to the owner by name or as "they". Do not infer or use gendered pronouns for them; the site deliberately does not state any, and getting it wrong on someone's own portfolio is worse than a slightly stiff sentence.
- The CONTEXT is background knowledge, not a script. Do not recite it verbatim or announce that you are "using the context".

## 2. Everything else is open conversation
Visitors also just want to talk. Expect casual chat, questions about technology, science, study or career advice, current events, and other topics that have nothing to do with the portfolio.
- Engage naturally and helpfully with these, using your own knowledge.
- Be accurate. If you are unsure, or a question depends on live information you cannot see, say so plainly instead of inventing facts.
- If a question is outside what you can help with at all, say so in one line and steer back to something useful.

## 3. Voice and formatting
- Warm, curious, and a little witty. Confident without showboating. Talk like a knowledgeable person who enjoys the subject, not like a manual.
- Lead with the answer. No filler preambles, no restating the question, no "Great question!".
- Default to under 90 words. Go longer only when the visitor asks for depth, a list, or an explanation.
- Short markdown only: **bold** for names and key terms, "- " bullets for lists. No headings, no tables, and no code blocks unless code is what was asked for.
- Mirror the visitor's language.
- Never claim to have done something you cannot actually do, such as sending email, booking a meeting, or browsing the live web. Offer to point them to a section instead.
- Keep replies to a single message. Do not split your answer across several turns.

## 4. Section navigation
If a section of the site would serve the visitor better than your text alone, end your reply with a final line containing exactly [[go:SECTION_ID]], using one of: ${CHAT_SECTIONS.join(", ")}. Use it only for genuine portfolio topics, never for casual chat. Omit the line otherwise.`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

/**
 * Strips the model's navigation token out of the reply text.
 *
 * Stripping is deliberately permissive while honouring is strict: any
 * `[[go:...]]` is removed so malformed markup can never leak into the chat
 * bubble, but the section is only honoured when it is a known anchor.
 */
function extractSection(text) {
  // Read the id from the original text, then strip every token from it.
  const match = text.match(/\[\[go:([a-z]+)\]\]/i);
  const section = match ? match[1].toLowerCase() : null;

  return {
    text: text.replace(/\[\[go:[^\]]*\]\]/gi, "").trim(),
    section: section && CHAT_SECTIONS.includes(section) ? section : null,
  };
}

/** Normalises the browser's message + history payload into Gemini `contents`. */
function buildContents(message, history) {
  const contents = [];

  for (const turn of history.slice(-MAX_HISTORY)) {
    const role = turn?.role === "assistant" ? "model" : "user";
    const text = String(turn?.text ?? "").slice(0, MAX_MESSAGE_LENGTH).trim();
    if (text) contents.push({ role, parts: [{ text }] });
  }

  // Gemini rejects a conversation that opens with `model`.
  while (contents.length && contents[0].role !== "user") contents.shift();
  if (!contents.length) {
    contents.push({ role: "user", parts: [{ text: "Introduce yourself in one sentence." }] });
    contents.push({
      role: "model",
      parts: [
        {
          text: "I'm Vegapunk, the assistant that lives in this portfolio. Ask me about the work here, or just chat — I'm up for it.",
        },
      ],
    });
  }

  contents.push({ role: "user", parts: [{ text: message }] });
  return contents;
}

/**
 * One attempt at Gemini.
 *
 * Returns the parsed reply, or throws on a transport/status failure so the
 * caller can decide whether the failure is worth retrying. A refusal or empty
 * completion resolves to `null` instead, because retrying those just burns
 * quota.
 */
async function callGemini(apiKey, payload, budgetMs) {
  const response = await fetch(
    `${GEMINI_ENDPOINT}/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Never let one attempt outlive the request's total budget.
      signal: AbortSignal.timeout(Math.max(1000, Math.min(REQUEST_TIMEOUT_MS, budgetMs))),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = new Error(`Gemini responded with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part?.text ?? "").join("").trim();

  if (!text || candidate?.finishReason === "SAFETY") return null;

  const { text: reply, section } = extractSection(text);
  return { reply, section, source: "ai" };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function askGemini(message, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const payload = {
    systemInstruction: {
      parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nCONTEXT:\n${buildContext()}` }],
    },
    contents: buildContents(message, history),
    // Slightly warmer than a pure extractor: Vegapunk is meant to be pleasant
    // to talk to, not just accurate.
    generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 900 },
  };

  // The free tier is regularly overloaded and answers 503 with "high demand",
  // which is transient by definition. One retry turns most of those into a
  // normal reply instead of a silent drop back to the offline bot.
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (let attempt = 1; attempt <= GEMINI_ATTEMPTS; attempt += 1) {
    const remaining = deadline - Date.now();

    // No time left for an attempt that could finish. Answering from the
    // knowledge base now beats being killed by the platform.
    if (remaining < 1500) {
      console.warn("[chat] out of time budget, answering offline instead of retrying.");
      return null;
    }

    try {
      return await callGemini(apiKey, payload, remaining);
    } catch (error) {
      const status = error?.status;
      const transient = status === 429 || status === 503 || status >= 500 || !status;

      if (!transient || attempt === GEMINI_ATTEMPTS) {
        console.error(
          `[chat] Gemini request failed on attempt ${attempt}/${GEMINI_ATTEMPTS}:`,
          error?.message || error,
        );
        return null;
      }

      console.warn(`[chat] Gemini ${status || "network error"}, retrying (attempt ${attempt + 1}).`);
      await sleep(RETRY_BASE_DELAY_MS * attempt);
    }
  }

  return null;
}

/**
 * Health check. Opening /api/chat in a browser is the quickest way to tell
 * "the API is unreachable" apart from "the request was rejected", which is
 * otherwise indistinguishable from the widget side.
 */
export async function GET() {
  return json({ ok: true, aiEnabled: Boolean(process.env.GEMINI_API_KEY), model: MODEL });
}

let warnedNoKey = false;

export async function POST(request) {
  // A missing key is the single most likely reason a deployed chatbot is
  // stuck in offline mode, and it is invisible from the page itself. Say it
  // once per instance so it turns up in the host's logs.
  if (!process.env.GEMINI_API_KEY && !warnedNoKey) {
    warnedNoKey = true;
    console.warn(
      "[chat] GEMINI_API_KEY is not set, so Vegapunk is answering from the offline " +
        "knowledge base. Add it to this deployment's environment variables.",
    );
  }

  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  if (rateLimited(clientKey)) {
    return json({ error: "Too many messages. Give it a moment and try again." }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const message = String(payload?.message ?? "").slice(0, MAX_MESSAGE_LENGTH).trim();
  if (!message) {
    return json({ error: "Message is required." }, 400);
  }

  const history = Array.isArray(payload?.history) ? payload.history : [];
  const offline = getOfflineReply(message);

  // No key configured: the knowledge base is the answer, not a fallback.
  if (!process.env.GEMINI_API_KEY) {
    return json({ ...offline, aiEnabled: false });
  }

  try {
    const ai = await askGemini(message, history);
    if (ai) {
      return json({ ...ai, suggestions: offline.suggestions, aiEnabled: true });
    }
  } catch (error) {
    console.error("[chat] Falling back to offline answers:", error?.message || error);
  }

  return json({ ...offline, aiEnabled: true });
}
