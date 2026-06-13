# Phase 04 · Weekly Pages And RSS

Status: awaiting review

## Goal

Change the public site from daily timeline reading to weekly issue reading.

## Tasks

- [x] Update `src/pages/index.astro` to render the latest weekly issue.
- [x] Add or adapt components for weekly issue sections while reusing
  `NewsEntry.astro` where possible.
- [x] Update `src/pages/archive.astro` to list weekly issues.
- [x] Update `src/pages/rss.astro` copy from daily RSS to weekly RSS.
- [x] Update `src/pages/rss.xml.ts` to read weekly selected stories.
- [x] Update `src/pages/rss/[slug].xml.ts` to read weekly selected stories by
  topic.
- [x] Update `src/pages/submit.astro` copy to say leads may be considered for a
  future weekly issue.
- [x] Remove homepage language that says `今天`, `最近 24 小时`, or `今日时间线`.
- [x] Run `npx pnpm build` and inspect generated RSS XML.

## Verification

- `npx pnpm build` passed.
- Browser checked homepage, archive, RSS page, and mobile homepage at
  `http://localhost:4321/`.
- `http://localhost:4321/rss.xml` returned valid RSS with 4 selected weekly
  items.

## Acceptance

- Homepage says `好消息周报`.
- Archive is week-first.
- RSS remains valid XML.
- Every selected story still shows source and verification text.
