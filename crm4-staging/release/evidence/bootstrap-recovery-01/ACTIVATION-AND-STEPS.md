# Controlled recovery activation — 19 October 2026

Owner approval: one supervised watcher session and one bootstrap creation attempt, only bootstrap@crm4.example.test and owner@crm4.example.test. No new identity, IAM, rule, image or provider scope.

Fresh read-only security preflight PASS: exact project/number, assessed image and sealed startup fields, service readiness/native IAP, exact service invocation and time-conditioned owner IAP policies, project IAM/audit policy, public OAuth client ID, narrowly selected Auth restrictions/domains, zero Firebase users, zero CRM4 memberships, and exact Firestore/Storage expiry ruleset names/source hashes. Previous failed watcher receipt is byte-identical; old PID 72160 is absent. No live watcher/account/claim/cloud mutation during this activation preparation.

47 local tests PASS. Four loopback emulator scenarios passed their expected decisions, including new independent acknowledgement before genuine-token governed owner creation, immediate revocation, disabled bootstrap and retained-token/refresh denial. Injected read failure/timeout revoked without PASS. Injected revocation failure remained FAIL_CLOSED; only subsequent emulator cleanup used the unfailed interface. No claim that live revocation has already been verified.

## Timing correction required by this approval

The earlier inactive proposal started its ten-minute clock after internal preflight. This approved activation additionally requires a separate local acknowledgement after independent verification. Watcher first reports WATCHER_READY_FOR_VERIFICATION, continuously rereads project and empty inventories, and remains unable to authorise create-bootstrap because its state is not ARMED. Waiting is capped at 15 minutes and the global test expiry. The acknowledgement is exclusive-create, bound to manifest hash, PID, session start, live process and fresh heartbeat. Stale, wrong-session, missing or duplicate acknowledgement fails closed. The watcher accepts only a fresh acknowledgement and then starts the full 600000ms period. No deadline extension, account adoption or cloud permission is introduced.

After owner reports READY_FOR_VERIFICATION, Codex must independently check current receipt/hash/PID/heartbeat and empty inventories, then call bootstrap-watcher.cjs acknowledge(receiptPath, approvedHash). This writes only the local .ack file, never cloud state. Confirm the resulting ARMED receipt records independentlyVerifiedAt <= armedAt and deadline-armedAt === 600000 before releasing the single creation command. Do not acknowledge until both private terminals and the authenticated browser are ready. Subsequent checks naturally consume ceremony time; the ten-minute clock starts after independent verification, not after every later conversational exchange.

## Step 1 — owner Terminal A

From C:\Users\CasaT\.codex\worktrees\crm4-isolated-clone\quaerensclaims:

node crm4-staging/release/managed-rehearsal/credentials.cjs watch-bootstrap crm4-staging/release/evidence/bootstrap-recovery-01/credential-approved.json cc4bdd39b4cdea401c5adc919a5d8020fe40baf2a5ca2c297e85b7ee66264428

Expected first readiness output: WATCHER_READY_FOR_VERIFICATION. Keep Terminal A open and report that fixed text. Do not enter a password, start create-bootstrap, repeat the watcher or delete receipts. Existing old commands/manifests do not match these tool hashes.

## Subsequent supervised steps (not yet executed)

After independent verification/acknowledgement and confirmed ARMED receipt, supply the one approved create-bootstrap command in Terminal B with this same manifest/hash. Private password only via masked TTY; no password in arguments/chat/environment. Use the unchanged same-origin browser ceremony and crm4AdminCreateUser handler for owner creation; no direct membership writes. Watcher must remove temporary platformAdmin, revoke refresh tokens and disable bootstrap on observed completion/failure/timeout. Independently verify exact bootstrap/owner identities, bootstrap disabled/no elevated claim, governed sole CRM4 administrator membership and creator/audit receipts, retained-token and refresh denial. Only then set owner's private password and verify normal owner login/unauthorised denial. No permanent platformAdmin.

Failure means STOP; inspect only allow-listed stage receipts. No automatic retry or removal of receipts. Network/host failure can prevent remote revocation: retain the previously approved revoke-bootstrap action and independent verification; do not claim guaranteed remote cleanup when the watcher cannot run. Never report unknown revocation as PASS.

Fixed test expiry remains 24 October 2026 09:00 UTC, containment deadline 10:00 UTC. HIGH vulnerability, Node reproducibility limitation and Firebase incident remain synthetic-only residual risks. Production and real-customer use remain NO-GO.
