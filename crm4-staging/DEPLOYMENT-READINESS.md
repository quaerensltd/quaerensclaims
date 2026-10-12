# CRM4 deployment-readiness checkpoint — 12 October 2026

**NOT READY FOR DEPLOYMENT.** Local demo integration only.

## Executed evidence

- 66/66 CRM4 regression tests; CRM2 Cloud Function security regression passed.
- Continuous synthetic client journey through assessment finalisation, Manager,
  Closer, agreement/payment capture, portal activation, uploads/messages,
  Administration completion, Processing and assessment correction completed.
- Added authenticated Admin, callback, agenda, download, preview and captured
  notification controls. Cancellation concurrency tested separately.
- Source manifests validate callable-specific bytes. Admin entrypoints are
  lexically selected without running unrelated production initialization.
- 15 responsive checks at 390/768/1440: no document overflow/page exceptions.
  No fresh authenticated CRM2 comparison: exact visual parity UNVERIFIED.

## Remaining functional contracts

- Manual Framework B Approve/GenerateDocuments/Issue/RequestCorrections and
  Assessment Assistant CompleteIssue are not integrated. These are not substitutes
  for the already-tested v9 Finalise/FinaliseCorrection pipeline.
- Legacy portal-v2 invitation/upsert/staff-document contracts require explicit
  integration separate from the current paid-workspace portal-v3. The inspected
  upsert writes portalVersion 2 and invitation requires version 2; automatically
  routing current version-3 cases through it would be unsafe. No such handler is
  auto-exposed and no current case is downgraded.
- Global client search and legacy Closer links remain unverified/unintegrated.
- Stripe request/refund paths remain disabled, not falsely counted as parity.
- Admin concurrent-create/partial-failure recovery and broader legacy email
  recovery remain incomplete. Client and staff paid-portal recovery is tested.
- Every remaining operation needs its own source/permission/state contract test;
  static callable coverage is not proof of all application workflows.

## Required infrastructure and approvals

- Independently approved CRM4 Firebase project, Auth tenancy, Firestore/Storage
  policy review, least-privilege service accounts and separate secret bindings.
- Durable isolated report/document storage (assessment outputs are currently
  memory-backed), emulator seed/export strategy, backup and recovery policy.
- Approved provider credentials, synthetic acceptance and delivery/payment
  controls; capture ledgers are simulations, not real delivery guarantees.
- Deployment packaging, target and release approval. Local transport is not a
  production deployment package. No infrastructure has been provisioned.

CRM2/CRM3/shared production sources, Firebase production resources and deployment
configuration are unchanged. No real email, AI request, payment or invitation.
