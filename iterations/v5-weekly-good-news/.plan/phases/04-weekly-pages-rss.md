# Phase 04 · Weekly Pages And RSS

Status: pending

## Goal

Change the public site from daily timeline reading to weekly issue reading.

## Tasks

- [ ] Update `src/pages/index.astro` to render the latest weekly issue.
- [ ] Add or adapt components for weekly issue sections while reusing
  `NewsEntry.astro` where possible.
- [ ] Update `src/pages/archive.astro` to list weekly issues.
- [ ] Update `src/pages/rss.astro` copy from daily RSS to weekly RSS.
- [ ] Update `src/pages/rss.xml.ts` to read weekly selected stories.
- [ ] Update `src/pages/rss/[slug].xml.ts` to read weekly selected stories by
  topic.
- [ ] Update `src/pages/submit.astro` copy to say leads may be considered for a
  future weekly issue.
- [ ] Remove homepage language that says `今天`, `最近 24 小时`, or `今日时间线`.
- [ ] Run `npx pnpm build` and inspect generated RSS XML.

## Acceptance

- Homepage says `好消息周报`.
- Archive is week-first.
- RSS remains valid XML.
- Every selected story still shows source and verification text.

