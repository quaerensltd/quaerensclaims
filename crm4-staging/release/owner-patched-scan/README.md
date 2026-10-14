# Patched CRM4 image — scan approval pending

Do not execute until the owner separately approves ONE paid On-Demand scan. No scan has been submitted.

Project quaerens-crm4-spain-test / 558324850479; existing operator martijnpronk76@gmail.com in Google Cloud Shell; existing ondemandscanning.googleapis.com API; scan location europe. Image repository remains europe-west1. No new APIs, IAM, rebuild, deployment, real accounts or customer data are included.

Exact immutable image:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

After approval, upload submit-scan.sh and SHA256SUMS together to a fresh Cloud Shell directory, then run:

```bash
sha256sum --check SHA256SUMS
bash submit-scan.sh --approved-one-scan
```

Independently expected script SHA-256: `9cb670d3f8f8a61bddff1aa5b49627450575a0e61638f58ed085f97f71a0c3a6`. The script verifies identity, project, existing API, exact image and installed local-extract, then creates a durable single-submission marker. Do not delete that marker to retry. Return only the operation name from scan-operation.json; no credentials are needed. No component manager is invoked.

Review OS and application findings against this exact digest, especially CVE-2026-85091. Preserve the local patch provenance and observed binary hashes when assessing a version-based report; do not suppress findings or reuse the old scan. Any critical/high finding requires evidence-based resolution before release clearance. A clean scan alone does not authorise deployment, account provisioning or real customer operations.
