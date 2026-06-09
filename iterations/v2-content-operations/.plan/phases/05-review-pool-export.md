# Phase 05 · Review Pool Export

Status: completed

## Goal

Make daily trial runs easier to review by exporting `data/candidates/YYYY-MM-DD.scored.json` into separate candidate and rejected pools.

## Scope

**In scope:**

- Add an export script that reads a scored file.
- Write `data/candidates/YYYY-MM-DD.json` for review candidates.
- Write `data/rejected/YYYY-MM-DD.json` for rejected scored items.
- Add a package script.
- Document the command in deployment/trial workflow notes.
- Verify with the 2026-06-09 trial data.

**Out of scope:**

- Automatic publishing.
- Manual publication drafting.
- AI re-scoring.
- Chinese search-result scraping.

## Tasks

- [x] Add scored export script. (`scripts/ingest/export-scored.ts:1`)
- [x] Add package command. (`package.json:14`)
- [x] Document the review-pool export step. (`DEPLOYMENT.md:51`, `data/trials/2026-06-09.md:60`)
- [x] Run export for 2026-06-09 trial data. (`npx pnpm ingest:export-scored -- --date 2026-06-09`)
- [x] Run typecheck and build. (`npx pnpm typecheck`, `npx pnpm build`)

## Acceptance Criteria

- `npx pnpm ingest:export-scored -- --date 2026-06-09` creates `data/candidates/2026-06-09.json`.
- The same command creates `data/rejected/2026-06-09.json`.
- Candidate and rejected counts match the scored routes.
- The command does not call an AI provider.
- `npx pnpm typecheck` passes.
- `npx pnpm build` passes.
