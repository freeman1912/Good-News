# Chinese Trackable Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stricter Chinese review model that separates publishable good news from follow-up-only announcements and rejected propaganda-like items.

**Architecture:** Keep the site static. Add review concepts to TypeScript types and document the editorial workflow in Markdown/YAML. Use the existing Chinese lead-generation configuration for discovery, but add a fixed themed source pool so trial runs have a stable review basis.

**Tech Stack:** Astro 6, TypeScript, YAML, Markdown documentation.

---

### Task 1: Review Types

**Files:**

- Modify: `src/lib/types.ts`

- [ ] Add `Trackability`, `VerificationStatus`, `ChineseReviewRoute`, and `FollowUpTask` types.

### Task 2: Fixed Chinese Source Pool

**Files:**

- Create: `data/sources/china-fixed-sources.yaml`
- Modify: `data/sources/china-leads.yaml`

- [ ] Define fixed Chinese sources by theme and source role.
- [ ] Keep official/corporate-heavy sources as watch or evidence-only.

### Task 3: Documentation

**Files:**

- Modify: `SOURCE_STRATEGY.md`
- Modify: `CHINA_SOURCE_PLAYBOOK.md`
- Create: `data/followups/README.md`

- [ ] Document publish/follow-up/reject rules.
- [ ] Document follow-up questions and review timing.

### Task 4: Trial Re-Review

**Files:**

- Modify: `data/trials/2026-06-09-china-shortlist.md`

- [ ] Reclassify previous Chinese candidates under the stricter model.
- [ ] Mark result-visible items separately from follow-up-only items.

### Task 5: Verification

**Commands:**

- `npx pnpm typecheck`
- `npx pnpm build`

- [ ] Confirm checks pass.
