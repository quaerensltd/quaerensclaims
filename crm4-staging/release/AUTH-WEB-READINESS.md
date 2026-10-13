# CRM4 Spain Auth and web readiness — 14 October 2026

Latest continuation: [Storage correction and live acceptance limits](STORAGE-CORRECTION-RESULT.md). This document records the preceding diagnostic state.

Shared CRM Framework; continuation of `3ff8eab8`. Verified only `quaerens-crm4-spain-test` / `558324850479`. Auth, app configuration and API-key restrictions were inspected read-only; no settings, IAM, APIs, rules or bucket protections were changed. No build or application deployment occurred.

## Verified owner configuration

Exactly one ACTIVE Firebase web app exists: `1:558324850479:web:4820e9460b4926adbd4bda`, named Quaerens CRM4 Spain. The six public SDK fields retrieved from Firebase are saved in `firebase-web.public.json`; project, app, sender number, Auth domain and bucket all match the approved CRM4 target. No duplicate app was created. The public browser API key is intentionally included in public configuration; it is not a service-account credential.

Firebase Auth subtype is `FIREBASE_AUTH`, not Identity Platform. Saved configuration verifies email/password enabled with password required (email-link disabled), client signup and deletion disabled, and improved email privacy enabled. Phone and anonymous sign-in are absent/default false; supported social-provider list is empty. MFA is disabled. Authorized domains are localhost and the project's firebaseapp.com/web.app domains. The future private runtime origin remains unassigned and unapproved; it was not invented or added.

The Auth administrative API also returns password-hashing metadata. Those unnecessary fields were removed from saved evidence before staging; no hashing parameters, user passwords or ID/refresh tokens are committed. Test credentials remained in process memory.

The app references key UID `0be9a348-3160-4749-9240-083aa454e877`. Read-only gcloud describe verified its project-number resource, 27 API target restrictions and an empty browser restriction object (no HTTP-referrer allowlist). The default API allowlist is broad and includes Firebase products not used by this runtime; this does not itself activate any API or provider. No key restrictions were changed. Direct REST using the CRM4 quota header returned SERVICE_DISABLED for API Keys API; gcloud describe succeeded without enabling it. Before first build, review a least-privilege API/referrer delta against the actual private origin and required Auth/Firestore/Storage traffic rather than blindly narrowing the default list.

## Authenticated cloud findings

The previous user instruction to test authorized and unauthorized synthetic Storage access was resumed now that Auth exists. `tools/cloud-storage-acceptance.cjs` requires an explicit execution flag, rejects emulator environment variables, locks project/app/bucket identifiers and rechecks project ID/number before each cloud write. It uses unique synthetic IDs and `example.test` emails, credentials only in memory, create/update preconditions, guarded cleanup and generation-matched object deletion. The fixture runner is not included in the container source closure.

Two diagnostic runs each created a disposable set of two individual Lister+Closer identities and one administrator. All six temporary accounts and all test documents were removed with successful verification. The first run stopped on the administrator's unexpected 403. The second collected the remaining matrix: **9 passed, 1 failed**. The verified case owner successfully uploaded a synthetic text file; wrong owner, disabled case, inactive membership, CRM2/CRM3/CRM5 membership and both dual-role users attempting administrator-only upload were denied. The administrator shared upload still returned 403 instead of 200. The overwrite test was not run because the administrator's initial object was never created.

One successful synthetic object was deleted with a generation precondition. Active Storage object listing and Firestore collection listing are empty. Seven-day soft-delete retention still applies to that deleted object; backups/PITR/audit retention must not be described as immediate physical erasure. No production data, real staff, provider credentials or live email/payment/AI service was used. No changes were made to other CRM resources; foreign workspace values existed only in CRM4 synthetic fixtures.

The deployed rule source is unchanged and matches its approved SHA-256. The shared-upload branch reads three unique Firestore documents: membership, portal case and linked lead. Google permits only **two unique Firestore documents per Storage-rule evaluation**; excess reads deny access. The live contrast between a successful one-document case-owner upload and failed three-document administrator upload is consistent with this documented limit. This is a release blocker, not an IAM-grant failure or evidence that bucket protections should be relaxed. Prior emulator success was insufficient for this production constraint. [Firebase rule limits](https://firebase.google.com/docs/rules/rules-behavior), [Firebase cross-service explanation](https://firebase.blog/posts/2022/09/announcing-cross-service-security-rules/).

Do not fix this by deleting the linked-lead check or broadening roles. Prepare a CRM4-specific integration with the existing protected server upload path/storage adapter so fresh membership, case, lead and audit safeguards remain enforced without Storage-rule lookup limits. Review that concrete change before publishing new rules or deploying application code. No such change was applied here. The accepted dual-role architecture is unchanged.

## Remaining OAuth/IAP and release work

Auth initialization and web-app registration are complete. Remaining Auth work is live acceptance after the administrator upload fix, and review of the private origin/API-key restriction delta. Do not create another app or upgrade Auth.

OAuth branding API still returns `400 Project must belong to an organization`. Initial External OAuth setup needs Google Auth Platform Console. Browser automation again failed before exposing a session, so support-email eligibility could not be inspected. `info@quaerens.co.uk` remains the proposed support/developer contact, subject to it being selectable as a signed-in Google account or a Google Group managed by that account. Do not substitute a contact automatically. Keep `brusseljeroen@gmail.com` as the sole proposed tester.

No OAuth credentials, IAP tester grant or Cloud Run service was created. Owner Administrator membership remains separate from Google IAP access. Private origin, exact container/image and service-specific bindings still require their existing separate build/deployment approvals. The budget company-email recipient update remains independently pending; no budget settings changed.

## Evidence and rollback

- `auth-web-readiness.json`: sanitized Auth, sole app and public configuration reads.
- `api-key-restrictions.json`: successful key restriction metadata.
- `authenticated-storage-acceptance.json`: first failed probe and successful cleanup.
- `authenticated-storage-crm4-cloud-3171c51d-962e-4682-9093-fddb43df8b64.json`: full matrix, guarded fixture mutation journal and cleanup.
- `storage-rules-current.json`, `storage-cross-service-limit.json`, `authenticated-storage-diagnostics.json`: matching rules, quota diagnosis and limited logs.
- `auth-web-final-checks.json`: empty active fixtures, OAuth API blocker and absent Run service.

All evidence files are under `release/evidence/phase1/`, excluded from runtime packaging. Synthetic rollback was cleanup of only run-owned accounts/documents/objects; it completed with no cleanup failures. There is no Auth/key/IAM/rules configuration rollback because no such settings were changed. Do not redeploy, recreate fixtures or restore deleted test data as an automatic rollback.
