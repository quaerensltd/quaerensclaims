# Bootstrap recovery 01 — local diagnostics validated; execution paused

Owner clarification: private password input was completed with Enter, without deliberate interruption; failure approximately 14:49 mainland Spanish time / 12:49 UTC on 19 October 2026. This predates the watcher's 12:50:57 UTC deadline. It does not establish the failed gate: heartbeat staleness, an intervening read, input policy or Auth request could still have failed. The original tool did not retain stage diagnostics, so the original cause remains UNKNOWN. Do not describe the later watcher timeout as the proven creation-failure cause.

## Changes

- Fixed allow-listed diagnostic stages around approval, operator/impersonation, project reads, watcher readiness, private input completion, password-policy validation, Auth lookup/create/claims/revocation and membership reads. The first failed stage is retained even if core bootstrap catches/replaces its exception or cleanup subsequently fails.
- Only fixed stage/state/category, UTC time and numeric HTTP status can enter diagnostic receipts. No arguments, return values, passwords/fragments/lengths, tokens, raw errors, SDK bodies or OAuth fingerprints. Expected user-not-found lookup is ABSENT, not a failed gate. Receipts use atomic local writes under release/.scratch with random filenames; no credential data enters Git.
- Diagnostic-write failure blocks creation and elevation but does not prevent independent cleanup attempts. The original governed handler, core bootstrap/revoke routines and browser ceremony are unchanged.
- Explicit readiness failure categories distinguish unreadable receipt, wrong seal, not armed, invalid/dead PID, stale heartbeat and deadline. The 30-second heartbeat limit and all existing identity/project checks are unchanged.
- Fresh session name crm4-bootstrap-watch-recovery-01.json preserves the old receipt and prevents reuse of the elapsed session. No receipt deleted or overwritten.
- A full ten-minute armed period starts only after preflight/empty-inventory reads succeed. Its end remains capped at 30 seconds before 24 October 2026 09:00 UTC. If ten minutes are unavailable, it refuses to arm. This removes setup time from the ceremony allowance; it does not extend the original test window or waive any gate.

## Validation

42 local tests PASS: existing 20 safety tests, 13 watcher tests, 9 new diagnostic/timing tests. Coverage includes redaction of malicious raw errors, no logging of inputs/results, failed Auth stage retained through core error replacement, cleanup despite diagnostic-write failure, HTTP status-only evidence, stale-heartbeat classification, full armed duration after slow preflight and refusal when the global window is too short.

Loopback demo-quaerens-crm4 Auth/Firestore/Storage emulator tests PASS with diagnostic wrappers: genuine-token governed owner creation, no bootstrap membership, no owner platformAdmin, correct creator, immediate disable/claim removal and retained-token/refresh denial. Read failure and timeout revoked but did not PASS. Injected revocation failure remained FAIL_CLOSED, not certified as successful; subsequent cleanup used the test-only original unfailed Auth interface. No live account or claim mutation. Emulator receipts are fictional and local only.

No cloud reads or writes were needed during this diagnostic work. Existing earlier live inventory evidence remains historical and will be repeated before execution. Application image, IAM, rules and CRM2/CRM3/CRM5/production unchanged.

## Sealed inactive proposal

credential-proposal.json SHA-256:
23dec3e9b26697db882cce69c46da0b361e4866948cc86a0b2fe3ec816c921f6

executionApproved=false, containmentApproved=false, actions=[]; no live watcher started. SHA256SUMS.json covers the tools, proposal and preserved prior receipt. The old approved manifest cannot run modified tooling because its tool hashes no longer match. Do not reuse old commands or edit hashes to bypass this check.

## Recovery procedure for approval

1. Approve activation of this sealed recovery proposal for one supervised watcher session and one bootstrap creation attempt, only bootstrap@crm4.example.test and owner@crm4.example.test, with existing governed creation and immediate revocation/disable authority. No IAM, API, rules, image, OAuth or production changes.
2. Codex performs fresh read-only project/operator, IAM, Auth configuration, zero-user/zero-membership, expiry-rule and service checks. Confirm the old PID is dead and preserve its existing receipt. Both private terminals and the IAP-authenticated browser must be ready before starting the new session.
3. Codex activates the local manifest under the new approval, records its exact checksum and supplies only the watcher command first. Do not enter passwords yet. Watcher must report WATCHER_ARMED; Codex then independently verifies its fresh atomic heartbeat, process, seal, full remaining interval and empty inventory.
4. Only then supply one create-bootstrap command. Private input remains masked, unique and non-reused. The tool rechecks watcher readiness after input and before creation/elevation. Failure means stop and inspect only the new sanitised diagnostic receipt, not automatic retry.
5. After a successful bootstrap receipt, use the unchanged private same-origin browser ceremony to call crm4AdminCreateUser for the synthetic owner. Watcher removes platformAdmin, revokes refresh tokens and disables bootstrap immediately on completion/failure/timeout. Independently verify Auth state, governed membership/creator, audit, retained-token denial and refresh denial before setting the owner's private password and normal login.
6. Any failed/uncertain mandatory check invokes only approved scoped containment. Do not create another identity, remove receipts or broaden permissions. Network/host loss remains a supervised-operation limitation; no false claim of guaranteed cleanup when the process cannot run.

STOP before live execution. Approval requested for this recovery sequence. Expiry remains 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Open HIGH finding, Node reproducibility and Firebase incident residual risks remain. Production and real-customer use NO-GO.
