# Phase 06 · verification-launch

Status: completed

## Goal

Verify the complete v1 experience, polish responsive and accessibility issues, and prepare deployment on Cloudflare Pages.

## Tasks

- [x] Run `pnpm build`. (command evidence below)
- [x] Run lint/typecheck commands if configured. (command evidence below)
- [x] Verify desktop homepage visually. (browser evidence below; screenshot `.codex/screenshots/phase06-home-desktop.png`)
- [x] Verify mobile homepage visually. (browser evidence below; screenshot `.codex/screenshots/phase06-home-mobile.png`)
- [x] Verify `/rss.xml` and at least one topic feed. (RSS XML evidence below)
- [x] Check source/verification visibility on every news entry. (browser evidence below)
- [x] Check keyboard focus and link accessibility. (DOM accessibility evidence below)
- [x] Document Cloudflare Pages build settings. (`DEPLOYMENT.md:27`, `DEPLOYMENT.md:32`)
- [x] Document required environment variables. (`DEPLOYMENT.md:56`, `DEPLOYMENT.md:60`, `.env.example:1`, `.env.example:2`, `.env.example:3`, `.env.example:4`)

## Acceptance Criteria

- Build passes.
- No obvious mobile text overlap or broken layout.
- RSS feeds are reachable and valid.
- The site still follows BRIEF boundaries and DESIGN do's/don'ts.
- Deployment notes are ready for the user.

## Evidence

- Documentation:
  - Added `DEPLOYMENT.md` with local commands, Cloudflare Pages settings, GitHub Actions settings, safety defaults, and pre-launch checklist.
  - Added configurable GitHub Issue link via `PUBLIC_GITHUB_ISSUE_URL`. (`src/lib/site.ts:8`, `src/lib/site.ts:9`)
  - Updated submit page copy to point maintainers to `PUBLIC_GITHUB_ISSUE_URL`. (`src/pages/submit.astro:38`)
  - Updated workflow env and architecture env docs. (`.github/workflows/ingest.yml:16-19`, `ARCHITECTURE.md:348-354`)
- Command verification:
  - `npx pnpm build` passed; generated 12 static pages plus RSS XML routes.
  - `npx pnpm lint` passed; 29 files, 0 errors, 0 warnings, 0 hints.
  - `npx pnpm typecheck` passed; 29 files, 0 errors, 0 warnings, 0 hints.
  - YAML parse check passed for `.github/workflows/ingest.yml`, `.github/ISSUE_TEMPLATE/good-news-lead.yml`, and `data/sources/sources.yaml`.
  - `$env:FEED_FETCH_TIMEOUT_MS='8000'; npx pnpm ingest` passed; fetched 80 unique candidates, routed 80 to review candidates, published 0 automatically, recorded 1 fetch error.
- RSS verification:
  - `dist/rss.xml`: 3 items, contains `为什么是好消息`, `核实说明`, and `查看原文`, does not contain `rawContent`.
  - `dist/rss/science-health.xml`: 1 item, contains the same verification fields.
  - `dist/rss/environment-animals.xml`: 1 item, contains the same verification fields.
- Browser verification on `http://127.0.0.1:4322`:
  - Desktop homepage rendered `今日好消息` with 3 article elements.
  - Every homepage article included source text, verification text, and why-good text.
  - Homepage did not include `好消息指数`.
  - Mobile viewport `390x844` had no horizontal overflow and rendered 3 articles.
  - `/rss`, `/submit`, `/category/charity-mutual-aid`, and `/about` all loaded with expected headings/text.
  - Empty category state was visible for `/category/charity-mutual-aid`.
- Accessibility/link checks:
  - DOM check found 21 focusable links/buttons on the homepage.
  - No focusable element was missing accessible text.
  - External links with `target="_blank"` had `noopener noreferrer`.
  - Global `:focus-visible` CSS rule exists.
  - Direct Tab simulation stayed on `body` in the in-app browser, so runtime keyboard traversal could not be conclusively observed with this tool; DOM/CSS focusability checks passed.
- Screenshots:
  - `.codex/screenshots/phase06-home-desktop.png`
  - `.codex/screenshots/phase06-home-mobile.png`

## Notes

Do not commit on behalf of the user. Provide a suggested commit message after approval.

Suggested commit message after user approval: `feat: launch Good News v1 static site and ingestion pipeline`
