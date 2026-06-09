# Phase 02 · data-model

Status: completed

## Goal

Create typed data helpers for categories, sources, and sample news so the UI and RSS layers can consume one consistent model.

## Tasks

- [x] Add category definitions in `src/lib/categories.ts`. (`src/lib/categories.ts`)
- [x] Add TypeScript interfaces for source, candidate, and published news data. (`src/lib/types.ts`)
- [x] Add date helpers for grouping by collected date and latest-24-hour display logic. (`src/lib/dates.ts`)
- [x] Add sample `data/news/YYYY-MM-DD.json` with realistic placeholder good-news entries. (`data/news/2026-06-07.json`)
- [x] Add source loader for `data/sources/sources.yaml`. (`src/lib/sources.ts`; loader command returned 10 sources)
- [x] Add news loader helpers in `src/lib/news.ts`. (`src/lib/news.ts`; loader command returned 3 news items, 2 latest-24-hour items, 2 date groups)

## Acceptance Criteria

- Sample news data can be imported and rendered by a temporary test or page.
- Category labels match `CONTENT.md`.
- Homepage grouping can distinguish today/latest 24 hours from previous dates.
- No database or CMS is introduced.

## Evidence

- `npx tsx -e "...getHomeNewsModel...getSources..."` returned: `allNews: 3`, `latest: 2`, groups `2026-06-07: 2` and `2026-06-06: 1`, `sources: 10`.
- `npx pnpm build` passed after data helpers were wired into the homepage.
- `npx pnpm typecheck` / `npx pnpm lint` passed with 0 errors, 0 warnings, 0 hints.
- Browser verification at `http://127.0.0.1:4322/` confirmed h1 `今日好消息`, example title visible, date group `2026-06-07` visible, `示例数据` badge visible, and latest count `2 条` visible.

## Notes

Sample news should be clearly marked as example data and should not pretend to be real current news.
