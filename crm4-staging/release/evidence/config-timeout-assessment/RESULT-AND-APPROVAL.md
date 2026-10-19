# Configuration timing assessment — proposed correction, execution blocked

## Smallest supported approach

Keep Google's supported effective-configuration command, already isolated from its optional project lookup by the child-only empty-project override. It is local-only for this purpose, but still launches the Windows/Python CLI. Removing the optional network lookup did not make that process reliably finish within ten seconds. Existing evidence proves timeout at 10.585 seconds, not the exact internal OS/Python phase responsible.

No supported zero-startup replacement was established. Direct INI parsing or importing internal SDK configuration modules would require reproducing active-configuration selection, environment precedence, account and impersonation semantics. That would add an unverified security path. Do not use a stale cached configuration or another credential as a workaround.

Prepared minimum candidate: permit up to 30000ms only for the exact projected config-list argument vector. All other CLI commands retain 10000ms; HTTP reads retain 15000ms. No retry, fallback or deadline extension. Reject success callbacks whose actual elapsed time reaches/exceeds the configured bound, even if process scheduling delayed delivery of a timeout event. The candidate is local and unactivated: no new approved manifest or live command.

## Security and revocation effects

Five-second liveness remains separate from completed-validation freshness. Both heartbeat and completed security validation must be strictly under 30000ms to authorise readiness/creation. A longer-running check does not refresh completed validation. Slow, failed, stalled or uncertain operations cannot become PASS; stale validation rejects creation even while liveness continues. A later completed successful check can establish a new validation timestamp. Every account action retains its own operator/project guards and governed handler.

The 30-second bound is a maximum wait for the configuration subprocess, NOT a 30-second allowance for stale authorisation. All tests and actual complete preflight cycles still require their readiness evidence to satisfy existing freshness checks. A host that remains too slow must STOP, not receive another automatic timeout increase.

Failure detection for this check can take up to 20 seconds longer than before. Revocation remains immediately initiated when the failure is detected; each of core.revoke's three existing independently guarded operations can incur this extra delay (up to 60 seconds additional configuration wait across those guards). HTTP/token/SDK operation time is additional. No hard end-to-end revocation guarantee is claimed. All three cleanup attempts, account-identity checks, token revocation, disabling and independent read-back remain unchanged. Unknown cleanup remains failure. Fixed containment deadline/expiry and supervised fallback remain mandatory; no safety claim if the host/network cannot execute cleanup.

## Evidence and limits

68 local regressions PASS, including a real 20-second configuration-like subprocess, a real stalled process terminated at the proposed 30-second limit, process death, network/read failures, stale validation despite fresh heartbeat, exact command scoping, operator/impersonation mismatches and late-success rejection. No live identities were used. Existing emulator evidence is preserved; no Auth/handler/revocation implementation changed in this candidate.

Three complete read-only startup/validation/independent-readiness runs passed. Cycle times (ms):
- 11076 / 4776 / 7245
- 6229 / 2623 / 6869
- 6443 / 8616 / 8540

Configuration reads ranged 1869–7013ms. Thus the actual repeated Google reads did not exercise the >10-second success branch; real local delayed-child tests exercised it. These measurements are not a guarantee of future host/network latency. Heartbeat/acknowledgement/duration checks used disposable local fixtures, not a live watcher. Full project/IAM/IAP/Auth/image/rules read-only repeats are recorded separately in security-1/2/3.json; see validation.json for final outcomes.

## Required approval and procedure

Request explicit approval of the configuration-only 30-second bound AND its possible additional revocation latency, followed by one fresh supervised watcher session/one creation attempt for the two existing approved synthetic identities. First repeat current security/empty-inventory checks and seal new tools/manifest/exclusive receipt. Never reuse old manifests or failed receipts. Start watcher only after approval; independently verify both freshness gates before acknowledging. Confirm a full ten-minute interval begins after independent verification. Then one private masked creation attempt, governed owner creation, immediate bootstrap revocation/disable and independent owner/audit/unauthorised-denial verification. STOP on failure; no automatic retry.

No live watcher/account/cloud change, rebuild or scan. Prior evidence preserved. Expiry 24 October 2026 09:00 UTC; containment 10:00 UTC unchanged. Open HIGH finding, Node reproducibility limitation and Firebase incident retained. Production/real-customer use NO-GO. STOP before live execution.
