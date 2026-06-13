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
pnpm trial:daily -- --date YYYY-MM-DD --skip-publish-ai-draft
pnpm weekly:draft -- --week YYYY-Www
```

`pnpm trial:daily -- --skip-publish-ai-draft` runs the conservative discovery
pipeline:

1. Fetch RSS candidates from `data/sources/sources.yaml`.
2. Dedupe and normalize candidates.
3. Score candidates with AI when DeepSeek or OpenAI-compatible credentials are configured.
4. Route items into `data/candidates/`, `data/rejected/`, `data/manual/`, and
   `data/trials/`.

Daily discovery does not update the public homepage or RSS in weekly mode.
Public content comes from reviewed weekly issue files in `data/weekly/`.

Without OpenAI credentials, candidates are not auto-published. This is expected.
Manual publishing still works:

```bash
pnpm ingest:fetch
pnpm ingest:publish-manual -- --date YYYY-MM-DD --file data/manual/YYYY-MM-DD.ai-draft.json
```

The manual command reads `data/manual/YYYY-MM-DD.ai-draft.json`, validates each draft
against the fetched candidate pool, and writes `data/news/YYYY-MM-DD.json`.

Weekly draft and publish commands:

```bash
pnpm weekly:draft -- --week YYYY-Www
pnpm weekly:publish -- --week YYYY-Www --file data/weekly-drafts/YYYY-Www.ai-draft.json
```

`weekly:draft` writes review artifacts only. `weekly:publish` writes
`data/weekly/YYYY-Www.json` and should be run only after human review.

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

Production project:

- Project name: `good-news`
- Public URL: `https://good-news-8ov.pages.dev`

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

Manual deployment from this workspace:

```powershell
$env:PUBLIC_SITE_URL="https://good-news-8ov.pages.dev"
npx pnpm build
npx pnpm deploy:cloudflare
```

The first public deployment was created with Wrangler direct upload. The current
Cloudflare Pages project is a Direct Upload project. Automatic deployment is
handled by `.github/workflows/deploy.yml`, which runs on pushes to `main`.

To enable GitHub automatic deployment, add this repository secret:

- `CLOUDFLARE_API_TOKEN`

The token needs permission to deploy the `good-news` Cloudflare Pages project.
The workflow uses account ID `64bc71e4f65e4ef240f94643ca88ee98` and production
URL `https://good-news-8ov.pages.dev`.

Until that secret is configured, deploy manually with the command above after
merging content or code changes.

## GitHub Actions

Daily discovery is in `.github/workflows/ingest.yml`.

Triggers:

- Daily schedule at 07:20 Asia/Shanghai
- Manual `workflow_dispatch`

The daily workflow runs:

```bash
pnpm trial:daily -- --date YYYY-MM-DD --skip-publish-ai-draft
pnpm build
```

It opens a review PR with discovery artifacts from:

- `data/candidates/`
- `data/manual/`
- `data/rejected/`
- `data/trials/`

It intentionally does not include `data/news/` and does not change the public
weekly homepage.

Weekly review is in `.github/workflows/weekly.yml`.

Triggers:

- Monday 20:30 Asia/Shanghai, for the previous Monday-Sunday window
- Manual `workflow_dispatch` with optional `week`, for example `2026-W24`

The weekly workflow refreshes the final daily discovery file, runs
`pnpm weekly:draft`, verifies `pnpm build`, and opens a PR containing review
artifacts from:

- `data/candidates/`
- `data/manual/`
- `data/rejected/`
- `data/trials/`
- `data/weekly-drafts/`

It does not write `data/weekly/` automatically. Review the original links,
edit the weekly draft if needed, then run `pnpm weekly:publish` after approval.

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
- Daily discovery and weekly review workflows both set `ALLOW_AUTOPUBLISH=false`.
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
