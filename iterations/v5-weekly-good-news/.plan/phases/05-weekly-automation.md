# Phase 05 · Weekly Automation

Status: completed

## Goal

Keep daily discovery but add a weekly review PR workflow for public publishing.

## Tasks

- [x] Modify `.github/workflows/ingest.yml` so daily scheduled runs can be
  discovery-only, or add a separate daily discovery workflow if clearer.
- [x] Add `.github/workflows/weekly.yml` that runs Monday evening
  Asia/Shanghai time.
- [x] The weekly workflow should install dependencies, run daily discovery if
  needed, run `weekly:draft`, verify `pnpm build`, and open a PR.
- [x] Update `DEPLOYMENT.md` with required GitHub secrets/vars and the weekly
  workflow behavior.
- [x] Keep `ALLOW_AUTOPUBLISH` false by default.

## Verification

- Workflow YAML files parsed with the local `yaml` package.
- `npx pnpm typecheck` passed.
- `npx pnpm build` passed.

## Acceptance

- Weekly workflow opens a review PR instead of silently publishing.
- Daily discovery no longer implies public homepage updates.
- Deployment docs explain the weekly rhythm.
