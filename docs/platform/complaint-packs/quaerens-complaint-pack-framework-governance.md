# Quaerens Complaint Pack Framework™ — Master Governance Directive

Current framework version: **1.2**
Status: Permanent platform standard  
Authority: The Quaerens Platform™  
Product specification: `docs/platform/complaint-packs/quaerens-complaint-pack-framework-v1.md`

## First principle

The framework is the product. Individual Complaint Pack Builders are configured implementations of that product.

Applicant Details™ and the Unique Complaint Pack Reference™ are mandatory shared capabilities. Category implementations may not duplicate, rename, suppress or replace them. A QCP reference is the case identity across Framework A, Framework C and Framework B; downstream frameworks inherit it and must not mint a competing reference.

Do not approach a category as another webpage, form or standalone Complaint Pack. Extend the existing framework.

The downloaded Complaint Pack is the product. The webpage prepares it. The user must finish more organised, more informed, more confident and better prepared than when they started.

## Mandatory pre-read

Before writing code for any Complaint Pack Builder, read the complete authoritative specification:

`docs/platform/complaint-packs/quaerens-complaint-pack-framework-v1.md`

Then identify:

- the shared modules and behaviours to inherit;
- category-specific questions;
- category-specific evidence and eligibility logic;
- category-specific complaint logic and wording.

Everything else must be inherited.

## Framework precedence

The framework takes precedence over category implementation preferences.

Do not create another:

- builder architecture;
- workflow or navigation model;
- preview or professional document viewer;
- timeline or chronology engine;
- evidence or readiness engine;
- financial schedule;
- document model or renderer;
- PDF, Word-compatible, TXT, print or copy engine;
- completion experience;
- responsive or accessibility system;
- visual language.

## Permitted category variation

A category may change only:

- questions;
- evidence requirements and guidance;
- eligibility logic;
- complaint logic;
- generated wording;
- legal and regulatory guidance;
- dispute-specific terminology;
- justified case-specific content within the common document structure.

Category-specific work must not silently modify the shared framework.

## Product outcome standard

Every interaction must reduce uncertainty, increase confidence, organise evidence and prepare a stronger complaint.

The intended download reaction is: “I can’t believe this was free.”

If a generated document feels like exported text or form data, the implementation has failed. If it feels professionally prepared by a knowledgeable consultant, it has succeeded.

Design backwards from the completed case file.

## Framework evolution approval gate

If an improvement appears to require a framework change:

1. stop before modifying shared framework behaviour;
2. describe the proposed improvement;
3. explain why it belongs in the framework rather than category configuration;
4. describe the effect on every existing Complaint Pack Builder;
5. identify versioning and migration consequences;
6. wait for explicit approval;
7. after approval, implement the change once in the shared boundary;
8. update the framework specification and version;
9. run the complete regression matrix.

Never fragment the framework. Strengthen it centrally.

## Regression obligation

Every new category must be tested against Airbnb Version 4, the v1.0 reference implementation.

An approved framework change must not break:

- Airbnb;
- Section 75;
- Holiday Park;
- Spray Foam;
- Solar;
- any other current or future configured implementation.

Regression includes workflow, documents, exports, privacy, accessibility, desktop, tablet, mobile and category SEO.

## Framework A acceptance rule

A Framework A implementation is not complete, compliant or production-ready unless all of the following are true.

### 1. Self-contained Framework CSS

The shared Framework A stylesheet contains the complete professional builder-shell styling required for the builder wrapper, two-column desktop layout, builder panel, Live Professional Preview panel, progress indicator, step navigation, inputs, buttons, timeline rows, evidence controls, financial rows, completion screen, tablet reflow and mobile reflow.

A configured builder must not depend on hidden page-specific Airbnb, Section 75 or category-level layout rules.

### 2. Shared DOM contract

Every Framework A builder uses the approved shared structural classes and DOM hierarchy required by the framework, including where applicable:

- `qcb-framework-v1`;
- `qcb-airbnb-shell`;
- `qcb-airbnb-stage`;
- `qcb-airbnb-preview`;
- `qcb-step-map`;
- `qcb-form-grid`.

Category implementations may change permitted wording and configuration, but must not silently replace the framework shell.

### 3. No category-specific layout dependency

Removing Airbnb-specific page styles must not break Airbnb, Section 75, Free Holiday Compensation or any future Framework A builder. The same shared framework stylesheet must render every configured implementation correctly.

### 4. Reference parity

Every new Framework A implementation is visually and structurally compared against the current Airbnb reference implementation.

Allowed differences are limited to product name, category questions, evidence catalogue, financial terminology, complaint logic, generated wording, official guidance and category-specific content. Workflow, navigation, shell proportions, preview layout, controls, spacing system, responsive behaviour, accessibility patterns, document structure and outputs must remain framework-identical.

### 5. Live visual acceptance

Automated tests alone are insufficient. Before deployment, the live or production-candidate page must be inspected at desktop, tablet and mobile widths. Acceptance confirms there is no raw or default HTML appearance, missing preview, full-width form regression, overlapping label, clipped button, container overflow, excessive spacing or category-specific visual drift.

### 6. Asset validation

Before deployment, verify that:

- the framework stylesheet returns HTTP 200;
- its content type is `text/css`;
- cache-versioned asset paths are valid;
- the JavaScript runtime loads;
- the builder mount initialises;
- all 12 preview pages render.

### 7. Regression gate

Every new Framework A implementation must pass regression against all certified reference implementations, including Airbnb, Free Section 75, Free Holiday Compensation and all later certified builders. A new builder is not complete if it damages an existing implementation.

### 8. Completion standard

A Framework A builder is complete only when the shared CSS is self-contained, the approved DOM structure is used, reference visual parity is confirmed, desktop/tablet/mobile acceptance passes, all document outputs work, SEO remains protected, accessibility passes, browser-first privacy remains intact, regression tests pass and live verification passes.

### Current certification status

Framework A is currently validated across:

- Airbnb Complaint Pack Builder Version 4;
- Free Section 75 Complaint Pack Builder;
- Free Holiday Compensation Complaint Pack Builder.

Certification is not inherited automatically. Every later configured builder must pass this acceptance rule independently before it may be described as certified, compliant or production-ready.

## Versioning

Airbnb Complaint Pack Builder Version 4 is the Quaerens Complaint Pack Framework™ reference implementation. The current shared framework version is v1.1.

Shared changes increment the framework version and require documentation, approval and regression. Category-only changes increment only the category version and must not silently alter the framework.

## Help the Next Person™

**Help the Next Person™ Version 1.0** is a permanent Framework A completion component and a platform value, not a category-specific feature.

Every configured Complaint Pack Builder must inherit the component once from the shared framework runtime. It appears after Complaint Pack readiness, downloads, next steps and Optional Guided Support. It must:

- invite an honest review without asking for a positive review;
- provide accessible desktop and mobile sharing with a safe copy-link fallback;
- preserve the approved identical thank-you message;
- remain evidence-first, consumer-first, browser-first, optional and free from pressure;
- contain no sales request, lead-generation prompt, donation, tip, payment or fundraising request.

Category implementations must not copy, rewrite, relocate or privately replace this component. The shared implementation is regression-protected across Airbnb, Free Section 75, Free Holiday Compensation and every later certified builder.

## Platform routing rule

Before any Quaerens Platform development, determine whether the work belongs to:

1. the Shared CRM Framework; or
2. the Quaerens Complaint Pack Framework™.

Use the correct framework before creating code. Never duplicate architecture, components or workflows.

## Final rule

The Quaerens Platform grows by extending frameworks, not by creating standalone products.

Every Complaint Pack Builder must strengthen the framework and must never fragment it.
