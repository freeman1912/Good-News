# Phase 06 · Chinese Trackable Review

Status: completed

## Goal

Make Chinese-source review stricter by requiring result visibility or explicit follow-up tracking before a lead can become published good news.

## Scope

**In scope:**

- Add trackability and verification status types.
- Document Chinese review routes: publish, follow-up, reject.
- Define a fixed Chinese source pool grouped by theme.
- Re-review the 2026-06-09 Chinese shortlist using trackability rules.
- Run typecheck and build.

**Out of scope:**

- Automated Chinese web search scraping.
- Full-text crawling.
- Public follow-up pages.
- Automatic publication.

## Tasks

- [x] Add trackability and follow-up types. (`src/lib/types.ts:132`)
- [x] Add Chinese fixed source pool configuration. (`data/sources/china-fixed-sources.yaml:1`)
- [x] Update source strategy and Chinese playbook. (`SOURCE_STRATEGY.md:166`, `CHINA_SOURCE_PLAYBOOK.md:13`)
- [x] Re-score the 2026-06-09 Chinese shortlist by publish/follow-up/reject. (`data/trials/2026-06-09-china-shortlist.md:1`, `data/trials/2026-06-09-china-rerun.md:1`)
- [x] Run typecheck and build. (`npx pnpm typecheck`, `npx pnpm build`)

## Acceptance Criteria

- Chinese candidates can be labeled as `publishable`, `follow-up`, or `rejected`.
- "Approved/launched/announced" items are not treated as publishable unless results are visible.
- The fixed Chinese source pool is grouped by theme and role.
- The 2026-06-09 Chinese shortlist is rewritten with stricter tracking decisions.
- `npx pnpm typecheck` passes.
- `npx pnpm build` passes.
