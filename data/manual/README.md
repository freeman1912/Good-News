# Manual curation drafts

Use this folder when you want to publish good-news items without an OpenAI API key.

## Why this exists

OpenAI can help with first-pass triage, Chinese summaries, topic classification, and verification hints. It is useful, but it should not be required. The most important quality gate is still human judgment: read the original source, check whether the event is concrete and verifiable, then write the Chinese summary and verification note.

## Workflow

1. Run `pnpm ingest:fetch` to collect candidates from `data/sources/sources.yaml`.
2. Open `data/candidates/YYYY-MM-DD.json` and choose only credible items.
3. Create `data/manual/YYYY-MM-DD.json`.
4. Fill one draft object per chosen candidate.
5. Run `pnpm ingest:publish-manual -- --date YYYY-MM-DD`.
6. Run `pnpm build` and inspect the homepage/RSS output.

## Draft format

```json
[
  {
    "candidateId": "positive-news-example123",
    "title": "中文标题，可以保留原意但不要夸张",
    "summary": "用中文讲清楚发生了什么，尽量具体，避免鸡汤和口号。",
    "region": "world",
    "topic": "public-improvement",
    "whyGood": "说明它为什么是好消息，重点放在具体的人、事或问题改善。",
    "verificationNote": "说明来源类型、是否有其他来源可交叉验证、还需要谨慎看待什么。",
    "sourceCount": 1
  }
]
```

## Field rules

- `candidateId`: required. Must exist in `data/candidates/YYYY-MM-DD.json` or `data/candidates/YYYY-MM-DD.fetched.json`.
- `title`: required. Chinese preferred. Do not exaggerate.
- `summary`: required. Explain what happened, not how the reader should feel.
- `region`: required. Use `china` or `world`.
- `topic`: required. Use one of the existing topic slugs.
- `whyGood`: required. One or two concrete sentences.
- `verificationNote`: required. Mention the source and verification limits.
- `sourceCount`: optional. Defaults to `1`.

Reader submissions and official-source items must still be reviewed manually. This file is a publishing draft, not a place for unverified leads.

