# Phase 04 · rss-and-routing

Status: completed

## Goal

Generate valid RSS feeds and confirm homepage, archive, and category routes all read from the same published-news data.

## Tasks

- [x] Implement `/rss.xml` for all published news. (`src/pages/rss.xml.ts:5`, `src/pages/rss.xml.ts:13`)
- [x] Implement `/rss/[slug].xml` for each topic feed. (`src/pages/rss/[slug].xml.ts:7`, `src/pages/rss/[slug].xml.ts:14`, `src/pages/rss/[slug].xml.ts:23`)
- [x] Include summary, why-good text, verification note, source, and original link in RSS items. (`src/lib/rss.ts:25`, `src/lib/rss.ts:41`)
- [x] Ensure RSS output does not include copied full original articles. (`src/lib/rss.ts:25`, command evidence below: `hasRawContent = false`)
- [x] Confirm category pages and RSS feeds share the same category definitions. (`src/lib/rss.ts:2`, `src/lib/rss.ts:48`, `src/pages/rss/[slug].xml.ts:7`, `src/pages/category/[slug].astro:9`)
- [x] Add route-level empty states for categories with no items. (`src/pages/category/[slug].astro:38`)

## Acceptance Criteria

- `/rss.xml` returns valid XML.
- At least one topic RSS feed returns valid XML.
- RSS item content is useful but not full-article copying.
- Archive/category pages and RSS agree on item counts for sample data.

## Evidence

- Implementation:
  - `src/lib/rss.ts` centralizes feed metadata, site URL handling, item content rendering, and news-to-RSS conversion.
  - `src/pages/rss.xml.ts` generates the all-news RSS feed.
  - `src/pages/rss/[slug].xml.ts` generates one RSS feed per `topicDefinitions` entry.
  - `src/lib/news.ts:6` and `src/lib/sources.ts:6` now resolve repository data paths from `process.cwd()` so built endpoints and pages read the same data.
- Commands:
  - `npx pnpm build` passed; generated `/rss.xml` and `/rss/*.xml`.
  - `npx pnpm lint` passed; 24 files, 0 errors, 0 warnings, 0 hints.
  - `npx pnpm typecheck` passed; 24 files, 0 errors, 0 warnings, 0 hints.
- Built XML checks:
  - `dist/rss.xml` parsed as XML with 3 `<item>` nodes.
  - `dist/rss/science-health.xml`, `dist/rss/education-culture.xml`, and `dist/rss/environment-animals.xml` each parsed with 1 item.
  - Empty topic feeds such as `dist/rss/charity-mutual-aid.xml` parsed with 0 items, not invalid XML.
  - RSS content contains `为什么是好消息`, `核实说明`, and `查看原文`; `rawContent` was not present.
- Local HTTP checks on `http://127.0.0.1:4322`:
  - `/rss.xml` returned 200, `application/xml`, 3 items.
  - All 8 RSS links from `/rss` returned 200 and `application/xml`.
  - Category/RSS counts matched for sample topics:
    - `science-health`: 1 RSS item, 1 category article.
    - `education-culture`: 1 RSS item, 1 category article.
    - `environment-animals`: 1 RSS item, 1 category article.
    - `charity-mutual-aid`: 0 RSS items, 0 category articles.
  - Browser DOM check confirmed empty category text is visible for `/category/charity-mutual-aid`.

## Notes

RSS is a core product feature. Do not mark this phase complete if feeds are only placeholder pages.
