# Good News · Daily Runbook

This is the current first-stage operating flow. It is designed for trial runs,
not automatic publication.

## One Command

Run a full daily trial:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD
```

The command runs:

1. `ingest:fetch`
2. `ingest:score`
3. `ingest:export-scored`
4. `ingest:china-leads`
5. daily Markdown summary generation

It does **not** publish to `data/news/`.

## Daily Files To Check

After the command, check:

- `data/trials/YYYY-MM-DD-daily-review.md` — human-readable summary.
- `data/candidates/YYYY-MM-DD.json` — AI candidate pool for manual review.
- `data/rejected/YYYY-MM-DD.json` — rejected items for source tuning.
- `data/candidates/YYYY-MM-DD.china-leads.json` — Chinese search/lead tasks.

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
