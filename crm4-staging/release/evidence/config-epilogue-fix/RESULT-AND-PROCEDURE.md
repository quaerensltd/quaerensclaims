# Configuration-only subprocess correction

Scope: Shared CRM Framework release tooling, local correction only. The exact projected CONFIG_ARGS subprocess receives a copied environment with CLOUDSDK_CORE_PROJECT set to an empty string. Case variants are removed from that child copy to avoid ambiguity on Windows. All other arguments use an unchanged environment. No persistent configuration or parent environment is edited.

This skips the installed SDK config-list epilogue's optional project lookup. Google's effective account and impersonation interpretation is retained. Explicit CRM4 project ID/number API verification remains mandatory and unaffected; token acquisition and every nonmatching subprocess retain their original environment. Strict null/empty impersonation checks and environment-override rejection remain unchanged. No timeout increase, fallback, new credential or IAM scope.

## PASS evidence

63 local regressions passed. Added checks establish exact argument confinement, unchanged parent/project/token environments and retained impersonation values. Existing slow CLI, ten-second real subprocess timeout, read/network failure, no overlap, unknown output, wrong operator and impersonation regressions remain passing.

Three complete read-only startup/next-cycle/independent-readiness runs passed:

- Run 1: 6367 / 2594 / 5889 ms.
- Run 2: 5783 / 2822 / 5131 ms.
- Run 3: 5255 / 2498 / 6523 ms.

Each run used the corrected CLI, fresh token acquisition contexts, explicit active CRM4 project/number checks, absent bootstrap lookup, empty Firebase inventory and empty CRM4 memberships. Disposable local fixtures verified advancing heartbeat, independent completed-validation freshness, exclusive acknowledgement, exact 600000ms ceremony duration and stale-receipt rejection. No live watcher or actual session acknowledgement was created. These are measured samples, not a guarantee against future host/network failures.

A real gcloud invocation against a disposable credential-free local config containing a fictional impersonation setting was rejected with IMPERSONATION_PRESENT in 2909ms. The temporary config was removed; the operator's settings were untouched. See validation.json for the final emulator result.

Ten-second subprocess timeout, 15-second HTTP bound, heartbeat strictly under 30 seconds and independent completed-validation freshness strictly under 30 seconds are preserved. Failed/uncertain reads still fail closed. Bootstrap claim removal, refresh-token revocation, disabling and independent confirmation are unchanged. Host/network loss remains a supervised containment limitation.

## Exact corrected supervised procedure — not executed

1. Obtain approval for one fresh supervised session and one creation attempt for bootstrap@crm4.example.test and owner@crm4.example.test, with previously scoped failure containment.
2. Freshly verify the full security state and empty inventories; preserve every failed-session receipt. Generate a new approved manifest/tool hashes and exclusive session receipt. Old sealed manifests intentionally fail against changed tooling; do not reuse their commands or remove old receipts.
3. Owner starts only the new watcher command in a private terminal, with second terminal and authenticated CRM4 browser ready. Report WATCHER_READY_FOR_VERIFICATION. No password entry yet.
4. Independently verify live PID/session/hash, heartbeat AND completed-validation ages, exact project and empty inventories; acknowledge only on PASS. Verify ARMED and a full ten-minute interval beginning after independent verification.
5. Provide the one private masked bootstrap-creation command. Provision owner only through the existing governed handler. Immediately revoke/disable bootstrap. Independently confirm owner membership, audit, retained-token/unauthorised denial and revocation before owner access is declared ready.
6. Any mandatory failure means STOP and approved scoped containment, never automatic retry.

No execution manifest activated or live command issued by this change. No live identities, IAM/OAuth/Cloud Run/rules changes, application rebuild or scan. Prior evidence preserved. Expiry remains 24 October 2026 09:00 UTC, containment 10:00 UTC. HIGH vulnerability, Node reproducibility limitation and Firebase incident remain. Production and real-customer use NO-GO.

Request owner approval before the next live attempt. Local correction/read-only preflight PASS does not certify a live session that has not started.

Final emulator result: all four expected outcomes PASS, including genuine-auth governed owner creation/revocation and retained-token denial. The initial arming failure is retained in initial-emulator-failure.json. The emulator harness now bounds its initial Firestore read and checks empty loopback readiness before the existing timed scenarios; failure cancels and awaits its test monitor. Its ten-second arming deadline and all production watcher code are unchanged by that harness adjustment. No claim is made that the initial failure was a production security failure or that its exact slow operation was identified.
