# Community Leads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an ordinary-reader lead submission form backed by GitHub Issues.

**Architecture:** The site remains static. `/submit` renders a structured form and a small client script generates a GitHub Issue draft URL with a Markdown body. Lead review rules live in TypeScript types and documentation.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS v4, GitHub Issues.

---

### Task 1: Specifications And Review Model

**Files:**

- Create: `iterations/v3-community-leads/PRD.md`
- Create: `iterations/v3-community-leads/.plan/plan.md`
- Create: `iterations/v3-community-leads/.plan/phases/01-submission-form.md`
- Modify: `src/lib/types.ts`
- Create: `data/leads/README.md`

- [ ] Define the v3 goals, non-goals, lead layers, and acceptance criteria.
- [ ] Add lead type and review status TypeScript definitions.
- [ ] Document how leads are reviewed and promoted.

### Task 2: Reader-Facing Submission Form

**Files:**

- Modify: `src/pages/submit.astro`
- Modify: `src/lib/site.ts`

- [ ] Replace the simple GitHub link with a structured form.
- [ ] Generate a GitHub Issue draft URL with title, body, and labels.
- [ ] Explain that submissions do not auto-publish.
- [ ] Show the verified timeline vs daily-kindness distinction.

### Task 3: GitHub Issue Template And Homepage Entry

**Files:**

- Modify: `.github/ISSUE_TEMPLATE/good-news-lead.yml`
- Modify: `src/pages/index.astro`

- [ ] Align the issue template with the web form fields.
- [ ] Add a light homepage entry point for submitting leads.

### Task 4: Verification

**Commands:**

- `npx pnpm typecheck`
- `npx pnpm build`

- [ ] Confirm type checking passes.
- [ ] Confirm the static build passes.
