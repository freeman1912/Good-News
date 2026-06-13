# Good News · PRD · v5-weekly-good-news

> This iteration changes the public product from a daily good-news timeline to a
> weekly Chinese-first good-news brief.

## 1. Background

The daily version proved that the project can fetch, score, draft, publish, and
render good-news items. The product direction now needs to become more selective.
Daily good-news publishing creates pressure to accept weak, repetitive, or
overly technical items, and readers can become numb even to positive stories.

The weekly version should reduce publishing pressure and make the editorial
standard clearer: choose concrete, understandable good things that make readers
feel that people are solving problems and that tomorrow still has hope.

## 2. Goals

- Reposition the public site as `好消息周报 / Good News Weekly`.
- Keep daily candidate discovery, but stop treating daily publication as the
  default product behavior.
- Generate a weekly draft from the previous week's candidates.
- Publish weekly issues after review.
- Make the homepage, archive, and RSS speak in weekly terms.
- Expand discovery toward Chinese public-interest media, public-good projects,
  video leads, and ordinary-reader-understandable stories.
- Keep strict boundaries against propaganda, brand PR, staged emotion, and
  unverifiable touching stories.

## 3. Non-Goals

- No login, comments, likes, voting, ranking, or community feed.
- No CMS or database in this iteration.
- No automatic publication from reader submissions or videos.
- No promise of a fixed number of stories per week.
- No full-text copying from source articles.
- No replacing the source-verification discipline with inspirational writing.

## 4. Editorial Standard

An item is a strong weekly candidate when:

- ordinary Chinese readers can understand why it matters;
- it is connected to people, communities, care, repair, exploration, or visible
  improvement;
- it has a concrete action, result, beneficiary, or meaningful discovery;
- it does not rely mainly on pity, tragedy, or emotional manipulation;
- it is not propaganda, institutional self-praise, or brand soft advertising;
- it has a source trail that can be explained plainly;
- it leaves readers with aftertaste: "someone is doing the work; there is still
  hope."

Science and technology are allowed when they have human meaning. A technical
breakthrough should not enter the weekly issue only because it is impressive.
It should connect to patients, everyday life, disability assistance,
environmental repair, access, public benefit, exploration, or a strong human
future narrative such as space, deep sea, archaeology, or fundamental discovery.

## 5. User Stories

- As a reader, I open the site once a week and see a concise Chinese brief of
  good things that feel real, specific, and hopeful.
- As a reader, I can click original sources and understand why each item is
  credible.
- As the maintainer, I can let automation collect daily candidates and review a
  smaller weekly draft.
- As the maintainer, I can send a video lead to the system and have AI extract
  facts, gaps, risks, and a possible rewritten item after I confirm the video.
- As a future contributor, I can understand why a story was selected, held, or
  rejected.

## 6. Public Pages

### Homepage

- Show the latest weekly issue first.
- Replace daily language such as `今日时间线` and `最近 24 小时` with weekly
  language.
- Keep every story's source and verification note visible.
- Include a short weekly intro note.

### Archive

- Group published issues by week.
- Keep old daily data readable during transition or migrate it into early
  weekly issues.

### RSS

- Keep RSS as a core feature.
- Update public copy from daily updates to weekly updates.
- First implementation should keep one RSS item per selected story because it
  fits the existing feed shape.

### Submit

- Keep the lead submission flow.
- Say submissions may be considered for a future weekly issue.

## 7. Data And Automation

Daily ingestion should continue to write candidate, scored, rejected, and
follow-up files. Weekly publication should use new weekly issue files.

Suggested new folders:

```text
data/weekly/
data/weekly-drafts/
```

Suggested workflow:

```text
daily fetch/score/export
-> weekly draft from previous Monday-Sunday window
-> maintainer review
-> weekly publish data
-> Astro build
-> RSS update
```

## 8. Video Lead Handling

Videos can be leads, especially for long-running do-gooders, public-interest
projects, community help, animal/environment work, and small local improvements.
They cannot auto-publish.

The review must identify:

- original URL or stable URL;
- who acted;
- where and when it happened;
- what was done;
- who benefited;
- what result is visible;
- privacy, staging, commercial, and traffic-bait risks;
- whether supporting sources exist.

If evidence is thin, the video stays in a watch/hold queue.

## 9. Acceptance Criteria

- The project has a weekly issue data model.
- A weekly draft command can collect candidates from a week and write an AI
  draft file.
- A weekly publish command can write a published weekly issue.
- Homepage renders the latest weekly issue.
- Archive renders weekly issues.
- RSS renders selected weekly stories with weekly copy.
- Submit page copy refers to weekly review.
- Daily ingestion still produces candidate files.
- Build and typecheck pass.

