# Weekly Good News Design

## Purpose

Good News should move from a daily good-news feed to a weekly Chinese-first
good-news brief. The weekly rhythm reduces pressure to publish weak items and
gives the project more room to choose stories that leave readers with a real
sense that people are solving problems and tomorrow can still be better.

The project is not a positive-energy column, a science-news ticker, a charity
PR board, or a collection of touching clips. It is a small public-good editorial
product that finds concrete, verifiable, understandable good things and explains
why they matter.

## Product Positioning

Working name:

- Chinese: 好消息周报
- English: Good News Weekly

Possible subtitle:

- 每周看看，世界哪里正在被认真修补。

Core promise:

- Each week, screen the previous week's candidate pool and publish a concise
  brief of concrete good things that ordinary Chinese readers can understand.
- The brief should make readers feel that there are still meaningful people,
  projects, repairs, discoveries, and acts of care happening in the world.
- No fixed item count is promised. A strong week can have more items; a thin
  week can have fewer or none.

## Editorial Definition Of Good News

An item is a strong candidate when it has most of these qualities:

1. Ordinary readers can understand it without specialist knowledge.
2. It is connected to people: someone acted, someone benefited, a community
   improved, or human understanding expanded in a way readers can feel.
3. It describes a concrete change, result, repair, rescue, project, discovery,
   or sustained act of care.
4. It is not merely emotional. It does not depend on pity, tragedy, tears, or
   inspirational pressure.
5. It is not official propaganda, institutional self-praise, brand PR, or a
   staged traffic story.
6. It has enough source trail to explain why it is credible.
7. It leaves aftertaste: a reader can close the page thinking, "there is still
   hope; someone is doing the work."

Science and technology are welcome, but they should be presented through human
meaning. A technical breakthrough is not enough by itself. A science item is
stronger when it helps patients, reduces a real burden, improves access,
protects nature, assists disabled people, changes daily life, or carries a big
human exploration story such as space, deep sea, archaeology, or fundamental
discovery. The selection test is not "is it impressive?" but "can a reader feel
why this matters to human life or human imagination?"

## Weekly Publishing Rhythm

Daily automation remains useful, but daily publication stops being the product.

The recommended operating rhythm:

1. Run discovery every day and store raw candidates, scored candidates,
   rejected items, and follow-up leads.
2. On Monday evening Asia/Shanghai time, generate a weekly draft for the
   previous Monday-Sunday window.
3. AI reduces the weekly candidate pool into a review draft, grouping duplicate
   or repeated stories across days.
4. The maintainer reviews only the weekly draft, not every daily item.
5. Approved items are published as the new weekly issue.
6. RSS updates when the weekly issue is published.

The weekly issue should never promise a fixed count. The system can internally
rank and cap candidates, but the public product should say "this week's good
news" rather than "3-7 items."

## Weekly Issue Shape

Each issue should contain:

- Issue title: week range plus a short plain-language theme if one emerges.
- Intro note: one or two sentences setting the week's tone without slogan
  language.
- Selected items: each with title, summary, why it is good, credibility note,
  and original/source links.
- Optional "still watching" section: promising leads that are not publishable
  yet because the result is not visible, the source trail is weak, or the claim
  needs follow-up.

Each selected item should answer:

- What happened?
- Who acted or who benefited?
- Why is this good news?
- Why should we trust it?
- Where can the reader see the original source?

## Data Model Direction

Keep daily candidate files. Add weekly published issue data.

Suggested structure:

```text
data/
  weekly/
    2026-W24.json
  weekly-drafts/
    2026-W24.ai-draft.json
  followups/
    2026-W24.json
```

A weekly issue can contain:

```ts
interface WeeklyIssue {
  id: string;              // e.g. "2026-W24"
  weekStart: string;       // YYYY-MM-DD
  weekEnd: string;         // YYYY-MM-DD
  title: string;
  intro: string;
  items: WeeklyGoodNewsItem[];
  watchlist?: WeeklyWatchItem[];
  publishedAt?: string;
}
```

The item fields can reuse the existing published news shape with additions for
source trail, media type, and weekly editorial notes.

## Source And Discovery Expansion

Chinese-first discovery should broaden beyond RSS, but publication remains
strict.

Source lanes:

- Chinese public-interest media: Southern Weekly, Sanlian, Caixin Health,
  The Paper, Beijing News, China Youth Daily, Jiemian, Yicai, Economic Observer,
  Daily People, and similar outlets.
- Public-good and evidence sources: NGO and foundation pages, project reports,
  charity platforms, university/hospital pages, local service organization
  pages, and verified community project pages.
- Video and social leads: Douyin, Kuaishou, Bilibili, Xiaohongshu, WeChat video
  accounts, Weibo, and individual long-running do-gooders.
- International constructive-news sources: Positive News, Reasons to be
  Cheerful, Solutions Journalism Network, Future Crunch, Good Good Good, and
  similar sources.
- Exploration and big-human-story sources: space, deep-sea, archaeology,
  medical access, disability assistance, environmental restoration, and public
  service innovation.

Chinese "warm news" and "positive energy" columns are useful as lead sources,
not style models. They need extra filtering for privacy, staged emotion,
propaganda tone, rescue-drama framing, and unverifiable touching stories.

## Video Lead Workflow

Video is allowed as discovery, but not as automatic publication.

The preferred workflow:

1. A person finds a video lead and shares the stable URL.
2. AI extracts facts: who, where, when, what action, who benefited, what result,
   what evidence exists, and what risks are visible.
3. The system searches or asks for supporting source trail.
4. The lead is routed to reject, hold, watch, or weekly candidate.
5. If the maintainer has watched the video and confirms it looks credible, AI
   can rewrite it into a weekly news item with visible caveats.

Video-only stories should normally stay in watch/hold unless the original
uploader, date, place, action, result, and privacy risk are clear. Stories about
minors, patients, rescued people, or vulnerable people need extra caution.

## Page And RSS Changes

The public site should shift from daily timeline to weekly issue reading.

Homepage:

- Replace "今日好消息" with "好消息周报."
- Show the latest weekly issue first.
- Remove text that promises today/latest-24-hour updates.
- Keep source and verification visible on every item.

Archive:

- Replace date-first archive with week-first archive.
- Old daily data can remain accessible or be migrated into early weekly issues.

RSS:

- Keep RSS as a core product.
- Change public wording from daily RSS to weekly RSS.
- Feed items can either be weekly issues or individual weekly selected stories.
  The first implementation should use individual selected stories because it
  keeps current RSS item behavior close to the existing site.

Submit:

- Keep submission as lead submission.
- Update copy to say leads may be considered for a future weekly issue.

## Automation Changes

Existing daily ingestion can remain, but publication should move to weekly.

New scripts or workflow steps:

- `weekly:draft`: collect daily candidates for a week, dedupe across days, rank
  by weekly editorial criteria, and write a weekly AI draft.
- `weekly:publish`: validate approved weekly draft items and write
  `data/weekly/YYYY-Www.json`.
- GitHub Actions weekly workflow: run Monday evening Asia/Shanghai time and
  open a PR with the weekly draft and issue data.

Daily workflow should stop writing public homepage data by default. It should
write candidates, rejected items, fetch errors, and follow-up leads only.

## AI Screening Rules

AI should rank for weekly usefulness, not daily novelty.

Higher weight:

- human impact;
- concrete beneficiary or changed situation;
- ordinary-reader clarity;
- credibility and source trail;
- non-propaganda tone;
- aftertaste/hopefulness;
- public value;
- verified action/result over announcement.

Lower weight or hold:

- narrow technical claims without human meaning;
- official-only announcements;
- institutional ceremonies;
- charity brand PR;
- viral touching clips without source trail;
- rescue/tragedy stories that depend on suffering;
- early research with no practical outcome unless it has a strong exploration
  or human-meaning narrative.

## Verification And Testing

Before implementation is considered done:

- Weekly issue data builds the homepage.
- Archive groups by week.
- RSS uses weekly wording and valid XML.
- Daily ingestion can still produce candidate files.
- Weekly draft generation dedupes repeated stories across days.
- Existing daily published data either remains readable or has a migration path.
- Build and typecheck pass.

## Open Decisions

- Final Chinese name: "好消息周报" is the current working name.
- Whether to migrate old daily published items into weekly issues immediately
  or leave them as legacy archive entries during transition.
- Whether the weekly RSS item should represent each selected story or the whole
  issue. The recommended first step is selected-story RSS.

## Reference Projects

- Solutions Journalism Network: solutions journalism focuses on responses to
  problems and evidence of effectiveness.
- Positive News: constructive journalism and "what's going right" as an
  editorial product.
- Reasons to be Cheerful: hopeful stories centered on concrete responses.
- Future Crunch: intelligent optimism and human progress, useful for big
  science/exploration framing.
- Chinese warm-news columns such as The Paper's warm-news channel are lead
  sources, but their emotional and propaganda-adjacent risks mean they should
  not define this project's voice.
