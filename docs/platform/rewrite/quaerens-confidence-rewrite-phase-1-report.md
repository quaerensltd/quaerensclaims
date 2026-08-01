# Quaerens Confidence Rewrite Phase 1 Report

Version: 1.0  
Date: 1 August 2026  
Status: Ready for review

## Purpose

The Confidence Rewrite Phase 1 adjusted the core public experience so visitors move from uncertainty to understanding and then confidence. The work was content-focused and did not redesign the site, change public routes, alter calculators, rebuild builders, or deploy production changes.

## Commit Sequence

1. Audit: `3c6ebc6` - Add confidence rewrite phase 1 audit
2. Core public pages: `26bef08` - Apply confidence rewrite to core public pages
3. Complaint pages: `fd2257a` - Apply confidence rewrite to complaint pages
4. Validation and report: recorded in the final report commit

## Files Changed

- `docs/platform/rewrite/quaerens-confidence-rewrite-phase-1-audit.md`
- `docs/platform/rewrite/quaerens-confidence-rewrite-phase-1-report.md`
- `public/index.html`
- `public/about-quaerens.html`
- `public/the-quaerens-platform.html`
- `public/consumer-rights-knowledge-centre.html`
- `public/section75support.html`
- `public/holidaypark.html`
- `public/foam-insulation.html`
- `public/energy-switch.html`
- `public/car-finance.html`
- `public/airbnb-refunds.html`
- `public/freeflightclaim.html`

## Core Pages Rewritten

- Homepage: repositioned the opening around clarity, confidence and next steps.
- About Quaerens: clarified the role of Quaerens as evidence organisation and route guidance.
- The Quaerens Platform: added the governing confidence line, "We don't build software. We remove uncertainty."
- Consumer Rights Knowledge Centre: reframed the page as a starting point for understanding the issue before choosing a route.

## Complaint Pages Rewritten

- Section 75 support: reframed eligibility uncertainty around payments, supplier relationship and evidence.
- Holiday park: reframed purchase concerns around documents, routes and factual review.
- Spray foam: reframed mortgage, sale and roof concerns around evidence and next-step confidence while preserving compensation-keyword SEO.
- Energy supplier switching: reframed billing, readings, switching and payment confusion around account evidence.
- Car finance: reframed agreement analysis so visitors understand they can organise evidence without needing specialist knowledge first.
- Airbnb refunds: reframed refund refusal around booking, platform and payment evidence; removed an internal SEO-facing public sentence.
- Free flight claim: reframed the builder as a flight disruption complaint pack experience, preserving statutory compensation context where relevant.

## Validation

Project `npm test` could not run through the npm wrapper because the local npm CLI module was missing at `C:\Users\CasaT\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js`.

The underlying regression scripts were run directly with Node and passed:

- `node public/platform-services/qcms/qcms.test.js`
- `node public/platform-services/qcms/qcms.ui.test.js`
- `node public/platform-services/qcms-operations/qcms-operations.test.js`
- `node public/complaint-builder/tests/qcbf.test.js`
- `node public/builders/holiday/holiday.migration.test.js`
- `node public/builders/flight/flight.migration.test.js`
- `node public/builders/car-finance/carfinance.partial-integration.test.js`
- `node public/builders/energy/energy.qcms.integration.test.js`

Targeted public-content scans confirmed:

- The new confidence language appears on the intended Phase 1 pages.
- The Phase 1 pages do not contain the removed Airbnb internal SEO wording.
- No new aggressive guarantee wording such as "Guaranteed compensation", "Guaranteed refund", "Huge Compensation", "Claim Now" or "Act Now" was introduced.

## Guardrails Preserved

- No deployment was performed.
- QCMS was not modified.
- QCMS Operations was not modified.
- Operations CRM was not modified.
- Existing routes, canonical URLs, builder logic, calculators and export functions were preserved.
- Existing disclaimers and cautious outcome wording were preserved.

## Known Limitations

- Browser-based visual inspection was not performed in this phase because the task was a content rewrite rather than a redesign.
- The repository still contains unrelated uncommitted local changes outside this task, including `package.json`, `public/platform-services/the-quaerens-platform/README.md`, `flight temporary.docx` and `public/images/hero-broadbandandmobile.jpg`. These were not staged or modified for this report.
- A wider site scan still found older internal SEO wording on pages outside the Phase 1 target set. Those should be handled in a separate cleanup pass.

## Recommendations

- Repair the local npm installation so `npm test` can run normally again.
- Run a later whole-site language audit for older public-facing SEO notes.
- Review the Phase 1 pages visually before deployment to confirm line length, hero balance and mobile readability.

The Confidence Rewrite™ Phase 1 is ready for review.  
The public experience now helps people move from uncertainty to confidence.
