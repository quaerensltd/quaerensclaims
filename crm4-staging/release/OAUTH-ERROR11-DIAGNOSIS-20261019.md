# IAP OAuth Error 11 — read-only diagnosis, 19 October 2026

**NO-GO for owner login/bootstrap. No cloud changes performed.** Current user instruction requires read-only diagnosis and stopping before corrections; no containment mutation, credential change or Firebase provisioning was performed.

## Verified

- Correct CRM4 project quaerens-crm4-spain-test / 558324850479.
- Native Cloud Run IAP public settings contain the exact approved client ID: 558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com.
- An unauthenticated application request returns 302 to accounts.google.com. Its public client_id is the same approved ID. Its redirect_uri is exactly https://iap.googleapis.com/v1/oauth/clientIds/558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com:handleRedirect. Cookies, state and authorization codes were discarded, not recorded.
- IAP owner policy and Cloud Run invocation policy, including etags, match the previously verified receipts exactly. The sole owner condition still ends 24 October 2026 09:00 UTC.
- IAP audit logs are readable. GatekeeperAuthorizer.AuthorizeUser events include status code 7 and accessViaIAP granted:false. Several overlap our anonymous probes. The selected records have no principal email and therefore cannot be conclusively attributed to the owner's Error 11 browser event. They do not independently establish a secret mismatch. The successful owner-operated UpdateIapSettings event is recorded at 09:44:32 UTC under martijnpronk76@gmail.com.

## Unresolved metadata and suspected cause

The client was previously owner-verified as a Web application with the exact saved redirect. That historical declaration is not a fresh API verification of client status/type/redirect. The owner has been asked to inspect these metadata and the replacement secret's enabled status privately in Google Auth Platform, without revealing any credential.

Installed gcloud explicitly marks iap oauth-clients deprecated and shut down, and documents that it is not a generic OAuth client management API. The IAM oauth-clients API manages Workforce Identity Federation clients, not this Google Auth Platform web client. Neither was used to retrieve credentials or treated as an authoritative lookup for this client.

Google's Error 11 guidance says to check both client ID and secret. Our evidence excludes a literal mismatch in the configured public client ID and the emitted OAuth request. Successful consent and redirect (owner report) suggests Google recognises the client and accepts the redirect, but does not conclusively prove all current client metadata. A mismatched, mistyped or disabled client secret is a leading remaining credential hypothesis. It is NOT confirmed. A stale browser flow or IAP-side issue remains possible. No secret, secret hash or credential file was retrieved.

## Minimum safe next step and correction boundary

First complete the private metadata check: exact client ID, Web application, exact saved redirect URI and enabled replacement secret associated with that client. Do not create or rotate credentials. If metadata matches, a proposed read-only owner-private comparison of the privately held replacement against IAP's documented clientSecretSha256 can establish whether the submitted value matches that held value, returning only match/no-match. Such a comparison would still not prove the held value is the correct active secret for the client. It has not been prepared or executed here and must not disclose the secret or hash.

If a mismatch is established, seek approval to re-enter only the correct existing active replacement for this client on this service, preserving all other settings and policies. The current upload script deliberately blocks duplicate submissions; do not remove its marker or rerun it to bypass that guard. Prepare a separately reviewed corrective entry path only after the discrepancy is established and correction approved. If all metadata and the privately held/submitted value match, do not rotate speculatively; pursue sanitised Google support diagnosis or a fresh private browser flow first. No raw HAR, callback URL, code, cookie or secret should be shared.

Original image, synthetic-only restrictions, expiry/containment deadlines, HIGH finding, Node reproducibility and Firebase incident remain unchanged. Production and real-customer use remain NO-GO.

Sources:
- https://docs.cloud.google.com/iap/docs/faq — Error 11 requires checking client ID and secret; redirect-stage troubleshooting.
- https://docs.cloud.google.com/iap/docs/custom-oauth-configuration — web client redirect format and service-level settings.
- https://docs.cloud.google.com/iam/docs/reference/rest/v1/projects.locations.oauthClients — Workforce Identity Federation API, not the Google Auth Platform client.

Evidence: evidence/oauth-error11-20261019/read-only.json, public-redirect.json and authorizer-summary.json.

## Updated owner Console declaration

The owner freshly confirms Web application type, matching approved client ID and Enabled replacement secret; no settings changed. The owner describes the displayed redirect as ending in apps.googleusercontent.com. This does not confirm the required :handleRedirect suffix and may reflect UI truncation. The complete saved public URI has been requested without any secret or screenshot. Treat saved redirect correctness as unresolved until the full value is compared. IAP emits the full expected URI including :handleRedirect. If the saved value actually lacks that suffix, this is a concrete configuration discrepancy requiring a separately approved correction; it is not yet established as the cause of Error 11.

## Final owner redirect verification and submission-path review

Superseding the unresolved redirect entry above: the owner confirms copying the complete saved redirect directly from Console and comparing it exactly with the expected URI. Redirect check: PASS (owner-verified Console evidence, not independently verified API evidence). Web application, matching client ID and enabled replacement secret are also owner-confirmed.

Local review of owner-oauth/crm4-oauth-private.py confirms that the submitted JSON pairs the fixed approved clientId with the masked input as clientSecret in accessSettings.oauthSettings, scoped to the exact CRM4 Cloud Run IAP service. There is no alternate client selection or secret transformation. The helper rejects blank and CR/LF input but does not reject surrounding spaces or quote characters: those would be submitted verbatim. This is a possible input-error mechanism, not evidence that it occurred. Successful submission and public-ID read-back do not prove that Google accepted that secret in an OAuth token exchange.

The enabled status of the replacement in Console does not establish that its exact value is the value stored in IAP. No credential or stored hash has been retrieved. Google documents clientSecret as input-only and clientSecretSha256 as output-only for OAuthSettings. The minimum proposed diagnostic is a separately authorised owner-private masked comparison, computing the held secret SHA-256 in memory and comparing it with the service-scoped output hash, exposing only MATCH/MISMATCH and no value/hash. This is read-only but involves private credential handling and retrieval of credential-derived metadata; it is not executed under the present restrictions. A MATCH proves only held-versus-configured equality, not the held secret association with the enabled Console secret. Do not rotate, re-enter or replace credentials without explicit approval.

Recommendation: NO-GO for bootstrap/owner access while Error 11 persists. Redirect correction is no longer proposed. Secret mismatch remains unconfirmed. Seek approval for the bounded private comparison or obtain sanitised Google support diagnosis if the owner does not wish to perform it. No cloud mutations performed.

Additional authoritative reference: https://docs.cloud.google.com/python/docs/reference/iap/latest/google.cloud.iap_v1.types.OAuthSettings (input-only secret; output-only SHA-256).
