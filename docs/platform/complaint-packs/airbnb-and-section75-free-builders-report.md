# Airbnb and Section 75 Free Builders Report

Version: 1.0
Status: Completed Locally

## Summary

The Airbnb Refunds and Section 75 Support pages now include free, browser-first Complaint Pack Builders. The existing authority content, page URLs and optional guided-support forms remain in place. The primary visitor journey now points to the free builder first, with guided support retained as a separate optional route.

## CRM2 Admin Centre

The Admin Centre CRM2 card was updated to use the requested production wording:

- Title: CRM2
- Description: Second operational CRM workspace for lead management, manager review, closer workflow and client onboarding.
- Button: Open CRM2

## Airbnb Builder

Added a free Airbnb Complaint Pack Builder to /airbnb-refunds.html with:

- Issue capture
- Evidence checklist
- Timeline prompts
- Requested outcome and amount prompts
- Live Quaerens Consumer Complaint File preview
- Copy, RTF, TXT and print/save PDF controls
- Local browser save option controlled by the visitor
- Optional guided support link retained separately

## Section 75 Builder

Added a free Section 75 Complaint Pack Builder to /section75support.html with:

- Issue capture
- Evidence checklist
- Timeline prompts
- Requested outcome and amount prompts
- Live Quaerens Consumer Complaint File preview
- Copy, RTF, TXT and print/save PDF controls
- Local browser save option controlled by the visitor
- Optional guided support link retained separately

## Privacy and Data Handling

The free builders are browser-first. They do not submit answers to Quaerens, Firebase, email or CRM systems. Users choose whether to copy, print or download their own pack. Optional guided support forms remain separate and continue to use the existing page behaviour.

## SEO and URL Preservation

No page slugs, canonical URLs, sitemap URLs or structured-data URLs were changed. No noindex tag was added to either public page. Existing SEO content remains in place.

## Validation Completed

- Confirmed both builder sections are present once.
- Confirmed the shared builder script is present once on each edited page.
- Confirmed copy, RTF, TXT and print controls are present.
- Confirmed the builder script does not contain fetch, addDoc or collection calls.
- Confirmed canonical links remain present.
- Confirmed no noindex tag was added.
- Confirmed Admin Centre CRM2 wording is present.

## Files Changed

- public/admin-centre.html
- public/airbnb-refunds.html
- public/section75support.html
- docs/platform/complaint-packs/airbnb-and-section75-free-builders-plan.md
- docs/platform/complaint-packs/airbnb-and-section75-free-builders-report.md

## Known Limitations

The builders are static browser-first tools. They do not verify external platform rules or submit complaints automatically. Users must review the generated text and send it themselves with supporting evidence.
