# Car Finance QCBF 1.2 Integration Assessment

Assessment date: 2026-07-22  
Assessed production page: `https://www.quaerens.co.uk/car-finance.html`  
Local baseline commit: `adfcc3ca1954c1a403cc3357c6fe90e3eea81c51`  
Assessment scope: Car Finance Agreement Analysis and Complaint Pack Builder only  
Decision: assessment only. No live Car Finance migration performed.

## Phase 1 Implementation - Partial QCBF Adoption

Implementation date: 2026-07-22  
Migration status after this phase: partial integration  
Framework version recorded: QCBF 1.2  
Pack reference prefix: `QC`

Phase 1 adds QCBF infrastructure around the existing Car Finance builder without replacing the specialist page engine. The public page remains `public/car-finance.html`, with the same title, H1, 10-step flow, lender directory, agreement analysis, redress caution, document generation and export behaviour.

Adopted components:

- Builder registration in the central QCBF registry.
- Safe Car Finance config module at `public/builders/car-finance/carfinance.config.js`.
- Pack-reference scaffold using `QC-YYYY-XXXXXX`, included in generated complaint-pack outputs.
- Isolated storage namespace `qcbf-car-finance`, with draft/schema metadata.
- Compatibility reading for known older Car Finance draft keys.
- Existing page live-region/focus behaviour recorded as the accessibility shell for Phase 1.
- Shared readiness-status shell in `carfinance.status.js`.
- QCBF document-model adapter scaffold in `carfinance.document-adapter.js`.
- Export interface scaffold in `carfinance.export-adapter.js`.
- Partial integration regression tests in `carfinance.partial-integration.test.js`.

Specialist logic left untouched:

- PCP, HP and conditional-sale calculations.
- APR, amount-of-credit, total-payable and balloon-payment handling.
- Commission and discretionary commission analysis.
- Affordability and sales-process complaint logic.
- Lender directory matching and submission pathways.
- Financial Ombudsman/FCA routing language.
- Redress estimate caution and calculation boundaries.
- Complaint-ground generation.

Rollback:

Restore the previous `public/car-finance.html`, `public/complaint-builder/registry.js`, `public/complaint-builder/internal/framework-dashboard.html` and `public/builders/car-finance/config.json`, then remove the Phase 1 adapter files under `public/builders/car-finance/`.

Phase 2 should not begin until golden-output snapshots and browser end-to-end tests exist for PCP, HP, conditional-sale, undisclosed commission, affordability, unknown lender, saved draft restore and all export paths.

## 1. Current Car Finance Architecture

The live Car Finance page is currently a standalone HTML application at:

- `public/car-finance.html`

It contains the user-facing page, builder wizard, styling, state handling, lender lookup, agreement calculations, document generation, export handlers and language behaviour in one large page file.

The page is registered in the QCBF registry as a pending migration item, but it is not yet a QCBF-driven builder:

- `public/complaint-builder/registry.js` loads `public/builders/car-finance/config.json`
- Registry status is `pending migration`
- Registered modules are currently only `["config"]`

This means Car Finance has a small builder metadata/config presence, but the production user journey is still powered by page-local code.

## 2. Production Baseline

The production page currently responds as:

- URL: `https://www.quaerens.co.uk/car-finance.html`
- Title: `Car Finance Agreement Analysis & Complaint Pack Builder | Quaerens`
- Main H1: `Build Your Car Finance Agreement Analysis & Complaint Pack`
- Product positioning: free complaint pack builder, agreement analysis, financial analysis, complaint readiness review and lender-ready pack
- Core visible builder: 10-step Car Finance wizard
- Production charset observed by browser fetch: `text/html; charset=utf-8`

Visible production markers confirmed:

- Agreement analysis and complaint pack positioning
- 10-step wizard
- Lender search / lender status flow
- Smart Submission section
- Complete PDF download
- Editable Word/RTF download
- Plain text download
- Copy Consumer Complaint File
- Print My Complaint Pack
- Privacy wording that answers are processed in the browser for direct download

The production page is not a QCBF shell rendering a modular Car Finance builder. It remains an independent, working product page.

## 3. Current File Map

Current relevant files:

- `public/car-finance.html` - live standalone Car Finance builder page
- `public/car-finance2.html` - older/development copy, not the current production page
- `public/car-finance-premium-pack.html` - related premium pack page
- `public/builders/car-finance/config.json` - minimal QCBF registry config
- `public/data/lenders.json` - lender directory used by the Car Finance page
- `public/data/car-finance-regulatory-status.json` - motor finance regulatory status and official resources
- `public/data/car-finance-redress-methodology.json` - redress safety rules and methodology notes
- `public/complaint-builder/registry.js` - registers Car Finance as pending migration
- `public/complaint-builder/*` - shared QCBF 1.2 core, document, export, submission, status and component modules

The current Car Finance config is:

```json
{
  "id": "car-finance",
  "status": "live",
  "page": "/car-finance.html",
  "title": "Free Car Finance Complaint Pack Builder",
  "primaryCta": "Start Free Complaint Pack Builder",
  "data": {
    "countries": "/data/countries.json",
    "currencies": "/data/currencies.json"
  },
  "outputs": [
    "Initial Complaint Letter",
    "Information Request",
    "Evidence Checklist",
    "Timeline",
    "Contact Record",
    "Follow-Up Wording"
  ]
}
```

This config is not yet a complete source of truth for the current live page.

## 4. Duplicated Functionality

The Car Finance page duplicates functionality that QCBF already has or is designed to own:

- Multi-step wizard state
- Progress display
- Local/session draft saving
- Validation and warning display
- Readiness/status language
- Document pack composition
- PDF export
- RTF export
- TXT export
- Copy actions
- Print actions
- Complaint pack branding
- Smart Submission wording
- Evidence checklist generation
- Timeline generation
- Official resources inclusion
- Accessibility patterns for accordions, buttons and step navigation

There is also duplication inside `public/car-finance.html` itself. Several functions are defined more than once, with later definitions overriding earlier ones. Examples include:

- `collectAnswers`
- `buildEvidenceChecklist`
- `buildTimeline`
- `buildLetter`
- `buildPack`
- `buildReadinessReview`
- `downloadRtf`
- `downloadPdf`

This internal duplication increases regression risk because a change to one version of a function may not affect the final active version.

## 5. Specialist Logic

The specialist Car Finance logic should not be absorbed into generic QCBF modules without careful boundaries.

Specialist logic currently includes:

- PCP, HP, conditional sale and linked vehicle-finance agreement handling
- Agreement figure analysis
- Deposit, part-exchange, settlement, balloon payment and total-payable calculations
- APR, flat rate and term interpretation
- Commission concern classification
- Discretionary commission arrangement handling
- Affordability and creditworthiness concern mapping
- Unknown lender path
- Dealer/broker request path
- Representative letter path
- FCA and Financial Ombudsman caution wording
- Redress-safety logic that avoids invented compensation figures
- Lender-specific Smart Submission contact routing

This logic is high risk because it sits close to financial-services wording, regulatory sensitivity and consumer expectation. It should be migrated as Car Finance modules, not flattened into generic shared code.

## 6. Shared-Component Candidates

Good candidates for shared QCBF extraction:

- Page shell and builder wrapper
- Step controller
- Autosave and draft controls
- Progress bar
- Validation message surface
- Live preview shell
- Complaint Pack download section
- Copy/print/export buttons
- Smart Submission card layout
- Official resources card layout
- Evidence checklist layout
- Timeline output model
- Accessibility and focus management
- Common "browser-first/self-service" privacy wording
- Complaint pack reference/version information

Poor candidates for generic extraction:

- Agreement calculation logic
- Commission/redress caution logic
- FCA motor-finance wording
- Lender classification and complaint route prioritisation
- Any official-redress handling
- Pathway assessment for commission, affordability, missing documents and unknown lender scenarios

## 7. Proposed Module Structure

Recommended future structure:

```text
public/builders/car-finance/
  car-finance.config.js
  car-finance.questions.js
  car-finance.state.js
  car-finance.validation.js
  car-finance.agreement.js
  car-finance.calculations.js
  car-finance.analysis.js
  car-finance.redress.js
  car-finance.evidence.js
  car-finance.timeline.js
  car-finance.documents.js
  car-finance.submission.js
  car-finance.resources.js
  car-finance.page.js
  car-finance.legacy-draft.js
  car-finance.test.js
```

Recommended data files:

```text
public/data/lenders.json
public/data/car-finance-regulatory-status.json
public/data/car-finance-redress-methodology.json
```

The live page should eventually import a single Car Finance page module that composes QCBF shared modules plus Car Finance specialist modules. The page should not keep a second inline implementation active.

## 8. Proposed State Model

Car Finance needs a richer state model than the current generic builder examples.

Recommended top-level state shape:

```js
{
  meta: {
    builderId: "car-finance",
    builderVersion: "1.0",
    documentVersion: "1.0",
    regulatoryContentVersion: "motor-finance-2026-07-18",
    lenderDirectoryVersion: "1.0"
  },
  user: {
    fullName,
    preferredContact,
    email,
    phone,
    address,
    postcode,
    representative,
    customerName
  },
  vehicle: {
    make,
    model,
    registration,
    year,
    purchaseDate,
    condition,
    status,
    useType
  },
  parties: {
    lenderStatus,
    selectedLenderId,
    manualLenderName,
    dealer,
    dealerLocation,
    agreementReference
  },
  agreement: {
    agreementType,
    startDate,
    approximateStartDate,
    originalEndDate,
    actualEndDate,
    agreementStatus,
    cashPrice,
    amountCredit,
    apr,
    flatRate,
    termMonths,
    monthlyPayment,
    regularPayments,
    finalPayment,
    optionFee,
    arrangementFee,
    otherCharges,
    totalPayable,
    paymentsMadeCount,
    settlementAmount,
    arrearsCharges,
    refundsReceived,
    depositsAndPartExchange
  },
  concerns: {
    commission,
    discretionaryCommission,
    highCommission,
    affordability,
    pressureSelling,
    rateConcern,
    unclearTerms,
    missingDocuments,
    otherConcern
  },
  commission: {
    commissionExplained,
    amountDisclosed,
    methodDisclosed,
    affectedRate,
    dealerInfluencedRate,
    tiedLendersExplained,
    lenderConfirmedCommission,
    lenderProvidedAmount,
    lenderProvidedType,
    verifiedAmount,
    verifiedPercentage,
    commissionType,
    recipient,
    lenderAprAdjustment,
    officialRedressFigure,
    compensatoryInterest,
    sourceDocument,
    lenderResponseDate,
    verifiedFiguresConfirmed
  },
  evidence: {
    selectedDocuments,
    missingDocuments,
    customEvents,
    complaintStatus,
    complaintReference,
    responseSummary,
    selectedRoute
  },
  derived: {
    netDeposit,
    scheduledInstalments,
    expectedTotal,
    financeCost,
    paymentsMade,
    remainingBalance,
    validationMessages,
    readinessScore,
    pathwayAssessment,
    redressMode
  },
  documents: {
    complaintPack,
    activeDocument,
    editedSubject,
    editedSections
  },
  submission: {
    preferredMethod,
    officialComplaintPage,
    verifiedEmail,
    postalAddress,
    verificationSource,
    lastVerified
  }
}
```

The migration should preserve existing saved drafts or provide a clear one-time draft migration path.

## 9. Calculation Review

Current calculation logic appears to be local to the page and includes:

- Net deposit
- Scheduled instalments
- Expected total payable from entered figures
- Entered total amount payable
- Estimated finance cost from entries
- Approximate payments made
- Approximate scheduled balance
- Financial validation notes

This should remain a Car Finance specialist module.

Important calculation boundaries:

- Do not treat blank values as zero in a way that misleads the user.
- Do not label derived figures as lender-confirmed figures.
- Do not calculate official redress unless the user has entered an official lender figure.
- Do not create estimated compensation/redress ranges from unknown commission data.
- Keep derived arithmetic separate from official lender calculations.

Recommended module:

- `car-finance.calculations.js`

Recommended test coverage:

- All money fields blank
- Cash price only
- Deposit plus part exchange
- Part exchange settlement greater than allowance
- PCP with final balloon payment
- HP without balloon payment
- Settlement/ended agreement
- Arrears/refunds entered
- Mismatch between derived total and entered total payable
- Official lender redress supplied
- Partial commission info supplied
- No commission info supplied

## 10. Complaint-Logic Review

The current page builds different complaint/request pathways:

- Initial agreement analysis, information request and complaint
- Follow-up to an existing complaint
- Factual clarification after a final response
- Dealer or broker request to identify the lender
- Representative letter
- Information-only request

The logic is valuable and should be preserved.

Migration risk is high because the wording must remain cautious:

- It should raise issues, not assert wrongdoing.
- It should distinguish complaint, information request and escalation.
- It should not imply Quaerens submits or manages the complaint through this free builder.
- It should not imply compensation or redress is guaranteed.
- It should not state that commission existed unless the user or lender evidence supports it.

Recommended module:

- `car-finance.documents.js`
- `car-finance.analysis.js`
- `car-finance.redress.js`

## 11. Evidence Mapping

The current evidence flow captures:

- Finance agreement
- Pre-contract information
- Dealer invoice
- Statement of account
- Payment history
- Dealer emails/messages
- Lender letters
- Complaint acknowledgement
- Final response
- Bank statements
- Credit report
- Commission disclosure document
- Settlement statement
- Vehicle return documents
- Missing documents
- Custom events

This should become a structured evidence map with:

- Evidence type
- Evidence label
- Applies to which concern
- Required / helpful / optional status
- User selected status
- Output document section mapping
- Sensitivity note where relevant

Recommended module:

- `car-finance.evidence.js`

## 12. Smart Submission Assessment

The current Smart Submission section is valuable and should be retained.

It currently supports:

- Selected lender display
- Legal lender display
- Preferred complaint method
- Complaint form URL where verified
- Complaint email where verified
- Postal address where verified
- Telephone where available
- Verification source
- Last verified date
- Manual verification fallback

This should migrate to QCBF only after the shared `SubmissionDirectory` supports regulated financial-firm metadata and verification confidence.

Smart Submission must never:

- Invent complaint emails.
- Prefer unofficial routes.
- Hide verification uncertainty.
- Automatically submit complaints.
- Suggest that Quaerens is acting as representative through the free tool.

Recommended module:

- `car-finance.submission.js`

## 13. Directory Schema Recommendations

Current `public/data/lenders.json` is a good start but should be formalised before migration.

Recommended schema:

```json
{
  "id": "black-horse",
  "lenderName": "Black Horse Limited",
  "legalName": "Black Horse Limited",
  "tradingNames": [],
  "fcaFirmReferenceNumber": "",
  "website": "",
  "officialComplaintsPage": "",
  "complaintFormUrl": "",
  "complaintEmail": "",
  "postalAddress": {
    "lines": [],
    "postcode": "",
    "country": "United Kingdom"
  },
  "telephone": "",
  "preferredMethod": "official-form",
  "verificationStatus": "official-source-verified",
  "verificationSource": "",
  "lastVerified": "YYYY-MM-DD",
  "dataWarnings": []
}
```

Recommended directory statuses:

- `official-source-verified`
- `fca-list-confirmed`
- `official-page-needs-check`
- `manual-verification-required`
- `not-listed`

## 14. Document-Model Assessment

Car Finance should use the shared QCBF `ComplaintPack` model, but only after its specialist document sections are mapped cleanly.

Current output sections include:

- Agreement Analysis
- Agreement Review
- Known Information and Information to Request
- Financial Agreement Summary
- Potential Redress Analysis
- Complaint Summary
- Complaint Letter
- Information Request
- Cover Email
- Evidence Checklist
- Visual Timeline
- Lender Submission Details
- Quaerens Smart Submission
- Submission Checklist
- Contact Record
- Follow-Up Tracker
- Official Resources
- Self-Service Disclaimer

Recommended QCBF document model additions for Car Finance:

- `analysisSection`
- `financialSummarySection`
- `redressCautionSection`
- `lenderDirectorySection`
- `knownUnknownInformationSection`
- `regulatedRouteWarningSection`
- `versionInformationSection`

The "Quaerens Consumer Complaint File" branding should be preserved.

## 15. Migration Risks

Risk rating:

- Saved draft compatibility: High
- Financial calculation regression: High
- Redress wording regression: High
- Lender directory route errors: High
- Complaint letter pathway regression: High
- Export format regression: Medium/High
- PDF layout regression: Medium
- Mobile layout regression: Medium
- Accessibility regression: Medium
- SEO/content regression: Medium
- Duplicate source-of-truth risk during migration: High
- User trust/compliance wording regression: High

Highest-risk areas:

1. Redress/commission logic
2. Lender directory and Smart Submission
3. Draft migration
4. Generated document wording
5. Export parity

## 16. Test Plan

Minimum regression test set before any migration goes live:

Functional builder tests:

- Start empty builder and complete all 10 steps.
- Save progress to session storage.
- Save progress to local storage with remember option.
- Delete saved answers.
- Start again after generating pack.
- Navigate forward and backward through all steps.
- Confirm validation warnings show and clear correctly.

Agreement calculation tests:

- Blank financial values.
- PCP with balloon payment.
- HP with no balloon payment.
- Conditional sale.
- Part exchange allowance and settlement.
- Deposit plus dealer contribution.
- Settlement amount entered.
- Arrears/default charges entered.
- Refund already received.
- Entered total payable differs from derived expected total.

Commission/redress tests:

- No commission concern selected.
- Commission concern selected but no lender data.
- Discretionary commission concern selected.
- High/variable commission concern selected.
- Lender confirmed commission but no amount.
- Lender supplied commission amount.
- Lender supplied official redress figure.
- User has not ticked verified commission confirmation.
- User has ticked verified commission confirmation.

Lender directory tests:

- Known listed lender selected.
- Unknown lender flow.
- Manual lender flow.
- Lender not listed flow.
- Lender has complaint form URL.
- Lender has no verified email.
- Postal-only or manual verification fallback.
- Official source and last verified date display.

Document output tests:

- Live preview updates.
- Agreement Analysis generated.
- Financial Agreement Summary generated.
- Potential Redress Analysis generated.
- Complaint Letter generated.
- Information Request generated.
- Evidence Checklist generated.
- Timeline generated.
- Lender Submission Details generated.
- Smart Submission generated.
- Official Resources generated.
- Self-Service Disclaimer generated.

Export tests:

- Download Complete PDF.
- Download Editable Word or RTF.
- Download Plain Text Version.
- Copy Consumer Complaint File.
- Copy Complaint Letter.
- Copy Cover Email.
- Copy Email Subject.
- Print My Complaint Pack.
- Download Evidence Checklist.
- Download Timeline Template.

Responsive tests:

- Desktop 1440px.
- Tablet 768px.
- Mobile 414px.
- Mobile 390px.
- Mobile 360px.
- Mobile 320px.

Accessibility tests:

- Keyboard-only step navigation.
- Visible focus states.
- Screen-reader labels for buttons.
- Field labels linked to inputs.
- Error/warning text announced or visible.
- No hidden active focus traps.

Production tests:

- `https://www.quaerens.co.uk/car-finance.html` returns the intended page.
- Charset is UTF-8.
- Canonical URL is correct.
- No noindex tag.
- Footer is not nested inside builder sections.
- No public internal notes are visible.

## 17. Migration Phases

Phase 0 - Freeze baseline:

- Save current production file as a rollback reference.
- Capture screenshots of the current desktop and mobile page.
- Capture representative generated pack outputs.
- Record current local/session storage keys.

Phase 1 - Extract passive config:

- Create `car-finance.config.js`.
- Move labels, output names, version metadata and route metadata into config.
- Keep live behaviour unchanged.

Phase 2 - Extract data adapters:

- Create lender-directory adapter.
- Create regulatory-status adapter.
- Create redress-methodology adapter.
- Keep existing page calling the same data.

Phase 3 - Extract specialist calculations:

- Move agreement arithmetic to `car-finance.calculations.js`.
- Add calculation tests.
- Compare outputs against current page for fixtures.

Phase 4 - Extract analysis and redress:

- Move pathway and redress-mode logic.
- Add caution wording tests.
- Confirm no compensation or redress guarantee language appears.

Phase 5 - Extract document generation:

- Map current document sections into QCBF `ComplaintPack`.
- Compare generated text output before and after.
- Test PDF, RTF, TXT, copy and print.

Phase 6 - Extract page state:

- Migrate wizard to shared QCBF state and step controller.
- Add legacy draft adapter.
- Test existing saved answers.

Phase 7 - Switch live page to QCBF source:

- Remove inline duplicate functions.
- Ensure one active source of truth.
- Run full regression.
- Deploy only after screenshots and exports pass.

## 18. Code-Reduction Estimate

Current live file:

- `public/car-finance.html`
- Approximately 194 KB
- Large inline CSS and JavaScript
- Multiple duplicated function definitions

Expected reduction in the page file after a careful migration:

- 20% to 30% page-file reduction in the first safe migration
- 35% to 45% possible after the shared QCBF modules are fully reused

The total project codebase may not shrink immediately because specialist Car Finance logic should move into separate modules rather than disappear. The main benefit is maintainability, testability and fewer hidden duplicate functions.

Likely reusable/shared portion:

- 25% to 35% of current builder logic

Likely specialist Car Finance portion:

- 55% to 65% of current builder logic

Remaining page-specific presentation:

- 10% to 15%

## 19. QCBF Improvements Required

Before full Car Finance migration, QCBF should support:

- Legacy draft migration adapters
- Stronger typed field schemas for money, percentage, dates and optional numeric entries
- Domain-specific calculation modules with fixture tests
- Builder-specific evidence maps
- Directory schema extensions for regulated financial firms
- Versioned data-source metadata
- Document-section ordering controlled by builder config
- Shared "known / derived / missing / lender-only" status patterns
- Shared warning/caution components
- Export regression fixtures
- Page-level no-duplicate-source enforcement
- Better test helpers for localStorage/sessionStorage
- Print and PDF visual checks for large complaint packs

## 20. Go / No-Go Recommendation

Recommendation: C. Partially integrate only.

Car Finance should not be fully migrated in one pass right now. The current page is live, specialist and financially sensitive. QCBF should be used first for shared structure, exports, document model, draft management, status display and Smart Submission shell. The agreement calculations, redress cautioning, lender logic and complaint pathway rules should remain Car Finance-specific modules.

Full migration can become appropriate after:

- Car Finance calculations have fixture tests.
- Legacy draft handling is designed.
- Lender directory schema is formalised.
- Generated output parity is proven.
- Export outputs match the current production builder.

## 21. Estimated Effort

Recommended effort estimate:

- Assessment and planning: complete in this document
- Phase 0/1: 0.5 to 1 day
- Phase 2: 0.5 to 1 day
- Phase 3: 1 day
- Phase 4: 1 day
- Phase 5: 1 to 1.5 days
- Phase 6: 1 to 1.5 days
- Phase 7 and regression: 1 day

Total safe migration estimate: 5 to 8 focused working days.

Fast migration is possible but not recommended because this page has high-value user flows, sensitive wording and complex output generation.

## 22. Recommended Next Codex Prompt

Use this as the next implementation prompt when ready:

```text
Begin Phase 0 and Phase 1 of the Car Finance QCBF migration only.

Do not change public behaviour.
Do not deploy.
Do not remove the current inline builder implementation yet.

Tasks:
1. Create a rollback snapshot note for the current public/car-finance.html baseline.
2. Create public/builders/car-finance/car-finance.config.js as the future source for labels, versions, CTA text, step titles, output names and canonical metadata.
3. Keep public/builders/car-finance/config.json compatible with the existing registry or update the registry safely to load the JS config if appropriate.
4. Do not move calculation, redress, lender or document logic yet.
5. Add a small test or verification script that confirms the new config exposes the same builder id, canonical URL, title, steps and output labels as the live page.
6. Confirm public/car-finance.html still renders and behaves exactly as before.
7. Report changed files, tests run and any migration risks discovered.
```

## Final Assessment Summary

Car Finance is ready for a cautious staged QCBF migration, but not a one-shot migration. The current page is production-ready and contains valuable specialist logic that should be preserved. QCBF should absorb the shared builder platform concerns first, while Car Finance retains its specialist calculations, regulated wording and lender route logic in clearly named modules.

No public Car Finance behaviour should change until output parity and regression tests are in place.
