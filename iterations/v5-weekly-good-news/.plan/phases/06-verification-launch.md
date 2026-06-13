# Phase 06 · Verification And Launch

Status: awaiting review

## Goal

Verify the weekly product end to end before public launch.

## Tasks

- [x] Run `npx pnpm typecheck`.
- [x] Run `npx pnpm build`.
- [x] Run or manually inspect `/`, `/archive`, `/rss`, `/rss.xml`, one topic RSS,
  `/about`, and `/submit`.
- [x] Start the dev server and visually inspect desktop and mobile widths.
- [x] Confirm no public page promises daily updates.
- [x] Confirm RSS copy and generated XML use weekly wording.
- [x] Confirm source and verification text are visible for every weekly item.
- [x] Stop for maintainer review before pushing/deploying.

## Verification

- `npx pnpm typecheck` passed.
- `npx pnpm build` passed and generated 12 pages.
- Static checks covered `/`, `/archive`, `/rss`, `/rss.xml`,
  `/rss/education-culture.xml`, `/about`, and `/submit`.
- RSS parsed successfully with 4 weekly items; RSS item content includes source
  and verification text.
- Browser checks passed on desktop and 390px mobile width at
  `http://localhost:4321/`.
- Published weekly data contains 4 article items, no published video item, and
  no reader-submitted item.

## Acceptance

- Typecheck and build pass.
- Homepage, archive, submit, and RSS match weekly positioning.
- No unreviewed video or reader submission is published.
