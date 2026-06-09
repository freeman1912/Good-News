# Phase 03 · static-pages

Status: completed

## Goal

Implement all v1 static pages and reusable UI components using the data model from Phase 02.

## Tasks

- [x] Build `NewsEntry.astro` with title, summary, region/topic badges, source, original link, why-good text, and verification note.
- [x] Build `DateGroup.astro` for date-grouped timeline sections.
- [x] Build `FilterBar.astro` for region/topic filters.
- [x] Implement homepage `/` with daily summary, filters, timeline, RSS prompt, principles, and footer.
- [x] Implement `/about` using the content spec.
- [x] Implement `/rss` with all RSS links and copy affordances if feasible without heavy JS.
- [x] Implement `/archive`.
- [x] Implement `/category/[slug]`.
- [x] Implement `/submit` with GitHub Issue guidance.

## Acceptance Criteria

- All PRD pages exist and build.
- Every news entry visibly includes source and verification text.
- Homepage uses the B design direction: light daily briefing, readable timeline, restrained cards/rows.
- Mobile layout remains readable without overlap.

## Evidence

- Components added:
  - `src/components/NewsEntry.astro`
  - `src/components/DateGroup.astro`
  - `src/components/FilterBar.astro`
  - `src/components/RssLinkBlock.astro`
  - `src/components/VerificationNote.astro`
- Pages implemented:
  - `src/pages/index.astro`
  - `src/pages/about.astro`
  - `src/pages/rss.astro`
  - `src/pages/archive.astro`
  - `src/pages/category/[slug].astro`
  - `src/pages/submit.astro`
- Shared site metadata added in `src/lib/site.ts`.
- Commands:
  - `npx pnpm build` passed; 12 static pages generated.
  - `npx pnpm lint` passed; 0 errors, 0 warnings, 0 hints.
  - `npx pnpm typecheck` passed; 0 errors, 0 warnings, 0 hints.
- Browser verification:
  - Desktop homepage rendered with 3 example entries, source text, verification notes, why-good text, RSS link, and submit link.
  - `/rss`, `/archive`, `/category/science-health`, `/submit`, and `/about` loaded successfully.
  - `/rss` rendered 8 copy buttons; clipboard feedback appears even when the local browser blocks clipboard writes.
  - Mobile viewport `390x844` rendered without horizontal overflow after header navigation adjustment.

## Notes

Do not add image thumbnails by default. The site should work without per-news images.
