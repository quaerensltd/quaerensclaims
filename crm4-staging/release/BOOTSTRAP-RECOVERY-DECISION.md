# CRM4 initial-owner recovery decision

Prepared 20 October 2026. Shared CRM Framework operator preparation only. No live account creation, watcher startup, cloud mutation, image rebuild or rescan. Previous evidence is retained.

## Recommendation

Replace the temporary-platformAdmin/watcher/browser-receipt ceremony with a **one-time, explicitly authorised trusted-operator initial-owner bootstrap**. Create only `owner@crm4.example.test`, with CRM4 Administrator membership and no custom claims. Do not create `bootstrap@crm4.example.test`.

This is a deliberate exception to the earlier requirement to use the platformAdmin-governed HTTP creation handler and prohibition on direct membership writes. It requires one consolidated owner approval; the previous approvals do not authorise it. The application handler, client rules, roles, assessed image and ongoing framework behaviour remain unchanged. This is an initial-project installation operation, not a second user-management framework.

## What failed, and what we actually know

The original b7849dbf preflight stopped at historical process verification. It discarded the underlying error; its precise historical Windows failure cannot honestly be reconstructed. New sanitised diagnostics retain the stage, UTC time, duration and failure category without command lines or credentials.

Three repeated diagnostic cycles reproduced `PROCESS_IDENTITY_UNCERTAIN` for historical PID 79316. This was an identity-verification rejection, not a demonstrated timeout. Subsequent independent inspection found that PID absent. Other historical PIDs were absent or belonged to later unrelated processes. No unrelated process was stopped. A recycled or short-lived Windows PID is not a durable identity for a completed ceremony.

The current-process check instead inventories current Node processes, refuses missing command-line metadata, and rejects an active known watcher/coordinator. It does not infer that an unrelated process is safe from PID alone or terminate it. This replacement is proposed only for the new, non-elevating bootstrap; the old verifier retains its security checks and improved diagnostics.

Fresh read-only preflight passed at 2026-10-20T10:25:01Z: exact project, assessed image/startup, service identity, private IAP and invocation policies, public OAuth client ID, project IAM/audit policy, Auth restrictions and published expiry-rule hashes matched. Firebase users and CRM4 memberships were empty; no current bootstrap process was found. With zero Firebase users there is no surviving Firebase bootstrap claim. Evidence: `evidence/bootstrap-reassessment/cloud-read-only-preflight.json`. This is point-in-time evidence, not permission to skip execution-time checks.

## Comparison with existing implementations

`functions/scripts/bootstrap-crm2-admin.js` uses trusted operator credentials, creates/reuses an Auth user, writes initial membership directly, grants permanent platformAdmin and sends a reset email. It has no bootstrap watcher or browser receipt exchange. We reuse only its trusted-operator initial-installation pattern; permanent platformAdmin, reuse of an unknown account and live email are excluded.

No independently verifiable CRM3 first-admin implementation was found in this checkout. References to crm3Memberships do not establish how its administrator was provisioned. We do not claim CRM3 evidence we do not possess.

The existing CRM4 creation handler requires a real platformAdmin Firebase actor. Simply removing the watcher while retaining that elevated account would retain the difficult revocation risk. The proposed alternative removes the elevated account itself. It does not fabricate a token or bypass a client role check.

## Minimal procedure and owner involvement

1. Codex verifies the approved exception, sealed candidate hashes, existing security configuration, current process inventory, operator/project identity, empty Auth/membership inventory and remaining test time.
2. Owner enters one strong unique synthetic password through the existing masked local TTY interface. No deadline starts while the owner prepares the password; all security checks still fail closed. Never supply a password in chat, command arguments or a file.
3. Reserve a one-time operation record and predetermined random owner UID. Create Auth **disabled**, without claims. Stage inactive CRM4 membership and an attributable operator audit record in a Firestore transaction.
4. Independently verify staged identity and membership. Activate membership while Auth remains disabled; enable Auth last. Read back identity, membership and audit. No automatic retry of a partial operation.
5. Owner opens the existing ordinary Edge CRM4 page, passes existing IAP and signs in normally with the synthetic owner credentials. Codex verifies audit and authorisation results. No DevTools, activation file, WATCHER_READY relay or browser timer.
6. If mandatory acceptance fails, disable and revoke only the recorded ceremony-created UID, deactivate its receipt-bound membership, verify the resulting state and retain audit evidence. An uncertain cleanup is FAIL/INCONCLUSIVE, never PASS.

The candidate deliberately has no live execution entrypoint: `provision.cjs` is an import-only operation and the executable test runner refuses non-demo emulator endpoints. Approval of the exception must precede connecting it to the existing private credential interface. No new authentication framework is needed. Budget approximately one hour for that final wiring and review, followed by 15–30 minutes of supervised execution if fresh cloud checks pass; cloud errors may extend this. Do not promise production readiness from this test.

## Exact scope for the consolidated decision

Approve one initial-owner installation exception in quaerens-crm4-spain-test (558324850479), operated as martijnpronk76@gmail.com:

- One Auth identity: owner@crm4.example.test; disabled initially; no custom claims.
- One random-UID CRM4 membership with role administrator, workspaceId CRM4 and workspaceAccess [CRM4]; no membership elsewhere.
- One `crm4AdminCreateOperations/initial-owner-v1` reservation and one `crm4MembershipAudit/initial-owner-<UID>` record, plus their stage transitions.
- Audit actor explicitly recorded as a Google IAM operator, not a fictional Firebase actor; createdBy uses `iam:martijnpronk76@gmail.com`.
- Enable only after independent staged verification; disable/revoke/deactivate that UID on failed acceptance. Retain audit and operation records; no destructive rollback.
- Existing IAP owner, IAM grants, OAuth, expiry rules, audit configuration, providers and image remain unchanged. No temporary bootstrap identity, no new IAM roles.
- Test expiry remains 24 October 2026 09:00 UTC; existing containment authority ends 10:00 UTC. No operation after its applicable deadline.

The exception and containment authority can be approved together. Do not start a new watcher or reuse any old ceremony command.

## Whole-procedure review

| Failure point | Disposition |
|---|---|
| Historical PID reuse and inaccessible unrelated metadata | No historical PID prerequisite in proposed non-elevating flow; current inventory still fails closed |
| Multiple operator CLI startups and token renewal | Existing bounded 30-second exact configuration/token commands retained; failures stop; no promise of network reliability |
| Three-minute browser receipt and ten-minute watcher coordination | Removed from proposed flow; ordinary login follows provisioning |
| Automated Google browser rejection | Ordinary Edge only; no cookie/token extraction |
| Partial Auth/Firestore operation, lost create response | Predetermined UID, disabled-first/enable-last, operation journal, independent readback and targeted containment |
| Unsupported custom-credential Firestore SDK path | Narrow Firestore REST adapter using existing operator/quota mechanism; tested against emulator REST, not the previously failing live SDK path |
| Wrong account/project, existing identity or repeated invocation | Rejected before mutation; prior account is never disabled by a second attempt |
| Interrupted process or persistent network failure | Cannot guarantee remote revocation; no temporary elevated identity exists; preserve receipts and apply authorised containment when connectivity returns |
| Owner admin UI requires platformAdmin for some staff-management actions | Owner gets workspace Administrator only; dashboard inspection does not imply ability to manage platform users |
| Server operations bypass Firebase rules | Explicit installation authority, narrowly allowlisted CRM4 collections; client rules unchanged; this is why separate exception approval is required |

## Validation and limits

Local process tests: 10/10. Candidate boundary tests: 7/7. Emulator integration covers actual Auth creation/sign-in and Firestore REST transactions, client membership reads, anonymous/cross-CRM denial, client membership mutation denial, failures before and after enablement, lost create response, cleanup readback, repeated invocation and persistent credential/network failure. Final receipts and source hashes are alongside this report.

A passing emulator is not proof that the live write permissions, quota routing or network will succeed. The current read-only preflight verifies existing policies, not a trial write. No live SDK write has been attempted. The candidate leaves a permanent operation record after a failed attempt, requiring inspection rather than automatic retry.

Auth and Firestore are not a cross-service atomic transaction. A hard process kill after enablement can leave the intended synthetic owner active; independent IAP, workspace security and the fixed expiry remain. Persistent operator credential/network failure can prevent confirmed immediate containment. The one-time audit actor format is explicit and must be accepted as installation attribution, not represented as a handler-generated Firebase actor.

The outstanding HIGH CVE-2026-85091, custom-backport disposition, Node binary reproducibility limitation, Firebase configuration incident and provider-retention uncertainty remain open. No real staff or customer data is authorised. Existing specialist managed expiry behaviours remain unproven; no claim of new assurance is made.

## Supported basis

Google documents disabled initial Auth users and later administrative updates: https://firebase.google.com/docs/auth/admin/manage-users

Firestore server access uses IAM and bypasses client security rules: https://firebase.google.com/docs/firestore/security/rules-conditions

Firestore transactions provide atomic document operations, not atomicity with Firebase Auth: https://firebase.google.com/docs/firestore/manage-data/transactions

## Decision

GO for choosing and completing this smaller initial-owner exception. NO-GO for live execution until the consolidated exception is approved and the final private entrypoint is validated against the same candidate. Production remains NO-GO. No further owner browser preparation is requested now.
