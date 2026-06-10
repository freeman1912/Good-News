# Phase 01 · Chinese Web Candidates

Status: completed

## Goal

Fetch real Chinese webpage articles from configured source pages and merge them
into the existing daily candidate pipeline.

## Tasks

- [x] Add v4 PRD and phase plan. (`iterations/v4-chinese-source-ingestion/PRD.md`, this file)
- [x] Extend source types/config for webpage discovery. (`src/lib/types.ts`, `data/sources/sources.yaml`)
- [x] Implement generic Chinese listing/article fetcher. (`scripts/ingest/fetch-feeds.ts`)
- [x] Merge Chinese web candidates into `ingest:fetch`. (`npx pnpm trial:daily -- --date 2026-06-10 --skip-score --skip-export --skip-ai-draft --skip-publish-ai-draft --skip-china-leads`)
- [x] Add daily report visibility for Chinese fetched candidates. (`scripts/ingest/daily-trial.ts`, `data/trials/2026-06-10-daily-review.md`)
- [x] Run a daily trial and review whether any Chinese item reaches publication. (`data/trials/2026-06-10-china-review.md`)
- [x] Run typecheck/build. (`npx pnpm typecheck`, `npx pnpm build`)

## Acceptance

- `npx pnpm trial:daily -- --date 2026-06-10 --skip-score --skip-export --skip-ai-draft --skip-publish-ai-draft --skip-china-leads` can fetch Chinese candidates.
- Generated fetched candidates include at least one `language: "zh"` candidate
  when reachable sources return usable pages.
- `npx pnpm typecheck` passes.
- `npx pnpm build` passes.
