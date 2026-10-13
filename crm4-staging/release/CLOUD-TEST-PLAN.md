> Final preflight: see [verified cloud findings and exact remaining gates](FINAL-PREFLIGHT.md) and [machine-readable infrastructure scope](infrastructure-scope.json). These supersede the historical engineering status and USD budget assumptions below.

> Superseding local implementation checkpoint: dual Lister + Closer capability support is now implemented and locally tested for two individual CRM4 accounts. Earlier single-role-only limitations below describe historical evidence. See [current acceptance and remaining deployment gates](DUAL-ROLE-ACCEPTANCE.md). Cloud provisioning, IAM grants and application deployment remain unapproved.

> Owner tester confirmed, 13 October 2026: the proposed IAP allowlist is brusseljeroen@gmail.com only. This confirms the tester identity, not an IAM grant or Firebase role. Resource provisioning, IAM changes, real accounts and application deployment require separate authorization. Organization/folder remains unconfirmed. Owner CRM4 Administrator membership must be separately authorized; staff remain deferred pending dual-role acceptance.

> Current decision, 13 October 2026: infrastructure approved in principle for quaerens-crm4-spain-test, europe-west1, Firebase Payment and a USD 25 monthly budget alert. Synthetic Firebase Authentication processing limitation accepted. Resource creation is paused pending the actual organization/folder and separate provisioning authorization. Application deployment, public access and real accounts remain unapproved. Offline runtime/routing/rules/index candidates now exist; cloud acceptance is unexecuted. See [current access and preparation evidence](ACCESS-POLICY-EVIDENCE.md).

# CRM4 Spain private cloud test plan — 13 October 2026

Classification: Shared CRM Framework. Scope: CRM4 only, branch `feature/crm4-isolated-clone`. CRM5 remains reserved for London. The user selected a new independent Spain project, EU regional storage, synthetic clients and captured providers. The later in-principle infrastructure decision supersedes the initial selection; creation remains conditional on organization/folder and named tester confirmation. Application deployment is separately gated.

## Decision for review

Propose `quaerens-crm4-spain-test` (availability not checked/reserved), one Firebase project and default Firestore database, with Cloud Run, Firestore and Storage in `europe-west1` (Belgium, EU). A separate project supplies independent Firebase Authentication; no CRM2/CRM3 tenants, memberships, service accounts, buckets, secrets, exports or client data are copied.

Firebase Authentication itself processes data in the United States. EU Firestore/Storage selection does **not** make the entire system EU-only. Only synthetic client identities are proposed. The user accepted this limitation for synthetic testing only; real identities remain unapproved. [Firebase privacy](https://firebase.google.com/support/privacy), [location selection](https://firebase.google.com/docs/projects/locations).

## Exact proposed resources

| Resource | Configuration |
|---|---|
| Project | `quaerens-crm4-spain-test`, dedicated billing link only after approval |
| Firebase web app | One CRM4 Spain test app; new public client config; no Analytics |
| Authentication | Independent email/password users; no production-user import, social/phone providers or public onboarding; active CRM4 membership still required |
| Firestore | Native Standard, `(default)`, `europe-west1`; CRM4-only initial synthetic records; default deny plus reviewed role rules; index inventory must be derived from CRM4 queries, never copied wholesale from production |
| Storage | `quaerens-crm4-spain-test.firebasestorage.app`, regional Standard, uniform IAM, public access prevention; report/download access mediated by authorized handlers; create-only client upload paths with MIME/size/ownership checks |
| Runtime | Cloud Run `crm4-spain-test`, one vCPU, 1 GiB, request billing, min 0/max 2 instances, concurrency 8, 120-second request timeout; no background worker or scheduler |
| Browser privacy | Direct IAP on Cloud Run, named tester allowlist; no `allUsers` invoker; Firebase authentication and application roles remain additional gates |
| Runtime identity | `crm4-runtime@quaerens-crm4-spain-test.iam.gserviceaccount.com`; no downloaded key; managed runtime credentials |
| Build identity | Separate `crm4-build` service account; Artifact Registry writer and build/log permissions only for this project; cannot read operational CRM projects |
| Artifact Registry | Regional Docker repository `crm4-release`, immutable image digest recorded per release; retain candidate and last accepted image |
| Backups | Firestore daily backup, 7-day retention for synthetic test; Storage 7-day soft delete; no destructive auto-cleanup of issued versions; explicit review before expiry/deletion of test data |
| Monitoring | Error rate, failed authentication and billing alerts; no request bodies, documents, tokens or client details in logs |

Required APIs after approval: `firebase.googleapis.com`, `identitytoolkit.googleapis.com`, `firestore.googleapis.com`, `firebasestorage.googleapis.com`, `storage.googleapis.com`, `run.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`, `iam.googleapis.com`, `iamcredentials.googleapis.com`, `iap.googleapis.com`, `logging.googleapis.com`, `monitoring.googleapis.com`, `firebaserules.googleapis.com`. Service Usage/Billing administration belongs to the provisioner. No Resend, Stripe or AI provider secret is needed for capture-only acceptance.

Runtime grants: Firestore data access (`roles/datastore.user`) only in the new project; Firebase Authentication administration only in the new project; Storage object access only on the new bucket. If short-lived signed downloads are retained, grant `iam.serviceAccounts.signBlob` on the runtime identity itself through a minimal custom role; do not grant impersonation across projects. Deployment identity can act as the CRM4 runtime account only. IAP service agent gets Run Invoker on this service; testers get IAP access on this service, not cloud-project administrator. Review inherited organization/folder grants as well as direct project grants before asserting cross-project isolation.

Direct IAP can protect the default Run URL without adding a load balancer. Initial OAuth setup can require a console action, particularly outside an organization. Tester email addresses and organization context are still needed. [Cloud Run IAP setup](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).

## Source and packaging status

`package.json`/`package-lock.json` pin independent CRM4 backend dependencies. `verify-source.cjs` verifies original per-callable transformed hashes, required brochure bytes, dependency locks and an allowlisted runtime source closure. It writes an offline review package under `.scratch/release-review/`. It never invokes a cloud CLI, copies root `functions/`, credentials, historical public snapshots or unrelated worktrees.

The package is explicitly **not deployable**. The local runtime's deliberate emulator checks remain. Outstanding engineering gates are a cloud bootstrap using the named isolated app, reviewed adaptation of CRM4-only recovery guards, durable provider capture registration, cloud SDK routing/CSP, authenticated same-origin callable/document transport behind IAP, deployable Firestore/Storage rules and required composite indexes. The persistent cloud Storage adapter is prepared and unit-tested but not connected to a cloud service. No cloud transport, IAP browser path, IAM denial or real-service race condition is certified by local tests.

This distinction prevents converting local demo code into a production package by simply replacing a project string or disabling its guards. Pinned business source versions must stay separate and unchanged. Cloud bootstrap must reuse their existing registrations and CRM4 boundaries; it must not create new assessment or operational workflows.

Runtime local report reads now use Storage, with no cache fallback. The optional inspection cache is not authoritative. The emulator does not enforce the SDK's generation-match precondition reliably; the local adapter checks persisted existence for sequential replay. That is not a cross-process atomic-write guarantee. Cloud generation-match concurrency and manual concurrent document-generation recovery remain explicit cloud acceptance gates.

## Cost envelope (estimate, not a quote)

Assume 5 testers, 100 synthetic cases/month, 100,000 requests, 50,000 active vCPU-seconds and GiB-seconds, 500,000 Firestore reads, 100,000 writes, 10,000 deletes, 1 GiB database, 5 GiB objects, 2 GiB internet downloads and 20 small builds/month. No email, payment, paid AI, SMS, load balancer or domain purchase.

| Item | Monthly planning allowance (USD, excluding tax) |
|---|---:|
| Request-billed Run | $0–3 |
| Firestore operations, storage and short backups | $0–2 |
| Storage operations, retained objects and downloads | $1–3 |
| Image storage and small builds | $1–5 |
| Authentication/IAP and logs at stated small usage | $0–2 |
| Total planning range | **$2–15** |

Use **$25/month as an initial review budget**, with notifications at $10, $20 and $25. Budget alerts do not stop charges. Resource caps reduce exposure but are not a spending cap. Regional SKU selection, exchange rate, free-tier consumption elsewhere on the billing account, build duration, downloads, retention and log volume can change the result. USD avoids inventing an EUR conversion. Recalculate against the selected billing account before approval.

Reference compute arithmetic before free tier: 50,000 × $0.000024 CPU + 50,000 × $0.0000025 memory + 0.1 × $0.40 requests = $1.365. This is illustrative list-price arithmetic, not a measured bill or guaranteed regional quote. Pricing checked 13 October 2026: [Cloud Run](https://cloud.google.com/run/pricing), [Firestore](https://cloud.google.com/firestore/pricing), [Storage](https://cloud.google.com/storage/pricing), [Firebase](https://firebase.google.com/pricing). Blaze links a billing account: [Firebase plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## Deployment sequence — not executed

1. Obtain explicit resource/API/billing approval, project organization/folder, billing-account selection and named IAP testers. Confirm Auth location constraint. Check availability of proposed project ID; changed names require configuration revalidation.
2. Create only the dedicated project and listed regional resources. Record project number, Firebase app configuration and service identities. Audit effective IAM for absence of CRM2/CRM3 access; use no production credentials or fixtures.
3. Finish and independently review the cloud engineering gates above. Lock cloud routing to the assigned service origin. Pin the container base digest and build with the independent dependency lock. Scan the resulting image and inspect all packaged files.
4. Apply CRM4 rules/indexes to the explicitly named new project. Test unauthorized requests, wrong roles, inactive accounts, wrong workspace, wrong project tokens, cross-bucket paths and unsigned document access. Do not probe operational CRM data to prove isolation; review IAM and use synthetic negative fixtures.
5. Obtain separate deployment approval for the exact commit, image digest, rules/index hashes and tester list. Deploy with no public invoker and IAP required. Record previous revision (none for first deployment).
6. Create only approved synthetic staff/client identities; distribute temporary test credentials privately. Test both IAP denial and allowed-tester access, Firebase token revocation, all roles, uploads/downloads and persistence after restart/revision change. Re-run v9 and manual Spray Foam journeys, corrected versions and responsive inspection.
7. Mark accepted only after cloud-specific gates pass. No real client use, external email, AI or payment is authorized by this plan.

## Rollback

For the first candidate, remove tester IAP access or disable inbound service access, then retire the failed revision. For later releases, route traffic to the previously accepted immutable image digest. Keep the database and bucket intact; application rollback is not a database rollback. Freeze new writes while diagnosing schema incompatibility. Restore backups first into an isolated recovery database/project and verify identities, linkage, versions and stored hashes before any approved recovery switch. Never delete a project/bucket, revert issued versions or copy data into CRM2/CRM3 as an automatic rollback. Retain audit and failure evidence; revoke synthetic sessions if access is suspect.

## Human decisions still required

Resource/API/billing approval; billing account and organization/folder; named Google-account testers; acceptance of the Firebase Auth location constraint; and later approval of a specific deployable image. No resource, API, billing binding or deployment was performed during preparation.
