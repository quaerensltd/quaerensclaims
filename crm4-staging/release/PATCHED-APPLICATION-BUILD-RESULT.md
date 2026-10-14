# Patched CRM4 application image — build verified

**One approved build succeeded. Private deployment and real-customer operations remain NO-GO.** No paid scan, IAM change, deployment, real-account provisioning or lead import was performed. This is isolated Shared CRM Framework release packaging; CRM workflows and safeguards were not changed.

## Immutable result

`europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

- Build: `4bde680d-4da6-4093-ad13-01a1706f1ecb`, europe-west1, quaerens-crm4-spain-test / 558324850479.
- Base source commit: `8409f7f1dd92ca1dd36f80b1ac2de05c86334d67`; the new packaging files and these receipts are committed together. Sealed archive provenance is authoritative for the submitted bytes.
- Application source digest: `2150619e1596a949bdf01b3a51c5dee0c239dd573a4e4d3e38958ece680e3f8c`, unchanged from the prior hardened package.
- Context: `ef1aea580c113dfb90f770a78b1fdb3c669ea785109d281f36fb4dcb74b9d6fb`; archive SHA-256: `5d3ffe5a5cad2eda22fa505362de4bf27eda000ab94b30a3423038327f286f64`.
- Dependency lock: `bde138edf2752278b1830fde437f4c6db53b90671505430cbb3e9eed4ff197e8`, unchanged.
- Dedicated crm4-build identity, immutable crm4-release repository, pinned compiler and distroless runtime retained. Worker: E2_HIGHCPU_8, 100 GB, maximum 7,200 seconds; native recipe retained four compile jobs and bounded container resources.
- Runtime remains UID 65532:65532. Activation remains deploymentApproved:false, providers capture-only, and sole IAP tester brusseljeroen@gmail.com. No production credentials or live provider configuration were added.

## Verification

The native source archives, approved patch and all eight recipe files matched the successful Linux validation. The application context was unpacked and verified before upload; Cloud Build provenance matches the archive and its exact uploaded generation. One new immutable tag/digest was published; both prior images remain, project IAM is unchanged, and Cloud Run service count remains zero.

System static/shared/64-bit upstream tests, both failed-write regressions, Node embedded-provider checks, compression/decompression, runtime binary hashes and final nonroot DOCX/PDF smoke all passed. The final layer hashes were verified against the registry manifest/config. The image retains the reviewed distroless base, contains 289 npm packages and excludes the intermediate validation binaries, compiler logs and native recipe directory. Actual final dpkg metadata identifies the custom system zlib backport as 1:1.3.dfsg+really1.3.1-1+crm4.1. Package inventory and final runtime verification are recorded in [evidence](evidence/patched-application-build/).

The pre-build npm audit reported zero vulnerabilities. Seven selected local packaging/configuration/dependency/boundary tests passed across the final runs: the first invocation of an emulator-dependent boundary test lacked NODE_PATH/emulator setup; the complete three-test boundary file then passed with the isolated demo Firestore emulator. The failed harness receipt is retained. No test assertions or security controls were weakened. Prior dual-role, workflow and live Storage acceptance evidence was preserved rather than repeated.

## Binary integrity and limits

- Actual Node binary SHA-256: `7fdf238278572555edea211d2fc69b8903689983656eaa7ec7d3361521d016cc`.
- Actual system zlib SHA-256: `27ec58df686ab3e3299191216f6fb3507681a23ebac697ca49babaaa73ac71d3`.

Both published binaries match this build's native receipts and passed their intended-runtime/provider checks. System zlib is byte-identical to validation. Node differs from the validation binary (ac7adf673431129b91a0026fc5d66b0f8ec32b7892ce9df23ed8fb76e917990e). The same pinned inputs and recipe were compiled again; no downloaded substitute binary was used. Compiler logs include build-specific intermediate filenames and ordering differences. The previous Node binary was not exported, so an exact binary-level cause cannot be established and bit-for-bit reproducibility is **not claimed**. See validation-comparison.json.

Compiler warnings are preserved in the checksum-verified native archive and warning summary. A successful build, focused zlib tests and zero npm audit findings do not establish a clean OS image. Node's bundled version string remains upstream 1.3.1-e00f703; a scanner may still flag the version and must be assessed against this digest and the backport evidence without suppression. Application startup with its real managed identity and private IAP browser behavior remain separately approved deployment gates.

## Timings and cost

Build elapsed: 81 minutes 35 seconds (4,895.482 seconds). Node compilation: 77 minutes 32 seconds. Final application-image checks took approximately 16.6 seconds; publication approximately 9.7 seconds. Earlier phase durations include the 30-second diagnostic polling granularity. Cgroup memory counters were unavailable, so peak-memory usage is not claimed.

Estimated compute cost is USD 1.27 at the previously reviewed USD 0.0156/minute rate; actual billed charges are unavailable. Storage/logging/network/tax/conversion are additional. The usage-limit interruption affected local monitoring only; after the user reported a reset, monitoring resumed on the same job. No second submission occurred.

## Exact next approval

Approve **ONE paid Google Cloud On-Demand vulnerability scan of the immutable image above**, using the existing scanning API/infrastructure in quaerens-crm4-spain-test / 558324850479, scan location europe, with authorised Cloud Shell operator martijnpronk76@gmail.com. No new IAM/API grants, rebuild, deployment, staff provisioning or data import is included. Automatic repository scanning was disabled at preflight; no scan command was run.

[Prepared owner procedure](owner-patched-scan/README.md) includes an exact-digest script, independent checksum, identity/project checks, installed-extractor detection, one-submission guard and operation receipts. It was syntax-checked only, not executed. Retrieve and review the new OS/application findings, particularly CVE-2026-85091; do not reuse the older image's scan results.

After security acceptance, private deployment, owner membership and real-customer admission still require separate approvals. Preserve the existing production-readiness and lead-import gates.

## Rollback

No running application changed. Retain the new image, exact source generation and audit receipts. Any later cleanup must target only the recorded new image/digest or source object with its generation-match precondition; deletion is not performed here. Never substitute the previous NO-GO image as a deployment rollback. No IAM rollback is needed.
