# IAP containment verification review — 18 October 2026

**Local mechanism: PASS (16 simulated cases). Current service absence: PASS. Independent verification of stored IAP withdrawal: INCONCLUSIVE, not PASS. No deployment authorised or performed.** Shared CRM Framework deployment tooling only; framework/image unchanged.

Fresh read-only checks confirmed project quaerens-crm4-spain-test / 558324850479 and Cloud Run crm4-spain-test HTTP 404. IAP getIamPolicy on the exact resource also returns 404. No Firebase users or unexpected project policy changes; audit configuration and expiry releases match preserved evidence. No service, account, role or rule was created/changed during this review.

## Mechanism

execution/iap-withdrawal.cjs is a narrow verifier used by execution/contain-private.cjs. It compares condition objects semantically, not by JSON serialisation order. Only the approved user email is case-normalised; resource, principal type, role, condition text/title and expiry remain exact. It preserves unrelated members, bindings, audit fields and the fresh etag. An unexpected grant to the owner or missing etag stops before mutation. It never retries a stale or uncertain write automatically.

PASS requires a successful independent getIamPolicy response matching the intended full policy after withdrawal. An already-absent grant requires two successful consistent reads and no write. A 200 setIamPolicy response by itself, 404 after deletion, 403, network timeout, ambiguous partial write, or stale read-back cannot produce PASS. Only etag and policy version metadata are excluded from semantic content comparison; version downgrade without conditions is permitted by IAM representation. Binding/member order is not security-significant; binding contents are preserved.

Tests: successful removal with reversed condition field order and unrelated policy preservation; already absent; stale etag 409/412; write denied/server failure; timeout after possible commit; read-back 403/404/network failure; retained grant in stale read-back; initial resource 404; wrong resource; unexpected owner condition/role; missing etag. All 16 simulated outcomes pass their expected assertions. No cloud writes were used for testing. Existing single-use execution receipts must not be overwritten or reused.

## Deleted service verification limit

Supported endpoint: POST https://iap.googleapis.com/v1/projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test:getIamPolicy with options.requestedPolicyVersion=3. Google documents getIamPolicy for policy reads and setIamPolicy with etag for concurrent updates. Neither documentation nor the observed 404 establishes that deletion removes stored IAP bindings. We have direct prior evidence that a deleted resource's policy can be returned upon recreation.

The preserved corrected withdrawal receipt contains HTTP 200 and an empty policy, but its subsequent GET was 404. That is successful write-response evidence, not independently verified stored-policy absence. No supported read-only alternative guaranteeing retrieval of this deleted resource's authoritative policy was identified. Audit events or asset snapshots, even if available, must not be substituted for current policy read-back. Do not infer empty policy from absence of logs or from 404. Do not repeat a write just to verify it.

## Evidence required for safe retry

1. Approve use of the reviewed verifier and fresh preflight/receipt paths. Recheck exact project/image, project IAM, rules, audit, users and time remaining.
2. Separately authorise recreation of only the same sealed private service, with native IAP and Cloud Run invocation checking enabled. Withhold IAP-agent invocation and owner access additions during this initial policy-verification step. Confirm no inherited/public invocation route.
3. Once the resource is readable, require a 200 version-3 getIamPolicy. If empty, independently repeat the read. If the exact previously approved binding remains, use authorised narrow containment withdrawal with its fresh etag and require successful independent read-back. Unexpected bindings stop for review; never overwrite them.
4. Only after that gate passes may the previously approved scoped grants, owner-private OAuth and governed bootstrap proceed. No login success until all original security acceptance gates pass.
5. On future shutdown, withdraw and independently read back IAP policy while the service exists, then remove invocation and delete the service. If policy read-back fails but emergency service deletion is necessary under containment authority, report service shutdown and IAP policy status separately; never collapse them into containment PASS.

No additional IAM permission is proposed. The current review stops before recreation. Request renewed owner authorisation for this bounded retry sequence. Fixed expiry/containment deadlines and all synthetic-only restrictions remain unchanged. HIGH finding, Node reproducibility and Firebase incident remain open. Production and real-customer use remain NO-GO.

Sources:
- https://docs.cloud.google.com/iap/docs/reference/rest/v1/TopLevel/getIamPolicy
- https://docs.cloud.google.com/iap/docs/reference/rest/v1/TopLevel/setIamPolicy
- https://docs.cloud.google.com/iap/docs/managing-access
- https://docs.cloud.google.com/sdk/gcloud/reference/iap/web/set-iam-policy

Evidence: evidence/containment-review-20261018/live-read-only.json, local-tests.json, preserved-security-checks.json. Previous inaccurate withdrawal receipts remain superseded as documented at 91e9e1b6.
