# CRM4 Spain Phase 1 continuation

Latest status: `STORAGE-SERVICE-AGENT-RESULT.md` records the now-approved and applied cross-service grant, synthetic test results and remaining Auth/OAuth work. The blocker list below is historical.

Shared CRM Framework. Continued from `13311437` on `feature/crm4-isolated-clone`. All mutations were restricted to `quaerens-crm4-spain-test` / `558324850479`, with both identifiers and ACTIVE state checked immediately before each write. Region remains `europe-west1`, parent No organization. No CRM2, CRM3, CRM5 or production resource was modified.

## Approved Editor correction completed

The fresh IAM version-3 read returned the same etag and policy as the prior checkpoint. Exactly one unconditional `roles/editor` binding contained `serviceAccount:558324850479-compute@developer.gserviceaccount.com`. The account had no user-managed keys or explicit account-level bindings. No build history, App Engine application, accessible Run services/jobs or build triggers were found. Compute, GKE and Functions APIs are not enabled. The audit query found no activity by this principal.

The dependency inventory covered 42 accessible Run job regions and 44 build-trigger locations (including global). `me-central2` rejects access under LOCATION_POLICY_VIOLATED; the wildcard service response also reports regions not advertised for this project as unreachable. These limitations are recorded rather than treated as successful empty reads. No dependency was found. The project's newly created state, unchanged IAM baseline, empty inventories and absence of Compute API supported the approved narrow removal.

Only the requested member was removed. The complete resulting policy, excluding the new etag, exactly matched the prepared policy. No other member, condition or service-agent permission changed in that operation. The Firebase SDK Token Creator and SDK Admin grants remain intact. See `evidence/phase1/editor-correction.json` for before/requested/after policies and the exact rollback ADD delta. Restoring Editor requires a fresh policy/etag and a justified, separately approved rollback; never replay an old whole policy.

## Infrastructure now present

| Resource | Verified configuration |
| --- | --- |
| Firestore `(default)` | Native, Standard, pessimistic concurrency, `europe-west1` |
| Firestore backup schedule `9ff29c64-2b0a-422f-a488-df4e4eca0595` | Daily, seven-day retention |
| `quaerens-crm4-spain-test.firebasestorage.app` | Firebase default bucket, regional Standard, uniform bucket IAM, public-access prevention, seven-day soft delete |
| `quaerens-crm4-spain-test-build-source` | Same regional storage protections; empty |
| Artifact Registry `crm4-release` | Docker, `europe-west1`, immutable tags, private |
| `crm4-runtime` / `crm4-build` | Dedicated identities, no user-managed keys |
| Firestore / Storage rules | Reviewed sources compiled and published; read-back SHA-256 matches the approved hashes |
| Ten reviewed composite indexes | All ten READY; exact definitions match reviewed indexes |

Only the six approved dedicated grants were added: runtime Datastore User and Firebase Auth Admin on CRM4, runtime Storage Object User on the default bucket, build Logging Writer on CRM4, build Artifact Registry Writer on `crm4-release`, and build Object Viewer on the build-source bucket. Each policy was read with its etag, modified at its exact scope and verified against the expected full binding set. No Owner, Editor, Token Creator, public invocation or cross-project grant was added by these writes.

Google automatically added the expected Artifact Registry, Firestore, Firebase Storage and Firebase Rules service-agent roles. The final project IAM policy matches the previous policy minus the approved Editor member, plus these four Google-managed roles and three approved project-scoped runtime/build roles. All other bindings remain unchanged. No new APIs were enabled in this continuation; the total remains 47.

The IAP service-identity operation returned DONE, email `service-558324850479@gcp-sa-iap.iam.gserviceaccount.com`, unique ID `106565878535270392880`. Direct project-scoped IAM lookup returns 404; lookup by exact email using `projects/-` resolves that same unique ID but returns 403. This managed identity's metadata visibility is therefore limited; no extra IAM was granted to obtain it. Future service-specific IAP/Invoker binding and live acceptance remain deployment gates.

## Remaining Phase 1 blockers

1. **Additional cross-service Storage permission requires approval.** The reviewed Storage rules read Firestore membership/ownership documents. Google requires `roles/firebaserules.firestoreServiceAgent` on CRM4 for `serviceAccount:service-558324850479@gcp-sa-firebasestorage.iam.gserviceaccount.com`. The live role contains only `datastore.entities.get`. This grant was absent from the approved six grants, so it was not applied. Rules remain unchanged and affected access fails closed. Exact delta and rollback: `evidence/phase1/storage-firestore-grant.proposed.json`. [Google's cross-service guidance](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules).
2. **Firebase Authentication requires Console initialization.** Config still returns CONFIGURATION_NOT_FOUND. Console automation failed before exposing a browser session. The documented REST initialization endpoint initializes Identity Platform, which is not an approved substitute. Use Firebase Authentication Get started for this exact project; then apply and verify the already approved email/password-only settings, disabled self-signup/self-deletion, no phone/anonymous/social providers. Stop if those restrictions require a product upgrade. The single web-app registration remains pending behind the approved Auth-settings dependency. No users or memberships exist. [Initialization API scope](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/projects.identityPlatform/initializeAuth).
3. **External OAuth/IAP needs Console setup and eligible support contact.** The earlier branding API rejects No-organization projects. `info@quaerens.co.uk` eligibility remains unverified; do not substitute it automatically. Supported support-email options are a selectable signed-in Google account or Google Group managed by it. Only `brusseljeroen@gmail.com` remains the proposed tester; no tester access or OAuth credentials were created.
4. **Budget company-email delivery remains unconfigured.** The existing budget is verified unchanged: GBP20 MONTH, only project 558324850479, thresholds 50/90/100%, no custom notification channels. A recipient-only channel/budget update needs an exact separately reviewed change; do not use the older proposal's 40/80/100% thresholds or create another budget.

The Firebase SDK Token Creator grant is explicitly outside this continuation's removal authority and was preserved. Its broad reach to new service accounts remains a separately documented review item. The automatic legacy Cloud Build builder grant also remains unchanged; future builds must use `crm4-build`.

## Validation and remaining release gates

Twelve local bootstrap, packaging, source-integrity, container-preparation, browser/configuration and dependency checks passed. Application and original backend sources were unchanged; the accepted two-individual-login Lister+Closer contract, audit trails, ownership and assessment safeguards are preserved. Prior full emulator acceptance remains 105/105 at `f104960f`; this evidence-only continuation did not rerun that suite.

Live Firestore membership-document and Firebase Storage list requests without credentials both return 403. This verifies unauthenticated denial only, not authenticated dual-role acceptance. The database has no collections, both buckets are empty, and build and regional Run service lists are empty. No application code, synthetic/real user, build or deployment was submitted. All cloud changes were within CRM4; other projects' global IAM policies were not audited, so global absence of pre-existing cross-project access is not claimed.

After Phase 1 blockers are resolved, building the candidate and deploying the first private application each require separate approval. Actual public Firebase configuration, reviewed origin, immutable built-image digest, service-specific sole-tester IAP access, owner Administrator membership and live synthetic acceptance remain outstanding. Repository scanning is disabled because Container Scanning API is not enabled; do not enable it automatically. Image validation must be planned within the separately approved build scope.

## Evidence and rollback

All 28 mutation requests have project-identity guards, request/response records and rollback guidance in `evidence/phase1/continuation-journal.json`. Read-back settings, policies, hashes and denial probes are in `continuation-verification.json`; final readiness and empty-resource/budget checks are separate snapshots. `continuation-validation.json` records exact policy-delta and configuration assertions. Evidence is excluded from the 594-file offline container context.

Rollback is recorded, not executed:

- IAM: remove only newly added dedicated members at their original resource scopes, using fresh etags; preserve Google-managed and pre-existing bindings. Editor restoration uses only its recorded ADD delta and separate approval.
- Rules: retain enforcement. No previous release existed; use a separately reviewed deny-all replacement if necessary, never expose default/public access. Delete a ruleset only when unreferenced.
- Indexes: delete only the new index resource names after approval; preserve documents and unrelated indexes.
- Backups: remove only the created daily schedule if approved; retained backups have their own lifecycle.
- Buckets: deleting requires explicit approval and confirmation of emptiness, retention and soft-deleted objects. Uniform access becomes locked after 90 days; do not promise it can always be reversed. Do not relax public-access prevention automatically.
- Database/repository/service accounts: delete only the newly created unused resource after separate approval and dependency/data checks. Account deletion must follow removal of its new scoped grants. Preserve backups and any later artifacts.
- IAP agent: preserve the Google-managed identity; no application access binding was created to undo.

No rollback affects project creation, billing attachment, budget or Firebase SDK permissions, because none was changed here.
