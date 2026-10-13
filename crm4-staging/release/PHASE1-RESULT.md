# CRM4 Spain Phase 1 result

Shared CRM Framework. Continuation of `f104960f`; project `quaerens-crm4-spain-test`, number `558324850479`, No organization, region `europe-west1`. Phase 1 was explicitly approved by the owner. Application builds, deployments, public invocation and real accounts remain unapproved.

## Applied and verified

One cloud mutation was submitted: Service Usage `services:batchEnable`, with exactly the eight approved service IDs. The project ID, number, ACTIVE state and absent organization parent were read and checked immediately before submission. Operation `operations/acf.p2-558324850479-15fae6f4-21a7-4fbe-af77-539356e2f472` completed successfully. All eight services are enabled.

Google also enabled `containerregistry.googleapis.com` and `iamcredentials.googleapis.com` as service dependencies. These were not in the submitted request. The enabled-service count rose from 37 to 47. No attempt was made to disable dependencies.

Google's service-agent manager automatically added five project IAM bindings:

| Principal (within project 558324850479) | Role |
| --- | --- |
| Legacy Cloud Build account `558324850479@cloudbuild.gserviceaccount.com` | `roles/cloudbuild.builds.builder` |
| Cloud Build service agent | `roles/cloudbuild.serviceAgent` |
| Container Registry service agent | `roles/containerregistry.ServiceAgent` |
| Default Compute account `558324850479-compute@developer.gserviceaccount.com` | `roles/editor` |
| Cloud Run service agent | `roles/run.serviceAgent` |

The exact principals, before/after policies and system audit entries are in `evidence/phase1/`. No IAM policy was written by this execution. The default Compute Editor grant is broader than the approved dedicated-identity design. Therefore the bootstrap's `inspect-existing` instruction to stop on unexpected policy changes was applied before any further mutation. This is not a withdrawal of the user's Phase 1 authorization.

Billing remains enabled on `billingAccounts/016627-0BEE7F-D03ADE` (Firebase Payment). The existing budget `6ca1ad9b-e39d-4941-8c10-9316b9697859` is scoped only to `projects/558324850479`, GBP20 per calendar month, including credits, with CURRENT_SPEND thresholds 50%, 90%, 100%. Its notification configuration has no custom channels. No duplicate budget, recipient update or threshold change was made. Delivery to `info@quaerens.co.uk` is not configured or verified; preserve the existing thresholds in any later recipient-only proposal.

## Accounts, dependencies and Token Creator

The Firebase SDK account has zero USER_MANAGED keys and one GOOGLE_PROVIDED SYSTEM_MANAGED key. Its service-account IAM policy has no explicit bindings; the project-wide Firebase SDK and Token Creator bindings remain effective. The default Compute account also has no user-managed keys. Key metadata only was read; no private key was downloaded or created.

Regional and global build lists, global trigger list, regional Cloud Run service/job lists are empty. Firestore `(default)` and the proposed Artifact Registry repository return NOT_FOUND; the bucket and Firebase web-app lists are empty. Firebase Auth returns CONFIGURATION_NOT_FOUND. This is a bounded inventory, not a claim that every possible dependency across Google Cloud was audited.

The audit query returned system IAM changes and no SDK-principal activity. Absence of logged use does not prove absence of external dependencies; Data Access logs may not be enabled. The prior source review found no CRM4 custom-token or remote-signing dependency. Nevertheless effective dependencies are not exhaustively established, so the SDK Token Creator grant was retained as instructed. Firebase-managed service-agent roles were preserved. No replacement signing grant is proposed.

## Exact next decision

`evidence/phase1/phase1-iam-correction.proposed.json` proposes removing only:

- Role: `roles/editor`
- Member: `serviceAccount:558324850479-compute@developer.gserviceaccount.com`
- Resource: `projects/quaerens-crm4-spain-test`

Keep the account and every other binding. Recheck dependencies and project identity, then read IAM version 3 and use its fresh etag; never replay the recorded snapshot. This newly discovered removal needs separate approval. The legacy Cloud Build builder grant is also broader than the planned dedicated build identity's grants; it remains unchanged and must not be used for the future build. Any removal of it requires its own reviewed authorization.

Following resolution of the unexpected IAM state, the remaining previously approved Phase 1 steps can resume: regional Firestore/default Storage, backups/soft delete/rules/indexes, synthetic-only Auth settings, one web app, dedicated identities and minimum grants, private repository and build-source bucket. None of those resources has been created by this execution.

## OAuth and later deployment gates

The IAP brands GET returns `400 Project must belong to an organization.` This does not prohibit an External OAuth application in a No-organization project; it blocks this branding API route. Use Google Auth Platform Console for the initial External setup. The proposed support address `info@quaerens.co.uk` has not been proven eligible. Do not substitute another address automatically. Supported choices are the signed-in Google account (`martijnpronk76@gmail.com`, subject to selection in Console) or a Google Group managed by that account; a company-address Google account would need separate authorization and access. Keep the developer contact proposal and sole tester `brusseljeroen@gmail.com`. No OAuth brand/client, tester grant or IAP access policy was created.

Separate container-build approval is still required after actual Firebase public configuration and expected private origin are reviewed. Separate first private application-deployment approval must identify the built immutable image digest, IAP configuration and exact service-specific bindings. No container build was submitted; no Cloud Run service/revision, public invoker or real/synthetic user was created. Owner Firebase Administrator membership remains a distinct unprovisioned approval item.

## Evidence, verification and rollback

- `evidence/phase1/phase1-cloud-journal.json`: guarded request, operation response and completion verification.
- `evidence/phase1/phase1-inventory.json`: post-enable services, project policy, existing resources, budget, Auth and branding responses.
- `evidence/phase1/phase1-dependency-evidence.json`: key metadata, account policy, workload reads and audit deltas.
- `evidence/phase1/automatic-changes.json`: exact automatic API/IAM additions.
- `evidence/phase1/billing-verification.json`: successful read-only billing confirmation. Optional Cloud Billing API remains disabled; direct REST using CRM4 quota header failed but gcloud read succeeded.

Rollback is not automatic and was not executed. Before disabling any of the eight requested APIs, obtain separate approval and confirm no resources or service dependencies require it. Disable only the individually approved unused services; do not use cascading disable or remove automatic dependent services blindly. API disablement does not reliably undo service accounts or IAM grants. Handle IAM restoration/removal as a separate fresh-etag member-level change, preserving Google service agents. The proposed Editor correction includes its own narrowly scoped rollback instructions. Budget and pre-existing SDK IAM require no rollback because they were not changed.

Local release regression: 12/12 passed (bootstrap guard, source/package integrity, container preparation, browser configuration, membership configuration, dependency extraction and deployment guard checks). The first run caught that a new evidence inventory would enter the container context; evidence was moved into a non-packaged subdirectory, then all 12 passed. The reviewed application and original backend sources were not modified. The prior full emulator acceptance remains 105/105 at `f104960f`; it was not rerun for evidence-only changes. Dual-role behavior remains the accepted two individual Lister+Closer identities with ownership/audit and assessment safeguards intact. No claim of live-cloud application acceptance is made.

Official references: [Default Cloud Build identities](https://docs.cloud.google.com/build/docs/cloud-build-service-account), [default Compute service accounts](https://docs.cloud.google.com/compute/docs/access/service-accounts), [OAuth support-email eligibility](https://support.google.com/cloud/answer/15549049?hl=en), [Firebase custom-token signing](https://firebase.google.com/docs/auth/admin/create-custom-tokens).
