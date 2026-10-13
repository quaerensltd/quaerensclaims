# CRM4 durable account creation and manual issuance — 13 October 2026

Shared CRM Framework boundary work beyond `4b360e2`. Local demo emulators only.
Pinned source bundles, cloned screens, CRM2/CRM3 and production are unchanged.

## Admin creation

`admin-create-recovery.cjs` calls the individually pinned CreateUser handler with
restricted Auth/Firestore/provider adapters. Platform-admin authorization and
synthetic-recipient checks run on every invocation, including completed replays.
Role, workspace, display-name and active-state validation remain mandatory.

- `crm4AdminCreateOperations` uses normalized email identity and a canonical
  request fingerprint. Conflicting role/name/access requests fail closed; they
  must use the existing membership-management operation, not creation replay.
- Concurrent Auth creation reconciles only `auth/email-already-exists` to the
  exact email identity. Membership plus operation UID commit atomically. Existing
  unowned membership records are not overwritten or adopted automatically.
- PENDING operations resume on an explicit authorized CreateUser retry; COMPLETE
  operations return the saved result. There is no process-local mutex/cache.
- `crm4AdminSetupCaptures` is the durable **synthetic provider receipt**, not an
  external delivery. One receipt and deterministic membership audit survive loss
  of acknowledgement. Passwords, reset links and rendered email bodies are never
  stored in that ledger. Real providers are not called.
- Tests interrupt after Auth creation, after membership, before/after Auth update,
  before capture and after capture acceptance. Fresh instances, a separate Node
  process and concurrent retries recover successfully. Fresh simultaneous creates
  also converge on one UID/membership/capture. Changed payload and unauthorized
  replay are rejected. This is actual recovery, not the old diagnostic suite.

No automatic worker is installed. Explicit setup-email resend remains a separate
authorized operation. This change does not certify UpdateMembership cross-service
atomicity or races involving a simultaneous unrelated administrative edit.
Real-provider idempotency and production retention remain outside this local contract.

## Manual issuance

`manual-issue-recovery.cjs` executes the pinned issuer inside a buffered Firestore
transaction, including original authority and the existing linkage/version/hash
boundary. Synthetic capture receipts, delivery record, version/assessment status
and audit commit together. A failed capture or pre-commit crash commits none.
Concurrent successful issuance commits once; a later attempt remains rejected
by the original ISSUED-state requirement. No alternate v9 path is introduced.

Report bytes are saved in explicitly configured demo Storage as well as the local
inspection cache. A fresh runtime with an empty cache successfully issues using
the durable bytes. Without explicit Storage emulator configuration the old unit
test-only memory adapter remains; there is never a production fallback.

Tests prove interrupted capture/pre-commit rollback, subsequent successful issue,
two concurrent attempts, immutable hashes/version/QAR, old-version denial and v9
separation. Historical PARTIAL deliveries are not silently rewritten by this
boundary. This is capture-only atomic acceptance, not real email atomicity.

## Actual manual authoring browser result: BLOCKED

Executed `manual-authoring-browser.cjs` using a synthetic authenticated Manager:
select case/category, edit narrative/financial fields, inspect draft preview,
attempt save, download and inspect RTF. Screenshots at 390/768/1440 were visually
reviewed; no horizontal overflow or page exceptions. Emulator warning is visible.
The actual save displays persistent PERMISSION_DENIED; no record is created.

Exact unresolved contract: cloned `crm4-assessment-builder.html` writes legacy
`crm4Assessments` directly and explicitly says Processing integration is pending.
The approved/issued Framework B pipeline uses `professionalAssessments`, immutable
versions and category capabilities. The pinned callable inventory does not contain
the matching Create/SaveDraft/SubmitReview authoring versions. Merely allowing the
legacy write would not execute the governed pipeline and would bypass that contract.
No rules were weakened and no artificial transition was seeded to claim success.
A version-pinned authoring route and explicit schema/linkage mapping are required.

## Readiness

## Executed regression evidence

- Full CRM4 suite: 76/76 passed, no failures/skips. Three inherited-source
  diagnostic tests remain explicitly diagnostic, not recovery acceptance.
- Final durable-Storage manual restart/concurrency test rerun: PASS.
- CRM2 Cloud Function security regression: PASS (after supplying existing local
  dependency search path; initial missing-dotenv invocation was not a product defect).
- Continuous actual-browser synthetic client journey: PASS, lead
  `Fde5mUG9R385JGZIueg2`; includes Admin controls and separate v9 corrections.
- Manual authoring browser: BLOCKED_SAVE_CONTRACT; preview and downloaded RTF
  verified, 390/768/1440 no horizontal overflow, screenshots visually inspected.
- Source-manifest and cloned-screen integrity: PASS in full suite; no pinned
  bundle, cloned screen, rule, production source or deployment configuration changes.
- Whitespace: PASS. All new records are isolated synthetic emulator records.

NOT READY FOR DEPLOYMENT. Account-creation recovery and new synthetic issuance
recovery are implemented; full governed manual authoring remains blocked as above.
Independent infrastructure/provider approvals and authenticated CRM2 visual
baseline remain outstanding. No production resources, payments or communications.
