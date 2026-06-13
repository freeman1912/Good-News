# Phase 01 · Spec Sync

Status: awaiting review

## Goal

Update project specifications and public copy direction so future implementation
uses weekly language and weekly editorial standards.

## Tasks

- [x] Update `BRIEF.md` from daily timeline wording to weekly brief wording.
- [x] Update `SOURCE_STRATEGY.md` daily rhythm section to weekly rhythm.
- [x] Update `DAILY_RUNBOOK.md` or create `WEEKLY_RUNBOOK.md` so operators know
  daily ingestion is discovery and weekly publishing is public.
- [x] Update `README.md` to describe weekly public publishing.
- [x] Keep `ARCHITECTURE.md` in sync where it describes ingestion and scheduled
  publishing.
- [x] Run `npx pnpm typecheck` to catch accidental Markdown import or config
  issues.
- [ ] Maintainer confirms the new weekly wording feels right.

## Acceptance

- Specs no longer promise daily public updates.
- Specs say no fixed weekly story count is promised.
- Science/technology criteria mention human meaning and ordinary-reader
  understandability.
- Video leads are documented as non-automatic, verification-gated leads.
