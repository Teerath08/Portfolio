# Teerath Jangid Portfolio

A responsive personal portfolio built with Next.js, React, and Tailwind CSS. It includes robotics and microprocessor-focused content, an interactive profile photo editor, smooth section navigation, and persistent light, dark, and neon themes.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Lucide React
- react-easy-crop

## Portfolio assistant

A floating chat widget (bottom-right) runs **Vegapunk**, the site's AI assistant.
Vegapunk knows this portfolio in detail and will also just talk about anything
else you throw at him.

- `src/app/api/chat/route.js` — the endpoint, and where Vegapunk's personality
  lives. The system prompt gives him the portfolio content as grounding, lets
  him converse freely on everything else, and tells him never to invent
  portfolio facts. The key is read here, server-side only.
- `src/chat/knowledge.js` — the offline fallback. A keyword-matched knowledge
  base that answers from `src/data.js` alone.
- `src/components/PortfolioChat.jsx` — the widget UI.
- `public/vegapunk.jpg` — his avatar, served locally rather than hotlinked.

### Enabling conversation

Free-form chat needs a key, so add one to `.env`:

```bash
GEMINI_API_KEY=your_key_here   # https://aistudio.google.com/apikey
```

**Use a plain `GEMINI_API_KEY`.** A `VITE_`-prefixed variable is inlined into
the client bundle and is readable by every visitor.

Set `GEMINI_MODEL` to override the model. The default is
`gemini-flash-lite-latest`, chosen deliberately: the free tier serves the
larger Flash model unreliably (503 "high demand"), while the lite tier has been
consistently available. Avoid pinned names such as `gemini-2.5-flash` — Google
has retired them and they now return 404.

### Free-tier behaviour worth knowing

Google's free tier is genuinely flaky, so the endpoint retries twice on 429,
503, and 5xx before giving up and answering from the offline knowledge base.
A refusal or an empty completion is *not* retried, since retrying those just
burns quota.

The widget also works with no server at all: the knowledge base is bundled into
the browser, so if `/api/chat` cannot be reached the bot answers locally and
the header switches to "Offline mode" instead of showing an error. It cannot go
silent.

### Behaviour worth knowing

- Portfolio facts are grounded in `src/data.js`, so editing your content
  updates what Vegapunk knows with no second place to maintain.
- Out-of-scope questions get an honest "I don't know" instead of an invented
  answer. The same applies to anything not listed on the site.
- Replies that map to a page section show a "Jump to" button. Casual chat does
  not.
- The endpoint is rate limited to 20 messages per minute per IP.
- If the Gemini call fails or times out, it falls back to the offline
  knowledge base, so the widget always replies.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run lint
npm run build
npm start
```

## Content

Portfolio content is stored in `src/data.js`. The main page is `src/app/page.jsx`, global theme and component styles are in `src/app/globals.css`, and reusable sections are in `src/components`.
