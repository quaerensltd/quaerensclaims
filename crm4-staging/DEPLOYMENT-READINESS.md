# CRM4 deployment-readiness checkpoint — 13 October 2026

**NOT READY FOR DEPLOYMENT.** Local demo integration only.

Current recovery extension supersedes the older CreateUser/issuance limitations
below: durable account creation and capture-only atomic manual issuance are tested.
Demo report Storage now supports fresh-runtime recovery when explicitly configured.
Actual manual authoring remains blocked: legacy crm4Assessments direct writes are
not the governed professionalAssessments pipeline. See ADMIN-RECOVERY-EVIDENCE.md.

## Executed evidence

- Focused final-contract tests and CRM2 security regression pass. Final full-suite
  count and evidence are recorded in FINAL-CONTRACTS-EVIDENCE.md.
- Continuous synthetic client journey through assessment finalisation, Manager,
  Closer, agreement/payment capture, portal activation, uploads/messages,
  Administration completion, Processing and assessment correction completed.
- Added authenticated Admin, callback, agenda, download, preview and captured
  notification controls. Cancellation concurrency tested separately.
- Source manifests validate callable-specific bytes. Admin entrypoints are
  lexically selected without running unrelated production initialization.
- 21 responsive checks at 390/768/1440: no document overflow/page exceptions.
  No fresh authenticated CRM2 comparison: exact visual parity UNVERIFIED.

## Remaining functional contracts

- Manual operations are integrated at authenticated-handler level; full manual
  authoring UI, concurrent document generation and issuance crash recovery remain
  unverified. Versioned v9 Finalise/FinaliseCorrection remains separate.
- Legacy portal v2 is integrated atomically with version/ownership gates and actual
  staff form acceptance. No v3 downgrade or duplicate legacy projection. Arbitrary
  v2-to-v3 migration is not implemented or silently inferred.
- Global search is integrated. Legacy Closer links are explicitly inapplicable:
  both screens skip shared-workspace calls and the source denies CRM4 membership.
- Stripe request/refund paths remain disabled, not falsely counted as parity.
- Admin resilience remains a demonstrated blocker: concurrent create can reject,
  interrupted Auth updates leave partial state and setup replay captures again.
  Explicit retry converges; a reviewed cross-service operation/recovery contract
  is still required. A process-local lock would not resolve this safely.
  Callback failure/retry passes; broader legacy email crash recovery is incomplete.
  Existing client/staff paid-portal recovery remains tested.
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
