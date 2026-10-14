# CRM4 Linux zlib validation result — 14 October 2026

**NO-GO: the single approved validation job timed out. No retry was submitted.** System zlib acceptance passed; Node compilation completion, embedded-zlib acceptance and final distroless runtime acceptance remain unverified. This is Shared CRM Framework release preparation; no application or shared framework behavior changed.

## Execution and integrity

- Source commit: `ac8b64537b0463082a630c3c92a1081633b76fec`.
- Project: `quaerens-crm4-spain-test`, number `558324850479`; region `europe-west1`.
- Operator: `martijnpronk76@gmail.com`; existing build identity: `crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com`.
- Build: `9d4e5c8f-5164-4e4f-a14c-4a04f62a423b`; status `TIMEOUT`.
- Worker: `E2_HIGHCPU_8`, 100 GB disk, 7,200-second timeout. Reported start/finish: 11:15:22.697951444–13:15:45.094813 UTC (7,222.397 seconds including lifecycle overhead).
- Reviewed context SHA-256: `822f8e439be7bc1494f7ac01293ab0414acb11c5e3733084b03b36dbbe70f9e9`.
- Archive SHA-256: `f6828fa97d4c30f01c9a4909a3a3933d748b6eb4b695cd712e62160d20d45cae`; all 14 context files reverified before submission. Cloud Build source provenance independently reports the same archive hash and generation.
- Source object: `gs://quaerens-crm4-spain-test-build-source/zlib-validation/822f8e439be7bc1494f7ac01293ab0414acb11c5e3733084b03b36dbbe70f9e9/f6828fa97d4c30f01c9a4909a3a3933d748b6eb4b695cd712e62160d20d45cae.tar.gz`, generation `1791976469810928`.

Submission used the sealed configuration through the Cloud Build REST API, with an exclusive local submission-intent guard and generation-pinned source. The upload required object absence and verified the returned checksum. See the submission, preflight and execution-integrity receipts in [evidence](evidence/zlib-linux-validation/).

## Acceptance

| Check | Observed result |
| --- | --- |
| Patched system zlib compilation | PASS |
| Upstream static, shared and 64-bit zlib tests | PASS, all three log markers |
| Focused system gzwrite failed-write regression | PASS; provider /out/system/lib/libz.so.1 |
| Patched Node compilation completion | Not established |
| Embedded-zlib regression and provider checks | Not established |
| Final distroless compression/decompression and document smoke | Not reached |
| CRM4 application startup | Not included in the reviewed native-validation archive |

The combined native compile/test Docker step did not complete. Last visible compilation was V8 work. BuildKit clipped output at its 2 MiB limit; this does not prove a compiler error, memory exhaustion or precisely how far execution progressed afterward. All 33,305 available Cloud Logging entries across 38 pages are preserved in compressed JSON with a verified raw-content hash. Complete pagination cannot recover output clipped before ingestion.

The real application also validates the metadata-provided runtime service account. The build identity must not bypass that safeguard. A future application build can check fail-closed startup; successful managed-identity startup remains a separately approved deployment acceptance gate.

Prior local 117/117 regression, 22/22 Storage-rule and historical live 38/38 Storage acceptance evidence is preserved, not rerun or represented as acceptance of this unfinished Linux runtime. No new vulnerability scan was performed; the existing image's HIGH zlib finding remains unresolved for release purposes.

## Cloud changes, cost and rollback

Only one generation-pinned source archive upload and one validation build were performed. Project IAM is byte-for-byte unchanged in the saved policy receipts; Cloud Run still has zero services; registry digest inventory is unchanged at the two existing images. Build history contains the two historical successful builds and this single timeout. No image publication, new IAM, real accounts, customer data or other CRM changes occurred.

The recipe's public source/dependency destinations were reviewed. No unexpected destination was observed in available logs; this is not complete network-egress telemetry.

Indicative compute cost is approximately USD 1.88 using the previously reviewed USD 0.0156/minute rate and reported duration. Actual billed charges are not available in the Cloud Build response. Storage, logs, network, tax, conversion and adjustments are excluded; no billing export or resource was created to obtain a cost figure.

The terminal build needs no cancellation. Its local image was not published and the ephemeral worker is disposable. Retain logs and source generation as evidence. Any later approved source cleanup must delete only the exact object generation above using a generation-match precondition; never delete the bucket or unrelated objects. There is no IAM or deployed application change to roll back.

## Next approval boundary

The one-job approval has been consumed. Do not rerun the submission script, remove its guard, extend the timeout or increase resources under this approval.

Before requesting another job, prepare and seal a revised validation recipe with separately observable compilation and test phases and retained compiler diagnostics. Review parallelism and memory requirements: the current native recipe uses make -j2 on the eight-vCPU worker, but increasing it is not yet proven safe or sufficient. Do not silently substitute sources, patches, compiler/runtime digests or dependencies. A fresh approval must name the new archive/context hashes, identity, machine, disk, timeout, expected downloads and estimated cost for exactly one validation attempt, with no publication, scan, IAM or deployment.

A replacement application image build is premature until both zlib implementations and the final runtime pass. After validation, separately approve one sealed application image build using the verified patched-runtime recipe and existing build identity/repository. Record its new digest and provenance, then obtain separate paid-scan and private IAP deployment approvals. Private synthetic deployment and production remain NO-GO; real staff provisioning and lead import remain separately gated.
