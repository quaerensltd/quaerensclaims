# Bounded IAP recovery result — 18 October 2026

**PASS. Paused before owner access, OAuth entry or Firebase provisioning.** This is Shared CRM Framework deployment work; no framework or image changes.

Fresh preflight verified project quaerens-crm4-spain-test / 558324850479, exact assessed image, operator permissions, project IAM, applied audit policy, original Firebase restrictions, bucket/key controls, no users and no existing test service. The executor independently verified current expiry ruleset contents against the sealed hashes before creation. Legacy preflight comparisons against pre-execution IAM/rules were superseded by exact comparisons against applied receipts; the old IAP-agent 404 was not treated as absence. The existing accepted identity receipt was reused without generation.

Only the previously sealed private Cloud Run service crm4-spain-test in europe-west1 was recreated. The canonical manifest SHA-256 remains 5e3b937eb705ac18abdc00a29c9f0e4dba6127cb8773ec7c49912b7c49efa734 and all sealed artifacts were checked. Image remains sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. Service Ready succeeded at 2026-10-18T13:12:56.213476Z; native IAP and invocation IAM checking are enabled. Startup, capture-only providers and expiry configuration are unchanged.

## Independent policy evidence

At 2026-10-18T13:13:32.436Z recovery completed:

- Run getIamPolicy: HTTP 200, no service invocation bindings.
- IAP getIamPolicy requested policy version 3 twice in separate calls: HTTP 200 both times, no bindings, etag BwZeHEwcVnY=. Google returned version 1 because the policy contains no conditional bindings; no access condition was removed during this review.
- Corrected verifier result: PASS / ALREADY_ABSENT_AND_READ_BACK; mutationAttempted false. No stale grant remained, so no withdrawal was performed. This independently corroborates the earlier empty-policy write receipt and resolves that evidence gap.
- Project IAM and audit policy still exactly equal the preserved audit-verified policy.
- Firebase user inventory empty. No account/claim mutations or credential handling.

The 16 local withdrawal tests passed before recovery. No owner IAP grant, IAP-agent invocation grant, public invocation or additional identity was created. No OAuth secret was requested or handled. No rebuild, scan or other CRM/project changes occurred.

## Required pause

The bounded recovery scope is complete. Leave the private service with invocation/access grants withheld. Owner browser readiness is NOT yet established. Await explicit instruction before applying the previously approved service-only IAP invocation permission and timed owner access, attaching the existing OAuth client privately, or performing governed bootstrap/owner provisioning. Remaining mandatory browser acceptance includes native IAP enforcement, anonymous/unauthorised denial, independent Firebase owner authorisation, immediate bootstrap revocation and audit visibility.

Expiry remains 24 October 2026 09:00 UTC and containment deadline 10:00 UTC. All live providers remain disabled. HIGH CVE-2026-85091, Node reproducibility limitation and Firebase incident remain open under synthetic-only acceptance. Production and real-customer use remain NO-GO.

Evidence: evidence/bounded-recovery-20261018/ (creation operation, service observation, invocation-policy, iap-independent-verification, recovery-result, fresh-preflight). The planned hostname is not presented as a verified login URL because access remains withheld.
