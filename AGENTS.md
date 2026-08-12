<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Moodboard Femmina Prime

## What This Is
The Femmina Prime moodboard: an editorial grid of Tiles, each pairing a Medium
(image or video) with a Text and its Provenance. Domain vocabulary lives in
`CONTEXT.md` — read it before naming anything.

The current UI started as a clone of the moodboard section of
`magdabutrym.com/it-en/moodboard-official`. The emulation phase is over: the
codebase is now in **customisation**, where the cloned layout is progressively
reshaped into Femmina Prime's own product. Cloned components still live under
`src/components/sites/<host>/<page>/` and keep their original structure until
they are rewritten.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Base UI primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** extracted SVGs in `src/components/sites/<host>/shared/icons.tsx`; Lucide React for the rest
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel (`unio-root/moodboard-femmina`)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build
- `vercel deploy --prod` — Publish to production

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Domain first** — names in code match `CONTEXT.md`. A cell is a Tile, not a card.
- **Real content** — actual Texts and Media, never placeholders.
- **Customisation over emulation** — the clone is a starting point, not a target.
  Diverge from the source deliberately, and record the decision in `docs/adr/`.
- **Beauty-first** — every pixel matters.

## Project Structure
```
src/
  app/                  # Next.js routes
  components/
    sites/<host>/       # Components cloned per source page (+ shared/ icons)
    ui/                 # shadcn/ui primitives
  lib/utils.ts          # cn() utility (shadcn)
  types/moodboard.ts    # Tile, Medium, Provenance …
  hooks/
public/
  sites/<host>/<page>/  # Cloned assets: images, videos, fonts, seo
docs/
  adr/                  # Architecture decision records
  agents/               # Agent workflow docs
  design-references/    # Screenshots of the source page, for visual diffing
CONTEXT.md              # Ubiquitous language (glossary only)
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- `public/sites/` holds ~90 MB of cloned media (mostly video). Do not add more
  large binaries without asking — consider Vercel Blob instead.

## Agent skills

### Issue tracker

GitHub Issues on `unio-corp/moodboard-femmina`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context — `CONTEXT.md` at the repo root plus `docs/adr/`. See `docs/agents/domain.md`.
