# Private Cloud Shell OAuth entry

Upload crm4-oauth-private.py from this folder using Cloud Shell's Upload file menu; do not paste its source. Upload the local file without editing. Its SHA-256 is ce5ba2265707473ad1e311f360b201cce33e497f8fcfacffea1e7091acbc87f3. Line-ending conversion changes the checksum, so a mismatch must stop execution.

1. Cancel any old hidden prompt with Ctrl+C. Use the operator martijnpronk76@gmail.com.
2. Upload the file to Cloud Shell home, keeping the exact filename.
3. Run `sha256sum ~/crm4-oauth-private.py` and compare all 64 characters.
4. Run `python3 ~/crm4-oauth-private.py`. Default is read-only; it asks for no secret and makes no changes.
5. When authorised to submit, run `python3 ~/crm4-oauth-private.py --apply`. Preflight repeats. Type APPLY, enter the existing replacement secret at the hidden prompt, then Enter. The script repeats preflight after input before writing settings.
6. Report only the final status. Do not send the secret, files containing credentials or command debug output.

The script preserves the verified name-only IAP settings baseline and stops on any settings drift or already-configured client. It checks exact project number/operator, no impersonation, service/image/runtime account, native IAP, invocation IAM checking, both exact scoped policies and the fixed expiry. JSON property order is ignored; only approved Google user email case is normalised. No IAM, Firebase, Run deployment or credential-generation operations exist in the script.

Private input requires a TTY and rejects getpass echo fallback. Credential file: /dev/shm, private temporary directory, mode 0600, removed on ordinary completion/error/KeyboardInterrupt. No secret in argv, environment, shell history or gcloud output. Gcloud file and HTTP logging disabled. Hard termination can prevent cleanup; do not inspect or share leftover temporary-file contents. The non-secret ~/.crm4-oauth-submission-attempted.json marker is created immediately before submission and blocks duplicate attempts. If present after failure, stop for independent verification; do not delete it and retry automatically.

Seven local tests passed using mocked operations only. No cloud command was run during these tests and no credential was handled. This package prepares the owner procedure only; no cloud setting was changed. Independent Codex configuration/policy verification remains required after submission. Production remains NO-GO.
