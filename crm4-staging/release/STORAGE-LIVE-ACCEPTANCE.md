# CRM4 Spain live Storage acceptance — 14 October 2026

Shared CRM Framework. Continuation of ae368a41. **All 38 live synthetic Storage checks passed, with zero failed or skipped checks and zero cleanup failures.** The temporary read grant has been removed, and the original bucket policy bindings are restored. No application was built or deployed.

## Exact authority and condition verification

The initial approval text named user@gmail.com, which conflicted with the saved proposal. Before any grant, the user explicitly confirmed martijnpronk76@gmail.com as the intended existing provisioner. Only user:martijnpronk76@gmail.com received the temporary conditional roles/storage.objectViewer binding. No access was granted to user@gmail.com.

Project quaerens-crm4-spain-test / 558324850479, bucket quaerens-crm4-spain-test.firebasestorage.app, region europe-west1 and active provisioner identity were freshly verified. Uniform bucket-level access and enforced public-access prevention were checked. The policy was requested with optionsRequestedPolicyVersion=3. It returned version 1 while unconditional; the conditional update used version 3 and the current etag.

The exact approved expression was used unchanged:

    resource.name.startsWith("projects/_/buckets/quaerens-crm4-spain-test.firebasestorage.app/objects/clientPortal/crm4-cloud-") && request.time < timestamp("2026-10-15T23:59:59Z")

Google's IAM condition linter returned HTTP 200 with no issues. Google's documented object-resource format, prefix conditions, time condition and uniform-access prerequisite support this expression. Before granting access, deterministic boundary checks covered the intended prefix, an unrelated prefix, a near-match, the bucket resource and the expiry instant. Actual pre-grant reads of three existing synthetic probes returned 403.

After the grant, metadata and content reads of the probe under clientPortal/crm4-cloud- returned 200. Both reads returned 403 for clientPortal/crm4-control- and near-matching clientPortal/crm4-cloudX-. No application tests proceeded until those live enforcement checks passed. This conditional object-read binding does not grant bucket-level listing because a bucket resource cannot match the object prefix; the provisioner's existing bucket-list permissions were preserved, not restricted or expanded.

Sources: [Cloud Storage conditions](https://cloud.google.com/storage/docs/access-control/iam#conditions), [conditional bucket policies](https://cloud.google.com/storage/docs/access-control/using-iam-permissions), [resource-name formats](https://cloud.google.com/iam/docs/conditions-resource-attributes).

## Live results

The unchanged CRM4 server-upload adapter was exercised with real Firebase ID tokens verified for signature, project and revocation, real Firestore transactions and real GCS objects. The matrix passed:

- Administrator upload, successful document registration and individual actor attribution.
- Exact retry without a duplicate audit; conflicting bytes rejected without overwrite.
- Original DOCUMENT_SHARED audit recorded once for the administrator.
- Membership revoked after object save but before registration: denied, with no client-visible document registered.
- Verified case-owner upload; wrong owner and revoked case access denied.
- Both individual Lister+Closer accounts denied supervisor-only powers.
- Inactive membership, CRM2/CRM3/CRM5 membership, foreign linked lead and conflicting, empty or null case markers denied.
- Case ownership and lead assignments unchanged.

Evidence: evidence/phase1/authenticated-storage-crm4-cloud-26ae6a7a-7327-4238-ae5b-a24b09f494bf.json. Earlier failed matrices remain historical evidence; this completed matrix supersedes their Storage release blocker. No original factory, runtime authorization, role contract, rule, ownership check or application code needed alteration in this phase.

This proves the requested live synthetic Storage matrix. It does not claim a deployed IAP route, managed Cloud Run identity or live browser has been tested. The governed callable ran locally against the isolated cloud resources; deployed integration remains gated by application approval.

## Cleanup, IAM restoration and audit receipts

The acceptance runner removed all three synthetic Auth accounts, all fixture/registration/audit/operation documents and all three acceptance objects with generation/update preconditions. The wrapper then removed its three IAM probe objects by exact generation. There were no cleanup failures.

The temporary binding was added at 2026-10-13T23:31:12.985Z and removal was submitted at 2026-10-13T23:32:00.605Z, immediately after tests and cleanup. It was not left until expiry. Bucket etags progressed CAM= (before), CAQ= (grant) and CAU= (restored). A fresh read confirms identical original bindings, resource and effective policy version; the etag changes because the policy was written. Unrelated project IAM bindings also match the previous verified state.

Evidence/phase1/temporary-storage-access-d003a5fb-12ba-40ca-b41a-3c32928b29d2.json preserves the original policy, approved delta, lint result, positive/negative controls, every mutation status, exact rollback instructions, removal response and final policy. Evidence/phase1/temporary-storage-final-verification.json independently confirms zero active bucket objects, zero Auth users, zero active Firestore collections and zero Cloud Run services. Seven-day object soft-delete retention remains applicable.

No project-wide Storage permission, Token Creator, impersonation, public accessor or additional tester was granted. Firebase SDK Token Creator remains unchanged and the default Compute Editor binding remains absent. CRM2, CRM3, CRM5 and production resources were not changed. Credentials were kept in memory and excluded from evidence.

Rollback is complete: the added conditional binding and active fixtures are absent. Do not restore this temporary grant or disposable fixtures as rollback. Any future grant needs fresh authorization, policy/etag inspection and expiry validation; the historical proposal file remains a record of the reviewed delta.

## Remaining private-deployment gates

1. Complete External OAuth Console setup and verify info@quaerens.co.uk is an eligible support/developer contact. Keep brusseljeroen@gmail.com as the sole proposed private IAP tester. The company owner still needs separately authorized CRM4 Firebase Administrator membership; IAP access does not supply it.
2. Confirm the exact private application origin and approve/test the corresponding Firebase authorized-domain and browser API-key restriction delta described in PRIVATE-ORIGIN-REVIEW.md. No settings were changed here.
3. Obtain separate approval for the regional container build using crm4-build; then approve the resulting immutable image, private Cloud Run service and exact service-specific IAM/IAP bindings. No placeholder service, build submission or application deployment occurred.
4. After that approval, complete browser/IAP/managed-runtime integration acceptance with providers still mocked or disabled and synthetic identities only. Real staff provisioning remains separately gated.

The existing GBP20 budget is unchanged. Its company-email notification channel/recipient delta remains a separate pending configuration approval; no duplicate budget was created.
