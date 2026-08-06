# Quaerens Platform Development Governance

Before beginning any development work, classify the requested change as belonging to one of these platform frameworks:

1. the Shared CRM Framework; or
2. the Quaerens Complaint Pack Framework™.

Reuse the applicable framework. Do not create duplicate architecture, components, workflows or engines.

## Complaint Pack work

Before implementing, modifying or extending any Complaint Pack Builder, read these documents completely:

- `docs/platform/complaint-packs/quaerens-complaint-pack-framework-governance.md`
- `docs/platform/complaint-packs/quaerens-complaint-pack-framework-v1.md`

Airbnb Complaint Pack Builder Version 4 is the Quaerens Complaint Pack Framework™ v1.0 reference implementation.

Every category must inherit the framework. Category work may change only questions, evidence requirements and guidance, eligibility and complaint logic, generated wording, legal guidance, dispute terminology and justified case-specific content.

Do not create a separate workflow, preview, evidence engine, timeline engine, financial engine, document engine, PDF engine, Word engine, export system or design language.

If a framework change appears necessary, do not change it silently. Explain the proposed improvement, why it belongs in the framework and its effect on every existing builder, then wait for explicit approval before modifying shared framework behaviour.

Every new builder or approved shared change must pass Airbnb regression and must not break Section 75, Holiday Park, Spray Foam, Solar or any other framework implementation.

## Framework A v1.6 category adapters

Specialist categories must use the governed allow-listed Category Adapter Contract. Adapters may supply only category-scoped calculations, quality/completion decisions, analysis, complaint and cover-email wording, guidance and twelve-page content. They must never mount or replace the shared shell, navigation, preview, output engines, metrics or Framework C boundary. Adding an adapter category or hook remains a shared-framework change requiring explicit approval.

## Framework A production acceptance

A configured Complaint Pack Builder is not complete or production-ready until it passes the permanent Framework A Acceptance Rule in both authoritative Complaint Pack documents. In particular, it must use the self-contained shared Framework A stylesheet and approved DOM contract (`qcb-framework-v1`, `qcb-airbnb-shell`, `qcb-airbnb-stage`, `qcb-airbnb-preview`, `qcb-step-map` and `qcb-form-grid`, where applicable), without hidden category-specific layout dependencies.

Acceptance requires reference parity with Airbnb Version 4, live visual inspection at desktop, tablet and mobile widths, successful stylesheet and runtime asset validation, all 12 preview pages, working outputs, protected SEO, accessibility and browser-first privacy, and regression against Airbnb, Free Section 75, Free Holiday Compensation and every later independently certified builder. Automated tests alone are insufficient. Do not describe a builder as complete, compliant, certified or production-ready until every applicable acceptance gate has passed independently.

Every Framework A completion experience must inherit the shared **Help the Next Person™** component after downloads, next steps and Optional Guided Support. Do not duplicate its markup or behaviour in category pages. Preserve its identical honest-review, share-tool and thank-you wording; do not replace it with sales, lead-generation, donation, tip, payment or fundraising prompts.

Every Framework A builder must also inherit **Anonymous Platform Metrics™** from the shared runtime. Category implementations may register only an approved builder identifier and must not create separate analytics code. Metrics are daily aggregates only: no form answers, personal data, QCP reference, user profile, CRM record or Framework C linkage is permitted. Public builders must include the shared disclosure and pass the metrics privacy and security regression gate.
