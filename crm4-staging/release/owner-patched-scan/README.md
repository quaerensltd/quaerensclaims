Completed owner scan: operation e5d1cd31-6ae1-438c-aca7-f1d001c02ef2. Do not execute the instructions below again; they are preserved as historical handoff evidence. See ../PATCHED-IMAGE-SCAN-RESULT.md for the NO-GO assessment and complete results.

# Patched CRM4 image — approved scan consumed

The owner approved ONE paid On-Demand scan on 2026-10-15. Execute only through the existing authorised Cloud Shell operator. No scan has been submitted by Codex.

Project quaerens-crm4-spain-test / 558324850479; existing operator martijnpronk76@gmail.com in Google Cloud Shell; existing ondemandscanning.googleapis.com API; scan location europe. Image repository remains europe-west1. No new APIs, IAM, rebuild, deployment, real accounts or customer data are included.

Exact immutable image:

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

Upload submit-scan.sh and SHA256SUMS together to a dedicated Cloud Shell directory. In that directory, verify the independent checksum and run once:

```bash
printf '%s  %s\n' '9cb670d3f8f8a61bddff1aa5b49627450575a0e61638f58ed085f97f71a0c3a6' 'submit-scan.sh' | sha256sum --check -
sha256sum --check SHA256SUMS
bash submit-scan.sh --approved-one-scan
```

Independently expected script SHA-256: `9cb670d3f8f8a61bddff1aa5b49627450575a0e61638f58ed085f97f71a0c3a6`. The script verifies identity, project, existing API, exact image and installed local-extract, then creates a durable single-submission marker. Do not delete that marker to retry. Return only the operation name from scan-operation.json; no credentials are needed. No component manager is invoked.

Review OS and application findings against this exact digest, especially CVE-2026-85091. Preserve the local patch provenance and observed binary hashes when assessing a version-based report; do not suppress findings or reuse the old scan. Any critical/high finding requires evidence-based resolution before release clearance. A clean scan alone does not authorise deployment, account provisioning or real customer operations.

## Verified preflight and limits (2026-10-15)

Read-only API checks verified the exact project ID/number, image digest and enabled scanning API. The sealed archive SHA-256 is `5d3ffe5a5cad2eda22fa505362de4bf27eda000ab94b30a3423038327f286f64`; dependency lock SHA-256 is `bde138edf2752278b1830fde437f4c6db53b90671505430cbb3e9eed4ff197e8`. Eight native recipe file hashes matched. See `../evidence/patched-image-scan/preflight.json`.

Bash syntax and five mocked guards passed: approval flag, missing extractor, single submission/receipt, duplicate blocking and wrong operator. All test cloud commands were mocked. The owner's actual Cloud Shell identity and durable submission marker must still pass the script checks; a local check cannot establish their state. Never remove `$HOME/crm4-scan-127600049240e507/submission-intent` to retry, including after an error or empty receipt. Report the error/receipt for read-only investigation instead. A second host or deleted home can bypass this local marker; do not run concurrently or from another host.

## Pending security decision

Private synthetic deployment remains NO-GO pending the new operation and complete findings review. No new vulnerability counts are available. Return the operation name in `scan-operation.json`, expected under `projects/quaerens-crm4-spain-test/locations/europe/operations/`, after submission. Keep the local receipts. No secrets are required.

Review every severity and affected OS/npm package against the operation's image metadata. Specifically assess CVE-2026-85091 against the recorded patch, compiled implementation and scanner package/version evidence. Absence of a finding alone does not prove the embedded implementation was inventoried. Preserve any version-based finding until its disposition is supported; do not suppress it.

The final system zlib hash matches Linux validation; the final Node hash differs despite identical pinned source/recipe inputs. The final binary passed its own runtime/provider checks and matches the registry-layer evidence, but bit-identical Node reproducibility has not been established. See `../evidence/patched-application-build/validation-comparison.json` and `final-runtime-verification.json`. This limitation remains open and must accompany the security decision.

The approval covers one paid scan only. No rebuild, deployment, IAM changes, real accounts or customer imports are authorised. Deployment needs separate approval even after security clearance.

