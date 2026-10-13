# CRM4 Spain Storage service-agent grant result

Shared CRM Framework. Continued from `5cbc2c7e` on `feature/crm4-isolated-clone`. Only project `quaerens-crm4-spain-test` / `558324850479` was mutated. The user explicitly approved this grant; no additional approval was inferred.

## Applied change and verification

Added one unconditional project IAM binding:

- Principal: `serviceAccount:service-558324850479@gcp-sa-firebasestorage.iam.gserviceaccount.com`
- Role: `roles/firebaserules.firestoreServiceAgent`
- Resource: `projects/quaerens-crm4-spain-test`
- Current role permission: only `datastore.entities.get`

The project ID, number, ACTIVE state and No-organization parent were checked immediately before the write. The version-3 IAM read returned the same policy as the last checkpoint, with no target binding or conditions. The fresh etag was preserved in the request. A full normalized before/requested/after comparison confirms exactly this addition and no unrelated change. No Editor, Owner, broad Storage administration, signing, public or cross-project grant was added. The existing Firebase SDK permissions and default Compute Editor removal were preserved.

Google's service-agent-manager audit entry confirms it created the principal's `roles/firebasestorage.serviceAgent` binding for CRM4. The bucket's project number matches. The published Storage rules match the approved SHA-256 and call Firestore for membership, case and linked-lead checks. Google's documentation identifies this Firebase Storage agent and cross-service role for that purpose. Direct project-scoped IAM account metadata returns 404 for this Google-managed account; identity verification relies on the exact project-number principal, Google-managed audit record and existing service-agent binding, not an invented replacement account. [Google cross-service rules guidance](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules).

The resulting IAM allow policy grants the intended agent Firestore entity reads without a condition. End-to-end use of that permission by the cloud Storage rules service has not been exercised because Firebase Auth remains uninitialized; policy verification and emulator behavior are not claimed as authenticated cloud acceptance. No impersonation or extra troubleshooting/API grant was used.

## Synthetic access tests

The expanded `tests/release-storage-rules.cjs` ran against literal loopback Auth, Firestore and Storage emulators under `demo-quaerens-crm4`, using the exact published release rules. All 19 checks passed:

- Allowed: verified CRM4 case-owner upload and active CRM4 administrator shared upload.
- Denied: CRM2/CRM3/CRM5 case or membership, conflicting workspace link, foreign linked lead, wrong owner, revoked case access, inactive/missing administrator membership, unsafe MIME, overwrite and unauthenticated listing.
- Both individual Lister+Closer identities were denied administrator-only shared uploads, preserving the existing elevated-role safeguard rather than broadening dual-role permissions.

The expected missing-membership null evaluation denied access. Baseline local rules were restored in `finally`, and all emulators stopped. Synthetic identities and records existed only in local emulators. The accepted Shared CRM Framework dual-role implementation and deployed rules were not modified.

Live unauthenticated Firestore and Storage requests returned 403 after the grant. Live CRM4 database collections and Storage objects remain empty. Firebase Auth still returns `404 CONFIGURATION_NOT_FOUND`, so no valid cloud synthetic identity token can be obtained for the authorized-versus-unauthorized cloud test yet. That test remains pending and must be run after Auth setup; it was not replaced with a privileged Admin SDK upload that would bypass Storage rules.

Offline source integrity verified all 594 package files, and cloud evidence remains outside the container context. No application code, build, deployment, real staff, CRM2/CRM3/CRM5 or production resource was changed.

## Remaining Firebase Auth and OAuth steps

1. In the Firebase Console for this exact project, initialize Firebase Authentication using Get started. The documented Identity Platform initialization endpoint is not an approved substitute, and Console automation was unavailable in the previous bootstrap attempt.
2. Apply and read back the already reviewed settings: password-required email sign-in; email-link, phone, anonymous and social providers disabled; duplicate emails disallowed; client signup and deletion disabled. If Firebase Auth cannot enforce the last restrictions, stop for a reviewed alternative rather than upgrading the product or weakening access controls.
3. Register the one approved web app after Auth settings pass; capture only its public configuration. Then run live synthetic Storage allow/deny tests with isolated test records and individual identities. Preserve the two dual-role staff contract and separate administrator membership; do not create real staff accounts.
4. In Google Auth Platform Console, prepare External OAuth. Verify `info@quaerens.co.uk` is selectable as the support address: a signed-in Google account or a Google Group managed by that account. If ineligible, report those supported alternatives; do not substitute another address or create an account automatically. Retain it as the proposed developer contact and `brusseljeroen@gmail.com` as the sole proposed tester.
5. Keep OAuth credentials outside source and images. Cloud Run/IAP service-specific grants and live private-access acceptance depend on separate application deployment approval. The generated IAP identity has a completed service-identity response but restricted IAM metadata visibility; no additional inspection permissions are authorized.

The existing GBP20 budget and thresholds remain unchanged. Company-email delivery still needs its separately reviewed recipient-only configuration. The Firebase SDK Token Creator grant remains untouched. Builds and application deployment remain unapproved.

## Evidence and exact rollback

`evidence/phase1/storage-grant-preflight.json` records the role, service-agent audit, rules, bucket and policy. `storage-grant-applied.json` preserves before/requested/after policies and the rollback delta. `storage-grant-journal.json` records the single guarded cloud mutation and verification. `storage-grant-cloud-verification.json` records persistent IAM, denial probes, empty data stores and the Auth blocker. `storage-grant-synthetic-tests.json` contains all 19 named results.

Rollback delta: REMOVE only the above principal from `roles/firebaserules.firestoreServiceAgent` on CRM4. If rollback is separately authorized, re-read policy version 3 and use the current etag; remove the binding only if its member list becomes empty. Preserve every other binding, condition and audit configuration. Do not replay a stale full policy. Removing this grant makes cross-service Storage lookups fail closed; do not weaken or remove the membership rules to compensate. No rollback was executed.
