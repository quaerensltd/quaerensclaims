# CRM4 Spain: approved Firebase changes and first container build

Current security result: owner-submitted scan completed and all findings retrieved; **NO-GO** for this digest. See [IMAGE-SECURITY-RESULT.md](IMAGE-SECURITY-RESULT.md). The handoff/pending status below is historical; do not submit another scan.

Scan approval update: only On-Demand Scanning API is now enabled, with IAM unchanged. Owner Cloud Shell execution is pending; see [IMAGE-SECURITY-SCAN.md](IMAGE-SECURITY-SCAN.md). The original build findings below remain historical.

Shared CRM Framework; project quaerens-crm4-spain-test / 558324850479 only. Completed 14 October 2026. No application deployed, IAM granted, real accounts provisioned or other CRM resources changed. Prior 38/38 live Storage acceptance remains intact and was not repeated.

## Successful build and immutable image

Build: `74bb9592-5541-4920-9463-3e4ba3f0dd7f`, europe-west1, SUCCESS. Exactly one regional build exists. [Build logs in Console](https://console.cloud.google.com/cloud-build/builds;region=europe-west1/74bb9592-5541-4920-9463-3e4ba3f0dd7f?project=558324850479).

Deploy only this digest after separate approval:

```
europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:f62e96fef639c362e2aeb86630bbf6487c861017acdc74aa5b7f52a64b8d253e
```

Immutable tag: `crm4-spain:1bdb4c8d42ddb361`. Dedicated identity: crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com. The build used the reviewed pinned Docker builder, Node image, production lockfile, Dockerfile and isolated runtime sources. No executable source files or dependencies were substituted. SHA256 source-provenance reporting was requested as additional build metadata.

Source baseline: commit 5f513b51989681681d66bcb321f979ab9a3e5866. First regenerated and verified the inactive context, then prepared the authorized candidate with deploymentApproved=true, reverified source/context hashes and archived it. The candidate flag is embedded only in that approved artifact; it is not application deployment authority. The independent runtime environment approval guard remains. Post-build status/documentation changes in the evidence commit are not represented as new executable image content.

Source digest: `1bdb4c8d42ddb361ee7b51badc2657758977c8a22cfcda40e2673f8c1da6a104`.
Archive SHA256: `f14a92034c46e2f134067ffa26cacd5b3a44e03c8f3b03fbf8d39f7ed2d404c4`.
The private source object generation is `1791964276903361`; the exact object path is in evidence/approved-build/source-upload-result.json. Upload used ifGenerationMatch=0. Its server MD5 and size matched locally; extracted archive contents matched all 679 sealed context entries. Cloud Build's resolved generation and SHA256 match the uploaded archive. Registry metadata independently matches the returned image digest. This is recorded Cloud Build source provenance; no separate signed SLSA attestation verification is claimed.

Evidence directory: evidence/approved-build. candidate.json, context-manifest.json, archive-verification.json, build-submit-intent.json, build-submit-result.json, build-latest.json, registry-image.json and final-verification.json preserve the chain. build-logs.json contains 136 log entries with no remaining page token. The one-build authorization is consumed; any rebuild needs new approval.

## Verified Firebase changes

Auth authorizedDomains now contains the prior localhost, quaerens-crm4-spain-test.firebaseapp.com and quaerens-crm4-spain-test.web.app plus exactly crm4-spain-test-558324850479.europe-west1.run.app. The Config API returned no etag; the full in-memory configuration was compared immediately before the authorizedDomains-only PATCH and all non-domain fields compared afterwards. Sensitive Auth hash configuration was never written to evidence.

Existing browser key projects/558324850479/locations/global/keys/0be9a348-3160-4749-9240-083aa454e877 now allows exactly `https://crm4-spain-test-558324850479.europe-west1.run.app/*`. The PATCH supplied the current etag and preserved all 27 API targets. Operation completion and a fresh GET verified the final restriction. Existing domains, Email/Password, disabled self-signup/deletion and email enumeration protection remain unchanged. Browser login/refresh verification awaits private deployment; no pre-deployment browser acceptance is claimed.

Rollback receipts: auth-result.json contains the precise old domain list and masked PATCH. key-intent.json contains prior key restrictions; use a fresh current etag when restoring only that field. Check current state against our resulting values and stop on unrelated drift. Do not restore unrelated fields or weaken Auth protections. The initial firebase-mutations.json is an intent receipt; auth-result.json and key-result.json record completion.

The source object/image are retained for provenance and deployment review. If a separately approved rollback requires removal, delete only the recorded source generation and exact image digest after dependency/reference checks; never remove the bucket/repository or reuse an immutable tag. No build can be undone and recorded charges are not reversed by deletion.

## Security findings and cost

Locked npm audit: 0 critical, 0 high, 3 moderate entries in the existing sprintf-js -> argparse -> mammoth dependency chain (GHSA-hp3w-g68c-fv3c). The relevant synthetic DOCX extraction test passed and confirmed the application path does not load the vulnerable CLI formatting dependencies. No dependency downgrade or override was added. Audit and test output are preserved. This is a scoped reachability observation, not proof that the entire image is vulnerability-free.

Container Analysis, Container Scanning and On-Demand Scanning APIs are all disabled. No local Docker/Trivy scanner is installed. OS/image scanning was not performed; no additional APIs were enabled. Before deployment, approve one remote digest-specific scan in the Europe multi-region using On-Demand Scanning (ondemandscanning.googleapis.com), with fresh dependency/permission review before enablement and no unapproved IAM grants. If additional APIs or roles prove necessary, stop for their exact approval. This does not require another container build or continuous scanning. [Google on-demand scanning](https://docs.cloud.google.com/artifact-analysis/docs/scan-os-on-demand).

Actual billed build cost is unavailable: the build API supplies timing, not a final billing charge, and no per-build billing export was available in this workflow. Do not interpret this as zero cost. Start 07:52:11 UTC, finish 07:53:24 UTC (09:52:11–09:53:24 Europe/Madrid), about 73 seconds; billable usage/credits must be reconciled in the existing Firebase Payment billing reports. The existing GBP20 budget was not modified. Artifact/source storage can continue accruing charges.

Fresh post-build checks verified unchanged project, build-bucket and repository IAM bindings, exactly one build and zero Cloud Run services. No application access was opened.

## Exact remaining approvals

1. Image security review: the single digest-specific on-demand scan described above; review its findings and explicitly resolve or accept applicable risks before deployment. No second build is authorized by this task.
2. Private Cloud Run deployment of the exact digest above to crm4-spain-test, europe-west1, dedicated crm4-runtime identity; native IAP enabled, invoker IAM check enabled, no anonymous/public invoker. Retain the reviewed 1 CPU/1024 MiB, min 0/max 2, concurrency 8, timeout 120s, request billing, exact origin and capture-only providers. Deployment environment must use the approved configuration path and runtime approval guard.
3. Only two service-specific IAM additions: IAP service agent service-558324850479@gcp-sa-iap.iam.gserviceaccount.com receives roles/run.invoker on crm4-spain-test; user brusseljeroen@gmail.com receives roles/iap.httpsResourceAccessor on that regional IAP service. Fresh policies/etags and exact rollback deltas required. No project-wide accessor/invoker or additional tester.
4. Owner privately applies the existing OAuth client and replacement secret to CRM4 IAP under separate authorization, following OAUTH-OWNER-HANDOFF.md. Saved redirect remains owner-verified evidence; no secret request/retrieval is needed. No duplicate client.
5. Separate owner Firebase identity/CRM4 Administrator membership and any central administrator bootstrap authorization. The IAP tester is not automatically a Firebase administrator; real staff remain excluded. Approve any temporary synthetic browser fixtures explicitly.

After these approvals, run the existing post-deployment browser acceptance plan, including IAP denial, Firebase login/refresh under the new referrer restriction, managed-runtime upload/audit/revocation and dual-role isolation. Keep the 38/38 Storage acceptance evidence; do not rerun that entire matrix unnecessarily. Stop before deployment until the required approvals arrive.
