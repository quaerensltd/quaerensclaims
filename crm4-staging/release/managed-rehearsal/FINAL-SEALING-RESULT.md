# Final timestamped rehearsal review — 16 October 2026

Shared CRM Framework. Continue from74d37bce. **NO-GO for rehearsal execution.** A timestamped configuration candidate is sealed, but this is not an assertion that all managed acceptance probes are executable under the currently approved identity scope. The blockers below are concrete and must be resolved before a complete execution bundle can be approved. No cloud mutation or real password/secret handling occurred.

## Proposed window (inactive)

- Supervised execution: 2026-10-16 11:00:00 UTC through11:30:00 UTC, approximately30 minutes.
- Policy R0: 2026-10-09T11:30:00.000Z.
- Policy R1: 2026-10-16T11:30:00.000Z.
- Difference: exactly604800 seconds /168 hours.
- Proposed containment authority deadline: 2026-10-16T12:30:00.000Z.

These are proposed times only; no grant/rule/service activates them. No deployment before11:00 or after the candidate expires. If supervision/approval is not ready by11:00, regenerate and reseal a fresh candidate; never silently extend or run a shortened acceptance period. This is not the final seven-day owner test window.

Canonical manifest: evidence/rehearsal-final-sealing/canonical-manifest.json. Separate generated Cloud Run, IAP, rules and audit artifacts have matching hashes in bundle-seal.json. executionApproved and containmentApproved remain false. A hash is integrity evidence, not approval.

## Fresh read-only results

Project ID/number and exact assessed image verified. Project IAM unchanged at etag BwZdwDu5QJg=; auditConfigs empty. Bucket IAM matches prior evidence. No Firebase users or regional Run services; IAP agent absent. Auth password-only restrictions and enumeration protection remain in place. Current key restrictions and rules-release identifiers retained without key-string retrieval. Current policies are evidence, not permission to overwrite them later.

The complete project permission query and runtime actAs check passed except Storage object permissions at project scope. Bucket-scoped test then established object LIST and DELETE are granted; object GET is not. Cleanup now verifies absence by listing the exact object name after a generation-conditional delete, so no new object-read grant is needed for cleanup. No IAM expansion is proposed as a workaround. Fixture provenance/generation receipts are mandatory; listing alone does not authorise deletion.

## What is locally validated

19 local tests cover approval rejection, masked input, synthetic browser ceremony, bootstrap revocation, timeout cleanup authority, exact configuration generation, missing/limited/inconclusive probe failure, containment refusal without approval, and generation/update-time cleanup guards. The earlier7 loopback genuine-token/bootstrap checks remain preserved; no reason to repeat them for this preparation-only update. All original assessed runtime/framework control sources remain unchanged.

Passwords are accepted only through a private non-echoing TTY or browser password input; tooling accepts no password/token arguments. Generic failure output does not dump SDK request objects. No credentials or tokens are written to Git, files or receipts. Tests exercise synthetic secret strings and verify no echo/returned token. This cannot guarantee secrecy against a compromised host, browser extension, memory dump, enabled developer-network capture or external recording. Private custody and disabled capture remain mandatory. The real managed browser/CSP/SDK integration is not yet verified.

## Blocking review findings

1. **Storage fixture mismatch.** Original rules deny all direct reads. The previous required positive direct-read baseline was impossible; it has been corrected to an always-denied access-control check, explicitly NOT expiry proof. Direct client upload additionally requires email_verified=true, a matching case clientUid, ACTIVE access and CRM4 markers. The approved owner is created emailVerified=false, without such a client fixture. The previous probe also used disallowed application/octet-stream; it now uses permitted text/plain. None of those fixes creates a lawful positive resumable baseline for the current owner automatically.
2. **Required fixture decision.** Do not silently mark the owner verified, repurpose its ownership, add a client or change rules. Recommended additional proposal: a separate synthetic portal-client identity, operated only by the same supervised owner, no CRM membership/IAM/additional IAP grant, verified-email test state and a CRM4-only linked case established through the governed portal workflow. Its exact identity/verification/case fixture requires separate review and approval. Alternatively retain the two-identity scope and mark resumable expiry BLOCKED; this does not satisfy the requested full acceptance.
3. **IAP evidence ambiguity.** A403 from the URL could come from the application window gate rather than native IAP. Browser observation now requires native IAP decision evidence before PASS. A login redirect is inconclusive. No assumed attribution.
4. **Listener and restart evidence.** A bounded no-event observation cannot be treated as unconditional session-expiry proof. Successful post-deadline canary write and observed listener state are required. An expired restart must actually be observed with the exact revision/configuration; lack of traffic-induced restart is not PASS. No forced redeploy or instance change is included without explicit approval.
5. **Execution integration remains supervised.** Every required callback name is bound by probe-bindings.cjs to strict redacted observations; absent/duplicate/unverified receipts fail. This does not automatically collect all platform-specific evidence or certify an unknown fixture. The runtime fixture IDs, canary receipt, document ticket and native IAP/restart/audit observations still require actual authorised execution and operator correlation. Do not describe those observations as already validated.

No failed or inconclusive observation may be upgraded by editing a boolean in a receipt. Receipts must be correlated to actual server events. acceptance.cjs now rejects limitedObservation and inconclusive states, and containment exceptions produce an explicit failed result.

## Exact proposed mutation list (none executed)

1. Merge only the sealed audit categories into fresh project IAM: IAP ADMIN_READ/DATA_READ/DATA_WRITE, datastore DATA_READ/DATA_WRITE, Storage DATA_READ/DATA_WRITE. Preserve bindings/exemptions/sinks/retention.
2. Generate only the IAP service identity; stop on unexpected default grants. Create only crm4-spain-test in europe-west1 from the assessed digest, existing runtime identity and sealed startup command. Native IAP and invoker IAM checks enabled; no public accessor/invoker; capture-only providers.
3. Attach only existing OAuth client558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com, via owner-private secret entry. No client/key/domain/provider changes.
4. Add IAP agent roles/run.invoker on this one Run service. Add only brusseljeroen@gmail.com service-specific IAP accessor with the sealed R0/R1 condition. No project-wide invoker or extra tester.
5. Create and publish only the generated CRM4 Firestore and bucket rules with the original predicates conjoined to the exact policy window. No retention/index/other-CRM change.
6. Create bootstrap@crm4.example.test and assign its temporary project-local platformAdmin claim; invoke governed owner creation through genuine Firebase/IAP authentication; set owner@crm4.example.test password privately. Never give owner platformAdmin or bootstrap CRM membership. Resolve server-generated UIDs only by the exact named emails and verify creator/target receipts. The existing self-update prohibition remains unchanged.
7. Start the approved bootstrap watcher before the browser ceremony. Immediately remove claim/revoke/disable on membership creation, timeout or failure, then verify retained-token/refresh rejection. No automatic re-elevation.
8. Create/update only separately approved synthetic fixture records/objects, including exact canary update after expiry. The additional portal-client fixture is NOT included as approved scope in this candidate.
9. Approve containment explicitly: bootstrap claim removal/revoke/disable; owner revoke/disable; exact conditioned IAP binding withdrawal; service-specific IAP invoker removal; deletion of only this Run service after image/identity verification; generation/update-time conditional synthetic cleanup. No account deletion, audit-log deletion, timeless-rule restoration or unrelated agent/policy modification.

## Executable containment and cleanup

Existing credentials.cjs supports create-bootstrap, watch-bootstrap, revoke-bootstrap and set-owner-password using the checked manifest hash. Cloud-containment operations verify exact project/image and per-action authority, then perform owner disable, narrowly matched IAM removal and service deletion. containment.cjs independently attempts each explicitly approved action and records failure/absence of authority.

cleanup.cjs accepts only recorded resources from fixtureRunId, explicit createdByThisRun receipts, exact approved bucket and case prefix, and only crm4Leads/<runId> or clientPortalCases/<runId> document paths. It refuses membership/audit paths and unknown generations. Object deletes use ifGenerationMatch; documents use currentDocument.updateTime. Changed resources cause failure, never wildcard deletion. Object absence uses permitted LIST; documents require404. Soft-deleted objects retain the existing retention period. No deletion of soft-delete history is proposed.

The final operator adapter must bind api/auth/guard/receipt to the existing authorised operator and preserve restricted before/after receipts. Missing adapters or failed containment never report success. No credentials are embedded in manifests. Cleanup authority ends at the separately approved deadline; if missed, request new narrowly scoped containment authority rather than silently extending it.

## Owner actions and approval request

Owner must supervise the private browser, retain private password custody, enter the existing replacement OAuth secret directly in Console, confirm the operator and available window, review residual risk and explicitly authorise the sealed mutation/containment list. Existing operator is martijnpronk76@gmail.com; sole Google tester remains brusseljeroen@gmail.com. These are distinct responsibilities. Credentials must not be supplied in chat.

First resolve the portal-client fixture and managed evidence criteria above. Then regenerate this candidate if its proposed slot has elapsed and obtain separate approval naming the final bundle SHA-256, supervised window, exact mutations and bounded containment authority. **I do not recommend approving execution of the current blocked candidate.** This report requests review of those prerequisites; it does not ask the owner to waive failed security controls.

Open HIGH CVE-2026-85091 and Node binary reproducibility limitations remain unchanged. Any subsequent risk acceptance is synthetic-only, time-limited and digest-specific; production/real customers remain NO-GO. STOP before any cloud mutation.
