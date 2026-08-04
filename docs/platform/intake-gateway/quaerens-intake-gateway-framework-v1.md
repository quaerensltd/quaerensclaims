# Quaerens Intake Gateway™ Framework v1.0

Status: Permanent platform architecture standard
Framework: C
Owner: The Quaerens Platform™
Effective date: 4 August 2026

## 1. Purpose

The Quaerens Intake Gateway™ is the central intake layer for The Quaerens Platform.

It is the operational bridge between the Public Platform and operational CRM workspaces. It receives completed Guided Support Requests, qualifies them, applies configurable business rules, assigns them to the appropriate workspace and controls the creation of an operational case.

The Gateway is not:

- a CRM;
- a Complaint Pack Builder;
- a public webpage;
- an operational case-management system;
- a source of public-page routing logic.

The Gateway never performs operational CRM work. Its responsibility ends when a qualified and assigned Prepared Case is used to create the correct operational case.

## 2. The four platform frameworks

The Quaerens Platform consists of four independent, loosely coupled frameworks.

### Framework A — Complaint Pack Framework™

- browser-first;
- free DIY;
- consumer-controlled;
- prepares professional Complaint Packs;
- does not automatically submit or create CRM records.

### Framework B — Professional Case Builder™

- internal;
- evidence-first;
- prepares Assessment Reports and professional case files;
- CRM-integrated after an operational case exists.

### Framework C — Quaerens Intake Gateway™

- receives every Guided Support Request;
- receives Prepared Cases rather than leads;
- qualifies;
- applies business rules;
- routes;
- assigns;
- controls operational-case creation;
- never performs operational CRM work.

### Framework D — Operations CRM™

- CRM1;
- CRM2;
- CRM3;
- CRM4;
- future partner workspaces;
- delivers the assigned operational service.

## 3. Core architectural principle

The public website never creates CRM records.

The public website never decides which CRM or workspace receives a case.

The public website creates only a Guided Support Request after the user explicitly chooses Guided Support. The Gateway determines qualification, commercial journey, routing, assignment and operational-case creation.

No public page may contain CRM allocation or partner-routing logic.

## 4. End-to-end flow

```text
Public Website
    ↓
Complaint Pack Builder
    ↓
Complaint Pack Complete
    ↓
User chooses:
    ├── Submit Myself → no Gateway or CRM record
    └── Request Guided Support
            ↓
    Quaerens Intake Gateway™
            ↓
        Qualification
            ↓
        Business Rules
            ↓
         Assignment
            ↓
    Operational Case Creation
            ↓
       Operations CRM
```

An operational CRM record exists only after the Gateway has completed assignment.

## 5. Prepared Case, not lead

The Gateway does not receive leads, enquiries or prospects.

It receives Prepared Cases. The Complaint Pack has already been completed and structured before the request enters the Gateway. Qualification determines how Quaerens should help; it does not repeat the consumer’s case preparation.

The operating language must therefore use:

- Guided Support Request;
- Prepared Case;
- qualification;
- assignment;
- operational case.

The operating language must not reduce a completed case to a generic lead.

## 6. Guided Support Request contract

Every Guided Support Request should contain, where applicable:

- complete Complaint Pack;
- Executive Summary;
- Timeline;
- Evidence Schedule;
- Financial Schedule;
- Complaint Letter;
- Cover Email;
- Submission Checklist;
- Response Tracker;
- Complaint Pack Quality;
- Builder Type;
- Issue Category;
- contact details supplied expressly for Guided Support;
- uploaded evidence expressly selected for transmission;
- submission date;
- unique Gateway reference.

The contract should also carry the minimum technical metadata needed for controlled processing:

- Complaint Pack Framework version;
- builder/category version;
- Guided Support consent timestamp;
- request status;
- source category identifier;
- language and country where provided;
- immutable creation timestamp;
- audit-safe assignment history.

Nothing already contained in the Prepared Case should need to be asked twice.

## 7. Data minimisation and consent boundary

The Complaint Pack remains browser-first until the user explicitly requests Guided Support.

The Gateway receives only information the user deliberately submits for that purpose. The public builder must clearly distinguish:

- local case preparation;
- user-controlled downloading or self-submission;
- explicit Guided Support transmission.

The Gateway must preserve source provenance and consent without exposing CRM routing rules to the public layer.

## 8. Gateway reference

Every accepted Guided Support Request receives a unique, immutable Gateway reference.

The reference is the cross-framework correlation key for:

- the submitted Prepared Case;
- qualification decisions;
- assignment decisions;
- operational-case creation;
- CRM workspace receipt;
- audit and performance reporting.

CRM-native identifiers may be added after assignment but must not replace the Gateway reference.

## 9. Builder intake sections

Every registered Complaint Pack Builder receives its own logical Intake Queue. Examples include:

- Airbnb;
- Section 75;
- Flight Delay;
- Holiday Compensation;
- Car Finance;
- Parking;
- Energy;
- Train;
- Lost Luggage;
- Cruise;
- future builders.

Builder sections are configuration-driven. Registering a future builder should make its queue and reporting category available without creating a separate Gateway architecture.

## 10. Queue states

Each builder queue supports the common lifecycle:

1. **New Requests** — received and awaiting qualification.
2. **Qualified** — meets the current Guided Support criteria.
3. **Assigned** — allocation decision completed.
4. **Awaiting Contact** — operational recipient has not yet recorded first contact.
5. **Accepted** — accepted into the assigned service journey.
6. **Rejected** — not accepted, with a recorded reason.
7. **Closed** — Gateway intake lifecycle complete.

Operational CRM activity is not managed through these Gateway states. The Gateway may receive limited status acknowledgements needed to measure intake completion, but it does not become the operational workflow.

Every state change must be attributable, timestamped and auditable.

## 11. Qualification

Qualification determines whether and how the Prepared Case can enter a Guided Support journey.

Qualification may consider:

- completeness of the Prepared Case;
- Complaint Pack Quality;
- issue category;
- evidence position;
- jurisdiction or country;
- language;
- product availability;
- service eligibility;
- commercial model;
- time sensitivity;
- recorded exclusions;
- manual review requirements.

Qualification must not rewrite the consumer’s Complaint Pack or perform operational casework.

## 12. Business Rules Engine

The Gateway is the sole authority for assignment decisions.

Configurable assignment factors may include:

- Complaint Type;
- country or jurisdiction;
- language;
- workspace capacity;
- partner availability;
- internal priority;
- product model;
- pricing model;
- service eligibility;
- business rules;
- temporary operational constraints.

Rules must be configuration-driven, versioned and auditable. A decision record should show which rule set produced an assignment without exposing internal routing logic to the public website.

## 13. Routing and workspace independence

The Gateway may assign a Prepared Case to:

- CRM1;
- CRM2;
- CRM3;
- CRM4;
- a future partner workspace.

The public platform knows only that it submitted a Guided Support Request. It does not know or determine the eventual CRM allocation.

Routing configuration belongs exclusively to the Gateway. CRM workspaces receive only cases assigned to them and cannot take ownership by bypassing the Gateway.

## 14. Product models

Every builder registration declares a Product Type, such as:

- DIY Only;
- DIY + Guided Support;
- Professional Consultation;
- Professional Assessment;
- Internal Service.

The Product Type describes the permitted journey. The Gateway interprets that configuration and determines the appropriate intake path.

A DIY Only product does not create a Guided Support Request unless its model is formally changed. A builder must not privately implement a professional journey outside the Gateway.

## 15. Pricing models

Every applicable builder registration declares a Pricing Model, such as:

- Free DIY;
- Fixed Price;
- Consultation;
- Assessment Fee;
- Hybrid.

The Gateway determines the commercial journey from the registered pricing configuration and current business rules. The public builder may explain an approved offer, but it must not determine downstream pricing, workspace assignment or commercial exceptions.

## 16. Assignment and operational-case creation

Assignment is complete only when the Gateway has selected an eligible destination under the active rule set.

Only then may the Gateway create the operational case in the selected CRM workspace.

The operational-case creation contract should include:

- Gateway reference;
- assigned workspace;
- Prepared Case payload or controlled reference;
- qualification outcome;
- product and pricing model;
- assignment reason and rule-set version;
- required first-contact target;
- source builder and issue category;
- permitted contact details and evidence references;
- creation and assignment timestamps.

The CRM never receives website enquiries directly.

## 17. Failure and exception handling

The Gateway must fail safely.

Examples:

- an incomplete request remains Awaiting Qualification;
- no available destination results in an explicit unassigned/capacity exception, not silent loss;
- duplicate submissions are detected using Gateway and source references;
- failed operational-case creation is retryable and auditable;
- invalid workspace destinations are rejected;
- manual overrides require authority, reason and audit history;
- a request is never assigned to more than one active operational owner without an explicit transfer record.

## 18. Gateway Dashboard

The Gateway Dashboard should provide platform-level intake visibility without becoming a CRM.

Core views and metrics:

- New Guided Support Requests;
- Awaiting Qualification;
- Awaiting Assignment;
- Assigned;
- Accepted;
- Declined;
- Average Response Time;
- Builder Breakdown;
- CRM Allocation;
- Capacity.

The dashboard supports intake control, routing oversight and performance analysis. It does not contain operational case notes, case progression, dialling, agreements or other CRM work.

## 19. Builder Breakdown

The Builder Breakdown reports intake volume and status for registered builders, including:

- Airbnb;
- Section 75;
- Holiday Compensation;
- Flight Delay;
- Car Finance;
- Parking;
- Train;
- Cruise;
- Lost Luggage;
- Energy;
- future builders.

Future registered builders should appear automatically through configuration rather than dashboard code changes.

## 20. Boundaries and single responsibility

### Public Platform responsibility

- explain the product;
- prepare the Complaint Pack;
- preserve browser-first privacy;
- let the user choose self-submission or Guided Support;
- transmit an explicitly authorised Guided Support Request.

### Intake Gateway responsibility

- receive Prepared Cases;
- qualify;
- apply business rules;
- determine product and commercial journey;
- route and assign;
- create the operational case;
- record intake audit and performance data.

### Operations CRM responsibility

- receive assigned operational cases;
- contact the consumer;
- perform casework;
- manage evidence operationally;
- deliver the service;
- record operational outcomes.

No layer may absorb the responsibilities of another merely for implementation convenience.

## 21. Independence and loose coupling

The Gateway is independent of:

- the Public Website;
- the Complaint Pack Framework;
- individual CRM workspaces;
- partner-specific operations.

Independence means stable contracts and separate responsibilities, not disconnected data. Frameworks exchange versioned requests and acknowledgements through controlled boundaries.

A public-page release must not require CRM routing changes. A CRM workspace change must not require builder changes. A business-rule change must be deployable within the Gateway boundary.

## 22. Security and governance principles

- The Gateway is the only authority permitted to assign a Guided Support Request to an operational workspace.
- Public clients cannot choose or spoof workspace assignment.
- CRM workspaces cannot receive unassigned public submissions.
- Assignment rules and capacity data are not exposed publicly.
- Every state, qualification, override and assignment change is auditable.
- Access follows least privilege.
- Sensitive case and contact data is minimised and protected in transit and at rest.
- Evidence access is controlled and traceable.
- Retention and deletion policies apply independently to Gateway intake and CRM operations.
- Reporting uses the minimum data required for its purpose.

## 23. Benefits

### Operational separation

Qualification and routing are separated from case delivery, keeping CRM workflows clean.

### Scalability

New builders and workspaces can be registered through configuration rather than public-page routing changes.

### Partner independence

Partner workspaces receive only assigned cases and do not need access to the public intake layer.

### Capacity balancing

Central rules can allocate work according to current capacity and availability.

### Central qualification

One consistent qualification boundary replaces category-specific intake decisions.

### Single intake

Every Guided Support Request enters through one controlled platform contract.

### Future automation

The common request, state and routing model supports safe automation without embedding it in public pages or CRMs.

### Cleaner CRM

Operational workspaces contain accepted operational cases, not unqualified website enquiries.

### Prepared cases

Consumers arrive with a completed, structured Complaint Pack rather than repeating the facts.

### Reduced administration

Reusable case data, evidence schedules and documents reduce duplicate questioning and manual re-entry.

## 24. Versioning

This document establishes **Quaerens Intake Gateway™ Framework v1.0**.

The Gateway evolves independently from the Complaint Pack Framework, Professional Case Builder and Operations CRM.

Versioning rules:

- breaking request, state or assignment-contract changes increment the major version;
- backwards-compatible Gateway capabilities increment the minor version;
- corrective changes that preserve contracts increment the patch version;
- business-rule configuration changes are versioned and audited without silently changing the framework contract;
- every Guided Support Request records the applicable Gateway and source-builder versions;
- migrations must preserve Gateway references and assignment history;
- framework changes require architecture review and regression across public submission, Gateway routing and CRM receipt boundaries.

## 25. Roadmap

Future phases may include:

1. **Automatic Assignment** — deterministic allocation using approved rules.
2. **Partner Capacity Balancing** — controlled distribution against live capacity.
3. **AI Qualification** — decision support with human-auditable reasoning and explicit authority boundaries.
4. **Document Verification** — structural and integrity checks for submitted case files.
5. **Evidence Scoring** — Gateway-level verification signals distinct from Complaint Pack preparation scores.
6. **Complaint Quality Validation** — confirmation that the submitted pack meets intake standards without predicting outcome.
7. **Language Routing** — assignment to suitable language capability.
8. **Jurisdiction Routing** — controlled application of country and legal-route rules.
9. **Performance Analytics** — response, acceptance, allocation and capacity reporting.

Roadmap items are not current implementation authority. Each requires separate approval, data protection review, security design, testing and versioning before implementation.

## 26. Architecture acceptance criteria

An Intake Gateway implementation conforms to Framework v1.0 only when:

- the public website creates Guided Support Requests and never CRM records;
- the Gateway receives Prepared Cases rather than generic leads;
- assignment logic exists only in the Gateway;
- CRM records are created only after assignment;
- builder queues and breakdowns are configuration-driven;
- product and pricing models are centrally interpreted;
- state changes and assignments are auditable;
- failures do not silently lose or duplicate cases;
- frameworks remain independently deployable and loosely coupled;
- the Gateway never becomes an operational CRM.

## 27. Final statement

The Quaerens Intake Gateway™ is the central nervous system of The Quaerens Platform.

The public platform prepares cases.

The Gateway qualifies and routes them.

Operational CRM workspaces deliver the service.

Each layer has a single responsibility.

Together they form one scalable evidence-first consumer support platform.
