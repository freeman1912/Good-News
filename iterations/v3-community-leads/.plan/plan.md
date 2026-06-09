# Good News · v3-community-leads · Implementation Plan

## Background

This iteration upgrades reader submissions into a core product loop. The project needs a way for ordinary Chinese readers to submit real good-news leads, including small acts of kindness and underreported public-good work, while preserving conservative editorial standards.

## Scope

**In scope:**

- Ordinary-reader submission form on `/submit`.
- GitHub Issue draft generation from the form.
- Updated GitHub Issue template.
- Lead review statuses and lead data documentation.
- Homepage entry point for community leads.
- Build/type verification.

**Out of scope:**

- Login.
- Comments, likes, voting, or leaderboards.
- File uploads.
- Direct database storage.
- Automatic publication from reader submissions.
- Public display of unverified leads.

## Phase Overview

| Phase | Slug | Goal | Status |
|---|---|---|---|
| 01 | submission-form | Make ordinary-reader lead submission usable through a web form backed by GitHub Issues | completed |

## Key Decisions

- GitHub Issues remains the first backend, but the reader-facing page hides the issue template complexity.
- Reader submissions are leads, not news items.
- The main timeline and RSS remain verified-only.
- A future daily-kindness section may display self-reported or witnessed stories with explicit verification labels.

## Open Questions

- Whether a later phase should add Cloudflare Worker storage to remove the GitHub account requirement.
- Whether `每日好人好事` should become public in v4 or stay as a review-only queue until the trust model is proven.
