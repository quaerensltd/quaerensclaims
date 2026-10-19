# gcloud configuration read correction

## Finding and exact correction

The failed 10.269-second operation was a local gcloud property read, not an IAM denial. Installed Google CLI source confirms config get reads active client configuration. Each old guard launched the Windows/Python CLI twice, once for account and again for impersonation. Diagnostic measurements: 4865ms + 2251ms (7116ms total), versus 1969ms for one combined command. The precise transient OS/startup cause of the historical timeout cannot be proved from existing evidence; no claim is made about antivirus or CPU contention.

Replace both launches with the supported command:

    gcloud config list --all --format="json(core.account,auth.impersonate_service_account)"

[Google's config list reference](https://docs.cloud.google.com/sdk/gcloud/reference/config/list) documents active-configuration properties, unset properties via --all and formatting. Only these public metadata fields are emitted/captured. No credential store, password or token is inspected by this check. No direct configuration-file parser or internal SDK API replaces Google's interpretation of effective configuration.

Strict parser requires both fields, exact approved account, and explicit null/empty impersonation. Rejects service-account strings, delegation chains, unknown types, missing fields, malformed JSON and environment impersonation overrides. No cached configuration, fallback, automatic retry, or changed account/impersonation setting. Fixed diagnostic stage operator-configuration records elapsed time/UTC and named mismatch/incomplete/timeout categories without raw output.

The existing ten-second CLI timeout is unchanged. Five-second liveness, heartbeat under 30 seconds, independent completed-validation under 30 seconds, bounded HTTP reads, single-flight read guard and all existing bootstrap/revocation code remain unchanged. A future genuinely slow or uncertain read still fails closed. Faster observations do not guarantee all future launches will complete.

## Evidence

61 local tests PASS, including slow responses, real stalled-child timeout, wrong operator, missing fields, configured impersonation/delegation, environment override and no fallback/retry. Three corrected effective-configuration reads passed in 2811, 2986 and 2430ms. A real gcloud invocation against a disposable, credential-free local config containing a fictional impersonation setting returned IMPERSONATION_PRESENT as required. The operator's active config was untouched; the temporary test directory was removed. No service-account impersonation/token request was executed for that negative test.

See validation.json for the final existing emulator outcome. Emulator uses loopback demo identities only; no live Firebase account creation or watcher start. No IAM, OAuth, Cloud Run, rules, image or production changes. Prior evidence is retained unchanged.

## Execution boundary

Correction is local only. Existing activated manifests no longer match the modified tool hashes and must not be reused. A future approved attempt requires a fresh manifest and exclusive receipt name, fresh project/IAM/Auth/rules/empty-inventory verification, and independent watcher heartbeat plus security-validation readiness before acknowledgement. Full ten-minute ceremony begins only after that verification. No live retry is authorised by this report.

Fixed expiry remains 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Outstanding HIGH finding, Node reproducibility and Firebase incident remain. Production and real-customer use NO-GO. STOP before another live attempt.
