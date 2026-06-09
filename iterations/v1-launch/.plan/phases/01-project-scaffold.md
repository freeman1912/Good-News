# Phase 01 · project-scaffold

Status: completed

## Goal

Create the Astro project foundation, package scripts, base layout, global styles, and design-token entry point so the site can run locally with a visible empty shell.

## Tasks

- [x] Initialize Astro 6 + TypeScript project structure. (`package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`; `npx pnpm build` passed)
- [x] Configure package manager scripts for `dev`, `build`, `lint`, and `typecheck`. (`package.json`; `npx pnpm lint` passed)
- [x] Add Tailwind CSS v4 and connect `src/styles/global.css` plus `src/styles/theme.css`. (`astro.config.mjs`, `src/styles/global.css`, `src/styles/theme.css`)
- [x] Create `BaseLayout.astro` with semantic document structure and metadata defaults. (`src/layouts/BaseLayout.astro`)
- [x] Create initial navigation matching `CONTENT.md`. (`src/layouts/BaseLayout.astro`)
- [x] Add placeholder homepage that renders without real news data. (`src/pages/index.astro`; browser preview at `http://127.0.0.1:4322/`)

## Acceptance Criteria

- `pnpm dev` starts the site.
- `pnpm build` succeeds.
- Homepage loads with the project name, navigation, and daily-summary placeholder.
- The visual foundation follows `DESIGN.md`: light background, restrained radius, no oversized hero, no decorative gradients.

## Evidence

- `npx pnpm build` completed successfully: 1 page built, output in `dist/`.
- `npx pnpm typecheck` completed successfully: 0 errors, 0 warnings, 0 hints.
- `npx pnpm lint` completed successfully: 0 errors, 0 warnings, 0 hints.
- Local preview loaded at `http://127.0.0.1:4322/`; browser check found title `今日好消息 - 每天一点真实发生的好消息`, h1 `今日好消息`, RSS CTA present, and navigation present.

## Notes

Do not implement the full homepage timeline in this phase. That belongs to later phases.
