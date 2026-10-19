# OAuth correction — independent verification, 19 October 2026

Owner reports MATCH SETTINGS_UNCHANGED from the approved correction helper. Independent read-only verification at 11:34 UTC passed exact project/number, approved public client ID and public IAP settings, assessed image, startup command/arguments/environment, runtime identity, ingress and native IAP, invocation enforcement, scaling/resource settings, service readiness, exact Run/IAP policies and etags, project IAM/audit baseline, published Firestore/Storage releases and source hashes, and empty Firebase inventory.

Stored fingerprint presence/format verified in memory only; no fingerprint, secret or raw settings response persisted or printed. Equality to the privately held secret cannot be independently established without the owner-operated read-only comparator, which has been requested. Do not conflate fingerprint presence with MATCH.

Audit evidence: one successful UpdateIapSettings on the exact service at 2026-10-19T11:30:32.405520144Z by martijnpronk76@gmail.com; no additional page. This verifies update attribution, not credential validity at Google's OAuth token endpoint.

Browser retry remains pending the separate comparator MATCH. If MATCH is reported, the requested fresh owner-only private Google authentication test can proceed using brusseljeroen@gmail.com. If MISMATCH/INCONCLUSIVE, STOP. No Firebase provisioning until OAuth authentication succeeds. No credential rotation, settings change or browser retry performed by Codex during verification.

Expiry remains 24 October 2026 09:00 UTC. Existing HIGH finding, Node reproducibility and Firebase incident restrictions remain. Production/real-customer use NO-GO.

## Separate comparator MATCH and browser-test release

Owner reports the separate checksum-verified comparator returned MATCH using the existing replacement. Record this as owner-executed independent-process evidence, not a secret comparison performed by Codex. Neither secret nor fingerprint was received. Combined with the independent cloud configuration/IAM/rules/audit verification above, this closes the fingerprint-equality gate for a fresh Google IAP browser test.

Fresh public checks at 2026-10-19T11:49:51.742Z confirm exact project, client ID, unchanged Run/IAP policies, assessed image and sealed startup, native IAP and an unexpired test window. See browser-test-readiness.json. No cloud changes performed.

Decision: GO for one fresh private/incognito browser authentication test at https://crm4-spain-test-558324850479.europe-west1.run.app using only brusseljeroen@gmail.com. Start from this clean application URL, not an old callback/tab. Reaching the CRM4 Firebase sign-in screen without an IAP error establishes browser-level progress; it does not establish Firebase login/dashboard acceptance. Report the resulting screen or error and UTC time only, never callback query parameters, tokens or credentials. Stop on another IAP error rather than repeatedly retrying.

Firebase provisioning remains paused until Google IAP authentication succeeds. This is not approval for real-customer operation, additional identities or settings changes. Expiry and all existing residual-risk restrictions remain unchanged.
