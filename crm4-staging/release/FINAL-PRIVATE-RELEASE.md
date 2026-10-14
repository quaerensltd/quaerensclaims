# CRM4 Spain first private release approval package

Current execution update: the approved Firebase domain/referrer changes are applied and verified; the ONE authorized regional build succeeded. See [BUILD-RESULT.md](BUILD-RESULT.md) for the immutable image, evidence and remaining deployment gates. The preparation instructions below are historical where they describe those actions as pending; they do not authorize another build.

Shared CRM Framework. Prepared from 47a578b0; original framework bundles and CRM2/CRM3/CRM5 remain unchanged. This is a local review package, not authority to execute the operations below. Current evidence is in evidence/final-private; historical bootstrap proposals are not the current cloud inventory. Storage acceptance remains 38/38 in STORAGE-LIVE-ACCEPTANCE.md and was not repeated.

## Fixed application origin

`https://crm4-spain-test-558324850479.europe-west1.run.app`

This follows Google's [deterministic URL format](https://docs.cloud.google.com/run/docs/custom-urls). No placeholder service is needed. Project quaerens-crm4-spain-test / 558324850479, service crm4-spain-test, europe-west1. After approved creation, verify the returned service URLs include this origin; stop on mismatch. Do not widen the origin policy or add a custom domain to compensate. The browser adapter requires this exact origin. Native IAP must protect every service URL, including any generated alias.

## OAuth owner handoff

The owner reports that Branding and one Web OAuth client are saved: External/Testing, support martijnpronk76@gmail.com, developer contact info@quaerens.co.uk, sole tester brusseljeroen@gmail.com. Do not create another client. The exposed original secret was disabled/deleted and the replacement remains privately held by the owner (owner-reported).

Follow [OAUTH-OWNER-HANDOFF.md](OAUTH-OWNER-HANDOFF.md) to verify the exact saved redirect and configure the existing client securely. Saved client configuration is distinct from applying credentials to IAP. The exact saved redirect and public client ID are now owner-verified Console evidence in evidence/oauth-confirmed/owner-console.json; the local equality check passed. No independent API verification is claimed.

## Auth and browser key: staged exact changes

Fresh read-only verification: Email/Password enabled, password required, signup/deletion disabled, enumeration protection enabled; no Cloud Run service. Public browser key restrictions are preserved verbatim in evidence/final-private/api-key.json. There are 27 API targets and no referrer restriction. This key is public configuration, not an administrator credential.

Proposed first key change: preserve ALL current apiTargets; set browserKeyRestrictions.allowedReferrers to exactly `["https://crm4-spain-test-558324850479.europe-west1.run.app/*"]`. Separately append `crm4-spain-test-558324850479.europe-west1.run.app` to current Firebase authorizedDomains, retaining current entries initially. Do not change password/sign-up/deletion settings. Keeping API targets avoids removing an Auth dependency before observing browser traffic. Identity Toolkit and Secure Token must remain available for login/refresh. Firestore and Firebase Storage remain required. Any later API-target pruning or domain removal is a separate observed, reviewed delta. [Firebase API key guidance](https://firebase.google.com/docs/projects/api-keys).

Before applying either delta: re-read exact project, resource and etag; preserve prior restrictions/domain list; refuse concurrent drift. Verify saved values, password login, token refresh, Firestore reads and case-owner upload from the exact origin. Roll back only the changed fields to the preserved values if the new restrictions break these flows. Do not restore Auth signup or deletion. No wildcard run.app, localhost referrers or extra API-key creation.

## Separate owner membership proposal

IAP Google identity and Firebase identity are independent. Do not infer a Firebase UID from the Google email or give tester access automatic CRM rights. Confirm the owner's chosen Firebase sign-in email and UID before provisioning; brusseljeroen@gmail.com is only the confirmed IAP identity today.

The reviewed document contract is `crm4Memberships/{OWNER_FIREBASE_UID}` with uid, confirmed email, displayName, role `administrator`, workspaceId `CRM4`, workspaceAccess `["CRM4"]`, active true, createdAt/updatedAt server timestamps and createdBy the individually identified authorized administrator. No lister/closer roles on this owner record; no CRM2/CRM3/CRM5 records. Preserve actor/target audit history and workspace access-state handling from crm4AdminCreateUser / crm4AdminUpdateMembership. Never write a membership from the client.

For the initial synthetic browser test, the existing proposed `owner@crm4.example.test` identity may be separately approved. Real owner provisioning remains a distinct approval. The current administrator wrapper permits only example.test identities and requires platformAdmin for central account-management operations. A CRM4 administrator membership does not grant that claim. Do not bypass the wrapper or silently create a platformAdmin/crossCrmAuthority claim. A central-administrator bootstrap must separately name the actor, target, exact project-local claim and audit/rollback process. Real-account administration requires a separately reviewed extension of the synthetic-only boundary; ordinary CRM4 owner testing can use the approved synthetic administrator membership without that extension.

Future staff retain one UID each, primary role lister, roles [lister, closer], active CRM4 membership; existing ownership, assignment, assessment and closing checks remain. They receive no IAP access in this release.

## Immutable build preparation

Run the existing offline prepare-container.cjs with the reviewed public Firebase config and the pinned Node/Docker builder digests in infrastructure-scope.json. evidence/oauth-confirmed/container-preparation.json records the local context location, source digest, context digest and image tag. context-manifest.json covers every copied/generated input, including browser output, lockfile, Dockerfile, runtime config and cloudbuild.json. It excludes only itself and the non-executable preparation receipt. Verify with `node crm4-staging/release/context-integrity.cjs CONTEXT EXPECTED_CONTEXT_SHA256` immediately before packaging/submission; the expected hash comes from separately reviewed evidence.

Current context deliberately embeds deploymentApproved=false and cannot start as a cloud application. Build approval must explicitly authorize preparing the deployment candidate with deploymentApproved=true while submission and deployment remain separate gates; regenerate, record and verify its new source/context hashes BEFORE submission. Do not patch a frozen context or reuse this review tag for changed bytes. The independent CRM4_DEPLOYMENT_APPROVED environment gate remains required. No approval flag has been enabled by this preparation.

Only source from the allowlisted CRM4 context may be archived, with archive SHA-256 and generation recorded after upload to the dedicated build-source bucket. Use europe-west1 Cloud Build, the dedicated crm4-build identity, reviewed cloudbuild.json and immutable Artifact Registry tag. No substitutions, floating bases, default Compute identity or production credentials. Docker uses Node 22, npm ci with scripts disabled, locked production dependencies, and non-root node. Build result image digest, provenance, logs and image/OS vulnerability report must be reviewed before deployment; pinned inputs alone do not prove bit-for-bit reproducible npm/container output.

Dependency audit: 0 high/critical; 3 moderate entries represent the existing sprintf-js -> argparse -> mammoth CLI dependency chain, with no patched sprintf-js listed. The DOCX extraction regression verifies the application library path does not load argparse/sprintf-js. Do not apply npm's suggested downgrade to mammoth 0.3.29. This finding remains disclosed for build review; scan the actual resulting image before release. No dependencies or original handlers were changed.

## Approval boundaries and rollback

| Approval | Exact requested action | Exclusions / rollback |
| --- | --- | --- |
| OAuth | Existing client/redirect owner-verified; owner privately applies existing replacement credentials to CRM4-only IAP settings under separate approval; preserve saved brand/tester | Preserve prior settings; restore only new delta; revoke newly created client if unused. No secret in evidence. |
| Auth/key | Exact referrer/domain additions above | Preserve etags and old fields; no API-target pruning, provider enablement or duplicate app. |
| Build | Activate candidate config under explicit approval, review new hashes, upload one source archive and submit one regional build with existing build SA/repository | No deploy. Preserve build receipt; delete only approved source generation/image if rollback is requested. |
| Deploy/IAM | One digest-pinned crm4-spain-test service in europe-west1; native IAP true; invoker check enabled; runtime SA crm4-runtime; 1 CPU/1024 MiB; min 0/max 2; concurrency 8; timeout 120s; request billing; capture-only providers | No public invoker, load balancer, Hosting or custom domain. On failure withdraw tester binding first; preserve unrelated IAM; delete only the newly created service under approved rollback. |
| Service IAM | serviceAccount:service-558324850479@gcp-sa-iap.iam.gserviceaccount.com -> roles/run.invoker on crm4-spain-test ONLY; user:brusseljeroen@gmail.com -> roles/iap.httpsResourceAccessor on that regional IAP service ONLY | Fresh version-3 policies/etags; preserve exact before/after delta; remove only these additions for rollback. No project accessor/invoker or Token Creator. |
| Owner/synthetic fixtures | Named individual Firebase account and exact CRM4 membership/central-authority scope after separate approval | No real staff; revoke sessions/deactivate only approved memberships; generation/update-time-safe fixture cleanup with audit receipts. |

Deployment image must be `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:ACTUAL_BUILD_RESULT`. Use infrastructure-scope.json runtime environmentOnApprovedDeployment and /app/release/runtime-config.json. Current service-account datastore/Auth/bucket permissions are already prepared; do not duplicate them. Recheck deployer's effective run/IAP/OAuth/build permissions and actAs on the two dedicated identities. Missing permissions require an exact additional delta, not blanket Owner/Editor. Leave the Firebase SDK Token Creator and all other service agents unchanged.

Before every future mutation revalidate P/558324850479 and current resource compatibility. No existing incompatible resource may be overwritten. Recheck native IAP audience `/projects/558324850479/locations/europe-west1/services/crm4-spain-test`, runtime metadata identity and no public/inherited accessor bindings before adding the tester. Exact image digest is intentionally pending the approved build.

## Post-deployment browser acceptance (new integration gates)

1. Verify deployed image digest, region, runtime identity, limits, IAP flag, both policies and all exposed URL aliases. An unauthenticated/incognito request must not retrieve application assets/data; unauthorized Google identity must fail. Do not grant a second tester to test denial. Forged/missing IAP assertions and alternate Host/Origin calls must fail.
2. Owner signs into IAP as brusseljeroen@gmail.com, then separately into the approved Firebase identity. Before membership is active, CRM data/actions must be denied. With active CRM4 administrator membership, correct dashboard opens. Confirm login, refresh/reload/logout and revocation with strict referrer restriction; no client signup/deletion or extra providers.
3. Use only separately approved synthetic fixtures. Perform a deployed-runtime administrator upload/register/retry and case-owner access check; verify individual audit, revoked membership denial and data isolation. This checks new managed-identity/IAP transport integration; retain the existing 38/38 cloud matrix without rerunning it wholesale.
4. Under the sole Google tester session, use the two separately approved synthetic staff Firebase logins sequentially. Confirm one UID has both Lister and Closer UI/workflows, correct ownership/assignment and assessment/closing safeguards; deny CRM2/CRM3/CRM5 and administrator actions. No additional Google identities or real staff are necessary.
5. Inspect desktop/tablet/mobile login and CRM navigation, Spray Foam primary category, preserved cloned workflows, generated/downloaded documents and private document links. Inspect browser errors/network for cross-project requests, key restrictions, mixed content and leaked tokens. Capture redacted receipts only.
6. Confirm email/payment/AI capture-only behavior; no messages sent. Cleanup approved fixtures using recorded generations/update times; revoke temporary Firebase sessions and verify audit evidence. No temporary provisioner Storage grant is needed for the deployed runtime's existing scoped access.

Only after these gates pass should the owner use the private URL for ongoing synthetic testing. Real records, real staff and live providers remain excluded. The existing GBP20 budget is verified historically; adding info@quaerens.co.uk to notifications remains a separate exact channel/budget approval and does not block the private login test.
