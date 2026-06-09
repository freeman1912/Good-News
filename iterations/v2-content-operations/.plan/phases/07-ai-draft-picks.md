# Phase 07 · AI Draft Picks

Status: completed

## Goal

Reduce daily human review time by generating a small AI-assisted publish draft from the candidate pool.

## Scope

**In scope:**

- Add an `ingest:ai-draft` command.
- Read `data/candidates/YYYY-MM-DD.json`.
- Select only high-confidence candidates.
- Write `data/manual/YYYY-MM-DD.ai-draft.json`.
- Write `data/trials/YYYY-MM-DD-ai-picks.md`.
- Keep final publication manual.

**Out of scope:**

- Automatic homepage publication.
- Full article crawling.
- Reader submission auto-publication.
- Chinese follow-up publishing.

## Tasks

- [x] Add AI draft generation script. (`scripts/ingest/ai-draft.ts:1`)
- [x] Add package command. (`package.json:15`)
- [x] Update daily runbook. (`DAILY_RUNBOOK.md:25`)
- [x] Generate 2026-06-09 draft and picks note. (`data/manual/2026-06-09.ai-draft.json:1`, `data/trials/2026-06-09-ai-picks.md:1`)
- [x] Run typecheck and build. (`npx pnpm typecheck`, `npx pnpm build`)

## Acceptance Criteria

- `npx pnpm ingest:ai-draft -- --date 2026-06-09` writes `data/manual/2026-06-09.ai-draft.json`.
- The command writes `data/trials/2026-06-09-ai-picks.md`.
- Draft items are compatible with `ingest:publish-manual -- --file`.
- Watch-level, roundup, prompt, and low-evidence items do not enter the auto draft by default.
- `npx pnpm typecheck` passes.
- `npx pnpm build` passes.

## Evidence

- `npx pnpm ingest:ai-draft -- --date 2026-06-09` wrote 4 draft items.
- `npx pnpm ingest:publish-manual -- --date 2026-06-09 --file data/manual/2026-06-09.ai-draft.json --dry-run` passed.
- `npx pnpm trial:daily -- --date 2026-06-09 --skip-fetch --skip-score --skip-export --skip-china-leads` regenerated AI picks through the daily command.
