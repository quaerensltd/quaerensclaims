# Quaerens Confidence Rewrite™ Phase 2 Report

Version: 1.0  
Status: Complete - Ready for Platform Guardian Review  
Date: 1 August 2026

## Executive Summary

The Confidence Rewrite™ Phase 2 refined the core public Quaerens journey across the homepage, platform pages, knowledge pages, flagship free tools, professional assessment pages and complex builders.

The work followed the governing Quaerens Platform™ documents and the public journey:

Understand -> Prepare -> Decide -> Progress

The rewrite focused on calmer, clearer, more confidence-led language. It did not redesign the site, remove SEO architecture, change canonical URLs, alter QCMS, change QCMS Operations, modify Operations CRM, or deploy.

## Commits

1. `8339cf8` - Add confidence rewrite phase 2 plan
2. `41f1faf` - Refine core public confidence journey
3. `93dd060` - Refine flagship free and payment confidence routes
4. `de743ce` - Refine professional assessment route confidence copy
5. `17290ae` - Refine complex builder confidence journeys
6. `06069ec` - Repair holiday park evidence anchor

The final report was prepared after these implementation commits.

## Files Changed

- `docs/platform/rewrite/quaerens-confidence-rewrite-phase-2-plan.md`
- `public/index.html`
- `public/the-quaerens-platform.html`
- `public/about-quaerens.html`
- `public/consumer-rights-knowledge-centre.html`
- `public/freeflightclaim.html`
- `public/section75support.html`
- `public/foam-insulation.html`
- `public/holidaypark.html`
- `public/airbnb-refunds.html`
- `public/car-finance.html`
- `public/energy-switch.html`
- `docs/platform/rewrite/quaerens-confidence-rewrite-phase-2-report.md`

## Final Page Journey

### `index.html`

The homepage now gives visitors a clearer entry journey: understand the available routes, prepare through free builders or guidance, decide between DIY and guided support, and progress to the most relevant route.

### `the-quaerens-platform.html`

The platform page now explains the connected platform more clearly, showing how visitors move from knowledge and evidence into the appropriate support system.

### `about-quaerens.html`

The About page now presents Quaerens through trust, evidence, people and practical support, helping visitors understand the organisation before deciding whether to progress.

### `consumer-rights-knowledge-centre.html`

The Knowledge Centre now better explains how users can start with a problem, prepare evidence, choose a route and progress to a guide, hub, builder or review page.

### `freeflightclaim.html`

The flight page now reinforces the complaint pack journey: understand the disruption, prepare journey details and evidence, decide the correct submission route and progress with a clearer pack.

### `section75support.html`

The Section 75 page now improves route clarity by explaining when card-linked support may be relevant, what evidence helps and what the visitor can do next.

### `foam-insulation.html`

The spray foam page now keeps its authority content while giving visitors a clearer route from problem recognition to evidence preparation and review.

### `holidaypark.html`

The holiday park page now gives a clearer static caravan and holiday lodge journey, with the evidence CTA repaired so it lands on the correct checklist section.

### `airbnb-refunds.html`

The Airbnb page now focuses more clearly on refund and booking problems, evidence preparation, complaint confidence and enquiry conversion without removing SEO content.

### `car-finance.html`

The car finance builder now better explains the journey from agreement analysis to complaint pack preparation, requested outcome and next-step readiness.

### `energy-switch.html`

The energy builder now more clearly frames the process around understanding the account issue, preparing evidence, deciding the route and progressing with a structured pack.

## Duplicate Content Consolidated

Repeated or overly similar public-facing explanations were tightened where they weakened confidence or made the journey feel circular. The rewrite preserved page length, SEO coverage and legally cautious wording while improving the visitor's sense of direction.

No builder logic was intentionally removed.

## Anchors Repaired

The Holiday Park hero CTA `#evidence-checklist` previously had no matching target. It now points to the visible "Documents That May Help" evidence checklist section.

## Structural Repairs

- Internal hash anchors were checked across the Phase 2 target pages.
- JSON-LD blocks were parsed locally.
- UTF-8 charset presence was checked across the target pages.
- The Holiday Park evidence anchor was repaired.

## CTA and Journey Improvements

CTA and support copy were refined to reduce uncertainty and pressure. The pages now more consistently invite visitors to:

- understand the issue;
- prepare the relevant evidence;
- decide the appropriate route;
- progress with a builder, guide, review or assessment.

## Accessibility Improvements

The rewrite avoided adding hidden or unclear interactions. Improvements focused on clearer text hierarchy, more descriptive destinations and repaired internal navigation. Existing labels, headings, forms and image references were preserved unless the Phase 2 rewrite required wording improvements.

## SEO Preserved

Canonical URLs, page slugs, sitemap assumptions, structured-data URLs and core SEO architecture were not changed. The rewrite improved confidence and clarity without removing the established topic coverage.

## Schema Validation

Local JSON-LD parsing passed for the Phase 2 target pages:

- `index.html`
- `the-quaerens-platform.html`
- `about-quaerens.html`
- `consumer-rights-knowledge-centre.html`
- `freeflightclaim.html`
- `section75support.html`
- `foam-insulation.html`
- `holidaypark.html`
- `airbnb-refunds.html`
- `car-finance.html`
- `energy-switch.html`

## Tests Run

The following local regression tests passed:

- `node public\complaint-builder\tests\qcbf.test.js`  
  Result: `QCBF tests passed`
- `node public\complaint-builder\tests\platform.test.js`  
  Result: `Platform branding and dashboard tests passed`
- `node public\platform-services\qcms\qcms.test.js`  
  Result: `QCMS Part 1A tests passed`
- `node public\platform-services\qcms\qcms.ui.test.js`  
  Result: `QCMS Part 1B UI tests passed`
- `node public\platform-services\qcms-operations\qcms-operations.test.js`  
  Result: `QCMS Operations Case Workspace Release 1.4.1 tests passed`
- `node public\builders\holiday\holiday.migration.test.js`  
  Result: `Holiday QCBF migration tests passed`
- `node public\builders\holiday\holiday.version11.test.js`  
  Result: `Holiday QCBF v1.1 document tests passed`
- `node public\builders\flight\flight.migration.test.js`  
  Result: `Flight QCBF 1.2 migration tests passed`
- `node public\builders\car-finance\carfinance.partial-integration.test.js`  
  Result: `Car Finance QCBF partial integration tests passed`
- `node public\builders\energy\energy.migration.test.js`  
  Result: `Energy Version 1.0 production acceptance tests passed: 39 fictional scenarios plus official source, supplier, SEO, schema and export checks`
- `node public\builders\energy\energy.qcms.integration.test.js`  
  Result: `Energy QCMS integration tests passed`

Additional temporary integrity validation passed:

- UTF-8 charset check
- Internal hash-anchor check
- JSON-LD parse check
- Car-finance duplicate id check

## Screenshots and Review Instructions

No deployment was performed.

Recommended Platform Guardian review path:

1. Start a local public preview server from the repository root.
2. Review each target page at desktop width.
3. Review each target page at 414px, 390px, 360px and 320px widths.
4. Confirm the public journey is clear: Understand -> Prepare -> Decide -> Progress.
5. Confirm builders still accept input, update previews and generate exports.

## Car-Finance Duplicate-Function Findings

The car-finance page still contains duplicate function definitions. This was identified during validation and intentionally deferred because Phase 2 required preserving working builder functionality rather than refactoring a complex active builder.

Duplicate function names reported:

- `buildEvidenceChecklist`
- `buildTimeline`
- `collectAnswers`
- `buildLetter`
- `buildComplaintSummary`
- `buildPack`
- `docLabels`
- `fullPackText`
- `filename`
- `downloadRtf`
- `downloadPdf`
- `newPage`
- `buildFinancialAgreementSummary`
- `buildReadinessReview`
- `buildAgreementReview`
- `buildKnownAndRequestInfo`
- `buildSmartSubmissionText`

Duplicate ids reported: none.

## Remaining Technical Debt

- Car-finance should be deduplicated into a cleaner shared builder/module structure in a future controlled refactor.
- Full browser visual regression screenshots were not run in this phase.
- Existing unrelated working tree changes were deliberately left untouched.

Unrelated files present outside this Phase 2 work:

- `package.json`
- `public/platform-services/the-quaerens-platform/README.md`
- `flight temporary.docx`
- `public/images/hero-broadbandandmobile.jpg`

## Deferred Refactoring

The car-finance builder should be reviewed in a future technical refactor after Product Guardian approval. The correct future direction is to reduce duplicate function definitions while keeping export behaviour, preview behaviour, local save behaviour and pack generation stable.

## Known Limitations

- No deployment occurred.
- No production-domain verification occurred.
- No visual screenshot suite was completed.
- Car-finance duplicate functions remain documented technical debt.

## Phase 3 Recommendations

1. Run a dedicated visual QA pass across the Phase 2 pages.
2. Refactor car-finance duplicate functions only after capturing builder export regressions.
3. Extend the confidence journey language to lower-priority category, knowledge and legal pages.
4. Build a shared content pattern for Understand, Prepare, Decide and Progress sections.
5. Add a lightweight automated internal-anchor and JSON-LD validation script to the permanent test suite.

## Completion Statement

The Confidence Rewrite™ Phase 2 has completed its local implementation and validation scope. The public experience is clearer, calmer and more consistent with the Quaerens Platform™ governing documents.
