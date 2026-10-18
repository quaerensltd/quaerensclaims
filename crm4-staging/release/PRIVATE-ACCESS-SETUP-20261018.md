# Private access setup — 18 October 2026

**Scoped grants verified. PAUSED for owner-private OAuth entry; browser readiness not yet established.**

Fresh preflight and access-preflight verified the exact project/number, existing operator permissions, no Firebase users, current project IAM/audit policy, published expiry-rule source hashes, and the running service's exact sealed image, command, arguments, environment and runtime identity. Native IAP is enabled and invocation IAM checking is not disabled. Both resource policies were empty before mutation.

Applied only the two sealed grants:

- Cloud Run resource projects/quaerens-crm4-spain-test/locations/europe-west1/services/crm4-spain-test: roles/run.invoker to serviceAccount:service-558324850479@gcp-sa-iap.iam.gserviceaccount.com. Independently read back exact binding.
- IAP resource projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test: roles/iap.httpsResourceAccessor to user:brusseljeroen@gmail.com, condition title crm4_synthetic_window and exact request.time window 2026-10-17T09:00:00.000Z through exclusive 2026-10-24T09:00:00.000Z. Independently read back using the approved email-only case comparison; resource, role and condition unchanged.

Cloud Logging returned successful SetIamPolicy audit events for both resources, attributed to martijnpronk76@gmail.com. Only sanitised operation metadata was retained. This verifies grant-operation audit visibility; it does not substitute for later IAP access-decision and Firebase membership audit acceptance.

No public or additional grant, identity creation, claim change, rebuild, scan, rule or audit update occurred. Exact assessed image remains sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. Capture-only provider configuration remains sealed. CRM2/3/5 and production unchanged.

## Private handoff

Owner requested to attach the existing approved OAuth client through the private Console service setting; do not create another client, generate a secret or disclose credentials. Existing client ID: 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com. No secret has been handled or retrieved by the agent. Await owner completion or description of unavailable service-level UI before dependent work.

After OAuth configuration: read only the public client ID, verify native IAP owner access and anonymous/unauthorised denial, then execute the approved two-identity governed bootstrap with private password entry. Immediately remove bootstrap platformAdmin, revoke tokens and disable the bootstrap identity. Verify independent Firebase owner membership/login, retained-token rejection and individual audit evidence before declaring dashboard readiness. No Firebase accounts exist as of the preflight and none were created during this stage.

This is a required private-input pause, not a failed security gate. Do not execute containment merely because private entry is pending. If a mandatory gate subsequently fails, use the corrected independently verified withdrawal procedure while the service is readable, followed by scoped shutdown. Fixed expiry 24 October 2026 09:00 UTC and containment deadline 10:00 UTC unchanged.

HIGH CVE-2026-85091, Node reproducibility limitation and Firebase incident remain open. Synthetic-only restrictions continue. Production and real-customer use remain NO-GO. No verified browser login URL is issued yet.

Evidence: evidence/private-access-20261018/access-preflight.json, invoker-before/applied/verified.json, iap-access-before/applied/verified.json and access-audit-observation.json.
