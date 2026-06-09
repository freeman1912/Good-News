# Good News · PRD · v2-content-operations

> This iteration makes the content operation workable before full automation. It answers two product questions: whether OpenAI is required, and where good-news candidates should come from.

## 1. Background

The v1 site already has a static timeline, RSS feeds, starter source pool, and an AI-assisted ingestion pipeline. The next risk is content operations: the project must be able to publish carefully selected good news even when no OpenAI API key is configured, and it must have an explicit source strategy rather than relying on vague "positive news" discovery.

## 2. Goals

- Make OpenAI optional for v1 operation. AI can help classify, translate, summarize, and reject candidates, but it must not be required for publishing.
- Add a manual curation path from fetched candidates to `data/news/YYYY-MM-DD.json`.
- Document source tiers, acceptance criteria, rejection criteria, and daily workflow.
- Keep conservative source handling: fewer credible items are better than many low-quality items.

## 3. Non-Goals

- No CMS or admin backend.
- No login.
- No automatic publishing from reader submissions.
- No paid subscription or gated content.
- No full-text copying from source articles.
- No automatic publication from official sources without human verification.

## 4. User Stories

- As the maintainer, I can fetch candidate links, review them manually, write Chinese summaries and verification notes, and publish without an OpenAI key.
- As the maintainer, I can still use OpenAI later to reduce repetitive triage work.
- As a future contributor, I can understand which sources are trusted, which are only for discovery, and why an item should be accepted or rejected.
- As a reader, I can trust that every published item has a source, an original link, and a short verification note.

## 5. Requirements

- Add a `data/manual/` workflow for hand-written publication drafts.
- Add a script that validates manual drafts against existing candidates and writes published news data.
- Preserve source metadata from the original candidate wherever possible.
- Require `title`, `summary`, `region`, `topic`, `whyGood`, and `verificationNote` for every manual item.
- Document OpenAI as optional for manual mode and required only for automated scoring.
- Document a starting source strategy with tiers:
  - Tier A: constructive/good-news editorial sources.
  - Tier B: discovery/watch sources.
  - Tier C: primary evidence sources used for verification.
  - Chinese sources: cautious discovery only until a stable trustworthy list emerges.

## 6. Acceptance Criteria

- `pnpm ingest:publish-manual -- --date YYYY-MM-DD` can validate and publish a manual draft.
- Missing or invalid manual fields fail with clear errors.
- `OPENAI_API_KEY` is no longer documented as required for basic local publishing.
- A source strategy document explains where candidates come from and how to screen them.
- `pnpm build` and `pnpm typecheck` pass.

