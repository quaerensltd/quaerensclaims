# Quaerens Intake Gateway™ Version 1 implementation

Status: Production candidate

Framework: C

Framework version: 1.0

Implementation boundary: Prepared Case review through Ready for Assignment

## 1. Architecture followed

This implementation follows:

- `docs/platform/quaerens-platform-constitution-v1.md`;
- `docs/platform/intake-gateway/quaerens-intake-gateway-framework-v1.md`;
- `docs/platform/roadmap/quaerens-product-roadmap-v1.md`;
- repository development governance in `AGENTS.md`.

The Gateway is an independent control layer between Framework A and Framework D. It is not a CRM, Complaint Pack Builder, public enquiry dashboard or operational case-management system.

Version 1 receives completed, explicitly consented Prepared Cases and supports internal review, manual qualification, internal notes and manual destination preparation. It does not create a CRM record. Its terminal operational state is `ready-for-assignment`.

## 2. Entry and authentication

The internal route is `/intake-gateway.html` and is linked from `/admin-centre.html` as **Quaerens Intake Gateway™**.

The route reuses Firebase Authentication. No separate login or credential store exists. Access requires the trusted `platformAdmin` custom claim. The browser cannot read or write Gateway records directly; protected callable Cloud Functions remain the authority.

Unauthenticated users are returned to the existing login route with a safe Gateway return path. Authenticated users without `platformAdmin` are denied access.

## 3. Prepared Case intake contract

`gatewaySubmitPreparedCase` accepts only an explicitly consented Guided Support submission containing:

- immutable Complaint Pack and Gateway references;
- Framework and builder identifiers and versions;
- complaint category, commercial model, country and language;
- customer contact details supplied for Guided Support;
- Complaint Pack Quality and Evidence Readiness;
- estimated financial exposure and issue summary;
- the prepared document sections;
- controlled supporting-document metadata;
- Guided Support consent and consent timestamp.

The function ignores client-side routing or assignment instructions. It generates the Gateway reference, fixes the initial status to `new`, fixes assignment to `unassigned`, records Framework C version 1.0 and uses a deterministic source key to prevent duplicate acceptance of the same builder and Complaint Pack reference.

The intake function does not create or update any CRM collection.

## 4. Internal dashboard

The dashboard displays:

- New Prepared Cases;
- Awaiting Review;
- Awaiting Qualification;
- Awaiting Assignment;
- Assigned, Accepted and Closed lifecycle visibility;
- Today's Cases;
- average response time;
- average Complaint Pack Quality;
- average Evidence Readiness;
- priority cases requiring attention;
- configuration-driven builder breakdown.

Assigned and Accepted are lifecycle reporting positions reserved for later integration acknowledgements. Version 1 internal actions cannot progress a case into either state.

## 5. Builder queues

Queues are derived from registered reference categories plus builders found in Prepared Case data. Current configured labels are Airbnb, Section 75, Holiday Compensation, Flight Delay, Car Finance, Train, Parking, Cruise, Lost Luggage, Energy and Gym.

A later builder appears from its Prepared Case `builder` value without requiring a new Gateway page or architecture.

## 6. Search and filters

Search covers Gateway reference, Complaint Pack reference, customer, builder, Framework, country, status, commercial model and submission date.

Filters cover Framework, builder, status, commercial model, country, priority and assignment preparation.

## 7. Prepared Case viewer

The internal viewer presents:

- Executive Summary;
- Complaint Pack;
- Timeline;
- Evidence Schedule;
- Financial Schedule;
- generated Complaint Letter;
- generated Cover Email;
- Supporting Documents metadata;
- Internal Notes;
- Assignment preparation.

The viewer does not display CRM activity, tasks, agreements, dialling, operational notes or case progression.

## 8. Manual qualification

Protected Version 1 actions are:

- Mark Reviewed;
- Approve;
- Decline with an internal reason;
- Request More Information;
- Assign Later;
- Add Internal Note;
- Mark Ready for Assignment.

Every action creates an immutable audit entry recording the actor, prior status, resulting status, destination where applicable, timestamp, Gateway version and `crmRecordCreated: false`.

## 9. Manual assignment preparation

The authorised destinations displayed in Version 1 are CRM1, CRM2, CRM3, CRM4 and Future Partner.

Selecting a destination and marking the case Ready for Assignment records only a proposed destination and assignment-preparation decision. It does not call, write to or otherwise connect with an operational CRM.

## 10. Security boundary

- Direct browser access to `intakeGatewayPreparedCases` and its audit subcollections is denied by Firestore rules.
- Internal listing and changes require the trusted `platformAdmin` claim in callable Cloud Functions.
- Public intake cannot select a destination or status.
- Status actions are allow-listed by the backend.
- Destinations are allow-listed by the backend.
- Prepared Case source identity is immutable after creation.
- No service-account credential is exposed to browser code.
- No CRM collection is referenced by the Gateway implementation.

## 11. Responsive and accessibility contract

The interface supports desktop, tablet and mobile reflow. It provides semantic headings, labelled controls, a real table with contained horizontal scrolling, keyboard-focus indicators, native dialog and form controls, live status messages and reduced-motion support.

## 12. Validation

The Version 1 validation script checks:

- required route, stylesheet, runtime and documentation files;
- Admin Centre entry;
- existing-authentication reuse and `platformAdmin` enforcement;
- all required metrics, queues, searches, filters and viewer sections;
- protected callable functions;
- explicit Firestore denial of browser access;
- allow-listed qualification actions and destinations;
- the Ready for Assignment terminal state;
- the absence of CRM creation or CRM collection writes;
- responsive and reduced-motion CSS;
- noindex and no-store route controls.

Live authentication, callable-function behaviour and responsive visual acceptance remain deployment-gate checks and must be recorded truthfully after deployment.

## 13. Known Version 2 enhancements

Version 2 requires separate approval before implementation. Candidate enhancements include:

- controlled operational-case creation after a valid assignment decision;
- CRM receipt acknowledgement without importing operational workflow into the Gateway;
- versioned business-rule automation;
- partner capacity balancing;
- document verification;
- complaint-quality validation;
- language and jurisdiction routing;
- expanded audit and performance analytics.

Automatic assignment, AI qualification and operational CRM activity are not part of Version 1.
