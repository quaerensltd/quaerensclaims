# Watcher heartbeat correction — local PASS, execution paused

Shared CRM Framework deployment tooling only. Application, governed handlers, core bootstrap/revocation implementation, browser ceremony, image, IAM and rules unchanged. No cloud reads/mutations or live identities during this work. Prior evidence and failed-session receipts preserved.

## Correction

- Five-second liveness publication on the nonblocking event loop. Heartbeat must remain strictly under 30 seconds old. Stalled/dead processes still fail; no detached process keeps a dead watcher looking alive.
- Separately recorded validationCompletedAt. Creation and independent acknowledgement also require completed security validation under 30 seconds old. An alive process performing slow/failed reads is not sufficient authority. No timer refreshes completed validation.
- Asynchronous gcloud calls bounded to 10 seconds; HTTP reads, including response-body consumption, use an abortable 15-second deadline. Sequential read gate rejects overlap; no automatic application-level retry. Existing SDK mutation/revocation routines remain unchanged. Timeout is failure, not absence or PASS.
- Same approved operator token acquired privately, held only in memory for at most 60 seconds with single-flight acquisition. No new credential, file or IAM role. Explicit operator/no-impersonation/project checks retained each cycle. Reuse removes repeated synchronous token-launch overhead.
- Watcher Auth reads use documented project-scoped lookup/batchGet methods, with explicit non-sensitive field selections. Password hashes, salts and signing configuration are not requested. Writes remain through the existing Auth SDK and governed handlers. See [lookup](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts/lookup) and [batchGet](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts/batchGet).
- Fixed error categories distinguish heartbeat staleness, validation staleness, dead PID, wrong manifest, bad state, deadline, timeout and read overlap. Stage records include UTC start/end and elapsed milliseconds; no raw errors, credentials or response payloads. Independent verification must use these named checks, not combined unlabelled assertions.
- Timer stops before revocation. Read/heartbeat failure keeps result FAIL_CLOSED even if cleanup succeeds. Existing independent claim removal, token revocation and disabling attempts remain mandatory. Unknown revocation cannot produce PASS.

## Validation

57/57 local tests passed, including existing security regressions. Simulated 46-second reads abort; 46 seconds of virtual liveness progress cannot conceal stale validation. Network errors/body timeout, concurrent-read rejection, stale/dead process, actual child-process termination, an actual 10-second child timeout with continuing event-loop ticks, token reuse/expiry/failure and sensitive-field exclusion tested. Simulated timing is explicitly distinct from a 46-second live cloud observation.

Existing loopback Auth/Firestore/Storage emulator scenarios passed using the new REST Auth adapter and independent heartbeat: genuine-auth governed owner creation then revocation/disable; read failure cleanup; timeout cleanup; injected revocation failure remains FAIL_CLOSED. Retained-token/refresh denial checked in the applicable scenarios. An initial emulator-only URL namespace mistake failed closed; corrected before the complete successful run. No completed security scan or unrelated acceptance suite repeated.

Remaining limitation: local/emulator validation does not establish actual live read latency or current permissions. A complete validation cycle exceeding 30 seconds still deliberately blocks authority; fresh liveness alone cannot bypass it. CLI/network/host loss may prevent remote cleanup, so supervised containment and independent verification remain required. Windows CLI timeout cannot prove remote request cancellation; no timed-out read is retried or accepted. No claim of crash-proof revocation.

## Revised supervised procedure — requires approval

1. Approve one fresh supervised watcher session and one bootstrap creation attempt for bootstrap@crm4.example.test and owner@crm4.example.test, including previously scoped immediate revocation/disable containment. Fresh read-only checks must confirm project, security controls, empty users/memberships and preserved failed receipts.
2. Activate the inactive proposal only under that approval and record the new approved-manifest checksum. Use new receipt crm4-bootstrap-watch-recovery-02.json. Never delete/reuse old receipts or use old manifest hashes.
3. Start the watcher in either named PowerShell terminal; retain the other for private creation. Keep the IAP-authenticated browser ready. Wait for WATCHER_READY_FOR_VERIFICATION. No password entry yet.
4. Independently verify exact seal/PID, advancing heartbeat, separately fresh completed validation, exact project and empty inventories. Preserve named gate results and observed UTC/elapsed times. Exclusively write the session-bound acknowledgement only after all pass. Verify ARMED receipt and deadline-armedAt=600000. Ten minutes begin after independent verification, within the unchanged global expiry.
5. Supply one masked create-bootstrap command using the newly approved hash. No secrets in command arguments/chat. Complete owner provisioning through the unchanged same-origin governed handler. Watcher must immediately remove platformAdmin, revoke tokens and disable bootstrap on completion/failure/timeout.
6. Independently verify revocation, retained-token/refresh denial, sole CRM4 administrator owner membership, creator/audit evidence and owner authorisation before dashboard readiness. Stop on any failure; no automatic retry.

Proposal executionApproved=false, containmentApproved=false, actions=[]; see SHA256SUMS.json. No live command supplied because execution is not yet approved.

Decision: PASS for local correction; NO-GO for live execution pending owner approval and fresh mandatory checks. Request approval only for the above single recovery session and single creation attempt. Fixed expiry 24 October 2026 09:00 UTC and containment 10:00 UTC unchanged. Open HIGH finding, Node reproducibility limitation and Firebase incident remain. Production and real-customer use NO-GO.
