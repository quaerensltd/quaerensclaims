# CRM4 linkage compatibility boundary

Classification: Shared CRM Framework, isolated CRM4 adaptation authorised by the
administrator. No shared production source or pinned bundle is edited.

## Contract trace

- GenerateDraft stores CRM4 workspace, crm4Leads source, caseRef/clientRef and QAR.
- Finalise preserves identity, writes the current report document and advances the
  authoritative lead assessment status/version.
- Manager linked-assessment reading accepts the caseRef variant with workspace
  validation. Appointment and commercial handlers retain their independent roles.
- Paid Client Workspace's pinned projection expects crmLink.crm4LeadId and has a
  legacy document-version fallback. The boundary authorises neither an unverified
  alias nor that fallback: exactly one current-version document is required.
- Processing completion uses paid lead/portal/checklist/appointment prerequisites
  and transactionally creates one Processing case and completion audit/activity.

## Adaptation

Validate the assessment and lead bidirectionally against the exact lead ID, CRM4
workspace, crm4Leads collection, QAR and current document version. Every supplied
caseRef/clientRef/crm4LeadId must agree. Support either canonical crm4LeadId or the
legacy caseRef, never conflicting values. Return an in-memory alias only to the
GetWorkspace factory. No persistent assessment field is added.

GetWorkspace reads and buffered workspace/template writes share one Firestore
transaction; failed projection or conflicting concurrent read prevents commit.
Read-your-writes preserves the original returned workspace/template projection.
Only expected create/set operations on clientPortalCases/clientPortalRequirements
are supported; new unknown writes/query operators fail closed. No provider work
runs inside this transaction. Other enabled paid-workspace mutations receive a
read-only transactional linkage preflight then retain their original business
handler checks. Their multi-system Auth/email semantics are not made globally
atomic by this change; provider-failure recovery remains a separate parity gate.

## Evidence

`tests/linkage-boundary.test.cjs`: legacy/canonical equivalence, no input mutation,
conflicting and malformed IDs, workspace/collection/QAR/version/document rejection,
failed-projection rollback and denied role. Conflicting records reject all five
enabled paid-workspace handlers before they create a workspace.

`tests/continuous-journey.cjs`: browser-authenticated single client from referral
through actual agreement PDF, synthetic acknowledgment, portal login, onboarding
and Processing evidence update; audit/idempotency assertions and 3-width captures.
Only staff identities are seeded. Generated evidence remains in ignored scratch.
