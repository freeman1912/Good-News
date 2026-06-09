# Phase 01 · Submission Form

Status: completed

## Goal

Make `/submit` usable for ordinary readers by providing a structured lead form that generates a GitHub Issue draft.

## Scope

**In scope:**

- Update submission page copy and form fields.
- Add issue-title/body generation in a small client script.
- Update lead types and review status types.
- Update GitHub Issue template to match the form.
- Add lead review documentation.
- Add a homepage participation entry point.

**Out of scope:**

- Backend API.
- Direct upload.
- AI review automation.
- Public lead listing.

## Tasks

- [x] Create v3 PRD and plan documents. (`iterations/v3-community-leads/PRD.md:1`, `iterations/v3-community-leads/.plan/plan.md:1`)
- [x] Add community lead and review status types. (`src/lib/types.ts:110`)
- [x] Rewrite `/submit` as a reader-friendly lead form. (`src/pages/submit.astro:57`, `src/pages/submit.astro:238`)
- [x] Update GitHub Issue template fields. (`.github/ISSUE_TEMPLATE/good-news-lead.yml:1`)
- [x] Add lead review documentation. (`data/leads/README.md:1`, `SOURCE_STRATEGY.md:113`, `ARCHITECTURE.md:27`)
- [x] Add homepage community-lead entry point. (`src/pages/index.astro:76`)
- [x] Run typecheck and build. (`npx pnpm typecheck`, `npx tsc --noEmit`, `npx pnpm build`)

## Acceptance Criteria

- `/submit` works on mobile and desktop as a normal form.
- Submitting the form opens a GitHub Issue draft with title, body, and labels.
- The page says clearly that submission does not mean publication.
- The review model separates verified news from self-reported or lightly verified daily-kindness leads.
- `npx pnpm typecheck` passes.
- `npx pnpm build` passes.

## Notes

- The repository currently has no `.git` directory, so phase evidence will use file paths and command output rather than commit hashes.
- Browser layout check on `http://127.0.0.1:4322/submit`: no desktop horizontal overflow at 1280px, form and submit button present.
