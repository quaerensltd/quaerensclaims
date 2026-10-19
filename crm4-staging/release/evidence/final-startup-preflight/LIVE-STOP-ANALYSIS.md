# Recovery 03 stop — exact failure and minimum correction

Exact first failure: operator-configuration / REQUEST_TIMEOUT at 2026-10-19T14:14:30.751Z, elapsed 10147ms. Last complete membership read passed at 14:14:19.563Z. Watcher PID 77152 exited, final state FAIL_CLOSED, never armed, no bootstrapUid, no acknowledgement. No creation command issued. Fresh read-only inventory at 14:17:13.666Z confirms exact project 558324850479, zero Firebase users and zero CRM4 memberships; no bootstrap elevated claim/account exists and no revocation is required.

## Why passing preflight did not establish reliable live timing

Preflight sampled successful short calls; the next repeated live configuration call exceeded the same ten-second bound. More importantly, installed Google SDK source reveals an ancillary network operation missed in the earlier assessment:

- lib/surface/config/list.py, Epilog (lines 125–127): gets core.project and, if set, calls PrintEnvironmentTagMessageProjectId.
- lib/googlecloudsdk/command_lib/projects/util.py, lines 336–351: that function calls projects_api.Get before considering the project's parent/environment-tag message.
- No organization does not skip this initial project fetch; the parent check occurs later.

Thus the combined query is not purely a local metadata read. The prior report's implication that local startup overhead was the only relevant work was incomplete. The ten-second process timeout does not capture which internal phase stalled, so ancillary network latency is a demonstrated dependency and plausible contributor, not proven as the exact internal delay in this specific call. No impersonation mismatch, Firebase denial or application failure was observed.

## Minimum proposed correction — not applied to watcher

For the configuration-only subprocess, supply a child-local CLOUDSDK_CORE_PROJECT='' override. This makes the installed Epilog skip the optional project lookup while preserving Google's effective account and impersonation reads. Do not alter the persistent configuration, global environment, token subprocess or explicit CRM4 project/number API checks. Google documents per-process property overrides: https://docs.cloud.google.com/sdk/docs/properties . Keep strict field parsing, environment impersonation rejection, ten-second timeout, both under-30-second freshness requirements and existing revocation safeguards.

One read-only diagnostic with that child-local override passed operator/impersonation checks in 4836ms. No persistent settings or watcher source changed. This single result is not certification of future latency. Before another attempt, implement the isolated override, regression-test that it cannot affect token/project checks or suppress an impersonation mismatch, and measure repeated complete cycles over a bounded period. Retain fail-closed outcomes; no automatic live retry.

All failure evidence retained. No live watcher restarted, no credentials handled and no cloud changes made. Existing image/IAM/OAuth/rules/expiry unchanged. STOP pending a validated correction and fresh authorisation. Production/real-customer use remains NO-GO.
