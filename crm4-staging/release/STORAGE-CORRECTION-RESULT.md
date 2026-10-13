# CRM4 Spain Storage correction — 14 October 2026

Latest result: [Full live Storage acceptance and temporary-access removal](STORAGE-LIVE-ACCEPTANCE.md). Earlier failures below are historical.

Shared CRM Framework. Continuation of 5b283718 on feature/crm4-isolated-clone. Only CRM4 files and quaerens-crm4-spain-test / 558324850479 were changed. No container build, application deployment, real staff, provider delivery, API enablement or IAM grant occurred.

## Implemented and published

The cloud browser transport now sends staff uploads to portalStaffUploadDocument through the existing same-origin IAP and revoked-Firebase-token HTTP boundary. It accepts the existing safe types and up to 15 MiB. It checks an active CRM4 administrator/manager/processing membership and the existing version-2 portal/canonical lead linkage in Firestore. Lister+Closer membership does not confer these supervisor powers. Ownership and assignment fields are not changed.

The CRM4 adapter reuses the pinned Shared CRM document registration factory and original buffered registration/audit transaction. Membership, case markers and the linked CRM4 lead are checked again in that transaction. Empty/null conflicting markers now fail closed. A platformAdmin claim cannot replace active CRM4 membership on this upload boundary. No original backend factory, cloned browser source, CRM2/CRM3/CRM5 rule or resource was edited.

Objects are create-only with a generation precondition. A server-written fingerprint binds bytes, metadata and individual UID; exact retries reuse the object and original idempotent registration. A conflicting retry is rejected. If authorization changes or registration is uncertain after an object save, the unregistered bytes remain private; an exact authorized retry can finish registration. Do not automatically delete an object on an ambiguous commit response, which could already have committed its document/audit. Reviewed run-scoped cleanup removes disposable test orphans.

The published Storage rules deny direct shared/staff writes. Case-owner uploads retain verified identity, immutable create, case ownership, active access, MIME and size checks; they now reject conflicting canonical markers and foreign linked leads. They read only the case and, when linked, its lead: at most two unique Firestore documents. Shared uploads use the server's explicit authorization instead of exceeding Storage's lookup quota.

Published ruleset: projects/quaerens-crm4-spain-test/rulesets/c71c0574-0e42-4fb6-b6c0-fa3ffbdadf45. Source SHA-256: 704066c28fda7b2868d3d5d68c4df3e386774a4e392c2ba8cb0a9a35eb6b6e61. Fresh project ID/number and previous ruleset/hash were checked before mutation. Publication and read-back verification are recorded in evidence/phase1/storage-correction-publication.json.

## Acceptance results and limits

- Final complete local regression: **107 passed, 0 failed**. This includes dual-role assignment isolation, original safeguards, immutable upload/retry, individual audit, and revocation between object save and registration.
- Additional focused cleanup regression: **1 passed**. It verifies recovery of objects saved before a metadata-read failure and refusal to delete unknown actors, paths or generations.
- Literal release Storage rules in Auth/Firestore/Storage emulators: **22 passed, 0 failed**, before publication. Subsequent strict-marker local acceptance also passed.
- Final live synthetic matrix: **31 passed, 3 failed/blocked**. See evidence/phase1/authenticated-storage-crm4-cloud-5355bee9-de22-477b-98c0-314ed1ba8663.json. Case-owner upload with two Firestore reads succeeded. Wrong owner, revoked case access, inactive membership, both dual-role staff attempting supervisor upload, CRM2/CRM3/CRM5 membership, foreign lead and conflicting/empty/null case markers were denied. Ownership and lead assignments remained unchanged.
- Live administrator upload completion, exact retry and conflicting retry did **not** pass. The provisioner can save objects but cannot read their metadata. The initial save succeeded, then metadata verification failed; no document/audit was registered. The resulting adapter error was 500 in the harness. Successful administrator audit/replay and mid-upload revocation were skipped live because they depend on a successful first registration; they passed locally. This is not full Storage acceptance or private-deployment readiness.

Live tests executed the same governed callable locally with real, signature/revocation-verified Firebase ID tokens and real CRM4 Firestore/GCS. They did not instantiate a deployed application, bypass its deployment guard, exercise a deployed IAP route or authenticate as the managed runtime. Those deployment integration checks remain pending.

## Live harness diagnostics and cleanup

Four disposable runs were recorded. The first exposed a test-only Auth quota-project header omission; the second exposed the actual object-read permission gap; the third also exposed null fixture serialization; the final run completed the independent matrix. These failures remain in evidence rather than being presented as passes. The harness now uses its SDK-compatible auth-library version, explicitly pins the quota project, supports null markers and records per-request project guards.

All twelve temporary Auth identities and all test documents were removed. A final object listing found three administrator test objects that had saved before getMetadata failed and therefore were initially untracked by the runner. Each was matched to its run's mutation journal and server actor metadata, then deleted by exact generation. The runner now discovers journalled run-owned objects before cleanup; the focused regression covers this failure mode.

Final independent verification confirms **zero active synthetic objects, zero Auth users, zero active Firestore collections and zero Cloud Run services**. See storage-correction-orphan-cleanup.json and storage-correction-final-verification.json. Deleted synthetic objects remain subject to seven-day soft-delete retention; do not describe this as immediate physical erasure. Passwords, ID/refresh/access tokens and Auth hashing parameters were never persisted in these evidence files.

## Precise remaining approval and deployment gates

The existing bucket policy grants crm4-runtime Storage Object User. Fresh provisioner permission testing returns object create/delete but not object get; runtime service-account token permission testing returns none. No additional permission was applied.

The minimum proposed test-only change is a conditional bucket roles/storage.objectViewer binding for user:martijnpronk76@gmail.com, limited to objects under clientPortal/crm4-cloud- and expiring 2026-10-15T23:59:59Z. The exact non-approved proposal and removal instructions are in evidence/phase1/storage-test-read-proposal.json. Re-read the version-3 IAM policy/etag and project identity after separate approval; stop if the condition has expired. Remove only that binding after acceptance and fixture cleanup. An alternative is explicitly approved execution under the already authorized runtime identity. Do not grant Token Creator or broader Storage administration to work around this blocker.

Then repeat live successful administrator registration, exact retry, conflicting retry, individual audit and mid-upload revocation. The rules quota defect is removed, but these results remain a release gate.

External OAuth still needs Console access and confirmation that info@quaerens.co.uk is an eligible support contact. The sole proposed tester remains brusseljeroen@gmail.com; owner Firebase Administrator membership remains separately unprovisioned. The browser tool failed during Windows sandbox initialization, not due to an approval rejection. PRIVATE-ORIGIN-REVIEW.md records the exact remaining OAuth/private-origin/API-key review; 27 existing API restrictions and an empty referrer allowlist remain unchanged.

After those gates, obtain separate approval for the exact container build, then the immutable image/private Cloud Run deployment and service-specific IAP/IAM changes. Do not create a placeholder service. Real staff provisioning remains separately gated. The GBP20 budget and pending company-email recipient delta are unchanged. Firebase SDK Token Creator remains intact; default Compute Editor remains absent.

## Rollback

The publication evidence preserves the previous release name, ruleset and full source, plus the exact PATCH rollback body. First reverify project ID/number and that the active release is still this correction. Restoring the previous rules also restores the known three-document administrator failure; do not roll back blindly. No application revision was deployed, so there is no application rollback. Local code rollback must be a reviewed CRM4-only revert, preserving earlier commits and current evidence. Synthetic rollback is the completed generation/precondition-scoped cleanup; never restore discarded fixtures automatically.
