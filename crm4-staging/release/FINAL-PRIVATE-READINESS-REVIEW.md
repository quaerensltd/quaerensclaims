# CRM4 final private readiness review — 16 October 2026

Shared CRM Framework. Review baseline: 69d37358. This is a proposal and read-only assessment, not deployment authorisation. All changes proposed below are confined to quaerens-crm4-spain-test / 558324850479, europe-west1. No cloud mutation was performed during this review.

## Decision

**NO-GO for deployment now.** A defensible owner-only synthetic risk exception remains possible, but bootstrap authority, final sealed controls and managed expiry acceptance are not established. A same-day deployment cannot be promised. Production and real-customer use remain NO-GO.

| Gate | Result | Evidence / remaining condition |
|---|---|---|
| Bootstrap authority | BLOCKED | Fresh complete Auth inventory: zero users, zero platformAdmin actors. New initial ceremony needs explicit approval. |
| Startup configuration | PASS locally | Existing six tests and loopback shutdown retained; no Linux/Cloud Run integration claim. Final command needs approved timestamps and hash. |
| Expiry | Locally verified; live gate BLOCKED | Existing 15 emulator checks cover fresh direct requests with retained tokens. Persistent listeners, resumable uploads and managed termination remain unverified. |
| IAM/IAP | Proposal ready; activation BLOCKED | Required sampled permissions granted; service and IAP identity absent. Exact scoped grants and OAuth attachment need approval. |
| Firebase/Storage rules | Local templates ready | Nine Firestore and three Storage allow clauses retain original predicates. Fixed-window rules must be generated, sealed and authorised. |
| Audit | Exact additive proposal ready | Current auditConfigs empty; operator can read private logs. Configuration and live event visibility remain pending. |

Fresh receipts: evidence/final-readiness-review/bootstrap-inspection.json and cloud-review.json. The project IAM policy still matches the prior evidence, etag BwZdwDu5QJg=. No Cloud Run services exist in europe-west1. The IAP service-agent lookup returns 404. The exact assessed Artifact Registry image still exists:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

No rebuild, scan, rules publication, account creation, claim change or IAM update occurred. Existing passing application/Storage evidence is preserved without repeating completed acceptance tests.

## Bootstrap authority and minimum ceremony

The complete default-project Auth inventory contains no accounts; multi-tenancy is not enabled in the inspected configuration. Password sign-in remains enabled, client signup/deletion disabled and enumeration protection enabled. Cloud project ownership is not a Firebase platformAdmin claim. There is no existing actor to reuse.

Propose a distinct temporary synthetic authority, **bootstrap@crm4.example.test**, operated only by the named owner through the already approved Google IAP identity brusseljeroen@gmail.com. This second Firebase identity is NOT currently approved. It is not a staff account, receives no CRM membership, no Google IAM role and no additional IAP accessor binding. Its project-local platformAdmin claim would nevertheless permit governed CRM4 administration while active: this temporary capability is material and needs explicit approval.

A separate actor preserves the existing prohibition on self-update in backend-sources/crm4AdminUpdateMembership/index.js. The earlier emulator evidence used distinct actor and target; it does not establish self-revocation. Do not change that safeguard. The proposed owner@crm4.example.test must never receive platformAdmin.

After separately approving this ceremony:

1. Reverify project number, operator, zero-account baseline and current Auth permissions; stop on drift. Record an approval reference and named human operator in a restricted receipt. No shared or anonymous administrative identity.
2. Using existing project-local administration, create the temporary synthetic Firebase actor and record its UID privately. Assign only the explicitly approved platformAdmin custom claim using Firebase's supported Admin mechanism. Preserve other claims; stop on unexpected claims. Do not manufacture JWTs or caller authentication objects. No service-account keys or impersonation grant is required or proposed.
3. Use owner-private credential entry with an in-memory, non-echoing procedure; no passwords, reset URLs, ID/refresh tokens or OAuth secrets in shell arguments, command history, chat, Git or logs. Browser-key referrer restrictions remain unchanged: Firebase sign-in occurs from the approved private application origin, not an unrestricted CLI workaround. Secure credential-entry tooling must be reviewed before execution.
4. Sign in normally and obtain a fresh Firebase-issued token. Verify revocation, exact project audience/issuer, named actor UID and platformAdmin=true. Through the owner's IAP-protected browser session call the existing `/__crm4/call/crm4AdminCreateUser` handler with `{email:"owner@crm4.example.test",displayName:"CRM4 Synthetic Owner",role:"administrator",workspaceId:"CRM4",active:true}`. Do not write membership documents directly. The HTTP boundary verifies real Firebase tokens and the governed handler enforces platformAdmin. The local preparation adapter is validation support, not an already deployed endpoint.
5. Verify the resulting CRM4-only membership, target UID, operation receipt and individually attributable audit record; confirm the owner has no platformAdmin claim. Set the owner's credential privately through approved Auth administration because mock email capture cannot deliver setup mail to example.test. Verify both authentication and governed authorisation separately.
6. Immediately remove the temporary claim, revoke refresh tokens, disable the bootstrap account and destroy ephemeral credentials. Verify the old token is rejected and the owner remains usable only under its CRM4 membership. Retain redacted UID references and restricted audit correlation. A failure at any stage triggers revocation/disable and withdrawal of access, not manual membership writes.

The framework runtime requires managed runtime identity verification. It cannot be bypassed by executing production handlers locally with fabricated dependencies. Thus protected service creation and controlled bootstrap are part of the future approved integration sequence, not a prerequisite that can be completed through read-only local work.

For later governed membership deactivation, a distinct legitimate administrator is again required. A separately approved brief reactivation of the same bootstrap actor can perform it before expiry, followed immediately by claim removal/revocation/disable. After expiry the application must remain closed: disable owner Auth and revoke sessions administratively, retain the expired rules, withdraw IAP access and stop the service. Do not reopen the window or write membership directly merely to mark membership inactive. A retained active membership document is inert under expired rules/disabled Auth; record it accurately pending a separately governed maintenance procedure.

## Independent control review and limitations

The startup wrapper verifies baked configuration SHA-256 8ee3b8d34ea203461513584b2ac97083c890a754c1292a0d45df78de6e893eb4, changes only deploymentApproved, and verifies activated configuration SHA-256 be32ef38127276c3ba875abb2a456acfa70816892df86c8eb768120c312610cc. Missing/false approval, wrong project, config drift, credential files, emulator variables and expired restart fail closed. The proposed command is /nodejs/bin/node with the sealed serialized -e wrapper calling the original server. This is a deployment-command change despite the unchanged image digest and needs explicit approval.

Original IAP signature/audience/sole-tester verification, Firebase token revocation checks, governed handler restrictions, membership, ownership and workspace checks remain in place. Capture-only providers and the exact original source evidence remain unchanged. No production credential is introduced.

One canonical UTC T0/T1 pair must satisfy T1-T0=604800 seconds. Both timestamps remain unset. The IAP expression is `request.time >= timestamp("T0") && request.time < timestamp("T1")`; both rule candidates add the equivalent conjunction to every original allow. The wrapper rejects new requests outside that interval and terminates its listener/connections at expiry. Storage rules incur no additional document reads. Admin SDK operations bypass client rules, so application cutoff and process termination are essential independent layers.

Google documents per-request IAM checks during valid IAP sessions; an existing cookie is not an exemption. Existing Firebase tokens likewise do not bypass server request.time predicates on new requests. However this does not prove termination of persistent Firestore listeners or resumable Storage sessions. Nor can terminating a process undo a backend operation already accepted before the deadline. Previously downloaded/cached synthetic bytes cannot be erased remotely. Trusted platform clocks, privileged project administrators and service-policy propagation are residual assumptions. No unconditional claim of strict cutoff for every in-flight operation is made.

Before ordinary owner testing, separately authorised managed acceptance must demonstrate: unauthenticated/wrong-Google-user denial; correct-IAP but missing/wrong/revoked Firebase identity denial; owner membership and audit attribution; direct Firestore/Storage denial outside the window with retained tokens; pre-existing listener/resumable-upload behavior; HTTP connections and document tickets crossing expiry; no expired restart; no public alternate ingress. An accelerated managed rehearsal would require an explicit additional configuration approval, not silent shortening of the approved 168-hour window. If any path survives its required cutoff, stop access and resolve it before declaring expiry PASS.

## Exact proposed cloud deltas and permissions

All resource names below refer exclusively to this project. No dependency, policy or data in CRM2/CRM3/CRM5 or production is changed. Project-wide audit configuration does cover all services of the listed types within this isolated project.

- **Firebase:** two approved synthetic identities only if the separate bootstrap proposal is accepted; temporary actor claim, governed owner membership, private credential setup and actor revocation as above. Requires firebaseauth.users.create/get/update; freshly tested PASS. Existing browser key, its 27 API targets/referrer, Auth authorised domains and client restrictions unchanged. No key restriction update requested.
- **Rules:** publish only sealed CRM4 default Firestore and CRM4 bucket rule candidates with the shared T0/T1, preserving original predicates. Requires firebaserules.rulesets.create and releases.update; PASS. Record old release/ruleset IDs, new hashes and rollback receipt; no index/storage-retention change.
- **Cloud Run:** create only crm4-spain-test in europe-west1 using the exact digest, existing crm4-runtime identity, native IAP enabled, invoker IAM checks enabled, 1 CPU/1 GiB, min0/max2, concurrency8, timeout120 seconds, reviewed startup override and capture-only configuration. No allUsers/allAuthenticatedUsers grant. Existing runtime datastore/Auth/bucket permissions remain unchanged. Prior runtime actAs and Run administration checks passed; fresh create/setIAM checks passed. Recheck deployment-time policy and image pull access before mutation; no broader role is a fallback.
- **IAP:** generate only service-558324850479@gcp-sa-iap.iam.gserviceaccount.com for iap.googleapis.com. Grant that principal roles/run.invoker on this Run service only. Grant user:brusseljeroen@gmail.com roles/iap.httpsResourceAccessor on projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test with the sealed time condition. No second Google tester. Google lists no default project role for this IAP agent; do not add an invented roles/iap.serviceAgent or any project-wide invoker role. Compare project policy before/after agent creation; stop on unexpected automatic grants. Fresh generateServiceIdentity and IAP policy/settings permissions PASS; actual resource-specific writes remain untested until authorised.
- **OAuth:** attach only existing client 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com. Preserve External/Testing, sole test user and existing exact handleRedirect URI. These Console settings remain owner-verified evidence, not independently verified secret-bearing API evidence. Owner enters replacement secret privately in Console; do not retrieve it. No new client or secret storage grant. Fresh clientauthconfig.clients.update permission PASS; no-organization initial Console setup remains an owner-operated step.
- **Audit:** merge exactly evidence/controlled-preparation/audit-delta.proposed.json: IAP ADMIN_READ/DATA_READ/DATA_WRITE, datastore DATA_READ/DATA_WRITE and Storage DATA_READ/DATA_WRITE. Preserve unrelated bindings, exemptions, retention and sinks; use fresh etag, stop on drift. Current policy matches the proposal baseline. Project setIAM and logging.privateLogEntries.list/logEntries.list PASS. Logging can incur cost; the budget is an alert, not a hard spending cap. Actual emitted access records, actor correlation and absence of secrets/content must be checked after authorised enablement; policy settings alone are not audit acceptance.

## Shutdown and rollback

Quaerens Ltd remains accountable. Execution by Codex requires explicit owner authorisation and available permissions. Automatic expiry must not depend on this manual work.

Before each future mutation preserve the exact resource version/etag, narrow delta, verification and rollback receipt. On failed acceptance: revoke/disable temporary and owner Firebase accounts and remove the exact temporary claims; remove the exact owner IAP binding; remove only the service-specific IAP invoker binding and delete/disable access to this newly created Run service. Revoke refresh tokens and verify denied requests using retained sessions. Policy propagation is not immediate, so keep all expiry/application gates intact.

Never roll back expired deny controls to the original timeless rules while accounts or credentials can access data. Retain expired rules by default; any rule restoration requires separate approval and proof it cannot reopen direct access. Keep shared project agents and unrelated IAM bindings. Revert only the reviewed audit additions if separately authorised and after evidence preservation, never delete audit logs or change retention. Clean only synthetic fixtures using documented generation-safe checks. Account/claim deletion and token revocation are not transactionally reversible; do not resurrect credentials to recreate a prior state. Record partial completion and use the same governed operation receipt for safe retry.

## Explicit approvals and earliest safe sequence

1. Approve the distinct temporary bootstrap identity, named human custody, project-local claim ceremony, private credential setup, immediate revocation and the shutdown limitations above. No existing platformAdmin authority can substitute for this decision.
2. Approve exact audit delta and IAP service-agent creation with no unlisted project grant. Verify baseline drift and resource permissions. These preparatory changes do not authorise user access.
3. Resolve the managed expiry acceptance procedure, including persistent sessions/resumable uploads and whether an explicitly approved accelerated rehearsal is required. Review its exact configuration delta before execution. Failure means NO-GO, not acceptance by assumption.
4. Once prerequisites are satisfied, owner confirms T0 and T1 exactly168 hours later. Generate and hash the final startup command, rule candidates, IAP condition and service configuration. Review that sealed bundle; no fixture timestamps may be deployed.
5. Explicitly accept the open HIGH CVE-2026-85091 finding, custom-backport uncertainty and Node binary reproducibility limitation for this digest, owner-only synthetic data, maximum seven days. No scanner finding is suppressed or relabelled fixed. This is not production risk acceptance.
6. Separately authorise the sealed deployment/configuration, rules publication, service-scoped grants, OAuth attachment and Firebase ceremony, with shutdown authority stated. Publish denial controls before access; create the private service with IAP and no user grant; verify identity/configuration; grant only the conditioned owner access, perform controlled bootstrap, remove temporary authority and run managed acceptance. Ordinary synthetic testing starts only after the required checks pass.
7. At expiry verify independent denial, then execute only the authorised shutdown/cleanup. Do not extend the window or admit customers by implication.

No final UTC window is set. No additional cloud change is authorised by this review. Stop here for owner decision.

## Authoritative references reviewed

- https://firebase.google.com/docs/auth/admin/custom-claims — supported privileged claim assignment and token verification; project IAM is not an application claim.
- https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run — native IAP on all ingress paths, service-scoped invoker and no-organization custom OAuth setup.
- https://docs.cloud.google.com/iap/docs/sessions-howto — per-request IAM evaluation and policy propagation limits.
- https://docs.cloud.google.com/iam/docs/service-agents — IAP agent identity and no default role.

The above sources support the design, not proof that proposed cloud changes have already been applied or accepted.
