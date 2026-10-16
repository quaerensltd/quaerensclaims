# CRM4 controlled preparation result — 16 October 2026

Shared CRM Framework. **Private deployment is NOT authorised and remains NO-GO pending the gates below. Production and real-customer use remain NO-GO.** The outstanding HIGH CVE-2026-85091 finding and Node binary reproducibility limitation are unchanged. The scoped synthetic-risk disposition remains conditional.

## Completed authorised cloud action

Only `apikeys.googleapis.com` was enabled in quaerens-crm4-spain-test / 558324850479, using the existing martijnpronk76@gmail.com operator after fresh project/permission verification. The enablement operation completed successfully: `operations/acat.p2-558324850479-e2fe0c71-36ae-4923-836f-19b34f5fcd3e`. Before/intent/completion receipts are in evidence/controlled-preparation/.

The existing browser key was inspected without retrieving its key string. Its only referrer is `https://crm4-spain-test-558324850479.europe-west1.run.app/*`; all 27 API targets exactly match the previously approved saved configuration. No key restrictions changed. Auth protections and project IAM remain unchanged, and the regional Cloud Run inventory remains empty.

API rollback, if separately requested: reread project identity and service state, check dependent API/admin workflows, then disable only apikeys.googleapis.com with dependent-service disabling forbidden. Do not delete keys or revert key restrictions. Stop if other services would need disabling. This rollback was not executed; retaining the enabled API supports authorised read-only management.

## Local validation evidence

- Six preparation tests passed, covering exact sealed configuration activation; rejection of missing approval, wrong project, credential-file use, drift, invalid duration and expired restart; request-time cutoff at the exact boundary; automatic connection shutdown; every rule allow path; and verified-token platformAdmin gating.
- A real loopback HTTP listener stopped accepting connections at expiry without manual shutdown. This validates the wrapper mechanism locally, not Cloud Run lifecycle behavior.
- Fifteen checks passed against fresh demo loopback Auth/Firestore/Storage emulators. The existing framework denied a caller without platformAdmin, created the synthetic owner idempotently with an individually attributable audit trail, kept membership CRM4-only, did not give the target platformAdmin, and disabled access through the governed membership operation.
- Direct Firestore and Storage requests using retained emulator tokens were denied after expiry and before the test window. Existing foreign-workspace denial remained intact. All tests used synthetic fixtures; emulator-only bootstrap claims were never applied to the cloud project.
- All 598 allowlisted application source files still match the sealed build context. No image rebuild or scan occurred. The exact image remains `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`.

An initial local generator assertion expected ten Firestore allow statements instead of the inspected nine. It stopped generation; the assertion was corrected to nine and validation rerun. Storage has three allow statements. No published rules were involved. Full final test outputs and stable source hashes are retained.

## Proposed startup mechanism — validated locally, not activated

`controlled-preparation/startup.cjs` produces a Node -e deployment command using only built-in modules and the existing server. It verifies the exact baked config byte hash, project/number, owner tester and capture-only provider configuration. It changes only deploymentApproved to true and requires the independent CRM4_DEPLOYMENT_APPROVED environment gate. It verifies the resulting config hash before writing a mode-0600, exclusive-create temporary file. It then invokes the existing server and retains its IAP, Firebase and framework checks.

The command adds a request-time window gate and an expiry timer that closes the listener/connections and exits. An expired process restart fails closed. This is a reviewed deployment-command/configuration change, not a new application image; it needs explicit approval of the final serialized command and its hash. It does not silently replace the original image ENTRYPOINT. The proposed Cloud Run command is /nodejs/bin/node with the sealed -e argument, which explicitly calls the existing /app/release/server.cjs.

This replaces the earlier Secret Manager delivery proposal if approved: no Secret Manager API, resource, secret-access grant or OAuth secret in config is needed. Fixed UTC timestamps are deliberately absent from the live proposal. The final command is generated and hash-sealed only after the owner confirms T0 and T1=T0+604800 seconds. Test windows under fixture-candidates/ are labelled fixtures and MUST NOT be deployed.

The baked configuration SHA-256 is `8ee3b8d34ea203461513584b2ac97083c890a754c1292a0d45df78de6e893eb4`. Approved-overlay SHA-256 is `be32ef38127276c3ba875abb2a456acfa70816892df86c8eb768120c312610cc`. Use the executable receipts, not manual transcription, when sealing.

## Independent expiry design

The exact duration validator requires 168 hours. Expiry generation adds the same inclusive start/exclusive end condition to every existing allow statement, including the own-membership read path and catch-all denies. It preserves the original membership, ownership, lead and workspace checks inside the conjunction. Source-hash and allow-count drift stop generation. No extra Firestore reads are introduced into Storage rules.

Automatic layers, each requiring separate publication/configuration approval:

1. IAP service-specific conditional accessor binding for brusseljeroen@gmail.com with the identical T0/T1.
2. Startup request gate and timer, including expired-restart refusal, on the exact immutable image.
3. Firestore and Storage request.time predicates, which deny fresh direct client operations after T1 even with retained tokens.

Manual cleanup is additional assurance, not the expiry mechanism. Quaerens Ltd is accountable; Codex may execute only after explicit authorisation and subject to available permissions. It withdraws exact tester access, disables the approved synthetic account/membership and revokes sessions, stops/removes access to the private service, verifies direct denial and performs generation-safe fixture cleanup while retaining audit evidence.

Limits: final timestamps are pending by owner instruction. Emulator tests validate before/after Firestore and Storage denial; the exact request boundary is separately unit-tested for the application. Managed IAP conditional evaluation, Cloud Run termination, direct live Firebase behavior and pre-existing streaming sessions/in-flight operations remain post-deployment acceptance gates. No claim of live expiry enforcement is made. Previously downloaded/cached synthetic bytes cannot be remotely erased by expiry. Enforcement relies on trusted platform clocks; privileged project administrators remain capable of changing policy and are outside ordinary test-user access.

## Governed owner bootstrap

Confirmed target login: owner@crm4.example.test. Sole Google IAP tester: brusseljeroen@gmail.com. These remain separate identities. No target UID exists in this preparation, no cloud identity was created, and no staff identities are proposed.

The preparation adapter accepts only a revocation-checked Firebase ID token for this exact project with platformAdmin=true and the separately approved actor UID. It invokes the existing governed handler with the fixed owner email, administrator role, CRM4 workspace and active membership. It never mints claims, trusts caller-supplied claims, substitutes provisioner IAM for platformAdmin or writes membership documents directly. Local tests do not prove an authorised bootstrap actor exists in the cloud project.

**Blocker:** identify an already authorised project-local platformAdmin actor, or separately approve a precise initial-bootstrap ceremony. Any alternative that temporarily gives the single synthetic owner identity project-local platformAdmin must be explicitly reviewed with initial account creation, secure password handling, verified sign-in, governed handler execution, removal of that claim, refresh-token revocation and audit receipts. It is NOT authorised by approval of the email alone. No second identity or project-wide/cross-CRM authority is silently added. Do not use a handcrafted request.auth object to bypass the real token check.

Because the target email is synthetic and providers are mocked, password setup cannot depend on actual email delivery. A separately approved owner-only credential entry procedure is required; no password/reset link should appear in chat, Git, logs or provider captures. The framework's existing false-delivery capture evidence remains preserved.

## Exact pending cloud deltas

`evidence/controlled-preparation/deployment-deltas.proposed.json` records the unchanged image, service, runtime identity, owner email, controls and null window/UID fields. `audit-delta.proposed.json` records an additive audit policy proposal against current etag BwZdwDu5QJg=, preserving all bindings, unrelated audit settings/exemptions and existing retention:

- iap.googleapis.com: ADMIN_READ, DATA_READ, DATA_WRITE.
- datastore.googleapis.com: DATA_READ, DATA_WRITE (Firestore configuration uses this service name).
- storage.googleapis.com: DATA_READ, DATA_WRITE.

No audit change was applied. Actual access-event visibility, reviewer permissions and absence of secret/document-content leakage must be verified after explicit configuration approval; these are not yet PASS.

Private Cloud Run remains crm4-spain-test, europe-west1; 1 CPU, 1 GiB, min 0/max 2, concurrency 8, timeout 120 seconds; native IAP and invocation IAM checks; no public principal. Proposed grants remain IAP agent -> roles/run.invoker on this service only, and owner Google identity -> conditionally time-limited roles/iap.httpsResourceAccessor on this regional IAP service only. The IAP agent does not yet exist; any required service-agent creation/default grant must be reviewed explicitly. Existing OAuth client only, owner-private secret input. No provider secrets or live email/payment/AI configuration.

## Stop point and approvals still required

API/key inspection is PASS. Startup/expiry/bootstrap mechanisms have local evidence; they are NOT cloud acceptance. Remain stopped before account creation, claim changes, IAM grants, audit changes, rule publication, configuration activation and deployment.

Next decisions are the named bootstrap authority/credential ceremony and review of the exact local mechanisms and cloud deltas. Once prerequisites are satisfied, the owner confirms fixed UTC T0/T1 immediately before final authorisation; regenerate final command, both rule candidates and IAP condition from that one window, hash them and obtain separate approval. Verify IAP/OAuth, live audit, independent Firebase authorization, expiry/streaming behavior and shutdown in the newly deployed integration before allowing ordinary owner testing. No production or real-customer operations are included.
