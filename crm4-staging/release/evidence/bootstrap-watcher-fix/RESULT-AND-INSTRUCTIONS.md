# Bootstrap watcher correction — PASS for local/emulator acceptance

Shared CRM Framework deployment tooling only. No application/framework handler, image, IAM, rules, CRM2/CRM3/CRM5 or production change. No live Firebase identity/claim mutation. Current decision: ready for approval of the corrected two-identity ceremony, STOP before execution.

## Evidence

- 33 local tests pass, including absent-identity arming, stale/dead/wrong-seal heartbeat denial, conflicting creator, failed reads, permission denial, cancellation, timeout and uncertain revocation. Missing evidence never yields PASS.
- Existing loopback demo Auth/Firestore/Storage emulators: governed owner creation using a genuine Firebase token passes; bootstrap has no membership, owner has no platformAdmin, createdBy matches bootstrap. Watcher armed before account creation. Claim removal, disabling and retained-token/refresh denial verified.
- Emulator failure cases: read failure and timeout revoke/disable and do not report PASS. Injected claim-clear failure attempts token revocation and disable but remains FAIL_CLOSED. Test fixture cleanup afterward used the original unfailed Auth object; this is not a live retry or a successful automatic-revocation claim.
- The first harness runs failed because NODE_PATH did not include existing release dependencies, then because a governed idempotency receipt was retained after deleting its Auth fixture. Both were fixed in test setup/cleanup only. No production handler was changed. SDK whole-second creationTime precision is accounted for explicitly and separately regression-tested.
- Live READ-ONLY check at 12:20:32 UTC: exact project/operator, quota-attributed Auth SDK listUsers, authenticated Firestore REST parsing, zero users and zero memberships all PASS. No live watcher was started.

## Correction

credentials.cjs uses SDK-supported GOOGLE_CLOUD_QUOTA_PROJECT scoped to its process and rejects conflicting configuration. Firestore membership monitoring now uses authenticated HTTPS REST reads with the same operator token and explicit CRM4 quota header, not the unsupported custom Firestore SDK credential. No new credentials or IAM.

watch-bootstrap no longer requires a bootstrap UID at startup. It checks empty Auth/membership inventory, then publishes WATCHER_ARMED and an atomic local heartbeat receipt bound to the manifest hash and process PID. Creation and each elevation guard require a live, fresh matching receipt and remaining deadline. The watcher binds only the exact approved email with a creation time in its armed interval. Existing identities, unknown/paginated memberships, cross-project paths, wrong creator or role are rejected.

The original core.cjs bootstrap and revoke implementations and browser-ceremony.js are unchanged. On governed completion, failure, cancellation or timeout, the watcher invokes existing claim removal, token revocation and disabling independently of the creation guard. Read-back must certify all three before PASS_REVOKED. A timeout without any account is not a successful ceremony.

Bound: ten minutes from watcher launch, also ending at least 30 seconds before fixed test expiry. Heartbeat freshness: 30 seconds. Process death/network loss cannot be guaranteed away: creation is blocked by stale/dead watcher checks; after identity creation a killed host requires the authorised explicit revoke-bootstrap recovery. Do not leave the operator terminals unattended. No claim of crash-proof remote scheduling is made. Automatic failure cleanup can itself fail; that remains FAIL and demands containment.

## Sealed proposal and approval

credential-proposal.json remains executionApproved=false, containmentApproved=false, actions empty. Its SHA-256 is dfbcd3724ea79775407e795a98bcc0eae88f62e17c16b895c8b6deaa3104531b. SHA256SUMS.json binds the corrected tools. The older activated manifest must NOT be used: its tooling hashes no longer match.

Request approval to activate this corrected manifest solely for create-bootstrap, watch-bootstrap, revoke-bootstrap and set-owner-password, retaining the fixed window and original two identities. After approval Codex will record the approval reference, activate only these existing fields and provide the resulting exact execution checksum before any command. No API/IAM/rule/service mutation is part of that activation. Current authorisation is local preparation only.

## Exact private ceremony sequence — only after approval

Use two private PowerShell terminals and the existing IAP-authenticated owner browser. No transcripts, screen recording, secret clipboard sharing, passwords in commands or debug logging. Strong unique passwords of at least 20 characters. Both terminals use:

```powershell
Set-Location 'C:\Users\CasaT\.codex\worktrees\crm4-isolated-clone\quaerensclaims'
$credentialTool = '.\crm4-staging\release\managed-rehearsal\credentials.cjs'
$approvedManifest = '.\crm4-staging\release\evidence\bootstrap-watcher-fix\credential-approved.json'
# Codex supplies the exact reviewed execution checksum after approval.
$approvedHash = '<approved execution SHA-256>'
```

1. Codex repeats project, expiry, zero-user/zero-membership, IAM/rule/service and operator checks. Verify the approved manifest checksum and tool hashes. Stop on drift. Do not remove an existing watcher receipt to force a restart.
2. Terminal A: `node $credentialTool watch-bootstrap $approvedManifest $approvedHash`. Require WATCHER_ARMED. Keep it running. Codex independently verifies the fresh local receipt, same PID and exact seal before the creation command. No bootstrap account exists at this point.
3. Terminal B, only after verified readiness: `node $credentialTool create-bootstrap $approvedManifest $approvedHash`. Enter the bootstrap password only at its masked prompt. The tool rechecks watcher readiness after private input and before elevation. Record only its non-secret UID receipt. Do not proceed if the watcher stops or the tool fails.
4. In the already authenticated CRM4 origin, load the reviewed local browser-ceremony.js as a DevTools Sources snippet (no password/token in DevTools). Codex supplies the non-secret invocation bound to the actual verified bootstrap UID, project, approval reference and 2026-10-24T09:00:00.000Z end time. Enter the bootstrap password only in the snippet's password control. Click the governed owner-creation button once. It calls only crm4AdminCreateUser for owner@crm4.example.test as CRM4 administrator. No direct membership writes.
5. Terminal A must return PASS_REVOKED with revocationVerified:true. Independently read Auth state and the governed membership/audit: bootstrap disabled, platformAdmin absent, refresh revocation recorded; owner no platformAdmin; exact CRM4 administrator membership/creator. In the browser click Verify revocation; require retained-token 401 and failed refresh. Any failed/inconclusive check means STOP and containment, not PASS.
6. Terminal B only after verified bootstrap containment: `node $credentialTool set-owner-password $approvedManifest $approvedHash`. Enter the owner's distinct private password at the masked prompt. No password is returned or logged. Exact governed owner and disabled bootstrap checks run before this operation.
7. Use the normal CRM4 Firebase login with owner@crm4.example.test. Verify independent Firebase authorisation, unauthorised denial, audit visibility and capture-only providers before dashboard readiness. Synthetic-only remains mandatory.

Recovery command, within approved containment authority: `node $credentialTool revoke-bootstrap $approvedManifest $approvedHash`. It resolves only the exact bootstrap email and preserves unrelated claims. Do not create a replacement actor or automatically rerun a failed creation. If no identity exists or permissions/read-back are uncertain, report the precise state and stop. Never delete an attempt/heartbeat receipt merely to bypass a guard.

Expiry remains 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. HIGH vulnerability, Node reproducibility and Firebase incident limitations remain. Production/real-customer use NO-GO.
