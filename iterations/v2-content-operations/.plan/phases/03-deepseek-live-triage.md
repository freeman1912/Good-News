---
Phase: 03
Slug: deepseek-live-triage
Status: completed
Gate: self-tested
---

# Phase 03 · DeepSeek Live Triage

## Goal

Use the configured DeepSeek API key to run real AI scoring, tune routing behavior, and reduce the first-day raw candidate pool into a smaller human-review queue.

## Tasks

- [x] Load `.env.local` from the scoring script without printing secrets. (`scripts/ingest/score-candidates.ts:23`)
- [x] Add `INGEST_SCORE_LIMIT` sample mode so paid API tests do not overwrite full scoring output. (`scripts/ingest/score-candidates.ts:347`)
- [x] Tighten DeepSeek prompt enum instructions for `suggestedRegion` and `suggestedTopic`. (`scripts/ingest/score-candidates.ts:290`)
- [x] Accept rejected AI outputs with empty summary fields so they become rejected instead of parse failures. (`scripts/ingest/score-candidates.ts:75`)
- [x] Add stricter routing for stale items and watch sources. (`scripts/ingest/score-candidates.ts:123`)
- [x] Add `INGEST_REROUTE_ONLY` mode to re-apply routing rules without spending API calls. (`scripts/ingest/score-candidates.ts:333`)
- [x] Run DeepSeek sample tests and full scoring on 2026-06-08 candidates. (`npx pnpm ingest:score`, 2026-06-08)
- [x] Route full scored pool into candidate/rejected files. (`npx pnpm ingest:publish`, 2026-06-08: 18 candidates, 62 rejected)
- [x] Document the daily DeepSeek workflow and test controls. (`SOURCE_STRATEGY.md:111`, `DEPLOYMENT.md:35`, `.env.example:20`)

## Verification

- `npx tsc --noEmit`
- `npx pnpm typecheck`
- DeepSeek live sample: 3 items, then 10 items.
- DeepSeek full scoring: 80 items.
- Final route split: 18 candidates, 62 rejected, 0 auto-published.

## Notes

- The model is usable as a first-pass reducer but still too broad to publish from directly.
- Upworthy should remain watch/high-friction; this run rejected all 10 Upworthy items after stricter watch-source rules.
- YES! Magazine remains useful as a selective archive/source of ideas, not as a daily RSS source.

