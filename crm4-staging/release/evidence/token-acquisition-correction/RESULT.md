# Token-acquisition correction — preparation only

## Cause and narrow change

The recovery-05 watcher passed operator configuration, then failed its project-read wrapper after 10.941 seconds and cleanup lookup after 10.712 seconds. That wrapper obtains an operator token before starting the 15-second HTTP timer. The token command retained its 10-second subprocess limit; its in-memory cache expires after 60 seconds. Code and timing identify the token acquisition boundary as the likely failure, not a rejected Firebase permission. Prior diagnostics did not separately capture the subprocess, so the underlying Windows/Python startup, credential refresh, scheduling or network delay cannot be reconstructed conclusively.

The installed Google SDK's surface/auth/print_access_token.py uses LoadCredentialsWithScopes and returns the selected account's token. This is not a guaranteed local-only constant-time read. We retain this supported interface and the exact existing operator. Parsing credential stores, introducing ADC, impersonation or reusing a token beyond the existing cache interval would change the security assumptions; none is introduced.

Only the exact argument vector `auth print-access-token --account=martijnpronk76@gmail.com` now receives a 30000ms subprocess limit. Config-list remains 30000ms; all other CLI commands remain 10000ms; HTTP remains 15000ms. Exact late-success rejection remains. No automatic retries or timeout fallback.

A dedicated `operator-token-acquisition` diagnostic records START/PASS/FAIL, UTC time, elapsed milliseconds and fixed failure category. It never records token text, raw output, stderr, credentials or command return values. The manifest operator must exactly match the approved account. Configuration and impersonation checks remain fresh and unchanged.

## Safety and evidence boundaries

The 60-second memory cache and single-flight behaviour are unchanged. Failed renewal clears the expired cached value and cannot return it. Heartbeats remain every five seconds; liveness and completed security validation must each be less than 30 seconds old. Token acquisition alone never refreshes completed security validation. HTTP 401/403, aborts and network errors fail closed; no automatic fallback credential.

Local forced-renewal monitoring exercises multiple cache expirations followed by acquisition failure, both with recovery for cleanup and persistent credential failure. Persistent failure cannot report verified revocation or PASS. Existing cleanup independently attempts claim removal, refresh-token revocation and disabling, then verifies account state. That code is unchanged.

Three complete read-only sequences, each with startup, another validation cycle and independent readiness, passed. The first two cycles force expiration of the in-memory cache; the independent reader starts with an empty cache. Nine token acquisitions took 2.616–6.746 seconds; full cycles took 6.512–19.429 seconds. Thus real reads did not reproduce the historical >10-second delay. Real delayed-child and stalled-child tests exercise that branch. Local fixture acknowledgements are disposable; no live watcher receipt is created or armed.

The first broad regression invocation had missing NODE_PATH and no emulator environment. Preserve its failure log; it is not a product PASS. Corrected runs use pinned local dependencies and loopback demo Firebase emulators. See validation.json for final counts and log hashes.

## Residual risk and approval boundary

A token subprocess may now take 20 seconds longer before failure is declared. Repeated independent cleanup guards/lookups may incur further token-acquisition waits when credentials remain unavailable; do not claim an end-to-end cleanup deadline or guaranteed remote revocation during network/credential failure. Existing configuration latency and HTTP/SDK work are additional. Supervised containment remains required. No increase to heartbeat/security-validation freshness is proposed.

The exact assessed application image, original HIGH finding, binary reproducibility limitation, Firebase incident and synthetic-only risk restrictions remain unchanged. No application/runtime/security-rule changes, live watcher, account creation, claims changes, cloud configuration changes, rebuild or scan occurred.

Approval requested: accept the exact operator-token-only 30-second limit and its additional failure/cleanup latency, then separately authorise one newly sealed supervised session and one bootstrap attempt for bootstrap@crm4.example.test and owner@crm4.example.test. Old manifests intentionally fail their tool hashes and must not be reused. Recheck project/operator/security/empty inventories before sealing; independently verify both watcher freshness gates and the full ten-minute ceremony before creation. Test expiry remains 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Stop on failure, no automatic retry. Production remains NO-GO.

## Final results

PASS: 94/94 local tooling regressions; 123/123 complete CRM4 regressions with demo Auth/Firestore/Storage emulators; four watcher lifecycle scenarios with expected success/failure decisions; three independent read-only sequences with nine token acquisitions. Initial misconfigured invocation retained (153 passed / 50 failed), followed by correctly configured passing runs. No failed or inconclusive observation is counted as acceptance. Local correction is ready for review; live execution requires separate approval.
