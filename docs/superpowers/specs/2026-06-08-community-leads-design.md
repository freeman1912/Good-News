# Community Leads Design

## Purpose

Good News needs a community-led discovery loop because many Chinese good-news stories are not covered by RSS-friendly sources. The feature should let ordinary readers submit leads while protecting the main timeline from unverifiable stories, self-promotion, privacy harm, and slogan-style positive energy.

## Approach

The first version uses a static web form on `/submit`. When submitted, the form generates a GitHub Issue draft with a structured title and body. This keeps the site static and open-source-friendly while making submission easier than asking readers to hand-fill a GitHub template.

## Content Model

Submissions are leads, not published news. Leads can be:

- media candidates
- public-good projects
- everyday kindness
- self-reported kindness
- person or organization profiles

Each lead has a review status: `submitted`, `needs-review`, `needs-evidence`, `basic-trust`, `verified`, or `rejected`.

## Publication Rules

Only verified leads can enter the main homepage timeline and RSS. Smaller personal stories may later enter a separate daily-kindness section, but only with visible labels such as `自述`, `目击`, `未独立核实`, or `已补充证据`.

## Privacy And Risk

The form asks about privacy, commercial relationships, and evidence. Evidence is not mandatory for every small kindness story, but missing evidence limits where the story can be displayed. Stories involving minors, patients, recipients of aid, or vulnerable people require extra caution.
