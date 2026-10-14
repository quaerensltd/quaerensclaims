# One hardened-image scan: owner authorized 14 October 2026

The owner has authorized ONE paid scan of:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce`

Project quaerens-crm4-spain-test / 558324850479; scan location europe. Use the existing authorized provisioner martijnpronk76@gmail.com in Cloud Shell, existing On-Demand Scanning API and installed google-cloud-cli-local-extract. No new IAM/API grants, build or deployment are included. The script never runs the disabled gcloud component installer.

Upload this directory's current submit-scan.sh and SHA256SUMS into a fresh Cloud Shell directory, then:

```bash
printf '%s  %s\n' '7ffa104e67b4874eca508fc139aca816205cb056cdaf5bf8dce6113263151536' 'submit-scan.sh' | sha256sum --check -
sha256sum --check SHA256SUMS
bash -n submit-scan.sh
bash submit-scan.sh --approved-one-scan
```

The exact scan invoked is:

```bash
gcloud artifacts docker images scan 'europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce' --project=quaerens-crm4-spain-test --remote --location=europe --async --quiet --format=json
```

Use the script for identity/project/image checks and the single-submission marker. Do not also run the bare command. If submission is uncertain, inspect the saved operation receipt; never delete the marker or retry blindly. Share only the operation name. No secret is needed.

Acceptance requires a successful operation tied exactly to this digest, complete paginated OS and npm findings, separate effective/reported severity counts, and an individual disposition of every critical/high finding. Verify Perl/global npm/old flagged npm absence, review retained glibc/GCC/zlib packages and any new issues, and explicitly resolve CVE-2026-85091. No unreviewed high/critical exception is implied. Review moderate/low/unknown items too. Compare actual findings with the 128-finding baseline; inventory absence alone is not vulnerability clearance. A clean scan does not prove real-customer operational/privacy readiness. Deployment and real data remain separately gated.

## Receipt and current decision

Send the new operation name returned by the script, normally `projects/quaerens-crm4-spain-test/locations/europe/operations/OPERATION_ID`. The full JSON is saved at `$HOME/crm4-scan-0e26c3427691a8da/scan-operation.json`; stderr is saved alongside it. An empty/failed response does not authorize a retry: preserve the submission-intent marker and report the error for read-only reconciliation. Do not send credentials. The guard is persistent in this Cloud Shell HOME; do not use another host/account or delete receipts to bypass it.

Local validation: Bash syntax plus five isolated mock cases passed (wrong account, wrong project, checksum mismatch, exact-image single submission/receipt, repeat rejection); no live scanner invocation. Read-only preflight verifies the exact image still exists and On-Demand Scanning is enabled. Image hosting/build region is europe-west1; the reviewed scanner location is europe.

New scan findings are pending; previous-image results are not reused as this image's findings. Private synthetic deployment is NO-GO pending this scan, zlib CVE-2026-85091 disposition and remaining deployment/configuration approval. Real-customer release additionally needs production-mode/provisioning changes, named staff/operational roles, privacy and recovery acceptance, deployed synthetic browser acceptance and governed import/reassignment. See ../REAL-CUSTOMER-LAUNCH.md and ../import-preparation/README.md.
