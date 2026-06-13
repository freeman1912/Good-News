# Phase 02 · Weekly Data Model

Status: completed

## Goal

Add a weekly issue model while preserving existing daily candidate data.

## Tasks

- [x] Extend `src/lib/types.ts` with `WeeklyIssue`, `WeeklyGoodNewsItem`, and
  `WeeklyWatchItem`.
- [x] Add `src/lib/weeks.ts` with helpers for ISO-like week ids, week date
  ranges, and candidate filtering by collected/scored date.
- [x] Add `src/lib/weekly.ts` to read `data/weekly/*.json`, sort issues, and
  expose the latest issue.
- [x] Add sample weekly data under `data/weekly/2026-W24.json` using existing
  June trial items that fit the new editorial standard.
- [x] Add small validation helpers so malformed weekly JSON fails during build.
- [x] Run `npx pnpm typecheck`.

## Acceptance

- Weekly issue JSON can be read at build time.
- Latest weekly issue can be loaded by Astro pages.
- Old daily news files remain untouched.
