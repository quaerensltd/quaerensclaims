# CRM4 final functional contracts — 13 October 2026

Baseline: `5913ce400f73b788e2f22853a206e5ca87f99091`.
Branch: `feature/crm4-isolated-clone`. Shared CRM Framework; isolated demo only.

## Verification executed

- Full CRM4 suite: **75/75 tests passed**, zero failed/skipped.
  This includes diagnostic assertions for inherited defects: two Admin failure
  tests and the historical unwrapped portal failure test. They do NOT certify
  those original failure paths as resilient. CRM4 paid-portal recovery is tested
  separately and remains passing.
- Final focused legacy/search rerun: 3/3. Final manual role/self-approval,
  projection-tamper/identity/document/issuance test: PASS.
- CRM2 Cloud Function security regression: PASS.
- Source-manifest hashes, clone-manifest hashes, provider isolation and local
  security regression: PASS. Existing pinned sources and cloned UI unchanged.
- Syntax and whitespace checks: PASS.
- Original same-client browser journey: COMPLETE; synthetic lead
  `ted8EDT7IAPwKcwMIY6Q`. Referral through v9 assessment, Manager/Closer,
  agreement/payment capture, portal, onboarding, Processing and correction.
  No completed intermediate client states were seeded in this journey.
- New actual browser forms: legacy projection, staff message, Storage upload/
  document registration, localhost invitation and duplicate invitation rejection;
  authenticated Processing global search. PASS.
- 21 responsive checks: seven screens at 390/768/1440; no horizontal overflow
  or page exceptions. All six new portal-admin/search screenshots visually
  inspected. Firebase's local-only emulator warning remains visible.
- One initial new browser harness run hit ERR_ABORTED during login navigation;
  the existing harness handling resolved it and the complete rerun passed.
- Manual PDF/DOCX byte generation/hash integrity checked. New manual-output
  PDF/DOCX visual certification NOT EXECUTED.

Reproducible commands (NODE_PATH points to existing local dependencies):

```
node --test <all crm4-staging/tests/*.test.cjs and *.test.mjs>
node scripts/crm2-functions-security.test.js
node crm4-staging/tests/continuous-journey.cjs
node crm4-staging/tests/final-contracts-browser.cjs
git diff --check
```

Browser evidence is local/ignored under `.scratch/continuous-journey` and
`.scratch/final-contracts`. No production client data or invitations are used.

## Admission and classification

83 exposed handlers: 81 separately pinned + 2 CRM4 recovery controls.
68/82 static names integrated. The other 14 are explicitly classified:
11 CRM3/Guided Support out of scope, one legacy Closer route inapplicable to
CRM4 membership, two Stripe operations disabled. Static counts do not establish
complete dynamic workflow/UI parity.

Legacy v2 source remains unchanged. CRM4 transaction boundary enforces exact
ownership, atomic mutation/audit, duplicate projection prevention and v3 protection.
Global search rejects foreign, unclassified and contradictory workspace records.
Manual routes reject versioned Assistant records and retain their own source
contracts; current v9 generation/finalisation/correction pipeline is unchanged.

## Outstanding blockers / limits

- Admin cross-service recovery: concurrent creation can reject one caller;
  Auth interruption leaves membership/Auth temporarily inconsistent; successful
  creation replay captures another setup email. Explicit retries converge to the
  same UID/state, but there is no durable original Admin operation contract.
  A reviewed recovery/idempotency policy is needed, not a process-local lock or
  silent replacement of the pinned workflow.
- Full manual authoring UI, concurrent manual document generation and issuance
  crash recovery are not certified. Manual contract fixtures begin UNDER REVIEW.
- Broader legacy staff email crash recovery incomplete. Callback failure/retry
  passes; paid-portal staff/client outbox recovery remains passing.
- No authoritative current authenticated CRM2 visual baseline available without
  accessing private records. Exact visual parity remains UNVERIFIED.
- Independent Firebase infrastructure, durable report storage, production provider
  configuration, deployment packaging and separate release approval remain needed.

**Deployment readiness: NO.** No merge, deployment, production resources,
CRM2/CRM3/shared production edits, real payments, emails, AI calls or deliveries.
