Current preparation update: see CONTROLLED-PREPARATION-RESULT.md. API Keys API is now enabled and existing restrictions verified unchanged. A local-tested startup alternative avoids Secret Manager. No other cloud changes are authorised. Historical proposals below remain unexecuted.

# CRM4 Spain — owner-only synthetic-test approval package

Prepared 16 October 2026 against commit 90702dcb and ZLIB-SECURITY-DISPOSITION.md. Shared CRM Framework release preparation only. **No deployment or cloud mutation authorised or performed. Stop after owner review.**

## Recommendation

**NO-GO for deployment now. GO to review a bounded synthetic-risk exception and the exact proposed controls below.** The zlib assessment permits a defensible limited test, but does not resolve operational prerequisites. No real customer use or staff access is included. This report does not accept risk on the owner's behalf.

Exact image:
`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

Target: quaerens-crm4-spain-test / 558324850479, europe-west1. Maximum duration 168 hours from the first grant of test access, with fixed UTC start T0 and end T1 agreed before any access is granted; T1 must be no later than T0+168h. Delays do not extend T1. The calendar end date is intentionally not invented before approval.

## Fresh read-only preflight

Receipts: evidence/private-synthetic-preflight/cloud-read-only.json and controls.json. Read calls include non-mutating getIamPolicy POST operations. No user/customer documents were read, no credentials retrieved, and no fixtures written.

| Control | Observed result | Interpretation |
|---|---|---|
| Exact project and image | Identity check and registry lookup succeeded | Correct independent project and assessed digest |
| Cloud Run | Regional list returned no services | No app or live IAP/browser acceptance exists |
| EU data resources | Firestore europe-west1; bucket EUROPE-WEST1 | Regional resources verified; this does not change the previously accepted Auth processing-location limitation |
| Rules | Both live releases match local reviewed Firestore/Storage rules | Existing membership/ownership/isolation controls preserved; prior 38/38 Storage evidence retained |
| Storage | Uniform bucket access; public access prevention enforced; soft delete 604800 seconds | No public bucket binding; runtime has objectUser; project convenience roles remain |
| Firebase Auth | Password enabled/required; self-signup and self-deletion disabled; enumeration protection enabled | Restrictions verified; owner Firebase account/membership not yet selected or provisioned |
| Auth domains | Planned run.app hostname present; existing localhost/firebaseapp/web.app entries retained | No domain changes needed based on this read; domains alone do not grant CRM access |
| Browser API key | Current list request returned HTTP 403 | Fresh restriction verification blocked; historical exact-origin restriction is not substituted for a current check. Use an existing authorised read/owner Console check; do not broaden IAM automatically |
| Runtime identity | Dedicated runtime account exists and is enabled | Existing project datastore.user/firebaseauth.admin and bucket objectUser retained; no key-file credentials allowed |
| Project IAM | Etag BwZdwDu5QJg=; no public principal; provisioner remains project Owner | No project-wide IAP accessor or Run invoker observed; privileged provisioner remains capable of administration, distinct from browser tester scope |
| IAP | Project web policy has no bindings; expected IAP service agent returns 404 | Native IAP setup and scoped invocation/access grants are still required; do not claim protection is live |
| Logging | _Default 30-day retention; locked _Required 400-day retention | Retention verified; project policy has no explicit auditConfigs. Data Access logging is not thereby established for IAP/Firestore/Storage |
| OAuth | Prior owner Console evidence only | Public client/redirect remain recorded; no new independent OAuth verification or credential application is claimed |
| Mocked providers | Reviewed runtime constructs capture-only provider; refuses provider-secret access; captures delivered=false | Build-time/source evidence, not deployed runtime verification |

Project IAM has no parent policy inspected in this run: No organization is owner-confirmed historical evidence. Resource checks do not establish absence of all possible external-project grants to service identities. No other CRM project was queried or changed. The Firebase SDK Token Creator grant remains unchanged and disclosed; removal is outside this package.

## Exact proposed deployment controls — not an execution authorisation

1. Create only Cloud Run service crm4-spain-test in europe-west1, pinned to the image above. Preserve distroless UID 65532, entrypoint and server command. One CPU, 1024 MiB, min instances 0, max 2, concurrency 8, timeout 120 seconds, request-based billing, port 8080. No custom domain, load balancer or Firebase Hosting deployment. Origin must be `https://crm4-spain-test-558324850479.europe-west1.run.app`; stop if returned URLs differ from the reviewed routing expectations.
2. Native IAP enabled from creation, invocation IAM check enabled, no allUsers/allAuthenticatedUsers binding. Native IAP protects all ingress aliases; ingress ALL is a routing setting, not permission for anonymous use. Verify denial through every returned URL before owner access. [Google native IAP guidance](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).
3. Runtime service account remains crm4-runtime@quaerens-crm4-spain-test.iam.gserviceaccount.com. No production credentials, credential files or emulator environment variables. Existing datastore/Auth/Storage permissions are not broadened. No change to build identities or other agents.
4. Proposed IAP agent service-558324850479@gcp-sa-iap.iam.gserviceaccount.com receives roles/run.invoker on this service only. Its absent service identity must first be created through the supported IAP setup under explicit approval; any automatically requested project role must be reviewed as a separate exact delta. Stop rather than accepting a blanket grant.
5. Proposed sole tester: user:brusseljeroen@gmail.com receives roles/iap.httpsResourceAccessor only at `projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test`. Proposed version-3 condition: `request.time >= timestamp("T0_UTC") && request.time < timestamp("T1_UTC")`, with literal UTC timestamps substituted before approval/execution. Validate supported conditions and saved policy; no unconditional parallel access binding. Application JWT verifier also enforces the owner email and exact regional audience.
6. Existing OAuth client 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com only; External/Testing; sole test user owner. Owner privately enters the replacement secret through the approved Console procedure with automation/screensharing paused. Never place it in the config mount, image, chat or receipts. Reconfirm saved redirect and status without exposing the secret. No second client.
7. Firebase sign-in remains independent of IAP. Proposed owner-operated synthetic login owner@crm4.example.test requires separate approval of its exact UID and crm4Memberships/{UID}: active, role administrator, workspaceId CRM4, workspaceAccess [CRM4], individual actor/audit metadata. No platformAdmin or crossCrmAuthority claim, no real staff or synthetic staff logins, no customer/portal users. Bootstrap actor and membership update/audit transaction require explicit approval. IAP email alone grants no Firebase membership.

### Activation of the unchanged image

The image's configuration has deploymentApproved=false, and runtime-boundary requires both that field true and CRM4_DEPLOYMENT_APPROVED=true. An environment toggle alone is insufficient. Do not weaken the boundary or modify the image.

A non-secret proposed config is prepared at evidence/private-synthetic-preflight/runtime-config.proposed.json. Its only semantic change from the recorded image config is deploymentApproved:false -> true. SHA-256: `be32ef38127276c3ba875abb2a456acfa70816892df86c8eb768120c312610cc`. Offline config/boundary checks passed; baked false config still rejects activation. Cloud startup was not tested.

Proposed delivery: a dedicated Secret Manager resource named crm4-synthetic-runtime-config, pinned numeric version, mounted read-only at /crm4-config/runtime-config.json. It contains public runtime configuration, not OAuth/provider secrets. This is an additional proposed resource, not an existing approved one. Its API availability, absent/compatible resource, replication policy, numeric version and runtime secretAccessor grant on this one secret must be verified and explicitly approved before creation. Prefer regional EU configuration where supported; do not silently select global replication. If this supported delivery cannot meet those constraints, stop and prepare an alternative, without rebuilding automatically.

Proposed environment is recorded exactly in activation-proposal.json: GCLOUD_PROJECT=quaerens-crm4-spain-test; CRM4_CONFIG_FILE=/crm4-config/runtime-config.json; CRM4_DEPLOYMENT_APPROVED=true; ASSESSMENT_REPORT_ARCHIVE_EMAIL=archive@example.test. Preserve all other provider/origin/project/membership controls. No live provider settings or production credentials.

## Expiry and audit gates

A written expiry or calendar reminder is not an enforced cutoff. The current image, Firestore rules and Storage rules do not enforce a seven-day test deadline. A time-conditioned IAP grant alone does not end direct Firebase access, existing tokens or privileged SDK operations.

Proposed complete cutoff design, requiring separate rule/IAM review and local tests before deployment approval:

- Fixed T1 on the service-specific IAP accessor condition. Verify denial with an expired condition in a separately approved acceptance procedure; never broaden access to test it.
- Add a project-specific absolute T1 predicate to **every client allow path** in both Firestore and Storage rules, ANDed with the existing membership, ownership and workspace checks. Use a literal UTC timestamp; never rely on an unenforced membership expiresAt field. Existing nested/overlapping allow paths must be audited so no alternative allow bypasses the predicate. Rules are not changed by this package. Boundary tests must demonstrate authorized access before T1 and denial at/after T1, including retained tokens and direct Firebase requests. This is a new justified test, not repetition of the entire Storage matrix.
- Named operator executes shutdown before T1: deactivate the approved owner membership through the governed transaction, disable its synthetic Auth account/revoke refresh tokens, withdraw only new tester/invoker bindings and stop/delete only the newly created service. Start shutdown sufficiently early to verify completion before T1; failures mean immediate early stop, not an extension. Finish in-flight work and verify denial before the deadline. Service deletion handles SDK paths which bypass client rules.

These expiry controls are proposed, not implemented or accepted. No background shutdown job has been scheduled. If a guaranteed unattended shutdown is required, a separately reviewed automation and exact permissions are necessary; this report does not invent them.

Audit proposal: preserve application actor UID and action history, IAP identity correlation where supplied, Cloud Run request/error logs and Cloud Audit Logs. Verify a synthetic action and denial reach the intended logs without logging tokens, document bodies or OAuth secrets. Explicitly configure/verify necessary IAP and Storage Data Access logging under a separately approved auditConfigs delta, preserving exemptions/unrelated entries; confirm Firestore logging behavior rather than inferring it from an empty policy. Maintain existing log retention and identify an authorised reviewer. Application audit collections alone do not prove coverage of all direct SDK/API reads. Missing audit visibility blocks test access. No logging configuration was changed today.

## Residual-risk acceptance statement — draft for owner signature

“I accept, solely for the exact digest and approved T0–T1 window (maximum 168 hours), the documented residual risk of CVE-2026-85091 remaining HIGH in Google's scan, incomplete exploit-specific regression coverage, uncertain embedded-zlib scanner coverage, Node's unresolved bit-for-bit reproducibility limitation and the retained low/minimal findings. The backport/runtime evidence supports limited synthetic testing but is not a clean scan or vendor clearance. I authorise only my named Google identity and separately specified synthetic Firebase administrator identity, known synthetic fixtures/documents and mocked providers. No customer-derived data, production records, staff access or live providers are permitted. I accept early termination on control failure and expiry without automatic renewal. This does not approve production use.”

Owner/signature: PENDING. T0/T1 UTC: PENDING. Firebase UID: PENDING. Operator/shutdown reviewer: PENDING. Separate approval must enumerate service/IAP/OAuth, config resource/version/grant, expiry rules, audit deltas and synthetic membership/cleanup. Signing the risk statement alone does not authorise those mutations.

## Rollback and incident stop procedure — execution requires explicit approval

Before each future write: verify project ID/number, exact target, current policy version/etag and resource compatibility. Preserve before/after JSON, resource generations, rule release IDs, timestamps and actor. Abort on drift, unexpected resources or missing permissions.

On public access, unexpected identity/provider, real-data ingress, suspicious crash, failed audit/expiry or scope drift: stop testing immediately. Withdraw the exact added owner IAP binding while preserving other bindings. Deactivate the synthetic membership/access state and revoke its sessions, then disable the synthetic Auth account. Verify denial using retained tokens against both app and Firebase endpoints. Delete/stop only the newly created CRM4 Cloud Run service; do not disable IAP as a workaround or point traffic to an older vulnerable image.

Remove only newly approved service-scoped grants/config-version access. Do not remove shared agents, existing project grants or the SDK Token Creator binding. Keep the config version and image for evidence unless separately approved for deletion; ensure they cannot restart a test without new approval. Restore prior rule releases only after membership revocation and direct-access denial are confirmed; retaining the expired deny predicate is safer than reopening access. Do not roll back Auth signup/deletion protections, API-key restrictions or unrelated settings. Never reactivate the old exposed OAuth secret.

Cleanup only inventoried synthetic fixtures with generation/update-time preconditions. Preserve audit and security receipts, pending retention approval; no blanket collection/bucket deletion. Soft-deleted storage may remain seven days; log evidence remains subject to observed retention. Rollback cannot erase data already read, so prevention of real-data ingress is mandatory.

## Approval prerequisites and post-deployment acceptance

Before any deployment approval: confirm risk acceptance and fixed window; verify current browser-key restriction through authorised read access; approve/validate IAP service identity and exact scoped deltas; finish public OAuth status verification; approve named synthetic owner UID/bootstrap; validate config mount delivery; approve/test complete expiry rules and shutdown accountability; verify audit configuration. No approval request should claim these pending controls already work.

After separately approved deployment, before general owner testing: validate exact image/config hashes and runtime identity; deny anonymous and unauthorised requests without adding another tester; confirm sole IAP identity, independent Firebase membership and revocation; verify direct Firebase expiry behavior, mock captures and individual audit; perform only new managed-runtime document/upload integration checks using known synthetic fixtures. Retain prior dual-role and 38/38 Storage acceptance; this owner-only phase does not grant staff access or reopen full acceptance unnecessarily.

No production clearance, real accounts, lead import, rebuild or identical rescan is requested. The package is delivered for review; work stops pending explicit owner approval and resolution of the listed prerequisites.
