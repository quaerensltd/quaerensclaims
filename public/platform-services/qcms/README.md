# Quaerens Complaint Management Service (QCMS) Foundation

Architecture version: `1.0.0-alpha.1`  
Case Summary schema version: `1.0.0`

This module is the internal foundation for the future Quaerens Complaint Management Service (TM). It does not create a public purchase journey, collect payment, create a CRM case, transmit personal data, submit complaints or create a binding instruction.

## Purpose

QCMS Part 1A defines the reusable layer that can receive a completed Complaint Pack, organise it into a Case Summary, assess administrative complexity, assess evidence completeness, estimate administration requirements and suggest an indicative QCMS service level.

The free DIY route remains primary:

> Your Complaint Pack is complete. You can download it and submit it yourself free of charge.

## Architecture

Current files:

- `qcms.config.js` - architecture version, schema version, enums, service levels, pricing config and public text.
- `qcms.case-summary.js` - universal `QCMSCaseSummary` contract helpers.
- `qcms.validation.js` - schema, status and completeness validation.
- `qcms.recommendation.js` - neutral recommendation and administration model.
- `qcms.pricing.js` - central service-level and fee configuration.
- `qcms.storage.js` - guarded local-only storage helpers for prototypes.
- `qcms.adapter.js` - generic builder-state adapter for future integrations.
- `qcms.fixtures.js` - fictional fixtures for Energy, Flight, Car Finance and manual review.
- `qcms.test.js` - Part 1A regression tests.

## Data Flow

```text
Complaint Pack completed
        |
        v
Case Summary generated
        |
        v
Validation and neutral completeness checks
        |
        v
Complexity and administration estimate
        |
        v
QCMS service recommendation
        |
        +--> Continue free DIY
        |
        v
Explore optional QCMS
```

Part 1A stops at the internal recommendation layer. It does not move data out of the browser or create operational case records.

## Case Summary Contract

The universal `QCMSCaseSummary` supports:

- source builder and source version;
- complaint category, type and title;
- Platform User details;
- respondent details;
- complaint issues, facts and chronology;
- financial position;
- requested outcomes;
- evidence items and missing evidence;
- generated documents and supporting files;
- complaint and submission status;
- official route and escalation position;
- vulnerability and communication indicators;
- neutral complexity, evidence and readiness fields;
- recommended service and indicative fee;
- consent and transfer states;
- future metadata for CRM, secure accounts, portals and mobile apps.

Unknown and not-applicable values are distinct. Not-applicable evidence does not reduce evidence completeness.

## Service Levels

Indicative service levels are configured centrally:

- `QCMS-L1` - Complaint Submission Service, `GBP 59`.
- `QCMS-L2` - Managed Complaint Service, `GBP 199`.
- `QCMS-L3` - Enhanced Managed Complaint Service, `GBP 349`.
- `QCMS-REVIEW` - Service Review Required, no automatic fee.

VAT treatment is not assumed and must be confirmed before launch.

## Recommendation Logic

The recommendation engine considers:

- scope suitability;
- administrative workload;
- evidence requirements;
- complaint stage;
- submission route;
- follow-up requirements;
- manual review triggers.

It does not use:

- revenue optimisation;
- disputed value alone;
- vulnerability;
- age or disability;
- marketing urgency;
- ability to pay.

It does not say that a case is strong, likely to win, guaranteed, approved or accepted.

## Privacy and Security

Part 1A is local-only. The storage helper is guarded and fails safely if `localStorage` is unavailable or malformed.

The module does not:

- transmit personal information;
- log personal information;
- load third-party scripts;
- collect payment;
- create CRM cases;
- create QCMS instructions.

## Prototype

The non-public prototype lives at:

`docs/platform/prototypes/qcms/qcms-prototype.html`

It uses fictional data and is for internal review only.

## Future Part 1B

Future work may add:

- specific builder adapters;
- digital instruction flow;
- payment handling;
- CRM handover;
- secure Client accounts;
- Complaint Manager workflow;
- Client portal and mobile app support.

Those features are outside Part 1A and must not be inferred from this alpha module.
