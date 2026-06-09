# Good News · Source Strategy

This project should feel warm, but the source strategy is intentionally strict. Good news is only useful here when it is specific, verifiable, and not propaganda or soft advertising.

## Why AI API Keys Are Optional

The website and RSS feeds do not need an AI API key. They read structured JSON from `data/news/` and can be built entirely offline.

DeepSeek, OpenAI, or another compatible model is only useful for the ingestion assistant layer:

- translating or summarizing English candidates into Chinese;
- suggesting region and topic;
- flagging propaganda, soft-ad, and vague inspirational content;
- drafting `whyGood` and `verificationNote` for human review.

Without an API key, the project should use manual curation: fetch links, read candidates, write Chinese summaries by hand, then publish with `pnpm ingest:publish-manual -- --date YYYY-MM-DD`.

## Candidate Source Tiers

### Tier A · Editorial Good-News and Constructive-News Sources

These are the best starting points because their editorial mission already overlaps with this project. They are not automatically trusted, but they reduce the amount of irrelevant news.

- Good News Network
- Positive News
- Reasons to be Cheerful
- YES! Magazine (selective archive/monthly source, not a daily source)

Use Good News Network, Positive News, and Reasons to be Cheerful for daily RSS discovery.
Use YES! selectively because it has shifted away from regular publication and is better treated as a solutions-journalism archive or occasional lead source. Still check whether an item is concrete, recent, and not just opinion or inspirational commentary.

### Tier B · Discovery and Watch Sources

These can produce useful leads, but they may contain lighter viral stories, advocacy content, or less rigorous evidence.

- Good Good Good
- Goodnet
- Upworthy
- The Optimist Daily
- The Better India
- Jane Goodall's Good for All News

Use these as discovery sources. Publish only after reading the original article and, when possible, finding a primary or second source.

### Tier C · Primary Evidence Sources

These are not usually good RSS discovery feeds, but they are valuable for verification:

- university and research institute announcements;
- peer-reviewed paper pages or journal press pages;
- NGO project reports;
- hospital, public-health, or charity project pages;
- local reporting close to the event;
- government pages only when the public value is concrete and cross-verifiable.

Tier C sources should support verification. They should not turn the site into an official bulletin board.

## Chinese Source Handling

The Chinese web has many "positive energy" columns that look close on the surface but conflict with this project's boundary. For now, Chinese sources should be treated as cautious discovery, not automatic publication.

There is not yet a stable Chinese Tier A equivalent to Positive News or Reasons to be Cheerful. The first domestic source pool should be a watch pool:

- 中国发展简报 / NGO信息中心: NGO and public-interest project leads.
- 自然之友: environmental primary/project source.
- 知识分子: science, health, and public knowledge leads.
- 财新健康: health and public-service reporting leads.
- 南方周末: public-interest reporting discovery.
- 澎湃新闻: broad discovery only; warm/positive columns are high-risk and need extra caution.

These sources are not daily auto-ingestion sources yet. Use them through manual search, reader submissions, or later search APIs. Publish only after original links and claims are checked.

For the full Chinese workflow, read `CHINA_SOURCE_PLAYBOOK.md`. Chinese
discovery should be treated as a lead pipeline:

```text
platform/search lead
-> AI extracts claim, people, place, date, action, result, and evidence gaps
-> source-trail search
-> hold / verify / candidate / reject
```

Video leads are allowed, but video-only leads should normally stay in `hold`
until the original URL, date/place, and at least one supporting source are found.

The repeatable task configuration lives in `data/sources/china-leads.yaml`.
Generate a daily search task queue with:

```bash
npx pnpm ingest:china-leads
```

Prefer:

- local reports with named people, places, dates, and concrete outcomes;
- NGO, public-interest, research, medical, education, or community project pages;
- Chinese-language coverage of international constructive news;
- reader-submitted leads that include original links.
- media and public-account leads from sources such as magazines, public-interest
  outlets, newsletters, and WeChat public accounts, as long as the final item is
  checked against the same specificity and evidence rules.

Avoid:

- slogan-style official praise;
- unverifiable touching stories;
- soft ads and brand PR;
- reposted short-video stories without traceable source;
- disaster-heavy stories where the "good" part is only emotional contrast.

Official sources are high-risk by default. They can be used only when the event has clear public value and at least one independent or primary supporting source.

## Screening Checklist

Accept an item only when most answers are yes:

- Is there a specific person, group, place, project, result, or measurable change?
- Can the reader click through to the original source?
- Is the event recent enough for a daily timeline?
- Does the item describe a real improvement, act of help, scientific progress, public-service improvement, environmental repair, or cultural/education benefit?
- Can the summary be written without slogans or emotional manipulation?
- If the source is official, commercial, or advocacy-heavy, is there cross-verification?

Reject or hold when:

- the story is unverifiable;
- it is mainly a slogan, ceremony, award, or leadership praise;
- it is mostly a brand campaign;
- it overstates early research;
- it depends on graphic bad-news framing for emotional effect;
- it has no concrete public value beyond "this feels nice";
- the original source cannot be found.

## Reader-Submitted Leads

Reader submissions are useful because many good acts are not covered by formal
media. Treat them as a separate input lane:

```text
reader lead
-> submitted / needs-review
-> needs-evidence / basic-trust / verified / rejected
-> only verified leads can enter main timeline and RSS
```

The project can accept leads about:

- a major public-good project or policy improvement;
- a small everyday act of kindness;
- a self-reported good deed;
- a person or organization that repeatedly does good work;
- a media, newsletter, or public-account item that looks like a good-news candidate.

Self-reported and witnessed stories do not always have formal evidence. That is
acceptable for collection, but not for verified publication. Missing evidence
means the story can only stay in the review queue or, in a future phase, appear
in a clearly labeled daily-kindness section.

Do not publish reader-submitted material when:

- the story exposes private details of minors, patients, aid recipients, or vulnerable people;
- the submitter relationship or commercial interest is hidden;
- the story looks like self-promotion, traffic bait, staged kindness, or brand PR;
- the facts cannot be described concretely.

## Daily Operating Rhythm

1. Fetch candidates from the fixed source pool.
2. Run DeepSeek scoring when `DEEPSEEK_API_KEY` is configured.
3. Review the AI candidate pool, not the full raw feed.
4. Read original articles for the final picks.
5. Check primary or secondary sources for higher-risk claims.
6. Write Chinese title, summary, why-good note, and verification note.
7. Publish 8-12 items when quality allows; publish fewer when the day is thin.
8. Build the site and inspect `/`, `/rss`, and `/rss.xml`.

The number is a target, not a quota. Empty or short days are acceptable.

## DeepSeek Triage Rules

DeepSeek is useful as a first-pass reducer, not as an editor. It should produce
Chinese summaries and scores, but publication still needs human reading.

Current routing rules:

- Reject items with very low specificity, evidence, or public value.
- Reject stale items older than about 45 days for the daily candidate pool.
- Treat `watch` sources strictly: if evidence or public value is not high enough, reject.
- Never auto-publish when `ALLOW_AUTOPUBLISH=false`.
- Use `INGEST_SCORE_LIMIT` for small paid tests before scoring a full day.
- Use `INGEST_REROUTE_ONLY=true` to re-apply routing rules without spending API calls.

The 2026-06-08 trial showed the rule shape clearly: Positive News and Reasons to
be Cheerful produced the usable candidate pool; Upworthy was too viral/light for
this project; YES! Magazine was mostly older archive/opinion material and should
remain a selective source.

## Source Pool Maintenance

Each source in `data/sources/sources.yaml` can be upgraded, downgraded, paused, or removed. Track these signals:

- feed reliability;
- number of usable candidates per week;
- repeated soft-ad or propaganda risk;
- source diversity by region and topic;
- how often a source needs cross-verification before use.

The first durable moat of this project is not code. It is a carefully maintained source pool plus conservative editorial judgment.
