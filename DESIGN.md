---
name: Good News
description: A light, trustworthy Chinese good-news daily: airy enough to feel relieving, dense enough to scan like a serious information product.

colors:
  primary: "#16756F"
  secondary: "#2F80A8"
  tertiary: "#D89A2B"
  accent: "#C95F46"
  neutral: "#F7FAF6"
  surface: "#FFFFFF"
  surface-muted: "#EEF5F1"
  border: "#D8E2DD"
  on-primary: "#FFFFFF"
  on-neutral: "#17211F"
  muted-text: "#66736F"
  success: "#238B5A"
  warning: "#B57917"
  error: "#B94A48"

typography:
  h1:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "1.15"
    letterSpacing: "0"
  h2:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: "1.3"
    letterSpacing: "0"
  h3:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: "1.35"
    letterSpacing: "0"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.7"
    letterSpacing: "0"
  caption:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

rounded:
  none: "0"
  sm: "4px"
  md: "8px"
  lg: "8px"
  full: "9999px"

elevation:
  none: "none"
  sm: "0 1px 2px rgba(23, 33, 31, 0.04)"
  md: "0 8px 24px rgba(23, 33, 31, 0.07)"
  lg: "0 16px 36px rgba(23, 33, 31, 0.10)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "#105E59"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.body}"
  news-entry:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "18px"
    elevation: "{elevation.sm}"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    typography: "{typography.body}"
  badge:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
    padding: "4px 9px"
    typography: "{typography.caption}"
---

## Overview
Good News uses the "light daily briefing" direction. It should feel like opening a clean morning digest: calm, bright, credible, and quietly encouraging. The site is not a cute healing toy and not an official news portal. It is an information product with warmth.

The chosen direction is based on option B from the visual explorations: a light daily homepage with clear RSS access, a friendly daily summary, and a restrained editorial timeline. It borrows AIHOT's scan-friendly density but avoids looking like a generic AI-generated card stack by leaning on date rails, hairline dividers, and newspaper-like row rhythm.

The core design sentence is: clear good news, with enough air to breathe and enough evidence to trust.

## Colors
- **Primary (#16756F):** Main brand color for RSS buttons, active filters, links, and key states. It suggests recovery and trust without becoming a medical or government green.
- **Secondary (#2F80A8):** Used sparingly for source links, RSS affordances, and secondary emphasis.
- **Tertiary (#D89A2B):** Used for small warm accents such as date markers or "why it matters" highlights.
- **Accent (#C95F46):** Used rarely for submission prompts or attention states, never as a dominant surface.
- **Neutral (#F7FAF6):** Page background. It is a pale green-white rather than beige or cream.
- **Surface (#FFFFFF):** News entries, RSS blocks, and page sections.
- **Surface-muted (#EEF5F1):** Badges, soft strips, and quiet secondary panels.
- **Border (#D8E2DD):** Hairline dividers and entry borders.
- **On-neutral (#17211F):** Primary reading text.
- **Muted-text (#66736F):** Metadata, timestamps, source notes, and helper copy.

The palette must not become a one-color teal interface. Sky blue, amber, and coral accents exist to keep the site lively while preserving the calm base.

## Typography
Use system Chinese-first typography for speed, reliability, and legibility. `Noto Sans SC` is included as a preferred fallback, but the interface should look good with system fonts alone.

Headings are confident but not oversized. Homepage typography should never feel like a marketing landing page. Body text is comfortable for Chinese reading, with generous line height because each news entry contains summary, reason, and verification text.

Metadata uses caption sizing and muted color, not tiny gray text that becomes hard to read. Titles stay compact enough for dense scanning, especially on mobile.

## Layout
The layout is mobile-first with a centered content column. Desktop can use a max-width around 960-1120px, with optional right-side utility space only if it does not reduce reading comfort.

Homepage structure:
- Top navigation stays thin and functional.
- Daily summary sits near the top as a compact briefing strip, not a huge hero.
- Filters sit close to the timeline and behave like controls, not decorative pills.
- News entries are grouped by date. "今日" means the current day or latest 24-hour window; previous-day content appears below with a clear date break.
- RSS and submit prompts appear as quiet utility bands, not popups.

News entries may use surface contrast, but they should not feel like isolated marketing cards. Prefer timeline rows with a quiet date rail, hairline dividers, compact spacing, and strong typographic hierarchy.

## Elevation & Depth
Use soft depth only. Most structure comes from spacing, borders, and background contrast. The default news entry uses `elevation.sm`; larger shadows are reserved for hover or focused interactive states.

Avoid floating panels inside panels. Page sections should not be stacked as decorative cards. Individual news entries, RSS copy blocks, and submission instructions can be card-like because they are repeated items or tools.

## Shapes
Rounded corners are restrained: 4px for small controls, 8px for entries and panels, full pills only for badges and filter chips. This keeps the site friendly without becoming toy-like.

Borders are 1px and low contrast. Do not use thick decorative outlines, wavy dividers, blob shapes, or illustration frames. The timeline can use a subtle vertical date rail or section dividers, but the date rail should never dominate the content.

## Components

### button-primary
Used for the highest-priority action on a page: RSS subscription, copy RSS, or open GitHub Issue. Only one primary action should dominate a screen region.

### button-secondary
Used for navigation-like actions, source links when styled as controls, and less urgent actions such as "查看归档".

### news-entry
The key component. It contains title, summary, region badge, topic badge, source, original link, "为什么是好消息", and "核实说明". The title and summary must be readable at a glance; verification details can be smaller but always visible. Avoid heavy card shadows for every item; the default should feel like an editorial row inside a timeline.

### input-text
Used only if a search or copyable RSS field is introduced. It should feel utilitarian and calm.

### badge
Used for region, topic, and verification states. Badges are information labels, not gamified achievements. Do not create a "好消息指数" badge.

## Do's and Don'ts

### Do's
- Use a light daily briefing layout with clear date grouping.
- Keep the timeline scan-friendly and avoid forcing every item into a heavy card.
- Make RSS access visible on the homepage and RSS page.
- Preserve a visible verification pattern on every news entry.
- Use warm accents sparingly to make the page feel alive.
- Use real source names and original links as part of the visual trust system.
- Keep empty states honest: if today has fewer good items, say so.

### Don'ts
- Do not make the site look like an official propaganda portal.
- Do not use slogans, oversized hero sections, or inspirational wallpaper design.
- Do not use gradient orb backgrounds, bokeh, neon, or purple-blue gradient themes.
- Do not use stock-photo thumbnails as a default pattern.
- Do not make every item image-dependent.
- Do not use cute cartoon decoration, emojis, confetti, or gamified scores.
- Do not hide source and verification behind extra clicks.
- Do not add popups, carousels, or attention-grabbing subscription overlays.

## Motion & Animation
**Level:** subtle.

Typical scenes:
- Buttons and filters use quick color or border transitions under 160ms.
- News entries can lift slightly on hover, but the movement must be barely noticeable.
- Page transitions are optional and should not delay reading.
- Respect `prefers-reduced-motion`; the site remains fully understandable without animation.

## Responsiveness
**Approach:** mobile-first.

Suggested breakpoints:
- Small: single column, compact nav, horizontal filter scroll if needed.
- Medium: single reading column with slightly wider spacing.
- Large: centered content with optional utility area for RSS or project principles.

Mobile simplifications:
- Keep the daily summary short.
- Stack badges and metadata cleanly.
- Avoid side rails that steal horizontal space.
- Keep copy buttons and RSS actions large enough to tap.

## Accessibility
**WCAG target:** AA.

Color contrast must meet AA for text and controls. Primary/on-primary is designed for strong contrast. Interactive elements need visible focus states, keyboard access, and readable labels.

The timeline must be semantic HTML: headings for dates, article elements for news entries, real links for original sources, and button elements for copy actions. Do not rely on color alone to distinguish region or topic.

## UI Framework Considerations
**Requirements:**
- Strong typography and list rendering.
- Easy badge, button, and entry composition.
- Good accessibility defaults.
- Low visual overhead; the product should not look like a generic SaaS dashboard.
- RSS copy controls and filters should be simple to implement.

**Candidate libraries:**
- **Custom CSS with Astro components** — best fit for a lightweight static editorial tool.
- **shadcn/ui selectively** — useful if the project later needs accessible tabs, dialogs, or command-like controls, but should not impose a SaaS look.
- **Radix primitives** — good for accessible low-level interactions if needed.

Final selection is deferred to `ARCHITECTURE.md`.

## References & Inspiration
**Reference sites:**
- [AIHOT](https://aihot.virxact.com/) — compact AI-news timeline, clear categories, scan-friendly information density.
- [Positron Today](https://positron.today/) — light positive-news aggregation mood, RSS visibility, open-source friendliness.
- [Positive News](https://www.positive.news/) — credible constructive-news tone and editorial trust.
- [Reasons to be Cheerful](https://reasonstobecheerful.world/) — solutions-oriented framing and seriousness without doom.

**Chosen direction:** option B from the generated comparison board, with A's compact timeline behavior and C's visible verification discipline.
