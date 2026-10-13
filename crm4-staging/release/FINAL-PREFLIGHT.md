# CRM4 Spain final infrastructure preflight — 13 October 2026

Shared CRM Framework; CRM4-only continuation of `deaa7e1a`. This document supersedes older cloud plan statements about unimplemented local runtime work. The approved dual-role contract and original backend source fingerprints remain unchanged. All infrastructure and deployment approvals remain false.

## Verified read-only findings

- Active CLI identity: `martijnpronk76@gmail.com`. Rechecked configured account and active authenticated account both match the user-proposed provisioner. This does not grant IAP access or authorize provisioning.
- The user manually checked Resource Manager and confirmed **No organization** as the parent for the new project. The proposed creation request omits `parent`; it contains no organization/folder ID. CLI organization visibility is retained only as historical evidence.
- Describing `quaerens-crm4-spain-test` returned permission denied or nonexistent. This cannot establish global availability; no create/reservation probe was attempted. Validate the ID in the creation console with the confirmed provisioner before authorizing creation, and recheck at creation time.
- `Firebase Payment`, account `016627-0BEE7F-D03ADE`, is open and denominated in **GBP**. A read-only `testIamPermissions` returned account read, project billing association, and budget create/read/update permissions for the current CLI identity. Project-side billing permissions and inherited policies are not yet verifiable.
- The user confirmed **GBP 20 monthly**, superseding USD 25. Proposed project-only thresholds are GBP 8, GBP 16 and GBP 20 (40%, 80%, 100%). Notification recipients still need confirmation; no automatic shutdown. The proposed budget payload must receive the actual project number before use.
- Docker is unavailable locally. Public registry lookups resolved immutable Node 22 and Docker builder digests recorded in the scope. No image build, cloud submission or deployment occurred.

Machine-readable evidence: [preflight-evidence.json](preflight-evidence.json). Reviewable resource and IAM scope: [infrastructure-scope.json](infrastructure-scope.json).

## Exact minimum private test scope

One dedicated project/Firebase web app; email/password Auth for synthetic users; regional default Native Firestore with reviewed rules, 10 candidate indexes and seven-day daily backups; regional default Firebase Storage bucket with uniform IAM, public-access prevention and seven-day soft delete. Preserve create-only document safeguards. No production data imports.

One Cloud Run service, one CPU/1 GiB, min 0/max 2, concurrency 8, 120-second timeout, request-based billing. Direct IAP protects every application route, with the IAP agent as the only Run invoker and `brusseljeroen@gmail.com` as the sole IAP accessor. Ingress ALL means the IAP login endpoint is reachable over the internet; it does not grant anonymous application access. No load balancer, public Hosting or public Functions deployment is proposed.

The personal Gmail tester requires External OAuth configuration and initial Console setup; confirm the OAuth support and developer contact identities. External OAuth audience does not broaden the IAP allowlist. IAP access never creates Firebase membership. The owner needs separately authorized CRM4 Administrator membership. Two individual synthetic staff memberships retain primary role plus the exact Lister/Closer capability pair. Staff cannot inherit Manager, Processing or assessment-issuer powers; existing approval/payment/assessment safeguards remain mandatory during cloud acceptance.

Separate runtime and build service accounts; no keys, Token Creator or signBlob grant. Durable application download tickets remove the need for signed Storage URLs. The runtime gets project-scoped Firestore/Auth access and object access only on its bucket. The build account gets writer access to the one Artifact Registry repository, logging access, and reader access to one regional source staging bucket. The submitter needs source upload and actAs permissions only for the applicable identities. Review automatic service-agent and inherited grants after creation; do not claim cross-project IAM isolation before that review. Resource administration belongs to the explicitly confirmed provisioner, never to staff or the tester merely because they can open IAP.

The scope lists exact APIs, proposed grants, runtime limits, storage names, identity constraints and unresolved fields. No mutation script is run or required to inspect it. Cloud build submission is a separate authorized infrastructure operation; the proposed build has one Docker build step and no deployment step.

## Local artifact preparation

`prepare-container.cjs` takes a validated cloud configuration and two digest-pinned images. It generates a content-addressed context under `.scratch/container-review`, verifies original backend/browser sources, builds private browser routes, writes a filtered runtime configuration, places `.dockerignore` at the context root, and generates `cloudbuild.json`. It neither submits a build nor deploys. Synthetic fixture image digests used in tests are explicitly not real build evidence.

The Dockerfile now sets `CRM4_CONFIG_FILE` to the prepared file. Startup still requires both the explicit deployment-approved configuration and environment gate, correct named runtime identity, actual project number, assigned service origin and public Firebase web-app fields. These real values must be recorded after authorized provisioning, then the artifact regenerated and its image digest scanned/reviewed before deployment approval. Build origin from the assigned Cloud Run URL; validate it before accepting the release.

## Dependency review

The isolated release pins Firebase Admin 13.10.0, Firebase Functions 7.4.0, Mammoth 1.13.0 and a CommonJS-compatible UUID 11.1.1 override. Original CRM source and other CRMs' dependency files are unchanged. Firebase Admin 14 was rejected by compatibility tests because it removed the namespace APIs used by the preserved handlers; it is not in the final lockfile.

A clean `npm ci --omit=dev --ignore-scripts` succeeds. Audit reports zero high/critical vulnerabilities and three moderate package entries representing one remaining advisory, GHSA-hp3w-g68c-fv3c, via Mammoth CLI -> argparse -> sprintf-js. No compatible upstream fix is published; npm's suggested Mammoth 0.3.29 downgrade is unsuitable. CRM4 uses the library's `extractRawText`, not the CLI. The synthetic DOCX extraction regression confirms argparse/sprintf-js are not loaded on that exercised path. This is bounded reachability evidence, not a claim that the package is vulnerability-free. Review this residual finding with the final image scan before release acceptance.

## Local verification results

- After the parent and GBP 20 confirmation update: focused configuration, startup approval, sole-tester IAP, private browser packaging and container/source checks passed 9/9; 587-file source package verified.

- Full emulator run on the final dependency set: 103 tests, 102 passed; the sole failure was a concurrent offline packaging file-lock collision, not a role/runtime failure.
- Fixed packaging to allocate a separate review directory per invocation. Affected container and package regressions then passed 3/3. The complete 103-test run was not repeated after this packaging-only fix.
- Dual staff, individual ownership/audit, administrator safeguards, assessment generation/correction, portal Storage rules, token/authentication and processing guards all passed in the full run.
- Clean dependency installation and synthetic DOCX/API compatibility passed. Original source/hash verification passed; review package remains explicitly non-deployable.

## Remaining gates

1. Verify project-creation eligibility, account quota and project-ID availability as `martijnpronk76@gmail.com`. Parent and provisioner identity are now confirmed. CLI list returned no accessible matching project and describe returned permission denied or nonexistent; neither establishes availability. No organization has no parent resource on which to run an organization/folder IAM test. Browser automation failed to start because of a Windows sandbox helper error, so Console form validation remains pending. Do not click Create or probe creation before separate approval.
2. Confirm budget notification recipients, External OAuth support/contact configuration, and this exact project/API/billing/IAM/build scope. The parent and GBP 20 amount do not require reconfirmation. Separately authorize resource creation, billing attachment, IAM and build submission.
3. After provisioning, record actual project number, Firebase public configuration, assigned service origin, OAuth configuration and effective IAM. Authorize only the three synthetic memberships, including separate owner Administrator access.
4. Build and scan the immutable candidate container using Docker or an authorized Cloud Build job. Review residual dependency advisory. Approve the specific image, configuration and rules/index hashes separately for the first private deployment.
5. First deployment remains an unaccepted test until real IAP allow/deny, Firebase membership/token revocation, cross-workspace denial, index readiness, Storage generation-match concurrency, durable document replay and dual-role Spray Foam acceptance pass. Local tests cannot certify those cloud properties.

No resource creation, billing attachment, IAM grant, real-account provisioning or deployment was performed.

References: [Cloud Run direct IAP and external OAuth](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run); [budget currency must match the account](https://docs.cloud.google.com/billing/docs/reference/budget/rest/v1/billingAccounts.budgets#BudgetAmount); [remaining dependency advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).

## Prepared request bodies (not executed)

`project-create.request.json` is the proposed Cloud Resource Manager v3 creation body; absence of a parent expresses the intended No organization path for the confirmed personal Google identity. Verify the resulting parent after any separately authorized creation and before attaching billing. `budget.request.proposed.json` is the GBP 20 monthly alerts-only body, with a mandatory project-number placeholder and existing billing IAM recipients proposed. Both are review artifacts only: no tool applies them, and all approval flags remain false.
