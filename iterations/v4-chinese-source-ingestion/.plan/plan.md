# v4 Chinese Source Ingestion · Phase Plan

## Background

English RSS ingestion can already produce daily homepage/RSS items. Chinese
discovery currently produces search tasks, not fetched article candidates. This
iteration adds a conservative real Chinese webpage ingestion lane so Chinese
items can enter the same AI scoring and review pipeline.

## Scope

Do:

- Add a configurable Chinese webpage source model.
- Implement generic listing-page and article-page fetching.
- Merge Chinese candidates into daily fetched candidates.
- Keep strict routing for Chinese official/watch sources.
- Verify with one daily run and record review notes.

Do not:

- Crawl WeChat, short-video platforms, login-only pages, paywalls, or CAPTCHA.
- Auto-publish official or organizational self-reports.
- Add a database or backend service.

## Phase Overview

| Phase | Goal | Status |
| --- | --- | --- |
| 01-chinese-web-candidates | Fetch Chinese webpage articles into the existing candidate pipeline | completed |

## Key Decisions

- Start with generic HTML discovery rather than source-specific scrapers.
- Prefer conservative false negatives over noisy Chinese publication.
- Treat Chinese candidates as score/review inputs first; publication remains
  gated by the existing AI draft and manual/PR review flow.

## Open Questions

- Which Chinese source pages will remain stable enough for daily crawling?
- Which sources deserve source-specific adapters after the generic crawler shows
  real yield?
