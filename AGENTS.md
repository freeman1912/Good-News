# Good News · AGENTS

> This document is the entry point for Codex / Claude when working on this project. Read it before making plans or editing code.

## Project In One Sentence

Good News（中文名暂定“今日好消息”）是一个面向中文读者的开源公益好消息聚合网站，提供网页时间线和 RSS 订阅。

## Document Map

This project was planned with First Flight. Treat the spec documents as the source of truth.

**Long-term project documents:**

| Document | Purpose |
|---|---|
| [BRIEF.md](./BRIEF.md) | Long-term project purpose, audience, value, and boundaries |
| [DESIGN.md](./DESIGN.md) | Visual and UX direction, design tokens, components, do's and don'ts |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, data strategy, ingestion flow, deployment, performance and safety budgets |
| [AGENTS.md](./AGENTS.md) | This AI entry document |

**v1 launch documents:**

| Document | Purpose |
|---|---|
| [iterations/v1-launch/PRD.md](./iterations/v1-launch/PRD.md) | v1 pages, information architecture, user scenarios, goals, and scope |
| [iterations/v1-launch/CONTENT.md](./iterations/v1-launch/CONTENT.md) | v1 content slots, copy, data sources, and source pool strategy |
| [iterations/v1-launch/.plan/](./iterations/v1-launch/.plan/) | Implementation plan and phase files, created before coding |

## Essential Boundaries

**The project always is:**

- Chinese-reader-first
- Real and verifiable
- Open-source and public-good oriented
- Web timeline plus RSS
- RSS-friendly
- Constructive-news oriented

**The project does not become:**

- An official propaganda site
- A slogan-style positive-energy column
- Chicken-soup writing
- A home for unverifiable touching stories
- A traffic site that uses bad news to create anxiety
- A generic news portal
- A comment-fight community

If a user request conflicts with these boundaries, stop and ask before implementing.

## Tech Stack

The v1 stack is:

- Astro 6
- TypeScript
- Tailwind CSS v4
- Local Astro components, no full UI kit by default
- Structured JSON/YAML data under `data/`
- `yaml` for reading `data/sources/sources.yaml`
- `@astrojs/rss` for RSS generation
- Node.js/TypeScript ingestion scripts
- OpenAI API or compatible LLM provider for structured candidate scoring
- GitHub Actions for scheduled ingestion
- Cloudflare Pages for deployment

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed decisions.

## Before Writing Code

Do these checks before implementation:

- Read `BRIEF.md`, `iterations/v1-launch/PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `iterations/v1-launch/CONTENT.md`.
- Create or update the phase plan under `iterations/v1-launch/.plan/` before multi-file implementation.
- Export design tokens if the implementation depends on `DESIGN.md` token values:

```bash
npx @google/design.md export --format css-tailwind DESIGN.md > src/styles/theme.css
```

- Confirm required environment variables are documented:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `PUBLIC_SITE_URL`
  - optional analytics variables

## Implementation Rules

1. Follow `DESIGN.md` do's and don'ts. In particular: no propaganda look, no inspirational wallpaper design, no gradient orbs, no stock-photo dependency, no gamified good-news score.
2. Use `CONTENT.md` exactly:
   - `📑` copy is direct copy. Do not rewrite it unless asked.
   - `🤖` prompts describe content to generate; generated copy must match the project voice.
   - `🗂️` data sources must be read from the specified path or schema.
3. Follow `ARCHITECTURE.md` for dependencies. Do not add a new framework, database, CMS, auth provider, or UI kit without updating the architecture spec first.
4. Keep v1 static-first. Do not introduce login, comments, backend admin, paid subscriptions, or automatic reader-submission publishing.
5. Treat RSS as a core product feature. RSS endpoints must be tested as part of build verification.
6. Treat source quality as a first-class product concern. Ingestion should prefer conservative rejection over low-quality publication.
7. AI output must be schema-validated before entering published data.
8. Reader-submitted GitHub Issues never auto-publish.
9. Official sources are high-risk by default. They require concrete public value and cross-verification before publication.
10. For implementation involving five or more steps, multiple files, or more than one work session, use the phase plan process and stop for review after each phase.

## Code Organization

Expected structure:

```text
src/
  components/
    NewsEntry.astro
    DateGroup.astro
    FilterBar.astro
    RssLinkBlock.astro
    VerificationNote.astro
  layouts/
    BaseLayout.astro
  lib/
    news.ts
    rss.ts
    categories.ts
    dates.ts
  pages/
    index.astro
    rss.astro
    rss.xml.ts
    rss/
      [slug].xml.ts
    about.astro
    archive.astro
    category/
      [slug].astro
    submit.astro
  styles/
    global.css
    theme.css
data/
  sources/
    sources.yaml
  news/
  candidates/
  rejected/
scripts/
  ingest/
    fetch-feeds.ts
    normalize.ts
    dedupe.ts
    score-candidates.ts
    publish.ts
```

## Common Commands

Use the package manager selected during implementation. The expected commands are:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
npx @google/design.md lint DESIGN.md
```

If these commands do not exist yet, create them during project setup.

## Verification Checklist

Before considering a phase complete:

- `pnpm build` passes.
- Type checking passes if configured.
- Lint passes if configured.
- Homepage renders date-grouped news.
- RSS endpoint renders valid XML.
- Theme follows `DESIGN.md`.
- Source and verification text are visible on every news entry.
- No client-side JavaScript is added unless the interaction needs it.
- No content violates the BRIEF boundary.

For frontend phases, verify the site visually in a browser at desktop and mobile widths.

## Spec Sync Rules

Specs are the source of truth. Keep them synchronized:

- If the long-term project boundary changes, update `BRIEF.md`.
- If page structure, v1 behavior, or scope changes, update `iterations/v1-launch/PRD.md`.
- If visual style, colors, typography, or component rules change, update `DESIGN.md`.
- If framework, deployment, data model, ingestion flow, or dependencies change, update `ARCHITECTURE.md`.
- If copy, content slots, source strategy, or sample data changes, update `iterations/v1-launch/CONTENT.md`.
- If a new feature is requested after v1 planning, create a new iteration PRD instead of rewriting v1 history.

## Where To Look

| Question | Read |
|---|---|
| What is this project and why does it exist? | `BRIEF.md` |
| What pages and features does v1 include? | `iterations/v1-launch/PRD.md` |
| What should the site feel like visually? | `DESIGN.md` |
| What stack and data flow should be used? | `ARCHITECTURE.md` |
| What copy or data source fills this section? | `iterations/v1-launch/CONTENT.md` |
| How should implementation be phased? | `iterations/v1-launch/.plan/plan.md` |

## Collaboration Posture

- Be conservative with scope.
- Prefer working software over clever architecture.
- Preserve the public-good, free, open-source nature of the project.
- Be especially careful with news quality, source verification, and official-source handling.
- When unsure whether a story is truly good news, do not publish automatically.
