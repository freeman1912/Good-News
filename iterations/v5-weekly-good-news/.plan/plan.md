# v5 Weekly Good News · Phase Plan

## Background

Good News is moving from daily publication to a weekly brief. Daily automation
will remain a discovery layer, but the public product should become a more
selective weekly issue centered on ordinary-reader-understandable stories with
human meaning and aftertaste.

## Scope

Do:

- Sync project docs from daily wording to weekly positioning.
- Add weekly issue and weekly draft data structures.
- Add scripts for weekly draft generation and weekly publishing.
- Update homepage, archive, RSS, and submit copy to weekly behavior.
- Keep daily candidate discovery available.
- Add a weekly GitHub Actions workflow that opens a review PR.

Do not:

- Add login, comments, CMS, database, likes, rankings, or a community feed.
- Auto-publish videos or reader submissions.
- Promise a fixed item count per week.
- Delete old daily data before a migration path exists.

## Phase Overview

| Phase | Goal | Status |
| --- | --- | --- |
| 01-spec-sync | Update specs, copy direction, and editorial rules for weekly publishing | pending |
| 02-weekly-data-model | Add weekly issue types, readers, sample data, and unit-level helpers | pending |
| 03-weekly-draft-publish | Add weekly draft and publish scripts | pending |
| 04-weekly-pages-rss | Render weekly homepage, archive, RSS, and submit copy | pending |
| 05-weekly-automation | Add weekly scheduled workflow and keep daily ingestion as discovery | pending |
| 06-verification-launch | Build, typecheck, RSS check, and visual review | pending |

## Key Decisions

- Public product name becomes `好消息周报 / Good News Weekly`.
- Daily ingestion remains an internal discovery workflow.
- Public publishing is weekly and does not promise a fixed story count.
- Science and technology can be selected when they are understandable and
  human-meaningful.
- Video leads require source-trail extraction and maintainer confirmation before
  rewritten publication.

## Review Checkpoints

Stop for review after:

- Phase 01, because it changes product direction and wording.
- Phase 03, because it defines the editorial automation behavior.
- Phase 04, because it changes the public reader experience.
- Phase 06, before pushing/deploying.

