# CRM4 Spain bootstrap approval package

Status update: Phase 1 was approved and API enablement completed. See `PHASE1-RESULT.md` for actual changes, automatic IAM drift and the current pause. The unapproved flags below describe the original proposal, not the later scoped user authorization.

Shared CRM Framework. Target is only `quaerens-crm4-spain-test` / `558324850479`, No organization, `europe-west1`. Continue from `0c04d04d`; no original business source, staff capability contract or other CRM is changed.

## Concrete artifacts

- `bootstrap-plan.json`: 22 ordered steps with exact resource names, request bodies, IAM member/role/resource deltas, rule/index/lockfile hashes, prerequisites and separate infrastructure/IAM/build/deployment stages. Every step is unapproved. It is data, not an executable apply script.
- `bootstrap-plan.cjs`: offline-only generator. It has no network or command executor. It checks the exact project, number, region and sole IAP tester before generating the plan.
- `bootstrap-preflight.json`: refreshed enabled APIs, current project IAM and role definitions, plus read failures for budget and service-account/key metadata.
- `sdk-account-log-evidence.json`: read-only audit-method search. No activity was returned; lack of Data Access logging can hide use, so this is not proof of inactivity.

The previous `CLOUD-RESOURCE-CHECKPOINT.md` remains the project/billing observation checkpoint. This package refines its API list and Token Creator recommendation. Project creation and billing attachment are already complete and excluded.

Read-only `testIamPermissions` confirmed all 13 requested bootstrap permissions for `martijnpronk76@gmail.com`, including API enablement, project IAM policy updates, service-account creation/actAs, database/bucket/repository/build/Run creation, Auth configuration, Firebase web-app creation and notification-channel creation. Evidence: `provisioner-permission-evidence.json`. Possession of permissions is not authorization to exercise them.

## Changes ready for separate approval

1. Enable exactly eight currently missing APIs on CRM4: `billingbudgets.googleapis.com`, `firestore.googleapis.com`, `firebasestorage.googleapis.com`, `run.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`, `iam.googleapis.com`, `iap.googleapis.com`. Cloud Billing API is optional administrative tooling and removed from the minimum enablement set. Enabling services may create their Google-managed service agents; inspect resulting IAM before proceeding. Do not disable unrelated APIs already enabled by Firebase.
2. After those APIs are available, perform read-only existing-resource, budget, SDK account, user-managed-key and policy checks. Stop on unexpected resources or dependencies. Reuse only exact matching infrastructure; never replace a database/bucket, overwrite incompatible settings or duplicate a budget silently.
3. Subject to the account/key/dependency check, remove only the SDK principal's existing project-wide Token Creator member/role binding, as described below. Then create dedicated `crm4-runtime` and `crm4-build` identities and the IAP service agent. No service-account key or signing/impersonation grant is proposed for runtime/build identities.
4. Create the `(default)` Native Standard Firestore database and default Firebase Storage bucket in `europe-west1`. Use seven-day daily Firestore backup retention, seven-day Storage soft delete, uniform bucket IAM and public-access prevention. Publish the existing reviewed rules and ten candidate indexes before user access; wait for indexes to become ready. The rules publication step explicitly excludes Hosting, Functions and application targets.
5. Initialize Firebase Auth, enable password-required email sign-in and disable phone, anonymous and email-link sign-in; create one Firebase web app without Analytics. Proposed client permissions disable self-signup and self-deletion. If that setting is unavailable on Firebase Auth, pause for a reviewed alternative: do not silently upgrade to Identity Platform or weaken it. No users are created by the bootstrap. Real-user provisioning remains prohibited; synthetic memberships have their own later approval.
6. Create the regional `crm4-release` Docker repository with immutable tags and private regional build-source bucket. The runtime gets Firestore User and Firebase Auth Admin on CRM4, and Storage Object User only on the default bucket. The build identity gets Artifact Registry Writer only on the repository, Logging Writer on CRM4 and Object Viewer only on the build-source bucket. The existing provisioner Owner role is not duplicated with additional broad grants. Verify actAs and source-upload permissions before a future build.
7. Inspect the owner-created GBP20 budget after Budget API enablement, then separately approve only necessary recipient/filter/threshold updates. One custom email channel for `info@quaerens.co.uk` is proposed; reuse an existing matching channel if discovered. Preserve the existing budget ID and etag; never create a second budget. Channel setup and any Google verification message occur only in the approved provisioning stage.
8. Configure External OAuth for direct Cloud Run IAP, proposing `info@quaerens.co.uk` for support and developer contact. Google support-email eligibility remains unresolved. Service-specific access is restricted to `brusseljeroen@gmail.com`; the IAP agent alone receives service Run Invoker. IAP access is distinct from the owner's separately authorized CRM4 Administrator membership.

## Token Creator: minimum proposed treatment

Observed project binding:

- Member: `serviceAccount:firebase-adminsdk-fbsvc@quaerens-crm4-spain-test.iam.gserviceaccount.com`
- Role: `roles/iam.serviceAccountTokenCreator`
- Scope: entire CRM4 project

The live role definition includes access-token/OpenID-token generation, implicit delegation, signBlob and signJwt. At project scope this is broader than signing as that account alone and can reach future CRM4 service accounts. The SDK's separate Firebase role has broad product access but does not supply those signing permissions.

No custom-token/signBlob/signJwt/impersonation dependency was found in the cloned backend or CRM4 runtime/tools. The cloud adapter replaces Storage signed URLs with membership-checked application tickets. It authenticates as the dedicated runtime identity through managed credentials, not as the generated Firebase SDK account. Therefore the current CRM4 design needs no replacement Token Creator grant.

Recommend removing only this one member from this one role at project scope after the dependency check, while preserving the SDK account itself, its Firebase SDK role, the Firebase management service agent, Owner access and every unrelated binding. Do not disable/delete the SDK account or alter other projects. If a real signing dependency is discovered, stop; a self-scoped grant or a signing-only custom role would require a new justified proposal, not an automatic fallback.

The offline removal helper preserves etag, policy version, audit configuration and unrelated members/bindings. It refuses missing etags, duplicate target bindings and conditional target bindings. Immediately before any approved write, re-read IAM with requested policy version 3, regenerate/review the delta and submit the current etag. The saved baseline is review evidence and must not be replayed blindly.

## Separate build/deployment gates

Cloud Build submission is not part of API/resource approval. The existing container preparer uses pinned Node and Docker builder digests, an independent lockfile, a verified source allowlist, non-root runtime and no deployment build step. Docker is unavailable locally; no image has been built or submitted.

Creating the Cloud Run service creates an application revision, so the plan places service creation and its access bindings in the separately approved deployment stage. There is no placeholder/hello-world deployment in the infrastructure stage. The service request explicitly enables IAP and invoker IAM checks, uses one CPU/1 GiB, min 0/max 2, concurrency 8 and a 120-second timeout. Its image digest remains a deliberate unresolved placeholder. Record actual Firebase public configuration and the reviewed service origin before building the candidate; verify the assigned URL before tester access. OAuth credentials must remain outside source and image.

After image build/scan and exact deployment approval, perform real IAP denial/allow tests, Firebase token and membership revocation, ownership/audit and dual-role Spray Foam acceptance, query-index readiness and Storage concurrency/replay tests. Local tests do not certify live-cloud behavior. Two staff retain their individual UIDs and exact Lister/Closer capability pair; this work does not grant Manager, Processing or assessment-issuer powers.

## Unresolved verification

Budget and SDK account/key reads still return `403 SERVICE_DISABLED` for the relevant CRM4 quota project. Therefore the exact budget settings, actual delivery route and SDK key inventory are not yet independently verified. No API was enabled to bypass this restriction. OAuth support email eligibility, Firebase Auth client-permission support, actual web-app settings, service origin and application digest also remain unresolved.

Sources: [Firebase Admin initialization](https://firebase.google.com/docs/admin/setup), [custom-token signing permissions](https://firebase.google.com/docs/auth/admin/create-custom-tokens), [default bucket creation](https://firebase.google.com/docs/reference/rest/storage/rest/v1alpha/projects.defaultBucket/create), [Auth configuration](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/Config), [Cloud Run service fields](https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services).

## Local validation

Full demo Auth/Firestore/Storage emulator regression: 105/105 passed (299 seconds). This includes dual staff, ownership/audit, assessment, processing and recovery contracts. The final additional IAM allowlist guards also passed their focused 2/2 tests. No application business source was changed. Source-integrity and offline packaging verification remain mandatory before any future build.
