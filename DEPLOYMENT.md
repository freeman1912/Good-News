# Good News · Deployment

This project is designed for static deployment on Cloudflare Pages with scheduled ingestion through GitHub Actions.

## Local Commands

Use `pnpm` through Corepack or `npx pnpm` if pnpm is not installed globally.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm ingest
```

`pnpm ingest` runs the conservative ingestion pipeline:

1. Fetch RSS candidates from `data/sources/sources.yaml`.
2. Dedupe and normalize candidates.
3. Score candidates with AI when DeepSeek or OpenAI-compatible credentials are configured.
4. Route items into `data/candidates/`, `data/rejected/`, and only when explicitly allowed, `data/news/`.

Without OpenAI credentials, candidates are not auto-published. This is expected.
Manual publishing still works:

```bash
pnpm ingest:fetch
pnpm ingest:publish-manual -- --date YYYY-MM-DD
```

The manual command reads `data/manual/YYYY-MM-DD.json`, validates each draft
against the fetched candidate pool, and writes `data/news/YYYY-MM-DD.json`.

For low-cost local AI testing, use a small scoring sample first:

```powershell
$env:INGEST_DATE="YYYY-MM-DD"
$env:INGEST_SCORE_LIMIT="10"
npx pnpm ingest:score
```

Limited runs write `data/candidates/YYYY-MM-DD.scored.sample.json` by default so
they do not overwrite the full scoring file.

After tuning routing rules, re-apply them to an existing scored file without
calling the AI provider again:

```powershell
$env:INGEST_DATE="YYYY-MM-DD"
$env:INGEST_REROUTE_ONLY="true"
npx pnpm ingest:score
```

After a full scoring run, export the review pools without calling the AI
provider:

```powershell
$env:INGEST_DATE="YYYY-MM-DD"
npx pnpm ingest:export-scored
```

This writes:

- `data/candidates/YYYY-MM-DD.json`
- `data/rejected/YYYY-MM-DD.json`

Use these files for manual review. They are not published content.

## Cloudflare Pages

Recommended settings:

- Framework preset: Astro
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js version: `22`
- Package manager: pnpm

Set `PUBLIC_SITE_URL` to the final production origin, for example:

```text
https://good-news.example.com
```

RSS feeds use `PUBLIC_SITE_URL` for absolute site metadata. If the variable is missing, local builds fall back to `http://localhost:4321`.

## GitHub Actions

The ingestion workflow is in `.github/workflows/ingest.yml`.

Triggers:

- Daily schedule
- Manual `workflow_dispatch`

Recommended GitHub secret for low-cost automated AI scoring:

- `DEEPSEEK_API_KEY`

Recommended GitHub variable for low-cost automated AI scoring:

- `DEEPSEEK_MODEL` (default: `deepseek-v4-flash`)
- `DEEPSEEK_BASE_URL` (default: `https://api.deepseek.com`)

Fallback GitHub secret for OpenAI automated AI scoring:

- `OPENAI_API_KEY`

Fallback GitHub variable for OpenAI automated AI scoring:

- `OPENAI_MODEL`

Recommended GitHub variable:

- `PUBLIC_SITE_URL`
- `PUBLIC_GITHUB_NEW_ISSUE_URL`
- `PUBLIC_GITHUB_ISSUE_TEMPLATE_URL`

Optional:

- `PUBLIC_GITHUB_ISSUE_URL` as a backward-compatible issue URL fallback
- `OPENAI_BASE_URL` for OpenAI-compatible providers
- `AI_MAX_TOKENS` for structured JSON scoring output length

The workflow creates a pull request through `peter-evans/create-pull-request`. It does not silently publish to `main`.

## Safety Defaults

- Reader-submitted GitHub Issues never auto-publish.
- `ALLOW_AUTOPUBLISH` is false by default.
- Watch-level and official-risk sources do not auto-publish.
- AI output must pass schema validation before routing.
- RSS content includes summaries and verification notes, not full copied articles.

## Pre-Launch Checklist

Before first public deployment:

- Set `PUBLIC_SITE_URL` in Cloudflare Pages and GitHub Actions variables.
- Set `PUBLIC_GITHUB_NEW_ISSUE_URL` to the real repository new-Issue URL, for example `https://github.com/OWNER/REPO/issues/new`.
- Set `PUBLIC_GITHUB_ISSUE_TEMPLATE_URL` to the direct Issue template URL, for example `https://github.com/OWNER/REPO/issues/new?template=good-news-lead.yml`.
- Add `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL` only if automated AI scoring is enabled.
- Run `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Open `/`, `/rss`, `/rss.xml`, at least one `/rss/*.xml`, `/about`, and `/submit`.
- Review `data/candidates/` manually before merging any ingestion PR.
