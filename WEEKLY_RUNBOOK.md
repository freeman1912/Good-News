# Good News · Weekly Runbook

This is the public publishing flow for `好消息周报 / Good News Weekly`.
Daily ingestion remains a discovery layer; the weekly issue is the reader-facing
product.

## Weekly Rhythm

Run weekly review on Monday evening Asia/Shanghai time for the previous
Monday-Sunday window.

There is no fixed story count. Publish only stories that remain concrete,
ordinary-reader-understandable, verifiable, and hopeful after review.

## Planned Commands

Phase 03 will add these commands:

```powershell
npx pnpm weekly:draft -- --week YYYY-Www
npx pnpm weekly:publish -- --week YYYY-Www --file data/weekly-drafts/YYYY-Www.ai-draft.json
npx pnpm build
```

Until those commands exist, use daily discovery files as source material:

```powershell
npx pnpm trial:daily -- --date YYYY-MM-DD --skip-publish-ai-draft
```

Then review:

- `data/candidates/YYYY-MM-DD.json`
- `data/trials/YYYY-MM-DD-ai-picks.md`
- `data/rejected/YYYY-MM-DD.json`
- `data/candidates/YYYY-MM-DD.china-leads.json`

## Weekly Review Standard

Prefer stories that:

- ordinary Chinese readers can understand;
- are connected to people, care, repair, public benefit, exploration, or visible
  improvement;
- show someone solving a problem or doing sustained useful work;
- have a source trail the reader can inspect;
- leave aftertaste: "there is still hope; someone is doing the work."

Hold or reject stories that:

- are narrow technical breakthroughs without human meaning;
- are official announcements, ceremonies, awards, or plans without visible
  results;
- are brand PR or institutional self-praise;
- rely on tragedy, pity, or emotional manipulation;
- are video-only claims without original source, date/place, action, result, and
  privacy review.

## Video Leads

Videos are discovery leads, not automatic news.

Before rewriting a video into a weekly item, identify:

- original or stable URL;
- who acted;
- where and when it happened;
- what was done;
- who benefited;
- what changed;
- privacy, staging, commercial, and traffic-bait risks;
- whether there is supporting source trail.

If the maintainer has watched the video and considers it credible, AI can help
rewrite it into a weekly item with caveats. If evidence is thin, keep it in
watch/follow-up.

## Publishing Rule

Weekly publication is conservative:

- strong week: publish the strong items;
- thin week: publish fewer items;
- weak week: publish nothing and keep the candidate pool for follow-up.
