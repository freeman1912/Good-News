# Good News · v2-content-operations · Implementation Plan

## Background

This iteration turns content operations into a repeatable workflow. The site should not wait for an OpenAI key before it can publish real, carefully verified good news. Automation remains useful, but human judgment is the quality gate.

## Scope

**In scope:**

- Manual publish script for curated candidate items.
- `data/manual/` documentation.
- Source strategy documentation.
- Environment and deployment documentation updates.
- Build/type verification.

**Out of scope:**

- CMS/admin backend.
- Login.
- Automatic reader-submission publishing.
- Automatic official-source publishing.
- Paid content.

## Phase Overview

| Phase | Slug | Goal | Status |
|---|---|---|---|
| 01 | no-api-curation | Make manual curation and source strategy usable without OpenAI | completed |
| 02 | deepseek-and-day-one | Add DeepSeek scoring config, expand China source strategy, and run day-one trial publishing | completed |
| 03 | deepseek-live-triage | Verify DeepSeek with the user's API key and tune routing rules on the first real candidate pool | completed |
| 04 | chinese-lead-pipeline | Define Chinese source and video-lead discovery workflow for AI-first triage | completed |

## Key Decisions

- OpenAI is an accelerator, not a prerequisite.
- DeepSeek is the first low-cost AI scoring provider to support.
- Candidates can be fetched automatically, but publication needs either validated AI output plus conservative rules or a manual draft.
- Source quality is handled as a living editorial asset, not only code.

## Open Questions

- Which Chinese sources can eventually become stable Tier A or Tier B sources?
- Whether the project should later add a contributor-facing review checklist page.
