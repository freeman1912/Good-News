# Good News · v1-launch · Implementation Plan

> This plan manages implementation for `iterations/v1-launch`. Each phase has its own file under `iterations/v1-launch/.plan/phases/`.

## Background

Good News v1 is a Chinese good-news aggregator with a light daily timeline, RSS subscriptions, transparent source verification, and a conservative AI-assisted ingestion workflow. The project should launch as a static-first Astro site before adding automation complexity.

## Scope

**In scope:**

- Astro 6 + TypeScript project scaffold
- Tailwind v4 styling based on `DESIGN.md`
- Static pages from the PRD
- Structured news/source data
- Date-grouped homepage timeline
- Category pages and RSS endpoints
- GitHub Issue submission entry
- Ingestion scripts for RSS/source candidates
- AI scoring script with schema validation
- GitHub Actions scheduled workflow in PR mode
- Build, RSS, accessibility, and responsive verification

**Out of scope for v1:**

- Login/register
- Comments
- Backend admin/CMS
- Database
- Paid subscriptions
- Email subscription
- Mobile app
- Automatic publishing of reader submissions
- Good-news score/gamification

## Phase Overview

| Phase | Slug | Goal | Status |
|---|---|---|---|
| 01 | project-scaffold | Create Astro/Tailwind project foundation and shared layout | completed |
| 02 | data-model | Add categories, sample news data, source pool loading, and typed helpers | completed |
| 03 | static-pages | Implement homepage, about, RSS page, archive, category, and submit pages | completed |
| 04 | rss-and-routing | Generate valid RSS feeds and ensure archive/category/date grouping behavior | completed |
| 05 | ingestion-pipeline | Add feed fetching, dedupe, AI scoring schema, candidate/published data flow, and GitHub Actions PR mode | completed |
| 06 | verification-launch | Run build/type/lint/browser checks, polish responsive states, and prepare deployment notes | completed |

## Key Decisions

- Build the visible static site before the ingestion pipeline so the user can inspect the product experience early.
- Store v1 content in repository data files instead of adding a database.
- Treat RSS as a first-class feature and verify it before considering the static site complete.
- Keep AI ingestion conservative: candidate data first, PR review before automatic publishing.
- Do not add dependencies outside `ARCHITECTURE.md` unless the spec is updated.

## Open Questions

- Final production domain is not chosen yet.
- Analytics provider is optional and can be deferred.
- Some starter source RSS URLs may need verification during the ingestion phase.
- The first real source list should be reviewed after the pipeline runs for several days.
