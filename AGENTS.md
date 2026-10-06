<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- UI comes from beUI: prefer an existing component in `components/motion` or `components/charts`
  (see `.claude/skills/beui/SKILL.md`) over a hand-rolled widget. These are vendored sources —
  keep edits minimal and note them in README.
- Shikimori is only called from the server through `lib/shikimori/api.ts` (rate limit, User-Agent,
  caching). Client components use the `/api/*` route handlers.
- UI text is Russian. Labels and formatting helpers live in `lib/shikimori/format.ts`.
- Schema changes: edit `lib/db/schema.ts`, then `bun run db:generate` and `bun run db:migrate`.
- Before committing: `bun run check` and `bun run build`.
- `SHIKIMORI_MOCK=1` serves offline fixtures from `lib/shikimori/mock.ts`.
