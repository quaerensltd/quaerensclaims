# CRM4 zlib validation v2 — PASS

Linux validation passed on 14 October 2026. **This clears the native-validation gate only. Private deployment and real-customer operations remain NO-GO pending separate release approvals.** This is Shared CRM Framework release evidence; no shared application behavior changed.

## Approved execution

- Source commit: `43a6d7cf9b817275c8d062efda13358093f83903`.
- Project: `quaerens-crm4-spain-test` / `558324850479`; region `europe-west1`.
- Operator: `martijnpronk76@gmail.com`; dedicated identity: `crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com`.
- Build: `eeddbba6-69c0-49a7-b636-e976e1455a51`; all three steps SUCCESS. Exactly one submission; no retry.
- Start/end: `2026-10-14T13:40:41.478164090Z` to `2026-10-14T14:57:36.015478Z`; 4614.537 seconds (76 minutes 55 seconds, rounded).
- Worker: E2_HIGHCPU_8, 100 GB disk, 7,200-second maximum. The native container used four compile jobs, four-CPU and 7 GiB/no-extra-swap limits, and the reviewed 6,600-second inner timeout.
- Sealed context: `d7fdf5cdf196f74929d5fdcee427aff62b70cc3ab7355fe369aa89ae39897339`.
- Source archive: `a5869ff361af26c7fa95240ec3cfef7c9d9eababe45cf9b91a429dc1a918cf5c`; Cloud Build provenance reports this same SHA-256 and source generation `1791985187169345`.

The unchanged sealed three-step configuration was submitted through the Cloud Build REST API with the guarded generation-pinned upload, project checks before each mutation and an exclusive submission-intent receipt. Fresh project identity, archive/context, operator, build identity, existing IAM and prior build history were checked first. The source object and job were the only cloud additions.

## Acceptance evidence

| Required check | Result |
| --- | --- |
| Both public source archives and original patch hashes | PASS |
| Both gzwrite.c source copies contain the approved patch | PASS; patched SHA-256 ce2da7e2567c7f3fd361cbdf56bc4354e179c1d91257ea26eeb281cbbe83e1ca |
| System zlib compilation and static/shared/64-bit upstream tests | PASS |
| System failed-write regression | PASS in compiler and final distroless runtime |
| Node 22.23.3 compilation | PASS; exit 0 |
| Embedded-zlib failed-write regression and executable symbol provider | PASS; /out/node/node and final /nodejs/bin/node |
| Compression/decompression round trip | PASS |
| Final Node/system-library hashes and intended provider use | PASS |
| Final nonroot runtime and DOCX/PDF smoke | PASS; Linux UID 65532; smoke reported zero network calls |

Node binary SHA-256: `ac7adf673431129b91a0026fc5d66b0f8ec32b7892ce9df23ed8fb76e917990e`.

System zlib binary SHA-256: `27ec58df686ab3e3299191216f6fb3507681a23ebac697ca49babaaa73ac71d3`.

The system library is the explicitly labelled local backport `1:1.3.dfsg+really1.3.1-1+crm4.1`, not an official Debian security package. Node's version string remains 22.23.3 and its bundled-zlib version string remains 1.3.1-e00f703; the patch is established by source/provenance and behavioral tests, not version-string suppression. Future scanners may still flag an unchanged upstream version and must be assessed against the new digest and patch evidence.

The retained native diagnostic archive SHA-256 is `386d7359f00e97581033b8c7df7a49748424c45fe86135241dac5b9829889362`. All 648 available Cloud Logging entries across five pages were collected, and the compressed diagnostic archive was reconstructed and checksum-verified. The 13,829,670-byte Node compiler log is retained inside it without the previous BuildKit clipping. [Acceptance markers](evidence/zlib-validation-v2-execution/acceptance-highlights.txt), [phase timings](evidence/zlib-validation-v2-execution/phase-results.tsv), [runtime hashes](evidence/zlib-validation-v2-execution/runtime-hashes.json) and [full evidence](evidence/zlib-validation-v2-execution/) are preserved.

## Timings, warnings and limits

Node compilation took 4,381 seconds (73 minutes 1 second), versus an unfinished first attempt. The six earlier phases each report 30 seconds because the heartbeat wrapper waits in 30-second intervals; these are observed wrapper durations, not precise compiler CPU timings. Final runtime validation took approximately 15.5 seconds. Resource limits were configured as approved, but the cgroup memory counters were unavailable inside this environment, so no measured peak-memory claim is made.

Compiler warnings are recorded in compiler-warnings.json, including upstream V8 C++20 template diagnostics, deprecated APIs and bounds/uninitialized-value warnings. They were not disabled or treated as proof of safety. A successful native build and focused zlib tests do not establish that the entire dependency stack is vulnerability-free. No paid scan was submitted, and the old application image's security status is unchanged.

This validation does not start the CRM4 application or exercise the deployed runtime identity/IAP browser path. Those remain release gates. Existing CRM4 regression, dual-role and Storage evidence was preserved and not unnecessarily rerun. Repeat-build bit-for-bit reproducibility has not been demonstrated; the exact observed source/binary hashes are recorded.

## Cost and unchanged resources

Estimated compute charge: **USD 1.20**, using the previously reviewed USD 0.0156/minute rate and actual reported duration. Actual billed charges are unavailable in the Cloud Build response. This estimate excludes storage, log ingestion, network, tax, conversion and adjustments; no billing export or other resource was created to obtain costs.

Project IAM is unchanged. Cloud Run service count remains zero. Artifact Registry still contains the same two previous image digests. Build history contains exactly one additional job. Cloud Build's generic PUSH lifecycle log label does not indicate publication: images/artifacts publication was absent from the configuration, and registry inventory is unchanged. The ephemeral local validation image is not a deployable registry release.

No real accounts, lead import, live providers, CRM2/CRM3/CRM5 changes or production actions occurred.

## Exact next approval boundary

Native validation is PASS. The next cloud approval is **ONE replacement CRM4 application-image build**, not another validation-only job: same project/region and dedicated build identity, existing private source bucket and crm4-release Artifact Registry repository, the now-validated patch recipe and pinned compiler/runtime/dependency inputs. Before requesting that approval, assemble and seal the application build context and supply its exact archive/context hashes and reviewed build configuration. The current validation archive deliberately lacks application source and must not be submitted as an application release.

That separate build approval must explicitly permit publication of one immutable replacement application image and its provenance/package inventory. It must exclude automatic scanning, IAM changes, deployment, real accounts and customer data. After the image exists, obtain a separate digest-specific vulnerability-scan approval; assess every finding, including the zlib backport, without suppressions. Private IAP deployment and real-customer launch require their own approvals and remaining operational acceptance gates.

## Rollback and retention

The completed job needs no cancellation; no IAM or application rollback is required. Preserve the diagnostic and source evidence. The sole uploaded source is `gs://quaerens-crm4-spain-test-build-source/zlib-validation/d7fdf5cdf196f74929d5fdcee427aff62b70cc3ab7355fe369aa89ae39897339/a5869ff361af26c7fa95240ec3cfef7c9d9eababe45cf9b91a429dc1a918cf5c.tar.gz`, generation `1791985187169345`. If its cleanup is later approved, use an exact generation-match deletion only. Do not delete the bucket, existing images or historical evidence. This one-job approval is consumed; do not rerun its submission script or bypass its marker.
