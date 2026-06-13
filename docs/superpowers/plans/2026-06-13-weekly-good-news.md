# Weekly Good News Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Good News from a daily public timeline into a weekly Chinese-first good-news brief while preserving daily candidate discovery.

**Architecture:** Keep the site static-first. Add weekly issue data under `data/weekly/`, add weekly readers/helpers in `src/lib/`, add weekly draft/publish scripts under `scripts/ingest/`, and update Astro pages to render weekly issues. Daily candidate files remain the input layer; weekly issue files become the public output layer.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS v4, local JSON/YAML data, `tsx` ingestion scripts, GitHub Actions, Cloudflare Pages.

---

### Task 1: Spec Sync

**Files:**
- Modify: `BRIEF.md`
- Modify: `README.md`
- Modify: `SOURCE_STRATEGY.md`
- Modify: `ARCHITECTURE.md`
- Modify: `DAILY_RUNBOOK.md`
- Create: `WEEKLY_RUNBOOK.md`
- Modify: `iterations/v5-weekly-good-news/.plan/phases/01-spec-sync.md`

- [ ] Replace daily public-product wording with weekly wording in `BRIEF.md`.
- [ ] Update `README.md` so readers and contributors see `好消息周报` as the public product.
- [ ] Update `SOURCE_STRATEGY.md` so daily ingestion is described as discovery and weekly publishing as public output.
- [ ] Update `ARCHITECTURE.md` scheduled publishing and data-flow sections.
- [ ] Create `WEEKLY_RUNBOOK.md` with the weekly review flow:

```powershell
npx pnpm weekly:draft -- --week YYYY-Www
npx pnpm weekly:publish -- --week YYYY-Www --file data/weekly-drafts/YYYY-Www.ai-draft.json
npx pnpm build
```

- [ ] Keep `DAILY_RUNBOOK.md` but rename its role in the text to daily discovery/trial.
- [ ] Run `npx pnpm typecheck`.
- [ ] Mark phase 01 complete only after the user confirms the new wording feels right.

### Task 2: Weekly Types And Readers

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/weeks.ts`
- Create: `src/lib/weekly.ts`
- Create: `data/weekly/2026-W24.json`
- Modify: `iterations/v5-weekly-good-news/.plan/phases/02-weekly-data-model.md`

- [ ] Add weekly types to `src/lib/types.ts`:

```ts
export interface WeeklyGoodNewsItem extends PublishedNewsItem {
  weeklyNote?: string;
  mediaType?: "article" | "video" | "report" | "other";
}

export interface WeeklyWatchItem {
  id: string;
  title: string;
  reason: string;
  sourceName?: string;
  sourceUrl?: string;
  followUpQuestion: string;
}

export interface WeeklyIssue {
  id: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  intro: string;
  items: WeeklyGoodNewsItem[];
  watchlist?: WeeklyWatchItem[];
  publishedAt?: string;
}
```

- [ ] Implement `src/lib/weeks.ts` with `getWeekId`, `parseWeekId`, `getWeekRange`, and `isDateInWeekRange`.
- [ ] Implement `src/lib/weekly.ts` with `getAllWeeklyIssues`, `getLatestWeeklyIssue`, and `getWeeklyStoriesByTopic`.
- [ ] Add `data/weekly/2026-W24.json` as seed data using reviewed June candidates that fit the weekly standard.
- [ ] Run `npx pnpm typecheck`.
- [ ] Mark phase 02 complete after weekly data can be loaded without build errors.

### Task 3: Weekly Draft And Publish Scripts

**Files:**
- Create: `scripts/ingest/weekly-draft.ts`
- Create: `scripts/ingest/weekly-publish.ts`
- Modify: `package.json`
- Create: `data/weekly-drafts/README.md`
- Modify: `iterations/v5-weekly-good-news/.plan/phases/03-weekly-draft-publish.md`

- [ ] Implement `weekly-draft.ts` CLI args: `--week YYYY-Www`, optional `--max-candidates N`, optional `--include-watch`.
- [ ] Read daily candidate files whose scored/collected dates fall inside the week range.
- [ ] Deduplicate by normalized original URL first, then normalized title.
- [ ] Rank with weekly criteria: human impact, ordinary-reader clarity, public value, evidence, low PR risk, and aftertaste.
- [ ] Hold narrow technical breakthroughs unless the AI score or source text shows human meaning.
- [ ] Write `data/weekly-drafts/YYYY-Www.ai-draft.json`.
- [ ] Write `data/trials/YYYY-Www-weekly-review.md`.
- [ ] Implement `weekly-publish.ts` CLI args: `--week YYYY-Www --file path`.
- [ ] Validate required weekly issue fields and write `data/weekly/YYYY-Www.json`.
- [ ] Add scripts:

```json
"weekly:draft": "tsx scripts/ingest/weekly-draft.ts",
"weekly:publish": "tsx scripts/ingest/weekly-publish.ts"
```

- [ ] Run `npx pnpm weekly:draft -- --week 2026-W24`.
- [ ] Run `npx pnpm weekly:publish -- --week 2026-W24 --file data/weekly-drafts/2026-W24.ai-draft.json`.
- [ ] Mark phase 03 complete after the user reviews the generated weekly draft shape.

### Task 4: Weekly Pages And RSS

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archive.astro`
- Modify: `src/pages/rss.astro`
- Modify: `src/pages/rss.xml.ts`
- Modify: `src/pages/rss/[slug].xml.ts`
- Modify: `src/pages/submit.astro`
- Optionally create: `src/components/WeeklyIssue.astro`
- Optionally create: `src/components/WeeklyWatchlist.astro`
- Modify: `iterations/v5-weekly-good-news/.plan/phases/04-weekly-pages-rss.md`

- [ ] Update homepage title to `好消息周报`.
- [ ] Render latest weekly issue intro and selected weekly items.
- [ ] Reuse `NewsEntry.astro` for weekly items when the existing shape is enough.
- [ ] Add a small watchlist section only if `watchlist` exists.
- [ ] Update archive to list weekly issues by `weekStart` and `weekEnd`.
- [ ] Update RSS page copy to weekly subscription language.
- [ ] Update all RSS endpoints to read weekly selected stories.
- [ ] Update submit page copy so leads are considered for future weekly issues.
- [ ] Search page code for `今日`, `最近 24 小时`, `每天`, `今日时间线`; keep only phrases that still make sense.
- [ ] Run `npx pnpm build`.
- [ ] Mark phase 04 complete after browser review at desktop and mobile widths.

### Task 5: Weekly Automation

**Files:**
- Modify: `.github/workflows/ingest.yml`
- Create: `.github/workflows/weekly.yml`
- Modify: `DEPLOYMENT.md`
- Modify: `iterations/v5-weekly-good-news/.plan/phases/05-weekly-automation.md`

- [ ] Update daily workflow so it does not publish public homepage data by default.
- [ ] Add weekly workflow scheduled for Monday evening Asia/Shanghai time.
- [ ] Weekly workflow steps: checkout, setup pnpm, setup Node 22, install, run weekly draft, run build, open PR.
- [ ] Use `peter-evans/create-pull-request` with labels `automation` and `weekly-review`.
- [ ] Document secrets and variables in `DEPLOYMENT.md`.
- [ ] Keep `ALLOW_AUTOPUBLISH` false by default.
- [ ] Mark phase 05 complete after workflow YAML is syntactically reviewed and build passes locally.

### Task 6: Verification And Launch Review

**Files:**
- Modify: `iterations/v5-weekly-good-news/.plan/phases/06-verification-launch.md`

- [ ] Run `npx pnpm typecheck`.
- [ ] Run `npx pnpm build`.
- [ ] Start `npx pnpm dev -- --host 127.0.0.1`.
- [ ] Inspect `/`, `/archive`, `/rss`, `/rss.xml`, one topic RSS, `/about`, and `/submit`.
- [ ] Confirm no public page promises daily updates.
- [ ] Confirm every weekly item shows source and verification text.
- [ ] Confirm no video lead or reader submission publishes automatically.
- [ ] Stop for user review before push/deploy.

---

## Self-Review Notes

- This plan covers the weekly product direction, data model, scripts, pages, RSS,
  automation, and verification.
- It deliberately keeps daily ingestion as an input layer instead of deleting
  existing candidate workflows.
- It avoids promising a fixed number of weekly stories.
- It treats science and technology as eligible only when ordinary readers can
  understand the human meaning.
- It treats video as a lead source that needs maintainer confirmation and source
  trail review.
