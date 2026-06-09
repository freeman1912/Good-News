---
Phase: 04
Slug: chinese-lead-pipeline
Status: completed
Gate: self-tested
---

# Phase 04 · Chinese Lead Pipeline

## Goal

Define how the project should discover Chinese good-news leads, including short-video good-deed stories, while keeping publication verifiable and mostly AI-assisted.

## Tasks

- [x] Add Chinese source and video-lead playbook. (`CHINA_SOURCE_PLAYBOOK.md:1`)
- [x] Add repeatable Chinese lead source configuration. (`data/sources/china-leads.yaml:1`)
- [x] Add script to generate daily Chinese search/video tasks. (`scripts/ingest/generate-china-leads.ts:1`, `package.json:17`)
- [x] Update source strategy and architecture docs. (`SOURCE_STRATEGY.md:58`, `ARCHITECTURE.md:23`)
- [x] Run lead task generation and build/type verification. (`npx pnpm ingest:china-leads`, `npx tsc --noEmit`, `npx pnpm typecheck`, `npx pnpm build`, 2026-06-08)

## Verification

- `npx pnpm ingest:china-leads`
- `npx tsc --noEmit`
- `npx pnpm typecheck`
- `npx pnpm build`

## Notes

- This phase does not fetch Douyin/Kuaishou/WeChat/Bilibili content directly.
- The deliverable is the reproducible discovery layer that can later connect to search APIs or platform tooling.
- Generated `data/candidates/2026-06-08.china-leads.json` with 68 tasks: 11 evidence tasks, 9 discovery tasks, 48 video/social lead tasks.
