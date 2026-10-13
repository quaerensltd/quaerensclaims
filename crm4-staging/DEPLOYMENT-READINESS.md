> Superseding local implementation checkpoint: dual Lister + Closer capability support is now implemented and locally tested for two individual CRM4 accounts. Earlier single-role-only limitations below describe historical evidence. See [current acceptance and remaining deployment gates](release/DUAL-ROLE-ACCEPTANCE.md). Cloud provisioning, IAM grants and application deployment remain unapproved.

> Owner tester confirmed, 13 October 2026: the proposed IAP allowlist is brusseljeroen@gmail.com only. This confirms the tester identity, not an IAM grant or Firebase role. Resource provisioning, IAM changes, real accounts and application deployment require separate authorization. Organization/folder remains unconfirmed. Owner CRM4 Administrator membership must be separately authorized; staff remain deferred pending dual-role acceptance.

> Current decision, 13 October 2026: infrastructure approved in principle for quaerens-crm4-spain-test, europe-west1, Firebase Payment and a USD 25 monthly budget alert. Synthetic Firebase Authentication processing limitation accepted. Resource creation is paused pending the actual organization/folder and separate provisioning authorization. Application deployment, public access and real accounts remain unapproved. Offline runtime/routing/rules/index candidates now exist; cloud acceptance is unexecuted. See [current access and preparation evidence](release/ACCESS-POLICY-EVIDENCE.md).

> **Latest CRM4 Spain preparation — 13 October 2026:** 84/84 full-suite tests,
> separate packaging test and CRM2 security regression pass. Both v9 and manual
> Spray Foam continuous browser journeys reach Processing; manual reissuance
> retains two versions. Runtime report reads now use isolated emulator Storage,
> with no memory fallback. This supersedes older manual-handoff and memory-only
> limitations below, but not cloud readiness. Independent configuration,
> dependency lock, storage adapter candidate and source review package are prepared.
> **Not deployable:** cloud bootstrap/routing, rules/indexes, IAP and cloud-specific
> acceptance remain. See [preparation evidence](release/PREPARATION-EVIDENCE.md)
> and [infrastructure, costs and rollback plan](release/CLOUD-TEST-PLAN.md).

# CRM4 deployment-readiness checkpoint — 13 October 2026

**NOT READY FOR DEPLOYMENT.** Local demo integration only.

Latest acceptance: 79/79 regressions and CRM2 security PASS. Spray Foam manual
browser reissuance and Manager protected report access verified. Solar is blocked
by all captured manual Create contracts allowing only Spray Foam; manual CRM
completion is blocked by the available CompleteIssue requiring AI_ASSISTED.
Neither was bypassed. Read-only legacy preflight is implemented, but migration is
only a proposed explicit process; no historical data touched. Required contract
decisions are in MANUAL-LEGACY-COMPATIBILITY.md. These are functional release
blockers, independent of production infrastructure/provider approvals.

Current recovery extension supersedes the older CreateUser/issuance limitations
below: durable account creation and capture-only atomic manual issuance are tested.
Demo report Storage now supports fresh-runtime recovery when explicitly configured.
Spray Foam manual authoring now uses the transactional compatibility endpoint and
has completed browser acceptance through two issued versions. Solar, existing-draft
migration and manual Processing handoff remain separate gaps. See
MANUAL-AUTHORING-EVIDENCE.md; older manual-authoring gaps below are historical.

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
