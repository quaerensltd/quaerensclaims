# Car Finance QCBF Partial Integration

Status: partial integration  
Framework: QCBF 1.2  
Public page: `/car-finance.html`  
Pack reference prefix: `QC`

## Adopted In Phase 1

- Central QCBF builder registration.
- Car Finance configuration module.
- QCBF-style pack reference scaffold using `QC-YYYY-XXXXXX`.
- Isolated draft namespace: `qcbf-car-finance`.
- Draft schema and version metadata.
- Accessibility shell for live step announcements and focus handling already present on the page.
- Readiness-status shell without replacing Car Finance-specific readiness logic.
- Document-model adapter scaffold.
- Export interface scaffold for the current PDF, Word/RTF, TXT, copy and print outputs.
- Partial integration tests.

## Specialist Logic Boundary

The live Car Finance page remains the authoritative implementation for:

- PCP calculations.
- HP calculations.
- Conditional-sale calculations.
- APR and total payable handling.
- Balloon payment and settlement analysis.
- Commission analysis.
- Affordability logic.
- Redress estimates.
- Discretionary commission concerns.
- Lender complaint pathways.
- Financial Ombudsman and FCA routing.
- Agreement-type identification.
- Lender directory rules.
- Complaint-ground generation.

These functions currently live inside `public/car-finance.html` and supporting data files under `public/data/`. Phase 1 intentionally does not move or rewrite them.

## Draft Compatibility

New drafts use:

- `qcbf:car-finance:1:draft`
- `qcbf:car-finance:1:remembered`

The page still attempts to read older draft keys where practical:

- `quaerensCarFinanceToolDraftV1`
- `quaerensCarFinanceToolRememberedV1`
- `quaerensCarFinancePackDraftV1`
- `quaerensCarFinancePackDraftRememberedV1`

Old keys are not silently deleted. A user-controlled reset removes both new and known legacy keys.

## Rollback

Rollback is low-risk because Phase 1 does not replace the specialist engine. To rollback, restore:

- `public/car-finance.html`
- `public/complaint-builder/registry.js`
- `public/complaint-builder/internal/framework-dashboard.html`
- `public/builders/car-finance/config.json`

Then remove the Phase 1 adapter files under `public/builders/car-finance/`.

## Phase 2 Prerequisites

- Browser end-to-end coverage for PCP, HP and conditional-sale scenarios.
- Golden-output snapshots for agreement analysis, complaint letter, evidence checklist, timeline and lender submission details.
- Explicit comparison tests for redress and commission pathways before any renderer migration.
- A decision on whether QCBF ExportEngine should replace the current page-level export implementation.
