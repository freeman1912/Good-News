# Good News · PRD · v4-chinese-source-ingestion

> This iteration turns Chinese source discovery from review tasks into a real ingestion lane.

## 1. Background

The project already has a working English RSS ingestion flow and a Chinese lead
task generator. The next gap is that Chinese sources are not yet fetched as real
candidate articles, so they cannot be scored, reviewed, or promoted through the
same daily workflow.

Chinese sources need stricter handling than English constructive-news sources:
many pages are official, promotional, ceremony-heavy, or inaccessible. The first
implementation should therefore fetch real pages while keeping publication
conservative.

## 2. Goals

- Add configurable Chinese webpage discovery sources.
- Fetch article links from Chinese listing/category pages.
- Fetch each article page for title, URL, date, meta description, and text
  snippets.
- Merge Chinese candidates into the existing fetched candidate file.
- Let AI scoring and current review/export steps process Chinese candidates.
- Keep official, organizational, and watch-level Chinese sources out of direct
  automatic publication unless later rules explicitly allow it.

## 3. Non-Goals

- No WeChat public-account crawling in this iteration.
- No short-video parsing.
- No search-engine API dependency.
- No login, paywall bypass, browser automation, or CAPTCHA handling.
- No automatic publication from official or primary organizational sources.
- No guarantee that every configured Chinese website is reachable every day.

## 4. Acceptance Criteria

- `pnpm trial:daily` fetches Chinese webpage candidates when configured.
- Chinese candidates include `language: "zh"`, source metadata, URL, title,
  summary/content snippet, and dedupe key.
- Fetch failures are captured in the daily fetch-errors file.
- The daily review report makes it visible how many Chinese candidates were
  fetched and how many entered review.
- `pnpm typecheck` and `pnpm build` pass.
