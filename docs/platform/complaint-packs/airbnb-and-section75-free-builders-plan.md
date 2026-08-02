# Airbnb and Section 75 Free Builders Plan

Version: 1.0
Status: Implementation Plan

## Purpose

This plan records the scoped public-page expansion for two existing Quaerens authority pages:

- /airbnb-refunds.html
- /section75support.html

The objective is to add browser-first, free Complaint Pack Builders while preserving existing SEO authority, URLs, canonical signals and optional guided support routes.

## Governing Principles

- The free route must not require personal data collection, account creation, email submission or payment.
- Builder answers stay in the visitor's browser unless they deliberately copy, print or download their own pack.
- Existing guided support forms may remain, but must be clearly separate and optional.
- The existing CRM and CRM2 systems must not receive data from the free builders.
- Existing page URLs, canonicals, metadata and structured-data URLs must not be migrated as part of this task.

## Implementation Scope

1. Confirm the CRM2 foundation is represented on the Admin Centre.
2. Add an Airbnb Complaint Pack Builder section near the top of the Airbnb Refunds page.
3. Add a Section 75 Complaint Pack Builder section before the guided assessment form on the Section 75 page.
4. Add shared, page-local browser-first builder behaviour for preview, copy, RTF, TXT and print output.
5. Keep optional guided-support forms on the page, but route primary CTAs to the free builder.
6. Validate that the builders do not call Firebase, fetch or submit data automatically.

## Validation Plan

- Confirm CRM2 card wording and link on Admin Centre.
- Confirm both builder sections are present once.
- Confirm the builder script is present once on each edited page.
- Confirm no noindex tag was added.
- Confirm existing canonical URLs are preserved.
- Confirm free-builder script contains no network submission functions.
- Confirm download, copy and print controls are present.
- Commit only the scoped files and do not stage unrelated existing changes.
