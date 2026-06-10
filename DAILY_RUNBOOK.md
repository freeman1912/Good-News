# Good News · Daily Runbook

This is the current first-stage operating flow. It is designed for trial runs,
not automatic publication.

## One Command

Run a full daily trial:

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

It publishes the AI draft to the local/static homepage data file for that day.
It does **not** push to GitHub or deploy publicly.

The scheduled GitHub Actions workflow runs the same daily trial flow with the
Asia/Shanghai date and opens a pull request containing the generated homepage,
RSS, candidate, rejected, and review files.

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
- `data/trials/YYYY-MM-DD-ai-picks.md` — small AI-selected draft review list.
- `data/manual/YYYY-MM-DD.ai-draft.json` — publishable draft file after a quick source check.
- `data/news/YYYY-MM-DD.json` — homepage/RSS data generated from the AI draft.

If you want to run the trial without updating the homepage data:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD --skip-publish-ai-draft
```

## AI Draft Picks

Generate a small publish draft from the candidate pool:

```powershell
npx pnpm ingest:ai-draft -- --date YYYY-MM-DD
```

Then check:

- `data/trials/YYYY-MM-DD-ai-picks.md`
- `data/manual/YYYY-MM-DD.ai-draft.json`

This narrows review to the few strongest items. If you generated the draft alone
and still need to publish it to the local homepage:

```powershell
npx pnpm ingest:publish-manual -- --date YYYY-MM-DD --file data/manual/YYYY-MM-DD.ai-draft.json
```

## Summary Only

If the data files already exist and you only want to regenerate the review note:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD --summary-only
```

## Daily Decision Rule

There is no fixed quota.

- If 8 items survive review, publish 8.
- If 3 items survive review, publish 3.
- If none survive review, publish nothing.

For Chinese leads, publish only result-visible stories. Put approvals, launches,
plans, and official/corporate claims into `data/followups/` instead of publishing
them as good news.
