# Good News · Daily Discovery Runbook

This is the daily discovery flow. It is designed to collect, score, and review
candidates, not to define the public product. The public product is moving to a
weekly issue; use `WEEKLY_RUNBOOK.md` for public weekly publishing.

## One Command

Run a full daily discovery trial:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD
```

If no date is provided, the script uses the Asia/Shanghai date.

The command runs:

1. `ingest:fetch`
2. `ingest:score`
3. `ingest:export-scored`
4. `ingest:ai-draft`
5. `ingest:publish-manual -- --file data/manual/YYYY-MM-DD.ai-draft.json`
6. `ingest:china-leads`
7. daily Markdown summary generation

In the legacy daily prototype, step 5 can write the AI draft to the local/static
homepage data file for that day. During the weekly transition, prefer
`--skip-publish-ai-draft` so daily runs only create discovery artifacts. The
command does **not** push to GitHub or deploy publicly.

The scheduled GitHub Actions workflow may still run daily discovery, but daily
automation should be treated as candidate collection. Weekly publication should
be handled by the weekly workflow introduced in v5.

For slow model responses, the workflow uses:

```powershell
AI_REQUEST_TIMEOUT_MS=20000
AI_SCORE_CONCURRENCY=4
```

## Daily Files To Check

After the command, check:

- `data/trials/YYYY-MM-DD-daily-review.md` — human-readable summary.
- `data/candidates/YYYY-MM-DD.json` — AI candidate pool for manual review.
- `data/rejected/YYYY-MM-DD.json` — rejected items for source tuning.
- `data/candidates/YYYY-MM-DD.china-leads.json` — Chinese search/lead tasks.
- `data/trials/YYYY-MM-DD-ai-picks.md` — small AI-selected daily review list.
- `data/manual/YYYY-MM-DD.ai-draft.json` — legacy daily draft file, useful as input to weekly review.
- `data/news/YYYY-MM-DD.json` — legacy daily homepage/RSS data if the daily draft is explicitly published.

For weekly operation, run the daily trial without updating homepage data:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD --skip-publish-ai-draft
```

## AI Draft Picks

Generate a small daily review draft from the candidate pool:

```powershell
npx pnpm ingest:ai-draft -- --date YYYY-MM-DD
```

Then check:

- `data/trials/YYYY-MM-DD-ai-picks.md`
- `data/manual/YYYY-MM-DD.ai-draft.json`

This narrows review to the few strongest daily items. For the weekly product,
use this as review context rather than public output. If you are intentionally
using the legacy daily prototype and still need to publish it to the local
homepage:

```powershell
npx pnpm ingest:publish-manual -- --date YYYY-MM-DD --file data/manual/YYYY-MM-DD.ai-draft.json
```

## Summary Only

If the data files already exist and you only want to regenerate the review note:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD --summary-only
```

## Daily Discovery Rule

There is no fixed quota, and there is no requirement to publish daily.

- If a daily candidate looks strong, keep it for the weekly review.
- If a lead is promising but not result-visible, put it in follow-up.
- If none survive review, publish nothing and keep the weekly issue thin.

For Chinese leads, publish only result-visible stories. Put approvals, launches,
plans, and official/corporate claims into `data/followups/` instead of publishing
them as good news.
