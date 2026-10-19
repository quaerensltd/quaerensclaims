# Approved private correction helper — owner execution

Owner confirms the supplied value came from the existing CRM4 Spain private IAP client in Console. Execution still requires explicit private confirmation that it is the enabled replacement, not a disabled historical credential. If uncertain, stop; do not rotate or guess.

Upload crm4-oauth-correct.py using Cloud Shell Upload file. Do not paste script contents. Use the private authorised operator session martijnpronk76@gmail.com in quaerens-crm4-spain-test. No recording, screen sharing, tracing, tee or output redirection.

SHA-256: d2c5a4f4504829c269db68e3a40d1cb5d13101f571cf6c215ff5f67715ef0cf1

First run read-only preflight in the upload directory:

```sh
printf '%s\n' 'd2c5a4f4504829c269db68e3a40d1cb5d13101f571cf6c215ff5f67715ef0cf1  crm4-oauth-correct.py' | sha256sum --check --status && python3 -I -B crm4-oauth-correct.py
```

Only if it reports PREFLIGHT_PASS_NO_CHANGE and the held credential is confirmed as the enabled replacement, execute the conditionally approved correction:

```sh
printf '%s\n' 'd2c5a4f4504829c269db68e3a40d1cb5d13101f571cf6c215ff5f67715ef0cf1  crm4-oauth-correct.py' | sha256sum --check --status && python3 -I -B crm4-oauth-correct.py --apply
```

Type ENABLED only after privately confirming provenance. Enter the same secret twice at masked prompts, without quotes or whitespace. Type APPLY-SECRET-ONLY to authorise the single request. Never put the secret in chat, shell commands, environment variables or files. Secret/fingerprint are processed in memory only. The helper disables core dumps and CLI payload logging; Python cannot guarantee secure wiping of process-memory copies. The only saved file is the non-sensitive attempt marker ~/.crm4-oauth-secret-correction-attempted.json containing target and timestamp; never remove it to retry.

It checks exact active project/number/operator, assessed image, native IAP and invocation checks, runtime identity, service readiness, approved Run/IAP policies and etags, project IAM/audit baseline, no Firebase users, exact published expiry rules and source hashes, exact public IAP settings and time before expiry. It reads no Firebase password configuration. No redirects are followed. The credential is sent only in the authorised PATCH body over HTTPS to the exact IAP endpoint; there is no credential API retrieval or credential-store lookup.

The transaction uses only updateMask=iapSettings.accessSettings.oauthSettings.clientSecret. The client ID is checked, not written. No settings-set CLI fallback, wider mask, retries, IAM changes, credential rotation, rule publication or deployment. Unsupported mask, permission failure or concurrent drift causes STOP. IAP settings provide no documented etag precondition; no other operator may modify settings during the private transaction. IAM etags and settings are rechecked immediately before the write and after it.

Outcomes:
- MATCH_SETTINGS_UNCHANGED: independent reads confirm fingerprint equality and exact baseline preservation. Report this label only, then run the previously verified crm4-oauth-compare.py independently and report its result. Codex must independently review public configuration, policies and update audit attribution before browser retry.
- ALREADY_MATCH: no write; investigate with the independent comparator.
- STOP_INCONCLUSIVE_NO_AUTOMATIC_RETRY: stop, report label only. A request may have succeeded before read-back failed; never automatically repeat it. No claim of rollback or successful containment.

The old stored credential is unknown and cannot be restored from a hash. This helper does not disable IAP or remove access on failure; it keeps protections in place and stops for the separately governed containment decision. No Firebase provisioning until OAuth browser authentication succeeds and all other mandatory gates pass. No browser attempt is performed by this helper.

Validation: 12 offline correction tests passed; 10 existing comparator tests passed. Tests use fictional values and mocked requests only. Covered exact PATCH shape/mask, one submission, drift before mutation, existing attempt marker, timeout, denied/mismatched/changed read-back, already-match no-op, masked-entry validation, error redaction, mutation allow-list and default read-only mode. Linux resource limits mocked on Windows; live patch acceptance is not claimed. The script has not been executed against Google by Codex.

The HIGH finding, Node reproducibility limitation and Firebase incident remain. Expiry 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Production and real-customer use remain NO-GO.
