# Retry result and containment correction — 18 October 2026

**Deployment stopped; no verified login URL.** Continue from a9bbe6f7 with the owner's approved email-only comparison fix. The ten local checks passed: email case differences accepted; changed principal type, identity, role, condition, or additional grants rejected. Fresh preflight verified the exact project/image, permissions, no Firebase users, service absence, empty Run invocation bindings and IAP resource 404. Full current project policy and published rule source hashes matched the applied audit/expiry evidence.

The sealed service was recreated successfully with native IAP and the exact assessed image. The IAP service-agent invocation binding was verified. The owner-grant action stopped before mutation because IAP returned an existing binding. Inspection showed the exact earlier approved timed owner grant, not an additional principal or broader role. Anonymous observations returned 502 while custom OAuth was not configured; no browser denial/login acceptance is claimed.

## Root cause and correction to previous evidence

The prior containment helper compared conditions using JSON.stringify, which is sensitive to object property order. Google returned expression before title; the proposal stored title before expression. The helper consequently did not remove the IAP member. Its verification compared against the unchanged target, falsely reporting successful withdrawal. The earlier reports at a9bbe6f7 claiming IAP access withdrawal were incorrect. Deleting the service prevented its use, but the IAP policy survived and reappeared on recreation. An IAP resource 404 while the service is deleted does NOT prove its stored policy is empty.

This attempt's first containment invocation repeated that flaw. Its containment-iap-verified.json and containment-complete.json must therefore NOT be used as proof of IAP withdrawal. Both are explicitly superseded by corrected-iap-withdrawal.json. The original files are preserved for an accurate audit trail.

Corrected withdrawal performed under existing containment authority:

- Service-agent invocation removed and service deleted with exact-image/current-etag checks. No Firebase users existed.
- After deletion, IAP getIamPolicy returned 404. Used the last observed policy etag BwZeHEi1tYU= from immediately before deletion as the concurrency precondition; verified its sole member, exact role and semantic condition against the approval.
- Set only that resource policy to empty bindings. Google returned HTTP 200, version 1, etag BwZeHEwcVnY=, with no bindings. Subsequent get returned 404 because the service was deleted. Empty policy is verified from the mutation response, not an independent post-deletion GET. It must be re-read after any future service recreation.
- No broad grant, new identity, rules rollback or additional service was used to perform containment.

The local execution containment helper now compares condition objects semantically, preserves unrelated fields and requires exactly one matching member actually removed before claiming success. It still uses the current policy etag. It does not change the sealed application image or framework. The older sealed managed-rehearsal/cloud-containment.cjs has the same order-sensitive comparison and must not be used for IAP withdrawal unchanged; do not silently alter its sealed hash. Use the corrected execution procedure, reviewed here, for this exact approved containment scope.

## Current state and next action

No Cloud Run test service or Firebase users. IAP empty-policy response preserved; no Run invoker grant. Audit additions, expiry-rule hashes, Auth/domain/key controls and project IAM preserved. OAuth secret/passwords were not handled. Owner was instructed to pause private entry when the gate failed.

Stop remains in effect under the owner's mandatory-gate instruction. Before any resumption: fresh state checks, new receipt paths, re-read actual IAP policy after service creation, and verify the narrow withdrawal procedure. An existing policy that matches the approved singleton exactly should be validated rather than blindly overwritten; an incompatible policy must stop. No access expansion or new permission scope is required. Complete private OAuth, governed two-identity provisioning/revocation, native IAP and Firebase denial/login/audit checks before browser readiness.

The original exact image, expiry 24 October 2026 09:00 UTC, containment deadline 10:00 UTC, HIGH CVE-2026-85091, Node reproducibility limitation and Firebase incident remain unchanged. CRM2/3/5 and production untouched. No real data, rebuild or scan. Production remains NO-GO.
