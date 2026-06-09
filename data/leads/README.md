# Community Leads

This directory documents the reader-submitted lead workflow. Reader submissions
are not published news items. They must be reviewed before any item enters the
homepage timeline or RSS.

## Lead Types

- `media-candidate`: a lead found in media, newsletters, public accounts, or RSS.
- `public-project`: a public-good project, public improvement, policy change, or institutional action.
- `everyday-kindness`: a witnessed small act of kindness.
- `self-reported-kindness`: a good deed submitted by someone who participated in it.
- `person-organization-profile`: a person or organization that appears to do good work repeatedly.
- `other`: a lead that does not fit the above types.

## Review Status

- `submitted`: received, not reviewed.
- `needs-review`: needs human judgment before routing.
- `needs-evidence`: specific enough to keep, but not strong enough to publish.
- `basic-trust`: plausible and specific; may be used only with clear labels in a future daily-kindness section.
- `verified`: enough public evidence for main timeline/RSS.
- `rejected`: outside scope, promotional, unverifiable, privacy-risky, or misleading.

## Publishing Boundary

Only `verified` leads can enter `data/news/YYYY-MM-DD.json` and RSS. `basic-trust`
items are not verified news. If they are ever shown publicly, the UI must label
them as reader-submitted, self-reported, witnessed, or not independently verified.

## Review Checklist

- Is there a concrete person, group, place, time, action, and result?
- Is the submitter relationship clear?
- Is there a public source, link, project page, video, or other evidence?
- If evidence is missing, is the story small enough to keep as a lightly labeled daily-kindness lead?
- Does the story expose minors, patients, aid recipients, addresses, or contact details?
- Is there commercial, organizational, or self-promotional risk?
- Would publishing this turn the project into slogan-style positive energy?
