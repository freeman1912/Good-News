# Good News · PRD · v3-community-leads

> This iteration upgrades reader submissions from a secondary GitHub link into a core community lead flow.

## 1. Background

Chinese good-news discovery cannot rely only on RSS feeds or media searches. Many useful stories appear as community observations, personal acts of kindness, public-interest projects, creator videos, and small local improvements that are never written up by major media.

Good News should become a public place where readers can submit these leads, while keeping publication conservative and verifiable.

## 2. Goals

- Make `/submit` understandable for ordinary readers, not only developers.
- Let readers submit media leads, public projects, everyday kindness, self-reported good deeds, and person/organization leads.
- Keep GitHub Issues as the first backend, but hide most of the GitHub complexity behind a web form.
- Define review levels so unverified personal stories do not enter the main timeline as verified news.
- Prepare future AI-assisted review without allowing automatic publication.

## 3. Non-Goals

- No login system.
- No public voting, likes, comments, or leaderboard.
- No automatic publishing from submissions.
- No direct file upload in this phase.
- No evidence requirement for every small kindness story, but evidence affects where and how it may be displayed.
- No "positive energy" slogans, rankings, or moral pressure.

## 4. Content Layers

### 4.1 今日精选好消息

The main homepage timeline and RSS feed. Items here require public sources, clear facts, and verification notes.

Examples:

- A public-interest project helped a measurable group of people.
- A policy or institutional change produced concrete public benefit.
- A medical, environmental, educational, or social problem is being solved.
- A person or organization did sustained work that can be documented.

### 4.2 每日好人好事

A future lighter section for smaller human-scale stories. These stories can be reader-submitted, self-reported, or witnessed, but must be labeled clearly.

Possible labels:

- `读者提交`
- `自述`
- `目击`
- `有公开来源`
- `未独立核实`
- `已补充证据`

This layer should not be mixed into the verified news RSS unless reviewed and promoted.

### 4.3 人物 / 组织线索库

A lead archive for people and groups who repeatedly do good work but are not covered by formal media. A lead can collect videos, posts, reports, project pages, and reader observations until it becomes strong enough for a profile or verified item.

## 5. Submission Form Requirements

The first web form must collect:

- Lead type.
- One-sentence title.
- Date or approximate time.
- Location.
- Who did what.
- Who benefited and what changed.
- Why the submitter thinks it is good news.
- Submitter relationship: self, witness, online source, media/source lead, or other.
- Evidence links or notes.
- Privacy and safety notes.
- Commercial, organizational, or personal relationship disclosure.
- Optional public name.

Submission output:

- The form generates a GitHub Issue title and body.
- The user confirms by opening GitHub and submitting the issue.
- The generated issue gets `good-news-lead` and `needs-review` labels.

## 6. Review Requirements

Every lead starts as `submitted`. Review can route it to:

- `verified`: enough public evidence for main timeline/RSS.
- `basic-trust`: plausible and specific, may be used in a future daily-kindness section with labels.
- `needs-evidence`: specific but not enough evidence yet.
- `needs-review`: requires human judgment.
- `rejected`: unverifiable, privacy-risky, promotional, misleading, or outside scope.

AI may assist by extracting facts and risks, but cannot publish.

## 7. Acceptance Criteria

- `/submit` presents an ordinary-reader-friendly form.
- The form generates a readable GitHub Issue draft with all key fields.
- The page explains that submissions are leads, not automatic publications.
- The page distinguishes verified main timeline items from future daily-kindness/self-reported items.
- Issue template fields match the form's review model.
- Type checking and build pass.
