# CRM4 Spain: existing OAuth client verification and private credential handoff

Current execution update: the approved Firebase domain/referrer changes are applied and verified; the ONE authorized regional build succeeded. See [BUILD-RESULT.md](BUILD-RESULT.md) for the immutable image, evidence and remaining deployment gates. The preparation instructions below are historical where they describe those actions as pending; they do not authorize another build.

Shared CRM Framework. Target only quaerens-crm4-spain-test / 558324850479, No organization. Owner confirmation dated 14 October 2026 supersedes the earlier proposed support email. No further cloud changes are authorized by this document.

## Saved client confirmed by owner

Owner-verified Console evidence dated 14 October 2026: client ID `558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com`; saved redirect `https://iap.googleapis.com/v1/oauth/clientIds/558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com:handleRedirect`. The local exact-string comparison passes. This closes the saved-redirect gate on the owner-provided evidence; it is not independently verified API evidence. No repeat Console check or secret disclosure is required. Receipt: evidence/oauth-confirmed/owner-console.json.

The steps below are the reference procedure for any future configuration change.

Open [Google Auth Platform Clients](https://console.cloud.google.com/auth/clients?project=quaerens-crm4-spain-test), select the existing Web client **CRM4 Spain private IAP**, and confirm the project ID/number. Do not create another client or download its credentials JSON. Read only its public client ID and saved Authorized redirect URIs; navigate away and reopen to distinguish saved values from an unsaved form. The sole expected redirect is:

`https://iap.googleapis.com/v1/oauth/clientIds/CLIENT_ID:handleRedirect`

Replace CLIENT_ID with the full public client ID including `.apps.googleusercontent.com`. Exact case, scheme, path and suffix must match; no trailing slash, private application URL or Firebase auth handler substitution. Compare the saved value, not only a success toast. If there are unexpected redirects, record them without editing and obtain approval for the exact correction. The expected form is documented by [Google Cloud Run IAP](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).

Confirm Branding app name Quaerens CRM4 Spain Test, support martijnpronk76@gmail.com, developer contact info@quaerens.co.uk, Audience External/Testing and only brusseljeroen@gmail.com as test user. Support contact does not grant IAP access. Record only public metadata and observation date. The owner reports the old exposed secret disabled/deleted and one enabled replacement; verify statuses privately without displaying/copying values into evidence. No secret needs to be sent to the agent.

Owner Console evidence now supplies the exact public client ID and saved redirect. Historical API observations remain in evidence/oauth-handoff/read-only.json; fresh Firebase-only reads are in evidence/oauth-confirmed/firebase-read-only.json. No OAuth credential endpoint was queried during this confirmation.

Fresh read-only APIs returned HTTP 200 for project IAP settings, with no custom OAuth client ID configured. Firebase authorizedDomains remain localhost, quaerens-crm4-spain-test.firebaseapp.com and quaerens-crm4-spain-test.web.app. The browser key retains 27 API targets and no referrer restriction. Email/password, disabled signup/deletion and enumeration protection remain verified. These checks do not establish the saved OAuth client redirect.

The current refreshed offline context receipt is evidence/oauth-confirmed/container-preparation.json; the prior context is historical after metadata updates. Source integrity and all 679 context file hashes were verified. No functional code changed and completed acceptance tests were not rerun.

## Owner-only credential configuration, after separate approval

Prefer the Cloud Console private input flow. Once the digest-approved Cloud Run service exists with native IAP enabled, open Cloud Run > crm4-spain-test > Security > IAP > Edit policy > Configure in IAP. Review the CRM4 project OAuth settings. Choose Custom OAuth and use the EXISTING client; do not auto-generate credentials. The owner enters its public client ID and privately held replacement secret directly into Google's secret field, then saves. This applies IAP settings and requires separate authorization; OAuth client creation alone did not apply them.

Pause agent browser automation, screen recording and screen sharing while the owner enters the secret. Keep the secret in the owner's private credential manager; never paste it into chat, a shell command, environment variable, source/config file, image, Cloud Build substitution, GitHub or evidence. Avoid copying if password-manager autofill is available; otherwise clear clipboard/history after entry. Do not export credentials JSON or enable HTTP/debug logging. Resume read-only verification with secret fields closed/hidden. Record client ID, target project and success/status only. If Console requests broader access or unrelated settings, stop and review the exact change.

If the Console flow is unavailable, pause; do not improvise a plaintext CLI secret argument. A separately reviewed owner-operated protected-file procedure can be prepared if needed. Do not re-enable the deleted secret for rollback. If new credentials fail, withdraw tester access and have the owner correct the current client privately. Keep IAP authentication required throughout.

Verify the configured client ID and sole service-specific IAP accessor without printing an entire settings response. Then test the owner login through IAP. Do not confuse OAuth redirect URI with application origin: the private application remains `https://crm4-spain-test-558324850479.europe-west1.run.app`.

## Remaining gates in order

1. Saved public client ID/redirect gate is complete on owner-verified Console evidence. Approve applying this existing client to CRM4 IAP using the owner-only secret procedure; no build/deploy approval is inferred from the confirmation.
2. Approve the existing exact Auth-domain and browser-key referrer additions in evidence/oauth-confirmed/firebase-pending-deltas.json; refresh etags before execution, retain current API targets and Auth protections.
3. Approve candidate deployment flag activation, regenerate and review source/context hashes, and submit one regional build with the dedicated build identity. Current offline contexts remain disabled; no build has been submitted. Review actual resulting image digest, provenance and security findings before a separate deployment approval.
4. Approve one private native-IAP Cloud Run service plus only the documented service invoker/IAP accessor bindings. Apply existing OAuth credentials using the private owner flow above under that explicit scope. No public invocation or extra tester.
5. Separately confirm/approve owner Firebase sign-in identity, CRM4 administrator membership and any central bootstrap authority. Google tester identity alone supplies none of these rights. No real staff provisioning.
6. Execute the post-deployment browser acceptance plan in FINAL-PRIVATE-RELEASE.md. Preserve prior 38/38 Storage evidence; test only the newly deployed integration paths. Dual-role staff protections, provider mocks and other CRM environments remain unchanged.
