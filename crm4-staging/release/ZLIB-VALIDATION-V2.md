# CRM4 zlib validation v2 — approval handoff

> Execution completed: **PASS** on 14 October 2026. See [verified results](ZLIB-VALIDATION-V2-RESULT.md). The single-job approval is consumed; the preparation text below is historical and must not be used to resubmit.

Prepared locally on 14 October 2026 from a96f4969. **No cloud job submitted; private and production release remain NO-GO.** This is Shared CRM Framework release tooling only. Historical acceptance and the failed first job remain intact.

## Investigation

The previous job's system-zlib upstream tests completed at 7.110 seconds and its focused regression at 7.219 seconds. Node configuration finished at 9.042 seconds. The preserved log contains 1,246 compiler command lines, including OpenSSL compilation through 245.1 seconds. V8-related diagnostics continued through 3,525.2 seconds. BuildKit clipped output at 245.1 and 3,525.2 seconds; the enclosing native step never finished before the two-hour job timeout. These are output observations, not per-object CPU measurements. Exact attribution of the remaining time is impossible from those clipped logs; no compiler failure or OOM is proven. See [timing evidence](evidence/zlib-validation-v2/previous-timing.json).

The [official Node release index](https://nodejs.org/dist/index.json) still lists 22.23.3 as the newest Node 22 release. Direct checks of its tagged gzwrite.c and the two preceding releases found the same vulnerable source hash and no approved reset patch. See [retrieved source evidence](evidence/zlib-validation-v2/node-release-review.json). Therefore no verified maintained prebuilt Node 22 shortcut has been established. A newer image tag alone cannot prove its embedded implementation is fixed. We retain the pinned compiler and distroless digests, Node version, both source hashes and original patch. We do not replace Node with an unverified third-party binary, switch major versions, or replace bundled zlib with a shared library.

## Revised execution

1. Run compilation directly in the pinned compiler container, with /out bound to the build workspace. This removes BuildKit's per-RUN output clipping from the long compilation phase. Four make jobs replace two. The compiler container is limited to four CPUs and 7 GiB memory with no additional swap, leaving worker capacity for Docker and diagnostics. No security or compiler optimization flags are disabled; Node keeps its default static bundled zlib.
2. Capture each download/configure/compile/test phase to its own complete log. Emit 30-second heartbeats, elapsed time, log size, cgroup memory usage/peak/events, exit status, checksum and bounded log tail. Compiler warnings are retained, not suppressed. An internal 6,600-second timeout leaves nominal time for diagnostics before the 7,200-second job limit; initial pulls or slow final stages can still exhaust the outer limit.
3. A dedicated diagnostic step emits a gzip archive as 3,000-character base64 lines between CRM4_DIAGNOSTICS_BASE64_BEGIN/END markers, preceded by its SHA-256. Retrieve those Cloud Logging textPayload entries in timestamp order, concatenate only lines between markers, base64-decode, and verify the recorded archive hash before extraction. This preserves full logs beyond the displayed tails without creating a new storage resource. A hard worker/job termination can still prevent collection; missing receipts are failure, never success.
4. Native-step failure is temporarily allowed only so collection runs. A native-success file is written strictly after compilation, both provider/regression checks and package metadata finish. The final Docker stage requires it; otherwise the overall build fails. Final distroless checks reverify binary hashes, the system-library provider, Node's embedded symbol provider, compression behavior and nonroot DOCX/PDF smoke. The local validation image is discarded; nothing is pushed.

Fresh builds use no cross-job compiler cache. The failed job did not export a trustworthy cache. Reusing arbitrary object files would undermine provenance. Build-local outputs are reused only between this job's compiler and final smoke stages. A future content-addressed compiler cache would need its own reviewed storage, invalidation and provenance design; it is not part of this request. No speculative V8 feature removal, reduced optimization, shared-library switch or snapshot configuration change is included.

## Package and local verification

- Context SHA-256: `d7fdf5cdf196f74929d5fdcee427aff62b70cc3ab7355fe369aa89ae39897339` (15 files, reproduced identically by two preparations).
- Archive SHA-256: `a5869ff361af26c7fa95240ec3cfef7c9d9eababe45cf9b91a429dc1a918cf5c`.
- Archive: `crm4-staging/.scratch/zlib-validation/crm4-zlib-validation-v2.tar.gz`.
- npm lock remains `bde138edf2752278b1830fde437f4c6db53b90671505430cbb3e9eed4ff197e8`.
- Bash syntax and JavaScript syntax checks passed. Diagnostic success, retained stdout/stderr and exit-7 propagation passed under Git Bash. Existing document smoke passed on Windows Node 22.14.0; it is not patched Linux acceptance.
- The prior full regression and Storage evidence was not repeated: this change affects validation orchestration, not CRM workflows or rules. No new scan or Linux compilation occurred locally.

## Resource and cost estimate

Request the same E2_HIGHCPU_8 worker (8 vCPUs, 8 GB memory), 100 GB ephemeral disk and 7,200-second maximum. Four compile jobs offer more concurrency, but memory pressure and actual Node build duration are not yet measured. Budget **70–110 minutes as an unvalidated planning range**, not a completion promise; the job can still time out or hit its memory limit. At the [published Cloud Build rate](https://cloud.google.com/build/pricing?hl=pt) of USD 0.0156/minute, that is approximately USD 1.09–1.72 compute, or USD 1.87 for 120 minutes before lifecycle overhead. Storage, network, diagnostic log ingestion, tax and currency conversion are additional; the existing GBP20 budget alert is not a spending cap.

## Exact next approval

Approve ONE validation-only Cloud Build job in quaerens-crm4-spain-test / 558324850479, europe-west1, using existing crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com, the worker/disk/timeout above and the exact archive/context hashes above. Scope includes one source upload to the existing private build-source bucket, the three reviewed steps in [cloudbuild.validation.json](evidence/zlib-validation-v2/cloudbuild.validation.json), public pinned source/image/npm downloads and diagnostic output to existing Cloud Logging. No persistent cache, registry publication, additional IAM, service creation, scan, deployment, real user or customer data is included.

Before execution, reverify project number, operator martijnpronk76@gmail.com, build identity and existing permissions; check prior submission history; verify archive SHA-256 and extracted context using verify-context.cjs. The existing submit-validation.sh still requires explicit approval plus the exact context digest and creates a durable one-attempt marker. Do not reuse the previous approval or remove a marker to retry. No job is submitted by preparing this package.

On completion retrieve the build receipt, phase logs, diagnostic archive and final runtime results. Failure, missing embedded-provider acceptance or missing final smoke remains NO-GO. The next approval after a passing validation is a separately sealed replacement application image build, followed by a digest-specific scan and private deployment approval. Successful application startup under the real runtime identity remains a deployment gate; this native recipe does not bypass that identity check.

Rollback: a terminal validation job publishes no image and changes no IAM or service. Retain evidence; any later source-object cleanup must target the recorded exact generation only. Do not delete buckets, old images or prior evidence.
