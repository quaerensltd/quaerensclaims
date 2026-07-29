# Quaerens Complaint Management Service (QCMS) Foundation

Architecture version: `1.0.0-alpha.3`  
Case Summary schema version: `1.0.0`

This module is the internal foundation for the future Quaerens Complaint Management Service (TM). It does not create a public purchase journey, collect payment, create a CRM case, transmit personal data, submit complaints or create a binding instruction.

## Purpose

QCMS Parts 1A to 1C define the reusable layer that can receive a completed Complaint Pack, organise it into a Case Summary, assess administrative complexity, estimate administration requirements, suggest an indicative QCMS service level and describe the future instruction workflow that may allow a Platform User to become a Client.

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
- `qcms.instruction.js` - universal instruction, authority, accuracy, agreement, signature, payment, CRM handover, audit and failure-state contracts.
- `qcms.fixtures.js` - fictional fixtures for Energy, Flight, Car Finance and manual review.
- `qcms.render.js` - static prototype renderer for Case Summary, recommendation and instruction architecture.
- `qcms.ui.js` - mounting helper for internal prototypes.
- `qcms.test.js` - QCMS architecture regression tests.
- `qcms.ui.test.js` - QCMS static UI regression tests.

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
        |
        v
Service confirmation
        |
        v
Authority and accuracy confirmation
        |
        v
Service Agreement placeholder
        |
        v
Digital signature architecture
        |
        v
Secure payment architecture
        |
        v
CRM handover schema
        |
        v
Client
```

Part 1C still remains prototype-only. It does not move data out of the browser, create operational case records, enable payment, accept live digital signatures or connect to any builder.

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

The current prototype is local-only. The storage helper is guarded and fails safely if `localStorage` is unavailable or malformed.

The module does not:

- transmit personal information;
- log personal information;
- load third-party scripts;
- collect payment;
- create CRM cases;
- create QCMS instructions.

## Instruction Lifecycle

The universal workflow is:

```text
Complaint Pack Complete -> Case Summary -> Recommendation -> Explore QCMS -> Service Scope -> Authority -> Accuracy Confirmation -> Service Agreement -> Digital Signature -> Secure Payment -> CRM Case -> Client
```

The `qcms.instruction.js` module exposes architecture-only contracts for:

- service confirmation;
- authority to use the Complaint Pack;
- information accuracy;
- Service Agreement placeholder sections;
- digital signature placeholders;
- future payment provider interfaces;
- CRM handover payload;
- audit events;
- failure and recovery states.

## Consent Lifecycle

Authority and information accuracy are represented as required, unselected checkboxes. The prototype states that ownership remains with the Platform User and that authority applies only to the instructed complaint.

Nothing is transferred until:

- authority is accepted;
- the Service Agreement is accepted;
- digital signature is completed;
- payment is confirmed.

Only after those future gates may QCMS create a CRM case. The current prototype does not collect those confirmations.

## Audit Lifecycle

Every future audit event must include:

- timestamp;
- event;
- status.

Configured event types include authority viewed, authority accepted, agreement viewed, agreement accepted, signature completed, payment started, payment cancelled, payment successful, CRM created and transfer completed.

## CRM Lifecycle

The CRM payload schema is defined, but no CRM connection is enabled. The payload contract includes Case Summary, recommendation, service, fee, authority, agreement acceptance, signature status, payment status, generated documents, evidence, complaint category and Platform User fields.

## Payment Architecture

Payment providers are architecture-only placeholders for Revolut, Stripe, PayPal, Apple Pay and Google Pay. No checkout, payment link, wallet flow, payment status verification or receipt flow is implemented.

## Prototype

The non-public prototype lives at:

`docs/platform/prototypes/qcms/qcms-prototype.html`

It uses fictional data and is for internal review only.

## Future Work

Future work may add:

- live digital instruction acceptance;
- payment handling;
- CRM handover connection;
- secure Client accounts;
- Complaint Manager workflow;
- Client portal and mobile app support.

Those features are outside this alpha module and must not be inferred from the prototype.
