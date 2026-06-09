---
Phase: 02
Slug: deepseek-and-day-one
Status: completed
Gate: self-tested
---

# Phase 02 · DeepSeek And Day-One Trial

## Goal

Support low-cost DeepSeek AI scoring, expand the source strategy with China/domestic discovery sources, and run a first-day real content trial with conservative manual publishing.

## Tasks

- [x] Add DeepSeek-compatible scoring configuration. (`scripts/ingest/score-candidates.ts:16`, `scripts/ingest/score-candidates.ts:196`, `scripts/ingest/score-candidates.ts:232`)
- [x] Update environment, deployment, and source strategy docs for DeepSeek. (`.env.example:1`, `.github/workflows/ingest.yml:14`, `DEPLOYMENT.md:63`, `SOURCE_STRATEGY.md:5`)
- [x] Research and add cautious China/domestic discovery sources. (`data/sources/sources.yaml:119`, `SOURCE_STRATEGY.md:58`, `iterations/v1-launch/CONTENT.md:253`)
- [x] Fetch first-day candidates from the current source pool. (`npx pnpm ingest:fetch`, 2026-06-08: 80 candidates, 1 fetch error)
- [x] Review candidates and publish a small real day-one batch when verification is strong enough. (`data/manual/2026-06-08.json:1`, `data/news/2026-06-08.json:1`)
- [x] Verify homepage and RSS build. (`npx tsc --noEmit`, `npx pnpm typecheck`, `npx pnpm build`, homepage title check, RSS title check, 2026-06-08)

## Verification

- `npx tsc --noEmit`
- `npx pnpm typecheck`
- `npx pnpm build`
- `npx pnpm ingest:fetch`
- `npx pnpm ingest:score` should work with no API key and be ready for DeepSeek when env vars are present.

## Notes

- No DeepSeek key is available in the current workspace, so AI scoring can be wired and documented but not live-called unless a key is later provided.
- China/domestic sources should be treated as discovery/watch sources first. Avoid official-positive-energy feeds as core sources.
- A local mock API attempt exposed process-control friction in the test harness, not a TypeScript/build failure. The project code type-checks; live DeepSeek verification should be run after `DEEPSEEK_API_KEY` is configured.
- The real day-one batch intentionally published 7 items, below the 8-12 target, because the candidate pool had many old, opinion, or viral pieces.
