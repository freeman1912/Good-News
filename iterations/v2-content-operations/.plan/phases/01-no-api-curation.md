---
Phase: 01
Slug: no-api-curation
Status: completed
Gate: self-tested
---

# Phase 01 · No-API Curation

## Goal

Allow the project to publish manually curated good-news items from fetched candidates without requiring an OpenAI API key, and document where candidates should come from.

## Tasks

- [x] Create v2 PRD and phase plan. (`iterations/v2-content-operations/PRD.md:9`, `iterations/v2-content-operations/.plan/plan.md:17`)
- [x] Add manual draft documentation under `data/manual/`. (`data/manual/README.md:9`)
- [x] Add `publish-manual` ingestion script. (`scripts/ingest/publish-manual.ts:6`, `scripts/ingest/publish-manual.ts:188`)
- [x] Add package command for manual publishing. (`package.json:16`)
- [x] Write source strategy documentation. (`SOURCE_STRATEGY.md:5`, `SOURCE_STRATEGY.md:18`, `SOURCE_STRATEGY.md:79`)
- [x] Update environment/deployment docs so OpenAI is optional for manual mode. (`.env.example:1`, `DEPLOYMENT.md:26`, `DEPLOYMENT.md:96`, `ARCHITECTURE.md:5`)
- [x] Run build and type verification. (`npx tsc --noEmit`, `npx pnpm typecheck`, `npx pnpm build`, 2026-06-08)

## Verification

- `pnpm typecheck`
- `pnpm build`
- Manual publish script validates arguments and draft schema.

## Notes

- This phase should stop after self-test so the maintainer can inspect the workflow before real daily publishing starts.
- Dry-run manual publishing passed with a temporary draft and did not write `data/news/`. (`npx pnpm ingest:publish-manual -- --date 2026-06-07 --file data/manual/2026-06-07.dry-run.json --dry-run`, 2026-06-08)
