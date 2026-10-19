# One-operation synthetic bootstrap — consolidated approval request

Framework: Shared CRM Framework. Application, assessed image, membership handlers and security rules are unchanged. This package changes local operator coordination only. It is inactive and creates no live accounts during preparation.

## Current state

Read-only verification at 2026-10-19 18:25:36 UTC confirmed the previous PID 79756 absent, zero Firebase users, zero CRM4 memberships and no bootstrap claim. This is a point-in-time observation; the coordinator repeats the full project/operator/IAM/IAP/Auth/rules/image checks immediately before execution. Historical receipts remain preserved.

## One approval requested

Approve one coordinator invocation, one independently verified watcher session and one bootstrap creation attempt in quaerens-crm4-spain-test (558324850479), using only bootstrap@crm4.example.test and owner@crm4.example.test. Authorise genuine temporary bootstrap authentication/platformAdmin, the existing crm4AdminCreateUser handler, private owner password setup, immediate bootstrap claim removal, refresh-token revocation and disabling. On failure, authorise the same bootstrap cleanup and revocation/disabling of an owner created by this ceremony. No automatic retry, extra identity, IAM change, service change, rules publication or new application build is included.

The inactive proposal SHA-256 is: **13f7b697c467722246ddfdab28d8590c1345a461705d6bc5402a5a8072beb39f**. Following approval, Codex changes only execution/containment approval flags and the approval reference, records the derived manifest hash, verifies all source hashes, and launches the private console itself. No old session receipt is reused.

## Owner action

After approval, enter the unique synthetic passwords only in the private console/browser prompts that Codex opens. The separate private browser may first require Google IAP sign-in as brusseljeroen@gmail.com; existing browser cookies are not copied. No PowerShell commands, WATCHER_READY relays or chat timing coordination are required. Passwords are neither supplied through command arguments nor copied into chat. The private browser deliberately has no tracing, screenshots, console capture, HAR or cookie export. Existing Google sign-in remains an owner-private action.

## Execution

1. Fail on drift, pre-existing identities, stale receipts, invalid hashes, expired authority or failed read-only checks.
2. Open the private IAP browser before starting the ceremony timer. Verify anonymous denial.
3. Start the existing watcher as a separate process; a second verifier process independently reads operator/project and zero inventories, and acknowledges only fresh watcher evidence.
4. Automatically confirm the full ten-minute armed interval. Existing heartbeat and security-validation freshness remain under 30 seconds.
5. Request the temporary password privately, create only the temporary account through the existing helper, then run the existing same-origin governed owner handler using genuine Firebase authentication.
6. Watcher immediately revokes bootstrap authority/tokens and disables the account. Independently verify account/membership state and retained-token/refresh rejection.
7. Set the owner's password privately, verify owner sign-in, no platformAdmin, sole active CRM4 administrator membership, attributable membership audit and anonymous denial; leave the private browser open only after acceptance.

## Failure containment and limits

Cancellation or loss of coordinator IPC requests watcher cleanup; the watcher is a separate detached process. The coordinator independently checks cleanup and disables/revokes a ceremony-created owner on failure. Failed/uncertain reads or cleanup never produce PASS. Creation-time and governed creator binding reject unrelated identities. Audit and membership evidence are retained, not deleted. This coordinator does not change IAM, withdraw IAP or delete Cloud Run; those are outside this requested operation.

All existing 30-second operator/token CLI limits, other CLI limits, HTTP bounds, heartbeat freshness, validation freshness and revocation guards remain unchanged. Windows/process or Google/network delays can still fail the operation. Machine shutdown, persistent network/credential failure or unavailable permissions can prevent verified remote revocation; such an outcome remains FAIL and requires containment follow-up, never an assertion that cleanup succeeded. No software watcher can guarantee remote cleanup while its machine is offline.

Expiry remains 24 October 2026 09:00 UTC; containment authority ends 10:00 UTC. The unchanged assessed image ends in 127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. The open HIGH zlib finding, Node reproducibility limitation and Firebase incident/provider-retention uncertainty remain accepted only for the existing synthetic scope. Specialist managed expiry tests remain deferred, not passed.

## Decision

Local validation: 122/122 regression checks; six governed-handler emulator scenarios; separate no-fallback IPC-disconnection revocation proof; two fully intercepted browser scenarios covering owner creation/login and retained-token denial plus governed rejection. Results and source/log hashes are recorded in evidence/coordinator-validation/validation.json. Failed exploratory runs remain preserved locally and excluded from acceptance. No live coordinator, account creation or cloud mutation was executed during this preparation. GO for the bounded supervised attempt only after the single approval above and fresh gates; not a claim of live dashboard acceptance. Production and real-customer use remain NO-GO.
