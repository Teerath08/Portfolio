# Teerath Jangid — Portfolio

A personal portfolio built with Next.js (App Router), TypeScript, Tailwind CSS
and React Three Fiber. It covers embedded systems and robotics work, carries a
set of persistent themes, includes an in-browser profile photo editor, and
ships an AI assistant ("Vegapunk") that answers from the site's own content.

## Stack

- Next.js 16 (App Router, Turbopack) and React 19
- TypeScript in strict mode
- Tailwind CSS v3, themed entirely through CSS custom properties
- React Three Fiber + three (hero board, lazy and progressively enhanced)
- Framer Motion (reveals and micro-interactions)
- Lucide React for icons; brand marks are hand-rolled in `src/components/ui/BrandIcons.tsx`
- react-easy-crop for the profile photo editor

## Layout of the source

```
src/
  app/            routes only — layout, page, chat API, OG image, robots, sitemap
  chat/           the assistant's knowledge base and intent matching
  components/
    layout/       navbar, footer, theme toggle, boot overlay, section rail
    hero/         the 3D board scene and its static SVG fallback
    sections/     one file per section, in page order
    ui/           small reusable primitives (reveal, magnetic, icons, cards)
    chat/         the assistant widget
  data/           all portfolio content, one module per topic
  lib/            hooks, theme tokens, motion easings, small helpers
```

Content lives only in `src/data/`. Everything else imports it, so there is one
place to edit a project, a skill or a link.

## Design system

The palette is a set of CSS custom properties defined per theme in
`src/app/globals.css`, mapped to Tailwind colour names in `tailwind.config.js`:

`canvas`, `surface`, `surface2`, `ink`, `muted`, `dim`, `line`, `accent`,
`accent2`.

Because colours are variables, a theme change is a variable swap — not a class
rewrite. Three themes ship: **Workbench** (dark, default), **Blueprint**
(light) and **Lab** (deeper dark). The choice persists in `localStorage` under
`portfolio-theme`.

`bootstrapScript()` in `src/lib/theme.ts` is inlined into the document head and
applies the stored theme before the first paint, which is why there is no flash
of the wrong colours.

> Opacity modifiers like `border-line/12` only work for values present in the
> opacity scale. The design uses fine hairline weights, so `8`, `12` and `18`
> are declared in `tailwind.config.js`. A new one-off value needs either an
> entry there or bracket syntax (`bg-canvas/[0.72]`).

## The 3D hero

`src/components/hero/HeroScene.tsx` renders a low-poly microcontroller board with
react-three-fiber. It is loaded with `dynamic(..., { ssr: false })` and only
mounted when all of the following hold:

- the pointer is precise (mouse or trackpad, not touch)
- the visitor has not asked for reduced motion
- the element is on screen (IntersectionObserver)
- the tab is in front

Otherwise `HeroVisual` renders a static SVG schematic and the same technical
labels in HTML. The page is never blocked on WebGL, and nothing 3D is created
during hydration.

## Portfolio assistant

A floating chat widget (bottom-right) runs **Vegapunk**, the site's AI assistant.
Vegapunk knows this portfolio in detail and will also just talk about anything
else you throw at him.

- `src/app/api/chat/route.ts` — the endpoint, and where Vegapunk's personality
  lives. The system prompt gives him the portfolio content as grounding, lets
  him converse freely on everything else, and tells him never to invent
  portfolio facts. The key is read here, server-side only.
- `src/chat/knowledge.ts` — the offline fallback. A keyword-matched knowledge
  base that answers from `src/data/` alone.
- `src/components/chat/PortfolioChat.tsx` — the widget UI.
- `public/vegapunk.jpg` — his avatar, served locally rather than hotlinked.

### Enabling conversation

Free-form chat needs a key, so add one to `.env`:

```bash
GEMINI_API_KEY=your_key_here   # https://aistudio.google.com/apikey
```

**Use a plain `GEMINI_API_KEY`.** A `NEXT_PUBLIC_`-prefixed variable is inlined
into the client bundle and is readable by every visitor.

Set `GEMINI_MODEL` to override the model. The default is
`gemini-flash-lite-latest`, chosen deliberately: the free tier serves the
larger Flash model unreliably (503 "high demand"), while the lite tier has been
consistently available. Avoid pinned names such as `gemini-2.5-flash` — Google
has retired them and they now return 404.

### Free-tier behaviour worth knowing

Google's free tier is genuinely flaky, so the endpoint retries on 429, 503 and
5xx before giving up and answering from the offline knowledge base. A refusal
or an empty completion is *not* retried, since retrying those just burns quota.

The widget also works with no server at all: the knowledge base is bundled into
the browser, so if `/api/chat` cannot be reached the bot answers locally and
the header switches to "Offline mode" instead of showing an error. It cannot go
silent.

### Behaviour worth knowing

- Portfolio facts are grounded in `src/data/`, so editing your content updates
  what Vegapunk knows with no second place to maintain.
- Out-of-scope questions get an honest "I don't know" instead of an invented
  answer. The same applies to anything not listed on the site.
- Replies that map to a page section show a "Jump to" button. Casual chat does
  not.
- The endpoint is rate limited to 20 messages per minute per IP.
- If the Gemini call fails or times out, it falls back to the offline knowledge
  base, so the widget always replies.

### Deploying so it runs continuously

`npm run dev` is for local work only — it stops when you close it, and the key
in `.env` stays on your machine. To keep Vegapunk online you need to deploy the
site and put the key in the host's environment.

**The key cannot travel through git.** `.env` is gitignored, so pushing the
repo never carries it. It also must not be pasted into `vercel.json` or any
other committed file — that would publish it. It has to be set on the host:

1. Commit and push the code.
2. Import the repo into Vercel (a `vercel.json` is already present).
3. In Vercel, add the environment variables for the **Production** environment:
   - `GEMINI_API_KEY` — the same value from your local `.env`
   - `NEXT_PUBLIC_SITE_URL` — the deployed origin, e.g.
     `https://your-domain.com`. Used for canonical links, the sitemap, robots
     and social share URLs. Defaults to `localhost:3000` if unset.
4. Redeploy. The key is read at request time, so no rebuild of it is needed.

Run `npm run check:chat-env` before deploying. It confirms the key is present
locally and reminds you that the host needs its own copy.

Check the deployed result by opening `https://your-domain/api/chat`:

- `{"ok":true,"aiEnabled":true,...}` — working.
- `"aiEnabled":false` — the variable is missing from that environment. The
  server also logs `[chat] GEMINI_API_KEY is not set...` once per instance,
  which is the fastest way to confirm it from the Vercel logs.

Two things to know about the deployed version:

- The rate limiter is in-memory and per instance, so on a serverless host the
  20/minute cap applies per instance rather than globally. It is a speed bump
  against abuse, not a security control.
- Free Gemini keys have per-minute and per-day request ceilings. When one is
  hit, the endpoint answers from the offline knowledge base instead of failing,
  so visitors see a working bot in a limited mode rather than an error.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # oxlint
npm run build       # next build
npm start
```

## Adding content

Portfolio content is stored in `src/data/`, one module per topic
(`projects.ts`, `skills.ts`, `hardware.ts`, `experience.ts`, `education.ts`,
`labNotes.ts`, `personal.ts`). The page composes sections from
`src/app/page.tsx`; the section list in `src/data/site.ts` drives the navbar,
the section rail and the footer together.

Where something genuinely isn't known yet — a certification, an internship, a
lab measurement — the entry is present and marked `placeholder: true`. The
sections render it as a visible "open slot" rather than hiding it or inventing
a result, and the chatbot reports those buckets as "none listed yet".

`skills.ts` is the exception: it lists only the two domains this portfolio has
always claimed, **Robotics** and **Microprocessor**, with the owner's own words.
A skill is not a placeholder, so add one only once it is real.
