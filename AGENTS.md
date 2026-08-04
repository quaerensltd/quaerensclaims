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
