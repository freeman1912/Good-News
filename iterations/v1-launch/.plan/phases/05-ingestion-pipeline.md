# Phase 05 · ingestion-pipeline

Status: completed

## Goal

Create the first conservative ingestion pipeline: fetch source candidates, dedupe them, score with AI structured output, and write published/candidate/rejected data files.

## Tasks

- [x] Add feed fetching script for `data/sources/sources.yaml`. (`scripts/ingest/fetch-feeds.ts:99`, `scripts/ingest/fetch-feeds.ts:132`, `scripts/ingest/fetch-feeds.ts:155`)
- [x] Add normalization and dedupe utilities. (`scripts/ingest/normalize.ts:12`, `scripts/ingest/normalize.ts:61`, `scripts/ingest/dedupe.ts:9`)
- [x] Add AI scoring schema and parser. (`scripts/ingest/score-candidates.ts:38`, `scripts/ingest/score-candidates.ts:145`, `scripts/ingest/score-candidates.ts:250`)
- [x] Add conservative rules for publish/candidate/rejected routing. (`scripts/ingest/score-candidates.ts:91`, `scripts/ingest/score-candidates.ts:136`, `scripts/ingest/publish.ts:19`)
- [x] Add scripts that write `data/candidates/`, `data/rejected/`, and optionally `data/news/`. (`scripts/ingest/fetch-feeds.ts:147`, `scripts/ingest/publish.ts:68`, `scripts/ingest/publish.ts:71`)
- [x] Add GitHub Issue template for submitted good-news leads. (`.github/ISSUE_TEMPLATE/good-news-lead.yml:1`)
- [x] Add GitHub Actions workflow with scheduled/manual trigger. (`.github/workflows/ingest.yml:4`)
- [x] Configure workflow to create a PR rather than silently auto-publish. (`.github/workflows/ingest.yml:50`, `.github/workflows/ingest.yml:58`)

## Acceptance Criteria

- Ingestion can run manually against starter sources.
- AI output is schema-validated before writing files.
- Official-risk and watch-level sources do not auto-publish without conservative checks.
- Workflow can run in PR mode.
- Reader-submitted issues are not connected to automatic publishing.

## Evidence

- Implementation:
  - Added TypeScript ingestion scripts and package commands: `package.json:13-16`.
  - Added direct feed/parser runtime dependencies: `package.json:22`, `package.json:29`; architecture synced at `ARCHITECTURE.md:15-17`.
  - Added AI scoring and routing types: `src/lib/types.ts:57`, `src/lib/types.ts:75`.
  - Added `.env.example` documenting `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, `PUBLIC_SITE_URL`, and `ALLOW_AUTOPUBLISH`.
- Source updates:
  - `good-good-good` and `goodnet` were downgraded from RSS sources to site sources because checked RSS-style URLs returned HTML or 404/redirect errors during implementation. (`data/sources/sources.yaml:68`, `data/sources/sources.yaml:98`)
  - `good-news-network` RSS URL works in PowerShell but timed out in Node fetch in this local environment; the script records this as a fetch error instead of blocking the pipeline.
- Manual ingestion run:
  - Command: `$env:FEED_FETCH_TIMEOUT_MS='8000'; npx pnpm ingest`
  - Result: fetched 80 unique candidates from Positive News, Reasons to be Cheerful, YES! Magazine, and Upworthy.
  - Result: 80 scored candidates, 80 routed to review candidates, 0 rejected by rules, 0 published because no OpenAI env/autopublish was enabled.
  - Generated files:
    - `data/candidates/2026-06-07.fetched.json`: 80 items.
    - `data/candidates/2026-06-07.scored.json`: 80 items.
    - `data/candidates/2026-06-07.json`: 80 review candidates.
    - `data/rejected/2026-06-07.json`: 0 rejected items.
    - `data/rejected/2026-06-07.fetch-errors.json`: 1 fetch error.
- Safety verification:
  - With no `OPENAI_API_KEY`/`OPENAI_MODEL`, scoring does not fabricate AI output and routes every item to `candidate`.
  - Default `ALLOW_AUTOPUBLISH=false`; `score-candidates.ts` only routes to `published` if `ALLOW_AUTOPUBLISH === "true"` and conservative score/source checks pass.
  - Reader-submitted GitHub Issues are only labeled `good-news-lead`/`needs-review`; no workflow reads issues for automatic publishing.
  - GitHub Actions workflow creates a PR via `peter-evans/create-pull-request@v7`.
- Verification commands:
  - `npx pnpm build` passed.
  - `npx pnpm lint` passed; 29 files, 0 errors, 0 warnings, 0 hints.
  - `npx pnpm typecheck` passed; 29 files, 0 errors, 0 warnings, 0 hints.
  - YAML parse check passed for `.github/workflows/ingest.yml`, `.github/ISSUE_TEMPLATE/good-news-lead.yml`, and `data/sources/sources.yaml`.

## Notes

Some starter RSS URLs were corrected during this phase by removing unverified/broken `rssUrl` fields from Good Good Good and Goodnet. Good News Network remains in the RSS source pool but currently records a local Node fetch timeout; watch this in GitHub Actions before downgrading it.
