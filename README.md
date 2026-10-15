# Teerath Jangid — Portfolio

A personal portfolio built with Next.js (App Router), TypeScript, Tailwind CSS
and React Three Fiber. It covers embedded systems and robotics work, carries a
set of persistent themes, includes an in-browser profile photo editor, and
ships a floating AI chat assistant powered by Botpress Webchat.

## Stack

- Next.js 16 (App Router, Turbopack) and React 19
- TypeScript in strict mode
- Tailwind CSS v3, themed entirely through CSS custom properties
- React Three Fiber + three (hero board, lazy and progressively enhanced)
- Framer Motion (reveals and micro-interactions)
- Lucide React for icons; brand marks are hand-rolled in `src/components/ui/BrandIcons.tsx`
- react-easy-crop for the profile photo editor
- Botpress Webchat for the portfolio assistant

## Layout of the source

```
src/
  app/            routes only — layout, page, OG image, robots, sitemap
  components/
    layout/       navbar, footer, theme toggle, boot overlay, scroll field
    hero/         the 3D board scene and its static SVG fallback
    sections/     one file per section, in page order
    ui/           small reusable primitives (reveal, magnetic, icons, cards)
    chat/         the Botpress webchat loader
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

A floating chat widget (bottom-right) is provided by **Botpress Webchat**. The
bot itself — its knowledge, avatar, welcome copy and feature flags — is
configured and trained in Botpress Cloud, not in this repository, so the site
only carries the two-script embed.

- `src/components/chat/BotpressChat.tsx` — loads the embed. Botpress ships a
  `inject.js` loader that defines `window.botpress`, plus a generated config
  bundle that calls `window.botpress.init({ ... })`. The two are dependent, so
  the loader is loaded first and the config is chained off its `onLoad` event:
  the config cannot run before `window.botpress` exists. Chaining also makes the
  load idempotent, so a remount cannot initialise the widget twice.
- Loading stays off the critical path. `inject.js` is ~1.7 MB, so it loads
  `afterInteractive` — it never blocks paint — while both scripts are preloaded
  (`next/script` hints the loader; `BotpressChat` calls React's `preload` for the
  config) and the root layout preconnects to the two CDNs and the webchat API.
  The URLs live in `src/lib/botpress.ts` so the component and the layout share
  one source.
- The config URL is the source of truth for the bot. Change the bot in Botpress
  and the site picks it up on the next load — no code change or redeploy.
- The widget presents the assistant as **Vegapunk**. The generated config does
  not carry a `botName`, so `BotpressChat.tsx` sets it through the public API
  once the widget has initialised (`window.botpress.config()`, which deep-merges
  into the live configuration). Every other value still comes from the remote
  config.

There is no chat API route, no API key and no environment variable to manage.
The endpoint that used to back a hand-rolled assistant has been removed.

To point the site at a different bot, replace the config URL in
`BotpressChat.tsx` with the one from Botpress Studio → Webchat → Deploy
Settings.

## Deploying

`npm run dev` is for local work only. To put the site online:

1. Commit and push the code.
2. Import the repo into Vercel (a `vercel.json` is already present).
3. In Vercel, add `NEXT_PUBLIC_SITE_URL` for the **Production** environment —
   the deployed origin, e.g. `https://your-domain.com`. It is used for canonical
   links, the sitemap, robots and social share URLs, and falls back to
   `localhost:3000` if unset.
4. Redeploy.

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
`src/app/page.tsx`; the section list in `src/data/site.ts` drives the navbar and
the footer together.

Where something genuinely isn't known yet — a certification, an internship, a
lab measurement — the entry is present and marked `placeholder: true`. The
sections render it as a visible "open slot" rather than hiding it or inventing
a result.

`skills.ts` is the exception: it lists only the two domains this portfolio has
always claimed, **Robotics** and **Microprocessor**, with the owner's own words.
A skill is not a placeholder, so add one only once it is real.
