# One hardened-image scan: awaiting separate approval

Do not execute before the owner authorizes ONE paid scan of:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce`

Project quaerens-crm4-spain-test / 558324850479; scan location europe. Use the existing authorized provisioner martijnpronk76@gmail.com in Cloud Shell, existing On-Demand Scanning API and installed google-cloud-cli-local-extract. No new IAM/API grants, build or deployment are included. The script never runs the disabled gcloud component installer.

After separate approval, upload this directory's submit-scan.sh and SHA256SUMS into a fresh Cloud Shell directory, then:

```bash
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
