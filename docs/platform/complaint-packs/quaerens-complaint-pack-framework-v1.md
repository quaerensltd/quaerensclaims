# Quaerens Complaint Pack Framework™ v1.6

Framework version: **1.6** — Governed Category Adapter Contract
Status: Permanent product architecture standard  
Reference implementation: Airbnb Complaint Pack Builder Version 4  
Framework owner: The Quaerens Platform™  
Effective date: 5 August 2026

## 1. Purpose

The Quaerens Complaint Pack Framework™ v1.6 is the mandatory product architecture for every future Quaerens Complaint Pack Builder.

### Version 1.6 governed Category Adapter Contract

Version 1.6 introduces one allow-listed, category-scoped adapter contract for specialist behaviour. Approved adapters may provide derived calculations, quality/completion rules, analysis, complaint and email wording, guidance, cover metadata and twelve-page content composition. They cannot mount UI, navigate, render previews, export, send data, register metrics or replace Framework C. All shared engines remain single implementations. Car Finance and Cruise Compensation certify this contract.

### Version 1.5 baggage extension

Version 1.5 adds Lost Luggage as a first-class declarative category. It extends the existing contract with baggage-specific questions, evidence scoring, journey analysis, complaint wording, official guidance and 12-page output composition while retaining one shared shell, state model, chronology, evidence, financial, preview and export runtime. The former baggage page controller, tabbed preview and document runtime are not loaded by the public Lost Luggage route.

Lost Luggage retains its established URL, landing experience, educational authority and anchors. Its operational builder inherits Applicant Details™, the Unique Complaint Pack Reference™, Evidence Readiness, Complaint Pack Quality, Help the Next Person™ and Anonymous Platform Metrics™ from the shared framework.

### Version 1.4 declarative category contract

Every category is registered once in `public/complaint-builder/config/framework-a-categories-v1.4.js`. The configuration declares the builder identifier, local-storage key, anonymous-metrics identifier, financial field mapping, chronology categories and evidence catalogue. The shared runtime consumes that contract; category pages must not duplicate evidence, chronology, financial, preview or export engines.

Airbnb, Section 75, Holiday Compensation, Flight, Lost Luggage, Car Finance and Cruise Compensation are the configured implementations through Version 1.6. Airbnb remains the visual and behavioural reference. Flight certified the declarative extension contract; Lost Luggage certifies that a previously specialist evidence and document workflow can move behind that contract without activating a second runtime.

Flight-only external services are connected through thin shared adapters. The Flight lookup adapter delegates to the existing protected lookup module, and the compensation adapter delegates to the existing Flight analysis and compensation engine. Manual correction remains available. Adapters may map fields and present results, but must not reproduce protected calculations or create an alternative document runtime.

### Version 1.3 anonymous metrics contract

Anonymous Platform Metrics™ is a mandatory shared Framework A capability. The shared runtime may emit only the approved aggregate events and the allow-listed builder identifier, event name, framework version and broad device class. The backend derives the reporting date and increments daily aggregate counters by exactly one.

Metrics must never contain Complaint Pack answers, personal or contact details, free text, financial data, chronology, evidence, documents, generated wording, Firebase identity, a QCP reference or a Framework C reference. They must not create event profiles, advertising identifiers, CRM records or Prepared Cases. Public browsers cannot read or write the aggregate store directly.

Every future configured builder registers an approved builder identifier, inherits the shared metrics runtime and disclosure, emits only approved Version 1 events, appears through dashboard configuration and passes privacy, security, duplicate-protection and regression tests. Independent category analytics implementations are prohibited.

### Version 1.2 shared identity contract

Every configured builder begins with the shared Applicant Details™ step. It collects the primary applicant's title, name, postal address, email, telephone and preferred contact method, with conditional joint-applicant details. The data remains browser-first and is never transmitted without a separate, explicit handoff action and consent.

Starting a new pack creates a cryptographically random, non-sequential `QCP-YYYYMMDD-XXXXXXXX` Unique Complaint Pack Reference™ containing no personal data. It remains stable for the pack lifetime, is persisted only with an opted-in local draft, and is regenerated when the user clears the pack. The reference and applicant identity must appear in the professional document set and generated metadata.

Framework C and Framework B inherit the original reference and applicant record. They must not ask for the same identity again or generate a second case reference. Any transfer remains an explicit, consented handoff; Framework A itself creates no CRM record.

The standard declaration is: “I confirm that the information contained in this Complaint Pack is true and accurate to the best of my knowledge.”

Quaerens does not build online forms. Quaerens builds professional case files. The webpage prepares the product; the downloaded Complaint Pack is the product.

Every configured builder must leave the user more organised, more informed and more confident. The finished document must resemble a professionally prepared consultant case file, not exported form data. The intended reaction is: “I can’t believe this was free.”

No future dispute category may introduce a standalone builder architecture, workflow, document engine or visual system.

## 2. Authority and scope

Airbnb Complaint Pack Builder Version 4 is the canonical reference implementation for:

- product behaviour;
- user experience;
- visual hierarchy;
- browser-first privacy;
- evidence, chronology and financial workflows;
- live document preview;
- the 12-page Complaint Pack;
- PDF, Word-compatible, TXT, print and copy outputs;
- responsive and accessible behaviour.

This standard governs all future Complaint Pack Builders. Category configuration may change subject matter; it must not fork the framework.

### Current reference files

| File | Framework responsibility |
| --- | --- |
| `public/airbnb-refunds.html` | Canonical builder shell, seven-step interface, completion experience, live preview container and reference design system. |
| `public/airbnb-complaint-pack-v3.js` | Airbnb V4 reference runtime: state, evidence, chronology, loss schedule, quality scoring, document model, preview and exports. The filename is historical; its active contract is Version 4. |
| `public/complaint-builder/config/framework-a-categories-v1.4.js` | Frozen declarative registry for every certified Framework A category. |
| `public/complaint-builder/adapters/framework-a-flight-adapter.js` | Thin Flight lookup and compensation bridge into the shared runtime; it owns no duplicate calculation or document engine. |
| `scripts/test-airbnb-complaint-pack-v3.js` | Airbnb reference regression and framework-conformance checks. The filename is historical; tests target Version 4. |
| `public/complaint-builder/` | Existing QCBF 1.2 technical primitives for state, validation, documents, exports, accessibility and registry. These are reusable infrastructure, but do not supersede the Airbnb V4 product standard. |
| `public/complaint-builder/components/help-the-next-person.js` | Shared Help the Next Person™ completion component inherited by every configured builder. |

The existing QCBF 1.2 modules and the Airbnb V4 reference must converge through controlled shared-framework work. A new category must not duplicate either implementation while that convergence is in progress. When a shared module does not yet reproduce Airbnb V4 exactly, Airbnb V4 remains the acceptance authority.

## 3. Framework architecture

The framework has five boundaries:

1. **Shared presentation shell** — step navigation, progress, panels, controls, preview viewer, completion screen and responsive layout.
2. **Shared case-file engines** — state, persistence, chronology, evidence, financial schedule, quality and document assembly.
3. **Category configuration** — questions, issue types, evidence requirements, terminology, complaint logic, route guidance and wording.
4. **Shared document renderers** — preview, PDF, Word-compatible, TXT and print outputs generated from one case model.
5. **Conformance and regression** — shared tests plus Airbnb reference regression at every framework change.

The dependency direction is one-way:

```text
Category configuration
        ↓
Shared case-file engines
        ↓
Shared document model
        ↓
Preview / PDF / Word / TXT / Print
```

Category code must not contain a private copy of a shared engine or renderer.

## 4. Mandatory reusable modules and behaviours

Every category must directly reuse the following contracts.

### Workflow and state

- seven-step reference workflow unless a documented case-file requirement justifies adapting labels or content within the existing structure;
- step navigation and Previous/Next behaviour;
- progress tracking;
- browser-first operation;
- optional, device-local saving;
- explicit deletion of locally saved answers;
- no account requirement;
- no automatic submission;
- optional Guided Support kept separate from the free builder.

### Timeline engine

- unlimited events;
- date, category, description and evidence reference;
- chronological sorting in generated output;
- manual event reordering in the interface;
- deletion without disturbing other case data;
- responsive desktop columns and mobile stacking;
- debounced preview updates during typing.

### Evidence engine

- category-configured evidence list;
- Available, Missing and Not Applicable states;
- accessible native controls with premium visual states;
- recommended evidence guidance;
- evidence-readiness calculation;
- missing-evidence priorities;
- live readiness gauge;
- evidence status represented consistently in preview and documents.

### Financial schedule

- description;
- amount;
- supporting evidence;
- status;
- unlimited rows where appropriate;
- deletion;
- automatic booking/refund position;
- automatic additional-loss total;
- automatic estimated financial exposure;
- consistent representation in preview and documents.

### Document and output engines

- one shared case model feeding every renderer;
- 12-page professional case-file structure;
- live A4 preview;
- true PDF generation;
- editable Word-compatible generation;
- TXT generation;
- print;
- complaint-letter copy;
- cover-email copy;
- consistent document facts and totals across all formats.

### Completion and quality

- professional completion banner;
- Evidence Readiness;
- Estimated Financial Exposure;
- Documents Generated;
- Recommended Next Step;
- Complaint Pack Quality indicator;
- quality must describe organisation and completeness, never likelihood of success;
- optional Guided Support after the free product is complete.
- shared Help the Next Person™ experience after Optional Guided Support;
- honest-review invitation without sentiment pressure;
- native sharing with accessible copy-link fallback;
- identical Framework A thank-you message;
- no sales, lead-generation, donation, tip, payment or fundraising request.

### Help the Next Person™ Version 1.0

The completion sequence is:

1. Complaint Pack Ready;
2. downloads;
3. next steps;
4. Optional Guided Support;
5. Help the Next Person™.

The shared component invites only two optional actions: **Leave an Honest Review** and **Share This Tool**. It must explicitly state that Quaerens is not asking for a positive review. Sharing uses the device share sheet where supported and an accessible copy-link fallback elsewhere.

Every builder displays this identical closing message:

> Thank you for using The Quaerens Platform.
>
> We believe consumers deserve clear, evidence-first support before they ever feel pressured to pay for help.
>
> If today's free Complaint Pack has helped you, thank you for helping the next person.

The component is inherited from the shared runtime and stylesheet. Category code may not duplicate or alter it. It must not request donations, tips, payments or fundraising, and it must not be reframed as sales or lead generation.

## 5. Common 12-page document structure

The default document structure is:

1. Professional cover
2. Executive Summary
3. Booking or transaction summary
4. Chronology
5. Supporting Evidence
6. Financial Impact
7. Formal Complaint Letter
8. Cover Email
9. Submission Checklist
10. Response Tracker
11. Official Guidance and Routes
12. Quaerens Notes

The common structure includes:

- Quaerens identity;
- confidentiality treatment;
- prepared-for label;
- case or booking reference;
- prepared date;
- readiness and status;
- estimated financial exposure;
- professional headings;
- page headers and footers;
- page numbering;
- balanced margins, spacing and tables.

A category may adapt a page title or page content only where the subject genuinely requires it. It must retain the same documentary hierarchy and output quality. Adding or removing pages requires a documented framework decision, not an undocumented category change.

## 6. Category configuration points

Category implementations may define only:

- category identifier and public route;
- dispute-specific questions;
- eligibility or route questions;
- issue types;
- evidence catalogue and guidance;
- genuinely category-specific evidence weights;
- event categories;
- category-specific financial terminology;
- complaint analysis and requested-resolution logic;
- route recommendations;
- generated Executive Summary, letter and email wording;
- legal or regulatory guidance;
- case-specific terminology;
- justified adaptations inside the 12-page structure.

Configuration must be declarative wherever practical. It must not implement private navigation, storage, preview, timeline, financial or export behaviour.

## 7. Evidence-engine extension points

A category evidence configuration should define:

```text
key
label
recommended record
default relevance
optional category-specific weight
conditional applicability rule
```

Extension rules:

- retain the three standard evidence states;
- use Not Applicable to remove an item from the relevant-item denominator;
- use category-specific weights only when the business reason is documented;
- never present readiness as legal merit or success probability;
- preserve the standard readiness UI, accessibility semantics and document table;
- regression-test zero evidence, partial evidence, strong evidence and Not Applicable combinations.

## 8. Route-logic extension points

A category may configure:

- official complaint recipient;
- internal escalation route;
- payment-provider route;
- insurer, ombudsman, regulator or court route where relevant;
- route-specific prerequisites;
- deadlines and jurisdiction warnings;
- official guidance wording and source-review date.

Route logic must:

- remain informational rather than automatically submitting a complaint;
- avoid guaranteeing eligibility or outcomes;
- derive recommendations from recorded facts;
- explain missing prerequisites;
- keep official guidance current and jurisdiction-aware;
- preserve the shared route-card, document and completion patterns.

## 9. Shared design system

Every builder inherits the Airbnb V4 visual standard:

- Quaerens navy, blue, white and restrained status colours;
- strong, consultancy-style hierarchy;
- premium cards and panels;
- generous whitespace;
- A4 document-viewer treatment;
- authoritative cover page;
- consistent tables;
- professional completion state;
- smooth but restrained micro-interactions;
- 220 ms debounced preview updates;
- reduced-motion support.

Category branding may change copy and relevant imagery outside the builder. It must not create a new builder palette, type system, card language or document style.

## 10. Accessibility requirements

Every implementation must preserve:

- semantic labels for every input;
- native checkbox, radio and select behaviour;
- keyboard-operable step navigation;
- Enter and Space activation for step controls;
- visible `:focus-visible` treatment;
- status messages exposed through live regions;
- progress bars with label, minimum, maximum and current value;
- meaningful button names for add, move, delete, download, copy and print actions;
- adequate colour contrast;
- logical DOM and focus order;
- no keyboard traps;
- responsive reflow without horizontal scrolling;
- `prefers-reduced-motion` support.

Visual hiding must never be the only security, validity or accessibility control.

## 11. Browser-first privacy requirements

- Answers remain in the browser unless the user explicitly downloads, copies, prints or submits them separately.
- Local saving is opt-in.
- Storage keys are namespaced by category and framework version where migration requires it.
- Deleting saved answers removes the category draft and resets the interface.
- No mandatory account, registration or contact details.
- No automatic transmission.
- Guided Support is a separate, explicit transmission route.
- Privacy language must accurately match runtime behaviour.

## 12. SEO preservation rules

Framework work must not silently change a category page’s:

- public URL;
- canonical URL;
- title;
- meta description;
- structured data;
- FAQ content or FAQ schema;
- authority content;
- internal links;
- indexability;
- established search intent.

Builder assets must be added in place. A framework migration must preserve the category page and its authority content rather than replacing it with a new route.

## 13. Testing and acceptance requirements

### Shared functional tests

Test:

- every step;
- Previous and Next;
- progress;
- timeline add, edit, move, delete and automatic sorting;
- evidence states and readiness calculations;
- financial add, edit, delete and totals;
- quality calculation and non-predictive wording;
- preview debounce and field-completion updates;
- local saving, restoration and deletion;
- completion state;
- PDF, Word-compatible, TXT, print, copy letter and copy email;
- consistent facts and totals across outputs;
- empty, partial and complete cases.

### Responsive tests

At desktop, tablet and mobile widths confirm:

- every step is usable;
- labels do not overlap;
- controls do not collide;
- buttons are not clipped;
- tables and rows remain contained;
- Timeline and Financial Impact fields stack correctly when required;
- preview pages remain readable;
- download actions remain accessible;
- no horizontal page overflow.

### Accessibility tests

Confirm:

- all controls have accessible names;
- step controls work by keyboard;
- focus is visible;
- live status and progress semantics are present;
- evidence status remains operable without a pointer;
- reduced-motion behaviour is respected;
- no console errors occur during the complete workflow.

## 14. Airbnb regression gate

Every new category and every shared framework change must run the Airbnb reference regression.

The release fails if Airbnb changes unexpectedly in:

- workflow;
- visual hierarchy;
- step behaviour;
- evidence readiness;
- chronology;
- financial totals;
- Complaint Pack Quality;
- preview;
- any of the 12 pages;
- PDF, Word-compatible, TXT, print or copy output;
- privacy;
- accessibility;
- desktop, tablet or mobile layout;
- SEO or public route behaviour.

Airbnb-specific changes must not be used as an undocumented way to alter the shared framework.

The regression obligation also protects every configured implementation, including Section 75, Holiday Park, Spray Foam, Solar and future Complaint Pack Builders. An approved shared release cannot proceed while any migrated category has an unexplained regression.

## 15. New-category implementation sequence

Before implementation:

1. Inspect the current live Airbnb Version 4 builder.
2. Identify the current shared framework contracts and files.
3. Confirm whether an existing QCBF module already meets the Airbnb acceptance standard.
4. Reuse the conforming shared module directly.
5. Create only the category configuration, questions, evidence catalogue, logic, guidance and wording.

Before release:

6. Run shared functional tests.
7. Run the Airbnb regression gate.
8. Compare the new builder with Airbnb on desktop, tablet and mobile.
9. Verify preview, PDF, Word-compatible, TXT, print and copy consistency.
10. Verify accessibility and browser-first privacy.
11. Verify category SEO and public route preservation.
12. Document the category and framework versions in the release record.

## 16. Versioning rules

This document establishes **Quaerens Complaint Pack Framework™ v1.6**.

Versioning rules:

- A shared behavioural, visual, accessibility, privacy, model or document change increments the framework version.
- Breaking shared-contract changes increment the major version.
- Backwards-compatible shared capability changes increment the minor version.
- Corrective shared changes that do not alter the contract increment the patch version.
- Category-only questions, wording, evidence or guidance changes increment only the category version.
- A category release must declare the framework version it conforms to.
- Category code must not silently modify shared framework files.
- Framework releases must update this document, the shared version source, conformance tests and migration notes together.
- The repository’s existing `QCBF 1.2` technical version remains distinct until a deliberate convergence release maps it to this product standard; neither number may be silently overwritten.

## 17. Change-control rules

When an improvement benefits more than one category:

1. propose it as a framework change;
2. explain why it belongs in the framework;
3. document the effect on every existing Complaint Pack Builder;
4. wait for explicit approval before changing shared framework behaviour;
5. after approval, implement it once in the shared boundary;
6. increment the framework version as required;
7. update this document;
8. run shared, Airbnb and configured-category regression tests;
9. verify every migrated category;
10. release migration notes.

When a change is category-specific, it must remain in category configuration and must not alter shared behaviour.

Before beginning any Quaerens Platform development, classify the work under the Shared CRM Framework or the Quaerens Complaint Pack Framework™. Reuse the applicable framework and do not duplicate architecture, components or workflows.

## 18. Definition of conformance

A Complaint Pack Builder conforms only when:

- it is a configured implementation of this framework;
- it does not duplicate shared engines or renderers;
- it matches Airbnb V4’s product quality;
- it preserves the 12-page professional case-file model unless an adaptation is formally justified;
- all output formats agree;
- privacy and accessibility contracts pass;
- desktop, tablet and mobile acceptance passes;
- Airbnb regression passes;
- framework and category versions are declared.

If the output resembles exported form data, conformance fails. If it resembles a professionally prepared consultant case file and preserves the shared product experience, conformance succeeds.

## 19. Framework A production acceptance rule

A Framework A implementation is not complete, compliant or production-ready unless it satisfies every requirement below.

### 19.1 Self-contained Framework CSS

The shared Framework A stylesheet must contain all professional builder-shell styling for:

- the builder wrapper and two-column desktop layout;
- the builder panel and Live Professional Preview panel;
- the progress indicator and step navigation;
- inputs and buttons;
- timeline rows, evidence controls and financial rows;
- the completion screen;
- tablet and mobile reflow.

No configured builder may rely on hidden Airbnb, Section 75 or category-specific page styles for its framework layout.

### 19.2 Shared DOM contract

Every builder must retain the approved framework hierarchy and, where applicable, these shared structural classes:

- `qcb-framework-v1`;
- `qcb-airbnb-shell`;
- `qcb-airbnb-stage`;
- `qcb-airbnb-preview`;
- `qcb-step-map`;
- `qcb-form-grid`.

Permitted category configuration may change content but must not silently replace the shared shell.

### 19.3 No category-specific layout dependency

The shared stylesheet must render Airbnb, Free Section 75, Free Holiday Compensation and every future Framework A implementation correctly without relying on Airbnb-specific page styles. Removing category-specific page CSS must not break another configured builder.

### 19.4 Reference parity

Every configured implementation must be visually and structurally compared with the current Airbnb reference implementation. Differences are limited to product name, category questions, evidence catalogue, financial terminology, complaint logic, generated wording, official guidance and justified category-specific content.

Workflow, navigation, shell proportions, preview layout, controls, spacing system, responsive behaviour, accessibility patterns, document structure and outputs remain framework-identical.

### 19.5 Live visual acceptance

Automated tests alone do not establish conformance. Before deployment, inspect the live or production-candidate builder at desktop, tablet and mobile widths and confirm:

- no raw or default HTML appearance;
- no missing preview;
- no full-width form regression;
- no overlapping labels or clipped buttons;
- no container overflow;
- no excessive spacing;
- no category-specific visual drift.

### 19.6 Asset validation

Before deployment, confirm that the framework stylesheet returns HTTP 200 with a `text/css` content type, cache-versioned asset paths are valid, the JavaScript runtime loads, the builder mount initialises and all 12 preview pages render.

### 19.7 Regression gate

Every new implementation must pass regression against every certified Framework A reference implementation. The currently certified set is:

- Airbnb Complaint Pack Builder Version 4;
- Free Section 75 Complaint Pack Builder;
- Free Holiday Compensation Complaint Pack Builder;
- Free Flight Claim Complaint Pack Builder.
- Free Lost Luggage Compensation Complaint Pack Builder.

All later certified builders join this regression set. A new builder is not complete if an existing implementation is damaged. Certification is never automatic: every configured builder must pass the acceptance rule independently.

### 19.8 Completion standard

A Framework A builder is complete only when its shared CSS is self-contained, its approved DOM structure is present, reference visual parity is confirmed, desktop/tablet/mobile acceptance passes, every document output works, SEO remains protected, accessibility passes, browser-first privacy remains intact, the complete regression suite passes and live verification passes.

## 20. Final rule

Do not build another standalone Complaint Pack Builder.

Build every future dispute category as a configured implementation of the Quaerens Complaint Pack Framework™ v1.6.
