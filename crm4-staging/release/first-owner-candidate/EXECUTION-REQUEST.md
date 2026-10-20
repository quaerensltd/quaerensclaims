# One-time CRM4 owner execution request

Local preparation only. The proposal remains executionApproved=false. No live account, membership, watcher, timer or cloud change was made during this preparation.

## Exact requested approval

Approve one supervised execution of the sealed first-owner candidate, exclusively in quaerens-crm4-spain-test (558324850479), by martijnpronk76@gmail.com. Permit only owner@crm4.example.test and the audited one-time initial-membership exception. No bootstrap identity or custom claims.

Writes, in order:

1. Create `crm4AdminCreateOperations/initial-owner-v1` with random predetermined owner UID, exact email/operator, kind INITIAL_OWNER_BOOTSTRAP, PENDING state and UTC timestamp. Existing reservation blocks another attempt.
2. Create that Firebase Auth UID disabled=true, emailVerified=false, displayName CRM4 Synthetic Owner, privately supplied password. No custom claims, email delivery or provider configuration.
3. Atomically create `crm4Memberships/<UID>` and `crm4MembershipAudit/initial-owner-<UID>`, and advance the operation state. Membership fields: uid, email, displayName, role=administrator, workspaceId=CRM4, workspaceAccess=[CRM4], active=false, createdBy=iam:martijnpronk76@gmail.com, createdAt, updatedAt. Audit includes action CRM4_INITIAL_OWNER_BOOTSTRAP, named Google IAM actor, target UID, CRM4 workspace/role, state, timestamp and passwordStored=false.
4. Verify exact identity, claim absence, membership and audit. Atomically set membership active=true and operation/audit AUTH_ENABLE_AUTHORISED while Auth remains disabled. Independently re-read identity, UID, email, role, workspace, active state and audit attribution before enabling Auth.
5. Enable only that Auth UID, independently read back identity/membership/audit, and record COMPLETE/verifiedAt. This confirms provisioning, not a successful browser dashboard session.

## Failure handling and limits

A failed stage triggers lookup of the predetermined UID; only this ceremony-created identity is eligible for containment. Disable it, revoke refresh tokens, verify disabled/claim-free state and token-valid-after timestamp, transactionally deactivate only its receipt-bound membership, and verify deactivation. Preserve operation/audit and local receipts; never erase evidence. A lost create response is reconciled by UID, not retried. Existing accounts are not reused or disabled.

If a request, read-back, permission or cleanup is uncertain, result remains FAIL/INCONCLUSIVE. Persistent network/operator failure or a hard process kill can prevent immediate verified cleanup. No temporary elevated identity exists, but the intended owner may remain active after a kill following enablement. Existing IAP and fixed expiry remain independent controls. Do not describe cleanup as guaranteed.

Normal creation/enablement must complete before 24 October 2026 09:00 UTC, with at least ten minutes remaining initially. Cleanup authority is bounded by 10:00 UTC. No deadline is started while the owner prepares the password. Fresh preflights run both before and after private entry. No automatic retry or time extension.

## One owner action and operator sequence

After explicit execution approval, Codex seals the same reviewed hashes into a per-run approved manifest, records the approval reference and checksum, and launches the private entrypoint in a visible private terminal. The owner enters one unique synthetic password at the masked prompt. No command, password or watcher message needs relaying. Then the owner signs in normally in the existing ordinary Edge CRM4 page. No browser script, token extraction or IAP change.

Operator-only command shape (not authorised to run now): `node run.cjs --apply <approved-manifest-path> <SHA256>`. The command rejects inactive approval, changed tools/baselines, wrong project/operator/email/image, expiry, non-TTY input and credential/debug environment overrides. Passwords are absent from arguments, receipt content and exception output. JavaScript cannot promise memory zeroisation, and OS/terminal recording or crash capture is outside this helper; use the previously confirmed private local session.

The live preflight compares existing image/startup, IAM/IAP/audit, public OAuth ID, Auth restrictions, inventory and rule hashes. It does not retrieve OAuth secrets or password-hashing configuration. Dependencies and reference baselines are hash-sealed. No change to IAM, rules, IAP, Cloud Run, assessed image, live providers or other CRMs is included.

## Acceptance and remaining risks

Local tests cover entry ordering/cancellation/masking, inactive approval, expiry/project boundaries and real emulator Auth/Firestore success/failure paths. No live write permissions are claimed from these tests. Actual Firebase SDK network behaviour is still subject to provider errors; failures stop without automatic ceremony retries. SDK transport retry behaviour is not a second authorised account attempt: the predetermined UID prevents duplicate creation.

The private dashboard must still be observed in ordinary Edge after provisioning. Workspace Administrator does not grant platformAdmin-only platform user-management privileges. HIGH CVE-2026-85091, Node reproducibility limitation, Firebase incident and synthetic-only restrictions remain unchanged. Production and real-customer use remain NO-GO.

Final local result: 16 entry/boundary tests and 10 emulator lifecycle scenarios passed. See VALIDATION.json for hashes. No live verification or cloud writes were performed in this preparation turn. Fresh live checks remain mandatory at execution. Catchable SIGINT/SIGTERM stop normal progression and allow targeted cleanup; forced termination cannot be contained by a stopped process.
