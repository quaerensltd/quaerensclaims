# Resumed private execution — 18 October 2026

**NO-GO: stopped at IAP service-agent verification. No application deployed and no verified login URL.**

The owner explicitly authorised the corrected audit request and continuation. The original sealed manifest and exact image sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb remain unchanged. Expiry remains 24 October 2026 09:00 UTC; containment ends 10:00 UTC.

## Verified changes

- Fresh preflight confirmed project quaerens-crm4-spain-test / 558324850479, operator, permissions, image, original rules, Auth restrictions, authorised domain, API-key restrictions and bucket policy. The expected etag drift from the previous stopped attempt was compared against its full preserved policy.
- Applied the audit request with updateMask auditConfigs,etag and the freshly read etag. Verified the seven approved log categories: IAP ADMIN_READ/DATA_READ/DATA_WRITE; Firestore and Storage DATA_READ/DATA_WRITE. IAM bindings remain identical; no exemptions existed or were removed. No retention API was called.
- Published and independently read back both sealed expiry rule releases. Firestore ruleset 39ff1981-2cf6-4a32-abbc-f44e485d8059, SHA-256 35b340ca1778e5d3d3aa0d8cd9a98eee4e44d3541cca35e767e56891d6853dc1. Storage ruleset 3e4de41f-f3c0-40b0-a3e9-d9cc23e52c32, SHA-256 cdd2d592f098f56ba7c39a861559a75fca86f8bb58e66e2e54bf357dd1b43d3f. These are exact sealed artifacts preserving the original predicates and adding the approved time restriction.
- Requested only the approved IAP service identity. Service Usage returned done:true and the exact expected email service-558324850479@gcp-sa-iap.iam.gserviceaccount.com, uniqueId 106565878535270392880. No project bindings or audit settings changed during this request.

## Stop and diagnosis

The immediate IAM GET under the CRM4 project returned 404. Read-only wildcard GETs by both email and returned uniqueId returned 403 IAM_PERMISSION_DENIED for iam.serviceAccounts.get. This does not prove that the Google-managed agent is absent; the creation receipt reports success. The executor's assumption that a Google-managed agent must be readable as a project-owned account is unproven. Do not request broad IAM rights or regenerate the identity to work around this diagnostic. Establish the supported verification method and reconcile this receipt before resumption.

Official references: https://docs.cloud.google.com/iam/docs/service-agents ; https://cloud.google.com/service-usage/docs/reference/rest/v1beta1/services/generateServiceIdentity ; https://docs.cloud.google.com/iap/docs/enabling-cloud-run .

Post-stop preflight verifies no regional Cloud Run services, no Firebase users, unchanged bucket policy/Auth/domain/key controls, exact image and existing operator permissions. Its legacy projectPolicy/rules booleans are false because they compare against the pre-execution baseline; the new policy and release pointers exactly match this execution's verified receipts. Its iapAgentAbsent boolean represents only the project-scoped 404 and must not be interpreted as global absence of the agent.

## Containment and rollback

No service, account or access grant exists to shut down, disable or revoke. Leave the expiry rules and audit additions in place; do not restore timeless rules or remove audit evidence. Do not delete a Google-managed identity based on the ambiguous lookup. No containment mutation was necessary. The preserved before/applied/verified receipts identify every change. Any later corrective mutation requires fresh state verification and authorisation within the existing scope; do not replay this helper against changed baselines.

## Remaining sequence

Resolve the IAP verification method read-only and obtain instruction to resume after this mandatory stop. Then create the sealed private service, apply only service-scoped invocation and timed owner IAP access, complete owner-private OAuth entry, and perform the approved governed bootstrap/owner ceremony with immediate bootstrap revocation. Verify live anonymous/unauthorised denial, independent owner authentication, audit visibility and shutdown controls before claiming browser readiness. No credentials were handled in this attempt.

HIGH CVE-2026-85091, Node binary reproducibility limitations and the Firebase incident remain open under synthetic-only acceptance. No rebuild, scan, real identities/data, live providers, CRM2/3/5 or production changes. Production remains NO-GO.
