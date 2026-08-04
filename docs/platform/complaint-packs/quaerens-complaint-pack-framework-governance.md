# Quaerens Complaint Pack Framework™ — Master Governance Directive

Status: Permanent platform standard  
Authority: The Quaerens Platform™  
Product specification: `docs/platform/complaint-packs/quaerens-complaint-pack-framework-v1.md`

## First principle

The framework is the product. Individual Complaint Pack Builders are configured implementations of that product.

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

## Versioning

Airbnb Complaint Pack Builder Version 4 is the Quaerens Complaint Pack Framework™ v1.0 reference implementation.

Shared changes increment the framework version and require documentation, approval and regression. Category-only changes increment only the category version and must not silently alter the framework.

## Platform routing rule

Before any Quaerens Platform development, determine whether the work belongs to:

1. the Shared CRM Framework; or
2. the Quaerens Complaint Pack Framework™.

Use the correct framework before creating code. Never duplicate architecture, components or workflows.

## Final rule

The Quaerens Platform grows by extending frameworks, not by creating standalone products.

Every Complaint Pack Builder must strengthen the framework and must never fragment it.
