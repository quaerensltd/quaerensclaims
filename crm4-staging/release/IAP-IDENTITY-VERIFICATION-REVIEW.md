# IAP service-identity verification review — 18 October 2026

**PASS for the identity-creation prerequisite; ready to resume the previously approved private deployment sequence when instructed. No deployment or cloud mutation occurred in this review.** This is Shared CRM Framework deployment investigation only; no framework behaviour changed.

## Exact verification method and evidence

1. Fresh authenticated Resource Manager GET confirmed quaerens-crm4-spain-test, project number 558324850479, ACTIVE, using martijnpronk76@gmail.com. Service Usage GET confirmed iap.googleapis.com ENABLED.
2. Validated the preserved response from the authorised POST /v1beta1/projects/558324850479/services/iap.googleapis.com:generateServiceIdentity: done:true, no error, typed ServiceIdentity response, email service-558324850479@gcp-sa-iap.iam.gserviceaccount.com and uniqueId 106565878535270392880. The original request is recorded in execution/execute-private.cjs and the receipt remains unchanged. The review receipt records its SHA-256.
3. Google documents that service agents are not created in customer projects and cannot be accessed directly. Therefore IAM GET projects/quaerens-crm4-spain-test/serviceAccounts/<agent> was an inappropriate project-ownership assumption, and requiring agent.projectId to equal the customer project was incorrect. The generic IAM GET API exists, but is not a suitable independent verification gate for this Google-managed agent.
4. Wildcard IAM GET returned permission denied. Google's IAM GET reference explicitly warns that wildcard lookups can return 403 even for a nonexistent identity. Neither the 403 nor the project-scoped 404 establishes global absence. No evidence demonstrates an eventual-consistency failure; waiting or regenerating is not justified by these responses.
5. The supported Service Usage generation response is the identity-creation evidence. Do not rerun generation merely for verification. The documented services.get returns API state/configuration, not a service identity. The generic operations.get endpoint was tried read-only for the returned operations/finished.DONE_OPERATION name; it returned 400 OPERATIONS_INVALID_OPERATION_ID. This completed-response identifier is not independently pollable by that endpoint. Do not treat its 400 as failed creation.
6. A narrow Cloud Logging read for GenerateServiceIdentity in the creation interval returned HTTP 200 with no entries. It supplies no additional corroboration. An earlier projection request returned 400 and was corrected to a normal entries.list read; neither call mutated cloud state.

The PASS relies on the preserved successful Google Service Usage creation response plus the documented Google-managed identity model, not on a successful independent IAM account GET. Live IAP invocation and owner access have not yet been tested and remain mandatory deployment acceptance checks.

## Preservation checks

Fresh full project IAM policy equals the audit-verified policy, including etag BwZeG1OhkmI=. All seven audit categories, bindings and exemptions are unchanged. Firestore and Storage release pointers and freshly fetched source hashes equal their sealed, previously verified expiry releases. No retention settings, IAM, identities, rules or services were changed. No secrets or Firebase authentication configuration were retrieved.

## Minimum next action

Correct the local continuation logic to consume and validate the existing Service Usage receipt; do not call the agent-create action again, require project ownership of a Google-managed agent, or use iapAgentAbsent from the old preflight as an existence conclusion. Keep the old failed-attempt receipts unchanged. No additional IAM permission, API enablement or identity creation is required to resolve this verification error.

Upon instruction to resume, freshly check the remaining deployment gates and proceed from the private Cloud Run creation stage, then only the approved service-scoped IAP invocation/access grants, owner-private OAuth entry, governed two-identity bootstrap and live security acceptance. Any failure to accept the exact service-agent principal or to enforce IAP must stop execution and trigger the approved containment process. This review does not establish browser readiness or authorise execution itself.

The exact assessed image, 24 October 09:00 UTC expiry and 10:00 UTC containment deadline remain unchanged. HIGH CVE-2026-85091, Node reproducibility limitation and Firebase incident remain open. No real customer/staff use; production remains NO-GO.

## Official sources

- https://docs.cloud.google.com/iam/docs/service-account-types — service agents are Google-managed, not created in customer projects, and cannot be accessed directly.
- https://docs.cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/get — resource forms, permission requirement and wildcard 403 ambiguity.
- https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services/generateServiceIdentity — supported generation endpoint and operation response.
- https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/operations/get — supported operation polling endpoint.
- https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services — services.get reports service configuration/state.
- https://docs.cloud.google.com/iap/docs/enabling-cloud-run — documented IAP agent principal and creation command.

Evidence: evidence/iap-identity-review-20261018/read-only-verification.json and creation-audit.json. Original creation and denial receipts remain under evidence/private-execution-resumed-20261018/.
