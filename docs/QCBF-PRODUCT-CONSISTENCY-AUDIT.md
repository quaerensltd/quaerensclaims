# QCBF Product Consistency Audit

Status: audit complete for current production builders  
Baseline commit: `ed6ea4fcc17b23df009be86a21afc090e8bc92c8`  
Shared framework version: `QCBF 1.2` / `1.2.0`  
Untracked files at baseline: `flight temporary.docx` only

## Executive Summary

No P0 production blockers were found during the source and automated-test audit. The four reviewed production URLs returned HTTP 200 with UTF-8 headers, and the available automated regression tests passed.

The main risk is consistency drift rather than broken functionality. Flight, Holiday, Car Finance and Baggage are all recognisably part of the QCBF platform, but they are not integrated at the same depth. Flight and Car Finance still contain substantial inline builder logic, while Baggage and Holiday are closer to a clean shared-module pattern.

No feature rebuild, redesign or production deploy was performed as part of this audit.

## Production Baseline

| Builder | URL | Status | Charset | Title | H1 |
| --- | --- | --- | --- | --- | --- |
| Flight | `https://www.quaerens.co.uk/freeflightclaim.html` | 200 | `text/html; charset=utf-8` | `Free Flight Compensation Pack Builder | Delay & Cancellation Claims | Quaerens` | `Claim Flight Delay or Cancellation Compensation Yourself` |
| Holiday | `https://www.quaerens.co.uk/freeholidaycompensation.html` | 200 | `text/html; charset=utf-8` | `Free Holiday & Package Travel Complaint Pack Builder | Quaerens` | `Build Your Holiday & Package Travel Complaint Pack` |
| Car Finance | `https://www.quaerens.co.uk/car-finance.html` | 200 | `text/html; charset=utf-8` | `Car Finance Agreement Analysis & Complaint Pack Builder | Quaerens` | `Build Your Car Finance Agreement Analysis & Complaint Pack` |
| Baggage | `https://www.quaerens.co.uk/lost-luggage.html` | 200 | `text/html; charset=utf-8` | `Free Lost, Delayed & Damaged Baggage Complaint Pack | Quaerens` | `Lost, Delayed or Damaged Luggage? Build Your Free Airline Complaint Pack` |

## Builder Status

### Flight

Status: migrated to QCBF 1.2 with active specialist flight modules.

Confirmed source modules include flight config, analysis, documents and a reusable Flight Card module. The FR578 regression scenario is covered in automated tests and passed. The live page also contains significant inline logic and inline flight-card presentation, so Flight still has more than one active presentation path.

Key details:

- Storage namespace in config: `qcbf-flight`
- Legacy storage key on page: `quaerensFlightComplaintPackDraftV1`
- Pack prefix: `QF`
- Steps: 8
- Exports: PDF, Word/RTF, TXT, copy and print

### Holiday

Status: QCBF migration present with Holiday v1.1 tests passing.

Holiday has strong topic-specific document generation and a passed Jet2/Rhodos-style regression scenario. The config reports `QCBF 2.0` even though the shared framework version is currently `QCBF 1.2`, which should be aligned before wider framework reporting is used.

Key details:

- Storage namespace: `freeholidaycompensation`
- Storage key: `quaerensHolidayComplaintPackV1`
- Pack prefix: `QH`
- Steps: 8
- Exports: PDF, Word/RTF, TXT, copy and print

### Car Finance

Status: partial QCBF integration with specialist car-finance logic preserved.

Car Finance has the deepest specialist analysis and more export actions than the other builders. The partial-integration test passed. The page should remain specialist, but common output labels and draft behaviours should be brought closer to the shared standard in a future consistency phase.

Key details:

- Storage namespace: `qcbf-car-finance`
- Draft storage key: `qcbf:car-finance:1:draft`
- Pack prefix: `QC`
- Steps: 10
- Exports: PDF, Word/RTF, TXT, print, copy full file, copy letter, copy cover email, copy email subject, evidence checklist and timeline

### Baggage

Status: QCBF builder present with migration tests passing.

Baggage is currently one of the cleaner shared-pattern builders. It uses QCBF 1.2, has an 8-step journey and passed the migration test covering delayed, lost, damaged, missing contents, mobility and no-PIR paths.

Key details:

- Storage namespace: `qcbf-baggage`
- Storage key: `qcbf-baggage-draft-v1`
- Pack prefix: `QB`
- Steps: 8
- Exports: PDF, Word/RTF, TXT, copy and print

## Customer Journey Findings

The automated tests verify important builder logic and regression scenarios. A full live browser journey was not performed in this audit, so save/restore, back-navigation, every export button and visual print/PDF output should still receive production browser QA before any major launch push.

Verified by automated tests:

- Flight FR578 regression scenario
- Flight passenger count and compensation multiplication
- Flight route distance and regulation analysis
- Holiday v1.1 document scenario
- Car Finance partial integration
- Baggage migration scenario
- Shared QCBF registry and helpers

Not visually verified in browser during this audit:

- 320 px, 360 px, 375 px, 390 px, 414 px and 430 px layouts
- Tablet and desktop screenshot comparison
- Keyboard-only journey
- Screen-reader announcement flow
- Visual PDF rendering
- Print layout pagination

## Mobile Findings

No mobile rendering defects were confirmed by automated tests. Because this audit did not run a browser screenshot matrix, mobile layout remains an evidence gap rather than a passed item.

## Visual Consistency Findings

The builders share broad Quaerens styling, but presentation depth varies:

- Flight has both a reusable Flight Card module and inline card styles.
- Car Finance has extra specialist output panels and more custom export controls.
- Holiday and Baggage are closer to a shared QCBF pattern.
- Hero language and product naming vary by page.

## Terminology Findings

The platform should standardise around:

- `Complaint Pack Builder`
- `Quaerens Consumer Complaint File`
- `Build My Complaint Pack`
- `Smart Submission`
- `Estimated only`

Some current wording still varies between "compensation pack", "complaint pack", "letter", "analysis" and "builder". This is not a launch blocker, but it should be cleaned up in a controlled copy phase.

## Flow Findings

Flight, Holiday and Baggage use 8-step structures. Car Finance uses 10 steps because of its agreement-analysis workflow. That exception is reasonable, but the progress display and step naming should still follow the shared standard.

## Draft And Storage Findings

Draft storage works in automated coverage, but naming is inconsistent:

- Flight config uses `qcbf-flight`, while the live page still references a legacy storage key.
- Holiday uses a legacy-style storage namespace and key.
- Car Finance uses a more structured QCBF key.
- Baggage uses a QCBF namespace and versioned key.

Future work should standardise namespaces while preserving legacy draft migration.

## Pack Reference Findings

Topic-specific prefixes are present in config: QF, QH, QC and QB. Future QA should confirm that every output surface consistently shows the pack reference: preview, PDF, Word/RTF, TXT, copy and print.

## Readiness And Evidence Findings

Readiness, evidence and missing-information messaging exists across the builders, but the visual treatment is not identical. The standard should be applied gradually without altering specialist evidence logic.

## Financial Summary Findings

Flight and Car Finance have the strongest financial logic. Holiday and Baggage handle financial loss and expenses differently. The shared design should standardise display structure, not calculation logic.

## Smart Submission Findings

Smart Submission is conceptually present in the platform but not uniformly presented. Flight is the most advanced. Other builders should adopt the same final-stage naming and structure where relevant.

## Export Findings

Standard export labels are largely present:

- Download Complete PDF
- Download Editable Word or RTF
- Download Plain Text Version
- Copy This Document
- Print My Complaint Pack

Car Finance has additional specialist copy/download actions. These should be grouped under the same standard output package rather than removed.

## Accessibility Findings

Source-level labels and controls are present, but this audit did not complete a keyboard or screen-reader pass. Accessibility should be treated as a required Phase A or Phase F item before claiming full compliance.

## Trust And Disclaimer Findings

The builders use cautious self-service language and avoid guaranteed-outcome wording. Privacy wording should continue to be checked against actual implementation, especially where API lookup or local browser storage is involved.

## Specialist Boundaries

No specialist logic should be flattened for visual consistency. Flight calculations, Car Finance agreement analysis, Holiday package-travel logic and Baggage convention logic should remain builder-specific and test-covered.

## Defects And Inconsistencies

### P0

No P0 defects were found.

### P1

1. Flight has a reusable Flight Card module but the live page also contains inline flight-card layout and logic. This creates two active sources of truth.
2. Holiday config reports `QCBF 2.0` while the shared framework version is `QCBF 1.2`.
3. Full production browser visual QA has not been evidenced for the four builders.

### P2

1. Draft storage namespace and key patterns vary by builder.
2. Product and output naming are not fully standardised.
3. Car Finance has specialist export labels that should be grouped under the shared output model.
4. Holiday config H1 and visible production H1 should be reviewed for consistency.
5. A Flight test assertion contains an encoding wart in test text, although production pages and source pages checked as UTF-8.

### P3

1. Card spacing, hero content density and trust-panel styling vary by builder.
2. Some builders feel more like standalone landing pages, while others feel like framework pages.

## Recommended Fix Plan

### Phase A - Verification Matrix

Run a browser-based QA matrix across the four builders: desktop, tablet, 430 px, 414 px, 390 px, 375 px, 360 px and 320 px. Include save, restore, back, edit previous answer, regenerate, delete draft, PDF, Word/RTF, TXT, copy and print.

### Phase B - Terminology And CTA Standardisation

Standardise product names, hero CTAs, output labels and pack naming without changing specialist logic.

### Phase C - Draft Storage Standardisation

Adopt a consistent QCBF storage namespace pattern and preserve legacy draft migration for existing users.

### Phase D - Shared Component Adoption

Move repeated cards, readiness panels, evidence cards, financial summary cards and Flight Card presentation into shared components where safe.

### Phase E - Export And Print Consistency

Align PDF covers, PDF footers, Word/RTF headings, TXT headings and print styles.

### Phase F - Accessibility Hardening

Complete keyboard navigation, ARIA live announcements, focus states, contrast checks and screen-reader review.

## Tests Run

The first sandbox run failed with a filesystem permission issue. The same tests were rerun with approved escalation and passed.

Passed:

- `node public\complaint-builder\tests\qcbf.test.js`
- `node public\builders\flight\flight.migration.test.js`
- `node public\builders\holiday\holiday.migration.test.js`
- `node public\builders\holiday\holiday.version11.test.js`
- `node public\builders\car-finance\carfinance.partial-integration.test.js`
- `node public\builders\baggage\baggage.migration.test.js`

Syntax checks passed for selected shared and builder modules:

- `public\complaint-builder\index.js`
- `public\complaint-builder\registry.js`
- `public\builders\flight\flight.config.js`
- `public\builders\flight\flight.documents.js`
- `public\builders\flight\flight.analysis.js`
- `public\builders\holiday\holiday.config.js`
- `public\builders\holiday\holiday.documents.js`
- `public\builders\car-finance\carfinance.config.js`
- `public\builders\baggage\baggage.config.js`
- `public\builders\baggage\baggage.documents.js`

## Rollback

No production files were changed by this audit. To roll back the audit documentation only, revert the documentation commit. If future production changes are made, rollback should use the previous deployed build or the last builder-specific commit.

## Final Audit Position

The platform is stable enough to proceed into a controlled consistency phase. The next step should not be a rebuild. It should be Phase A browser QA followed by small, separately committed consistency changes.
