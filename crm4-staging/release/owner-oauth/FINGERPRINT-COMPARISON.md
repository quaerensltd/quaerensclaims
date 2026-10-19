# Owner-private OAuth fingerprint comparison

Approved scope: read-only diagnostic for quaerens-crm4-spain-test / 558324850479, native IAP service crm4-spain-test in europe-west1. No browser retry, bootstrap, settings change, rotation or credential replacement.

Upload `crm4-oauth-compare.py` with Cloud Shell's Upload file action; do not paste its contents. Use the existing authorised operator martijnpronk76@gmail.com. Run from the upload directory in a private interactive terminal without terminal recording, screen sharing, tracing, tee or output redirection. The script requires an interactive terminal and disables core dumps. Enter only the existing replacement secret at the hidden prompt, never in a command or chat. No secret is retrieved from Google or local credential stores. The operator's existing gcloud authentication is used in memory for read-only requests.

Exact uploaded-file SHA-256:
`37d333761aa86617558ea83c58c8f39fa46720fb44bd9229487c3e9c4f9a6041`

Run this single command from the directory containing the uploaded file:

```sh
printf '%s\n' '37d333761aa86617558ea83c58c8f39fa46720fb44bd9229487c3e9c4f9a6041  crm4-oauth-compare.py' | sha256sum --check --status && python3 -I -B crm4-oauth-compare.py
```

If checksum verification fails the script does not execute; stop. The secret prompt is hidden. The comparison result is only MATCH, MISMATCH or INCONCLUSIVE. Report that word only. No automatic retries. MATCH means the entered value matches the service's stored fingerprint; it does not independently prove that it is the enabled secret belonging to the Google OAuth client. MISMATCH requires a separately approved correction. INCONCLUSIVE requires diagnosis before retrying. Missing/unsupported fingerprint encoding, read failure, drift, expiry or interrupted entry cannot yield MATCH.

The tool uses documented OAuthSettings.clientSecretSha256 (output-only) and never requests clientSecret. Fingerprints, secret and access token are processed only in memory; no application-level persistence or payload logging. Python cannot guarantee erasure of all process-memory copies; this is not a guarantee against privileged host inspection or provider-side memory retention. Private Cloud Shell custody remains required. It writes no temporary file or receipt. Process exit drops references. Existing cloud audit infrastructure may record read metadata, not a secret submitted by this tool: the entered OAuth secret is never sent over the network.

Offline validation: 10 tests passed using fictional values only, including equality, mismatch, whitespace, changed fingerprints, malformed input, exception redaction, output allow-list, redirects, wrong project/service/client, disabled invocation checking, unsupported hash encoding and GET-only source checks. Linux resource controls are mocked for Windows tests; actual live comparison awaits owner execution and is not claimed passed.

Reference: https://docs.cloud.google.com/iap/docs/reference/rest/v1/IapSettings#OAuthSettings

Outstanding HIGH vulnerability, Node reproducibility limitation and Firebase incident remain unchanged. No cloud mutation occurred during preparation. No Firebase accounts or browser authentication attempted. Production remains NO-GO.
