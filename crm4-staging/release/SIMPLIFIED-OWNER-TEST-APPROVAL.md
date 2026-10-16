# CRM4 Spain — simplified owner browser test approval

Baseline: 0763742e. Preparation only; no cloud changes. Shared CRM Framework preserved.

**Ready for conditional execution approval. Not deployed and not cloud-browser accepted.** Current preflight passed at 2026-10-16T14:58:21.106Z: exact project/image, unchanged project and bucket policies/rule releases, zero Firebase users, zero Cloud Run services, existing Auth/domain/key restrictions, required operator permissions and runtime actAs. IAP agent is absent as expected. Historical OAuth configuration is owner-verified; the replacement secret remains in owner custody, never retrieved here.

## Fixed proposal and scope

- Project: quaerens-crm4-spain-test / 558324850479; region europe-west1.
- Test window: **16 October 2026 16:00 UTC through 23 October 2026 16:00 UTC**, exactly 168 hours (18:00 Madrid at both ends). This replaces the compressed rehearsal proposal. No activation before approval/start; do not silently extend or shift it if missed.
- Technical operator: martijnpronk76@gmail.com. Sole Google IAP tester: brusseljeroen@gmail.com.
- Only bootstrap@crm4.example.test and owner@crm4.example.test may be provisioned. The fourth identity's approved risk scope remains recorded in the conversation but grants no provisioning authority in this proposal. No portal/workflow identities or case fixtures.
- Exact image: europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb.
- Initial activity: inspect the owner dashboard and navigation using fictional data only. Full case/portal journeys await separate workflow provisioning approval.

## Exact mutations requested

1. Create Cloud Run **crm4-spain-test** from the image above with the existing validated startup command: nonroot image, dedicated crm4-runtime service account, one CPU/1 GiB, min 0/max 2, concurrency 8, timeout 120s. Native IAP on; invoker IAM checks on. The internet-reachable ingress is protected by IAP and IAM; no allUsers/allAuthenticatedUsers grant. Origin: https://crm4-spain-test-558324850479.europe-west1.run.app. Startup activates only the known non-secret config hash and preserves capture-only providers.
2. Generate only the missing Google-managed IAP service identity, service-558324850479@gcp-sa-iap.iam.gserviceaccount.com. Grant it **roles/run.invoker on this service only**. Grant **roles/iap.httpsResourceAccessor** only to brusseljeroen@gmail.com on this service's IAP resource, conditioned on the exact window. Stop on any unexpected automatic project-level grant; no broad grants are requested.
3. Bind the existing OAuth client 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com using owner-private Console secret entry. Preserve its saved matching IAP redirect URI. Do not create another client or retrieve/disclose its secret. Owner confirms existing client/secret availability at execution.
4. Publish the two attached expiry rule candidates to the existing Firestore and Storage releases. Every original allow predicate is retained and conjoined with the UTC window. No Auth-domain, API-key, index, bucket-retention or provider changes.
5. Merge only Data Access audit categories: IAP ADMIN_READ/DATA_READ/DATA_WRITE; datastore DATA_READ/DATA_WRITE; Storage DATA_READ/DATA_WRITE. Preserve all other IAM, exemptions, sinks and retention; reread policy/etag before application. Audit logging and Cloud Run may incur usage charges; no build or scan charge is requested.
6. Through the reviewed private credential ceremony, create the temporary bootstrap with project-local platformAdmin and no CRM membership/IAM/IAP; use genuine authentication and crm4AdminCreateUser to create owner Administrator. Set unique private passwords. Immediately clear bootstrap authority, revoke refresh tokens and disable it; verify retained-token and refresh rejection. The permanent owner gets no administrative custom claim and no cross-CRM membership.

Exact JSON/rule bytes: `evidence/simplified-owner-test/`. Canonical proposal SHA-256: `02278a463d956f043240953e08dc5258482ee7d98c6dda05be56243525cd4c8d`. SHA256SUMS.json binds all proposed artifacts and redacted preflight. Approval flags remain false. Actual account UIDs must come from verified creation receipts and matching membership audits, never fabricated IDs. Execution approval must identify this proposal and permit those receipt-derived UID substitutions plus approval metadata only; all configuration bytes/window stay fixed.

## Acceptance and shutdown authority requested

Before owner inspection: verify exact deployed digest/config/runtime identity; sole-tester IAP and anonymous denial; no public invoker; Firebase owner login and governed CRM4 membership; bootstrap revocation; exact published rule hashes; capture-only providers; visible individually attributable operator/membership audit. Stop and contain on failure. No additional identity is needed to inspect IAM policy or exercise anonymous/invalid-token rejection.

Authorise immediate containment on failure, owner request, or test end: revoke and disable the two exact receipt-bound synthetic identities; remove only the conditioned owner IAP binding and the service agent's service-level invoker binding; delete only the verified crm4-spain-test service (checking image and current etag). Preserve audit/account history, existing infrastructure and expired rules. No account deletion, wildcard data cleanup or restoration of timeless access is requested. No case records are authorised for this initial inspection, so no specialist fixture-cleanup programme is needed. Unexpected records/resources are reported and left untouched behind revoked access pending specific approval.

Containment authority ends **23 October 2026 17:00 UTC**. Technical execution requires the authorised operator/available permissions; independent configured expiry does not rely on a manual shutdown occurring. If containment cannot be verified, report failure and request a specific remedy, never broaden permissions. Do not delete the service agent or undo unrelated audit changes as part of rollback.

## Evidence, limits and decision

The uncommitted fourth-identity rehearsal drafts were preserved under local ignored `.scratch/deferred-rehearsal-drafts-0763742e/` and removed from the active path; committed owner-only tools were restored. **30/30 existing startup, expiry, bootstrap and redaction tests passed.** Prior workflow/security evidence remains unchanged. No rebuild, rescan, cloud mutation or credential handling occurred.

Expiry is configured and locally validated, not demonstrated across every managed in-flight operation. Forced restarts, canary writes, persistent listeners, resumable uploads crossing expiry and deadline-specific native-IAP session correlation are explicitly deferred, not PASS. The owner-approved simplification must not be represented as completed specialist assurance.

The HIGH CVE-2026-85091, Node binary reproducibility limitation and Firebase incident/provider-retention uncertainty remain open under the accepted synthetic-only scope. Production and real customer use remain NO-GO.

**Genuine remaining gates:** explicit approval of these mutations/window/containment; fresh drift checks immediately before execution; owner-private OAuth/password entry; successful first deployment and the short acceptance list above. No new functional-code blocker was found. The next action is approval, then deployment integration—not further rehearsal construction.
