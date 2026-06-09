# Good News · Chinese Source Playbook

This playbook answers the hard part of the project: where Chinese good-news
leads can come from, especially when the first signal is a short video rather
than a conventional article.

## Core Conclusion

There is no stable Chinese equivalent of Positive News or Reasons to be
Cheerful yet. Chinese good-news discovery should use a lead pipeline, not a
single source list.

The pipeline should be:

```text
video/search/platform lead
-> AI extracts claim, people, place, date, action, result
-> AI assigns risk and evidence gaps
-> search for source trail and cross-verification
-> publish only if the story is concrete and traceable
```

Short videos can be leads. They are not enough by themselves for publication
unless the video has a stable original URL, identifiable context, low privacy
risk, and independent support.

## Source Layers

### Layer 1 · Primary Public-Good Sources

These are better as evidence sources than daily news feeds.

- 中国发展简报 / NGO信息中心: NGO and social-sector project leads.
- 自然之友: environmental project updates and primary project context.
- 腾讯公益: fundraising and charity project pages, useful for project identity and updates.
- 微公益: public-interest campaigns and project pages.
- 字节跳动公益: platform-side public-good projects and creator campaigns.
- 阿里巴巴公益: public-good campaigns and project updates.
- Universities, hospitals, research institutes, and foundations.

Use case: verify whether a project, organization, campaign, or claimed public
benefit really exists.

### Layer 2 · Public-Interest Media

These are discovery and context sources, not automatic publishing sources.

- 财新健康
- 南方周末
- 澎湃新闻
- 中国青年报
- 新京报
- 极目新闻
- 红星新闻
- 封面新闻

Use case: find concrete public-service, science, health, education, environment,
and community-help stories. Reject opinion-only, ceremony-only, and slogan-style
pieces.

### Layer 3 · Video and Social Lead Sources

These are high-volume, high-noise lead sources.

- 抖音
- 快手
- 微信视频号
- 微博
- 小红书
- Bilibili

Use case: discover people helping people, community mutual aid, rescue, local
volunteer action, animal/environment projects, and small public improvements
that may never become formal news.

Risk: videos may be staged, edited, reposted, privacy-invasive, commercial,
fundraising bait, or stripped of time/place context.

## Video Lead Rules

Treat a video as a lead only when it has at least three of these:

- original uploader can be identified;
- publication date is visible;
- place or organization can be inferred;
- the action is specific, not just emotional;
- result is visible or described;
- there is a follow-up post, media report, project page, or organization page;
- no obvious commercial ask, donation bait, or traffic bait.

Do not publish when:

- the story only exists as a reposted clip;
- the original source is missing;
- the people shown are minors or vulnerable people and privacy risk is high;
- the event is mostly tragedy/drama with a tiny "good" contrast;
- the uploader is selling products, asking for money, or farming attention;
- there is no date, place, person, organization, or outcome.

## AI Extraction Prompt Shape

For Chinese video/search leads, the AI should not start by writing a summary.
It should first extract facts and gaps.

Required fields:

- `claim`: what good thing is being claimed;
- `actors`: named or visible people/organizations;
- `place`: city, school, hospital, community, road, project site, or unknown;
- `date`: event date or post date;
- `action`: what was done;
- `result`: what changed;
- `sourceTrail`: original URL, repost URL, media URL, project URL;
- `privacyRisk`: low/medium/high;
- `stagingRisk`: low/medium/high;
- `commercialRisk`: low/medium/high;
- `verificationGaps`: missing evidence;
- `route`: reject / hold / verify / candidate.

AI should route video-only leads to `hold` unless evidence is unusually strong.

## Publish Thresholds

### Publish Candidate

Use when at least one is true:

- credible media source plus primary project/source page;
- original project/organization source plus independent context;
- video original plus local media follow-up;
- multiple independent posts point to the same concrete event and source trail.

### Hold For Verification

Use when:

- video looks promising but has no independent source;
- source is official-only;
- person/place/date is incomplete;
- story involves minors, medical treatment, fundraising, or vulnerable people.

### Reject

Use when:

- no original link;
- no concrete person/place/date/action/result;
- repost-only;
- obvious emotional manipulation;
- brand PR or creator traffic bait;
- official praise without verifiable public value;
- "positive energy" slogan story with no evidence trail.

## Daily Chinese Discovery Workflow

1. Generate search/video tasks from `data/sources/china-leads.yaml`.
2. Use search APIs or manual platform search to collect URLs.
3. Save raw leads separately from RSS candidates.
4. Ask AI to extract fact fields and risk fields.
5. Search for cross-verification.
6. Promote only verified leads into `data/manual/YYYY-MM-DD.json` or an automated publish draft.

The human workload should shrink to reviewing a small `verify` or `candidate`
queue, not reading every raw video or article.

