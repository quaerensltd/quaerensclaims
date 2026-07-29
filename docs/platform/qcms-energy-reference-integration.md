# QCMS Part 2A Energy Reference Integration

This note records the local Energy-to-QCMS reference integration.

## Scope

The integration connects the completed Energy Supplier Complaint & Switching Pack Builder to the Quaerens Complaint Management Service preview layer without changing the free DIY route.

## Files

- `public/builders/energy/energy.qcms.adapter.js`
- `public/builders/energy/energy.page.js`
- `public/energy-switch.html`
- `public/builders/energy/energy.qcms.integration.test.js`
- `docs/platform/prototypes/qcms/energy-reference-integration.html`

## Data Flow

1. The Energy builder remains browser-local.
2. When the Energy Complaint Pack reaches `Ready to Submit`, the adapter creates a QCMS Case Summary.
3. The Case Summary is validated against schema version `1.0.0`.
4. The shared QCMS recommendation engine assigns an indicative service level.
5. The optional QCMS panel is rendered after the free download/copy/print actions.
6. Selecting `Explore QCMS` reveals a local-only instruction architecture preview.

## Privacy Wording

The integration uses this wording:

> Your Complaint Pack and Case Summary currently remain stored locally in your browser.
> Exploring the Quaerens Complaint Management Service™ does not send your information to Quaerens.
> Nothing will be transferred unless you later give clear permission during the instruction process.

## Deterministic Recommendation Checks

- Simple Energy reference case: `QCMS-L1`, `GBP 59`
- Moderate Energy reference case: `QCMS-L2`, `GBP 199`
- Complex Energy reference case: `QCMS-L3`, `GBP 349`
- Out-of-scope or route-verification case: `QCMS-REVIEW`, no fixed fee

High disputed value alone, vulnerability alone and a portal route alone do not uplift the recommendation.

## Current Limitations

- The QCMS preview is local-only.
- No CRM, payment, email, upload, account creation or external API connection is active.
- The Energy builder remains a self-service DIY builder unless a future instruction process is completed.
- This is not a production-ready QCMS instruction workflow.

