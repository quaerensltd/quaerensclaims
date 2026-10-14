# CRM4 image scan: owner Cloud Shell handoff

Current security result: owner-submitted scan completed and all findings retrieved; **NO-GO** for this digest. See [IMAGE-SECURITY-RESULT.md](IMAGE-SECURITY-RESULT.md). The handoff/pending status below is historical; do not submit another scan.

Shared CRM Framework. Target project quaerens-crm4-spain-test / 558324850479. The abbreviated approval image was resolved to the exact successful image from commit fb73d923:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:f62e96fef639c362e2aeb86630bbf6487c861017acdc74aa5b7f52a64b8d253e`

Fresh registry verification passed. Existing provisioner permissions cover scan submission/results, API enablement and image download; no IAM grant is needed. The only requested enablement is ondemandscanning.googleapis.com. Google on-demand scanning uses the Europe multi-region (`europe`); the image remains in europe-west1. Continuous scanning is not enabled.

The installed Google scanner explicitly rejects Windows before extraction/submission. No usable Linux/WSL host is available here. The owner selected Google Cloud Shell as the supported executor. No scan has been submitted by Codex; the one-scan authorization remains available. No new build, Cloud Run service or image modification is required.

## Run once in Cloud Shell

1. Open Google Cloud Shell as the existing provisioner martijnpronk76@gmail.com. Do not add roles or share credentials.
2. In Cloud Shell run `sudo apt-get update`, then `sudo apt-get install google-cloud-cli-local-extract`. This installs the extractor through the package manager; do not use `gcloud components install`. Upload the corrected `owner-scan/submit-scan.sh`, replacing the old uploaded script, and run `bash submit-scan.sh` from its upload directory.
3. Return only the operation name from the script output, for example `projects/quaerens-crm4-spain-test/locations/europe/operations/...`. This is public resource metadata, not a secret. Do not paste an access token, OAuth secret or downloaded credentials JSON.

The script checks project number, active account, enabled API and the exact image, detects the installed extractor in the active SDK or PATH without installing it, and records an exclusive submission marker before running one asynchronous scan. It scans all default supported OS/application package types. If it fails after the marker is created, do not retry: preserve the error/receipt so we can determine whether an operation exists without consuming another scan. If package installation is blocked or the extractor is still missing, stop and report that error; no compute/build workaround is authorized. The owner reported the original component-manager failure occurred before any scan submission. The existing receipt directory can be reused; never delete a submission-intent marker to bypass the guard.

Once the operation name is available, Codex can poll and retrieve all vulnerability pages through read-only APIs from Windows, classify findings, review fix availability/runtime reachability and commit the actual scan results. An incomplete/failed extraction must not be reported as a clean image.

## Current security disposition

**NO-GO pending scan completion**, not a finding that the image is necessarily exploitable. Critical/high/moderate/low image counts are UNKNOWN until the scan results arrive; zero must not be inferred. The existing npm audit reports three moderate entries from the sprintf-js -> argparse -> mammoth CLI chain. The previous synthetic DOCX extraction test shows the application library path does not load argparse/sprintf-js. The actual image was built from the pinned lockfile with npm ci. This supports limited runtime relevance, but image-level package findings and broader reachability still require the approved scan.

No scan request has been submitted by Codex, so there is no scan usage receipt yet. Actual billed cost is unavailable. Google's listed on-demand rate is USD 0.26 per image scan; that is a published rate, not an observed charge or a GBP invoice amount. Preserve the operation/scan receipt for billing reconciliation. [Pricing](https://cloud.google.com/artifact-analysis/pricing), [supported scan workflow](https://docs.cloud.google.com/artifact-analysis/docs/scan-os-on-demand).

Evidence: evidence/image-security/preflight.json, api-enable-intent.json, api-enable-operation.json and api-enable-verification.json. After scan retrieval, API rollback (if requested) is to disable only ondemandscanning.googleapis.com following a fresh dependency check, without disabling dependencies or deleting scan evidence. No rollback or IAM mutation has been performed.

Private deployment remains separately gated by scan findings review, exact-digest Cloud Run deployment, the two service-specific IAP bindings, owner-only OAuth credential application and the separate owner Firebase Administrator membership. The completed 38/38 Storage acceptance remains preserved.
