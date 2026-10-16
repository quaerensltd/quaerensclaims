# Fresh preflight and sealing hold — 16 October 2026

Base: e15a60c6. Shared CRM Framework. **NO-GO; no execution bundle issued.** No cloud mutation, account creation, IAM change, rule publication, deployment, build or scan occurred.

## Proposed supervision and window

Technical operator: martijnpronk76@gmail.com. Private owner/IAP supervisor: brusseljeroen@gmail.com. Proposed live slot: 2026-10-16T13:30:00.000Z through 2026-10-16T14:00:00.000Z. Both participants' actual availability remains to be confirmed. Intended policy window would be 2026-10-09T14:00:00.000Z through 2026-10-16T14:00:00.000Z (exactly 168 hours); proposed containment deadline 2026-10-16T15:00:00.000Z. These are unactivated proposals, not sealed or approved timestamps. If the slot is missed, obtain a new supervised slot rather than reuse it.

## HTTP 403 diagnosis and resolution

The three denied read endpoints reported PERMISSION_DENIED/SERVICE_DISABLED because the request did not specify a quota project. Google selected its CLI shared consumer project 32555940559, not the CRM4 project. This was a diagnostic request construction error, not evidence that CRM4 APIs were disabled or IAM needed expansion.

Using request-scoped `x-goog-user-project: quaerens-crm4-spain-test` resolved all three reads to HTTP 200. Existing `serviceusage.services.use` was verified. No gcloud/ADC saved configuration, API state or IAM policy was changed. Official procedure: https://docs.cloud.google.com/docs/quotas/set-quota-project . The initial denied receipts are retained in sanitized form alongside the corrected results.

Fresh corrected reads verify exact project ID/number, operator, immutable image, unchanged project/bucket policies and rules release identifiers, absence of Firebase users and Cloud Run services, absent IAP service agent, required project permissions including run.services.update, runtime actAs, and bucket LIST/DELETE. Auth password sign-in, disabled client signup/deletion and enumeration protection remain enabled as required. Browser-key restrictions match the earlier baseline. Object GET was not requested or granted. Policies must still be re-read immediately before any separately approved mutation.

## Diagnostic security handling incident — stop condition

The Auth GET response included password-hash signing configuration. The diagnostic code initially saved the full response locally and a subsequent inspection inadvertently printed that response into this task's tool output. No password or OAuth client secret was requested; nevertheless this signing configuration is sensitive and should not have been captured. The assistant takes responsibility for this handling error.

Local evidence files have been overwritten with an explicit allowlist of non-sensitive configuration fields before Git staging. The sensitive response was never committed or pushed. This does not retract prior task output or prove erasure from host/tool retention. Do not copy the affected output into tickets, Git or other reports. No affected Firebase users currently exist, as independently verified by the successful inventory read, but that does not justify dismissing the exposure.

The reader now requests only approved fields at the Auth API and applies a nested output allowlist. Two local tests verify a fictional sensitive sentinel is excluded and the request field mask is present. No further cloud calls followed discovery. No rotation, permission change, key change or incident-response mutation has been attempted.

Owner/security review of the exposed test-project Auth signing material and the task output's access/retention is required before further sealing or identity creation. Determine whether restricted-output handling and a documented disposition suffice or whether Google-supported remediation is needed; do not assume browser API-key rotation remedies password-hash signing-material exposure. Any cloud remediation requires its own exact approval. This report contains no sensitive value.

## Decision and next approval

The original 403 checks are resolved. The new security-handling incident is an unresolved readiness blocker, so this turn stops before canonical execution sealing as required by the security-stop condition. The approved scope (fictional portal identity, governed workflows, one canary, bounded service-level restart stimulus and containment) remains recorded in the conversation; none is executed.

After incident disposition, reconfirm participant availability and a valid slot, refresh the relevant read-only checks, then produce the complete timestamped manifest and reviewable deltas. Only then request explicit approval naming its SHA-256, execution scope and containment deadline. No request for execution approval is appropriate now.

Exact image remains sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. Open HIGH CVE-2026-85091 and Node binary reproducibility limitations remain. No CRM2/CRM3/CRM5 or production resource was accessed or modified. Production and real-customer use remain NO-GO.
