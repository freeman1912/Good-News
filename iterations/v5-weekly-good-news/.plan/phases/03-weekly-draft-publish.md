# Phase 03 · Weekly Draft And Publish

Status: pending

## Goal

Generate weekly drafts from daily candidate pools and publish reviewed weekly
issues.

## Tasks

- [ ] Add `scripts/ingest/weekly-draft.ts` to collect `data/candidates/*.json`
  within a week range.
- [ ] Deduplicate weekly candidates by original URL and normalized title.
- [ ] Rank candidates with weekly-specific criteria: human impact,
  ordinary-reader clarity, source trail, aftertaste, and non-PR risk.
- [ ] Write `data/weekly-drafts/YYYY-Www.ai-draft.json`.
- [ ] Write `data/trials/YYYY-Www-weekly-review.md` for human screening.
- [ ] Add `scripts/ingest/weekly-publish.ts` to validate reviewed drafts and
  write `data/weekly/YYYY-Www.json`.
- [ ] Add package scripts `weekly:draft` and `weekly:publish`.
- [ ] Run a draft against the June 8-13 candidate files and inspect output.

## Acceptance

- `npx pnpm weekly:draft -- --week 2026-W24` writes a weekly draft.
- `npx pnpm weekly:publish -- --week 2026-W24 --file data/weekly-drafts/2026-W24.ai-draft.json` writes a weekly issue.
- Duplicate stories that appeared on multiple days are not repeated.

