# CRM4 OAuth secret correction — approval request, not execution

## Evidence and decision

Owner reports that the checksum-verified private comparison returned MISMATCH. This is owner-executed evidence, not an independently observed run. It establishes that the entered bytes differ from the IAP fingerprint read by the script. It does not establish which value belongs to the enabled Google OAuth client. Wrong private credential selection, quoted/padded input or a previously submitted wrong value remain possible. No secret or fingerprint was supplied to Codex. Redirect URI remains PASS based on final owner Console verification; configured public client ID was independently verified previously.

Minimum proposed correction: one service-scoped secret-only IAP settings PATCH using the existing enabled replacement, followed by independent GET verification. No credential generation or rotation. No browser retry or Firebase provisioning included in this request. No cloud operations were performed during this preparation.

## Exact boundary

- Project quaerens-crm4-spain-test; number 558324850479.
- Operator martijnpronk76@gmail.com; owner supervision brusseljeroen@gmail.com.
- Resource projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test.
- Client ID 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com, unchanged.
- Redirect https://iap.googleapis.com/v1/oauth/clientIds/558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com:handleRedirect, unchanged.
- Image sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb, unchanged.
- Test expiry 2026-10-24T09:00:00.000Z; containment deadline 2026-10-24T10:00:00.000Z, unchanged.

## Controlled private procedure

1. Owner privately confirms the held value is the enabled replacement belonging to the exact approved Web OAuth client. Use existing private custody/provenance only. Do not ask for it in chat, inspect credential stores, retrieve it through an API, download another credential or rotate anything. If provenance cannot be established, STOP; MISMATCH alone is insufficient grounds to overwrite IAP.
2. Before execution, provide an uploadable, checksum-sealed correction helper with offline tests. Do not reuse the initial full-settings submission script or remove its duplicate-attempt marker. The reviewed transaction below is the sole permitted mutation; helper implementation must conform exactly and pass local tests before owner execution. No executable cloud correction is issued by this document.
3. Fresh read-only preflight immediately before submission: exact active project/number/operator, native IAP service, assessed image, runtime identity and unchanged public settings. Read current Run and IAP policies with conditions/etags; compare against approved receipts. Run invoker must contain only the IAP service agent; owner IAP binding must retain the exact 168-hour expression. Preserve rule-release names/source hashes, existing audit state and account inventory using secret-filtered reads. Stop on denial, drift, unexpected accounts or expiry; no new grants to overcome a failed read.
4. Establish a private supervised change interval with no other settings writer. Read IAP settings into process memory only. Retain non-secret public comparison baseline; fingerprints must never enter receipts. The documented settings resource has no etag-based compare-and-swap facility; immediate re-read plus a single operator reduces but cannot eliminate a concurrent-writer race. Stop on any detected drift.
5. Owner enters the existing replacement twice via masked terminal input, with no command argument, environment variable, file, transcript or shell-history value. Require exact equality. Reject leading/trailing whitespace, CR/LF and surrounding quotation marks; never silently trim/transform. Disable core dumps and HTTP/debug logging, suppress response/error payloads and refuse redirects. Python process memory cannot be guaranteed securely erased; retain the previously accepted private-host limitation.
6. Compare privately with the current stored fingerprint before any write. If already MATCH, perform no mutation and report ALREADY_MATCH. If the value is confidently the correct enabled replacement and remains MISMATCH, obtain the explicit private confirmation to execute the approved transaction. Recheck all preflight state after input. A restrictive local non-sensitive attempt marker must be created before the single network submission, blocking accidental repeats. No automatic retry, including on timeout.
7. Submit one PATCH below with only the secret field in the update mask. Input value and body exist only in memory. Do not use shell-variable interpolation or a secret-bearing JSON file. Reject an unsupported mask or permission denial; never fall back to a full-settings replacement, broader mask or new IAM grant.
8. Discard the write response body without printing or persisting it. Perform separate GET reads of the public client ID and stored fingerprint, and compare privately with the intended input. Require MATCH. Independently compare all public IAP settings, service configuration, Run/IAP IAM policies and expiry controls with the fresh baseline. Secret/fingerprint must not be included in the sanitised evidence. Verify the narrowly scoped update audit entry and operator attribution without exporting request payloads.
9. Owner runs the existing checksum-verified read-only comparison helper as a separate process and reports only MATCH/MISMATCH/INCONCLUSIVE. A successful PATCH or a fingerprint MATCH alone is not proof that Google will accept the credential. Codex independently checks non-sensitive public settings/policies/audit evidence. STOP after verification; no browser authentication or owner provisioning until the required checks pass and continuation is explicitly authorised.

## Exact proposed transaction (not an executable command)

Method: PATCH

Endpoint:
https://iap.googleapis.com/v1/projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test:iapSettings

Query:
updateMask=iapSettings.accessSettings.oauthSettings.clientSecret
fields=name,accessSettings.oauthSettings.clientId

Body shape, constructed only in private process memory:

```json
{
  "name": "projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test",
  "accessSettings": {
    "oauthSettings": {
      "clientSecret": "<PRIVATE MASKED INPUT; NEVER STORE THIS BODY>"
    }
  }
}
```

The update mask uses the fully qualified iapSettings prefix documented by updateIapSettings. The client ID is checked before/after but is deliberately excluded from the mutation. Google documentation has inconsistent custom-OAuth sample field names; use the actual OAuthSettings clientSecret field. An API rejection is a STOP, not permission to experiment with masks. Existing permission iap.webServices.updateSettings is required on the service; success of the earlier write is historical evidence only, not fresh proof of continued permission. Read permissions are also required; do not broaden IAM.

## Failure, recovery and evidence

- Before submission failure: no mutation; stop.
- Timeout/uncertain submission: do not retry. A separate safe read must determine current fingerprint and public state. Return INCONCLUSIVE until established.
- Read-back mismatch, public drift or failed independent verification: NO-GO; preserve sanitised evidence and request the minimum next action. Do not claim rollback or containment occurred.
- The old configured secret cannot be reconstructed from its SHA-256 and will not be retrieved. Automatic restoration is therefore unavailable. Do not rotate or restore an unknown/non-working value. Keep IAP and invocation checks enabled. Previously documented access withdrawal/service shutdown is a separately controlled containment action, not an automatic part of this secret-only approval.
- Never save a fingerprint, raw API body, credential, auth token or OAuth callback URL. Permitted receipt: script checksum, UTC attempt time, exact resource/client ID, result label, non-sensitive policy comparisons and audit correlation metadata.
- Rules, IAM, Cloud Run, audit configuration, OAuth client metadata and all other projects receive no writes. Open HIGH finding, Node reproducibility and Firebase incident limitations remain; production and real-customer use remain NO-GO.

## Approval requested

Approve one owner-private, secret-only update of the named CRM4 native-IAP service to the existing enabled replacement for the unchanged client, with fresh preflight, one-attempt safeguard and independent read-back. No rotation, additional IAM, browser retry or Firebase provisioning. Execution remains conditional on owner provenance confirmation and checksum-sealed helper validation. This document records a prepared procedure, not a submitted correction or tested live patch.

References:
- https://docs.cloud.google.com/iap/docs/reference/rest/v1/TopLevel/updateIapSettings — explicit updateMask required to avoid replacing all settings; PATCH and resource-scoped permissions.
- https://docs.cloud.google.com/iap/docs/reference/rest/v1/IapSettings#OAuthSettings — clientSecret input-only; clientSecretSha256 output-only.
