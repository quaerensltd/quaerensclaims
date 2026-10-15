# CRM4 Spain — formal zlib security disposition

Assessment date: 15 October 2026. Baseline commit: e7831759. Framework: Shared CRM Framework release security; no framework or application behavior changed.

## Decision and scope

**A defensible, time-limited private synthetic test exception is possible for this exact image, subject to explicit owner risk acceptance and separate deployment approval. Production with real customer information remains NO-GO.** This is a conditional recommendation, not a deployment authorisation or a claim of vendor clearance. The scanner HIGH remains open and visible.

Image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`.

Project quaerens-crm4-spain-test / 558324850479. Scan operation e5d1cd31-6ae1-438c-aca7-f1d001c02ef2, scan c1abe587-1ab3-4fce-8eee-46572419938b. All 25 occurrences match this digest: effective critical 0, high 1, medium 0, low 17, minimal 7. Raw severities differ and remain preserved in `evidence/patched-image-scan/assessment.json`. No new scan was requested.

The preceding NO-GO applied pending a supported disposition. This review supplies a narrowly bounded engineering risk recommendation based on additional source-level comparison and test-coverage analysis. It does not change the prior scan, close the HIGH, establish universal unreachability or authorise real data.

## Authoritative defect and correction

The [Debian CVE record](https://security-tracker.debian.org/tracker/CVE-2026-85091) describes stale external input pointers in the newer nonblocking gzip-file writer, involving gz_vacate and subsequent gzprintf/gzvprintf buffer movement. [Upstream commit df84af25dc1942490e1d1c899a07619152a46148](https://github.com/madler/zlib/commit/df84af25dc1942490e1d1c899a07619152a46148) corrects the direct-write error path in gz_write. The [maintainer discussion](https://github.com/madler/zlib/issues/1310) identifies that commit as the fix; this is not maintainer endorsement of CRM4's older-version backport.

The newer path must discard pending external input after a compression/write error. The published affected range and Debian's older-version disposition differ. CRM4 does not rely on the absence of gz_vacate in 1.3.1 as an exemption: the older direct-write path can also retain external input on failure, and the backport clears it. No version-range-only not-affected claim is made.

### Line-by-line semantic comparison

| Authoritative newer correction | Applied older-source correction | Assessment |
|---|---|---|
| Opens a block when saved compression result is -1 | Opens a block when the direct gz_comp call returns -1 | Equivalent error predicate for this older synchronous path; no attempt to transplant newer nonblocking control flow |
| Clears strm.avail_in | Clears the identical field to zero | Exact required state reset: failed external input no longer remains pending |
| Resets strm.next_in to state->in | Performs the identical pointer reset | Exact required state reset: subsequent writes point at owned input storage |
| Retains existing partial-progress/error return | Retains existing return 0 | Preserves the older function's error contract; it has no newer state->again handling |
| Closes the new error block | Closes the new error block | Resets are confined to the error branch; normal write behavior is unchanged |

Both local patched gzwrite.c files were rehashed and match the actual application build receipt: `ce2da7e2567c7f3fd361cbdf56bc4354e179c1d91257ea26eeb281cbbe83e1ca`. Patch hash: `358df2b489c7e9ac0bfe033a3e2d81378a222d5ca8048d3dedf3dda4a63849ca`. The exact upstream source and comparison receipt are retained under `evidence/zlib-disposition/`. These checks verify the two required reset operations and their placement, not every possible zlib defect.

## Establishing both implementations in the image

The evidence chain is pinned source archive -> unique-context/hash-checked patch -> compiler success -> failed-write provider tests -> final nonroot image-stage checks -> registry-layer hashes. Source preparation uses a literal replacement guarded by the original file hash and uniqueness check; the resulting file hashes match the compiler receipt. Compilation is established by later phase logs, not by the preparation receipt alone.

| Component | Actual final SHA-256 | Evidence |
|---|---|---|
| System libz.so.1.3.1 | 27ec58df686ab3e3299191216f6fb3507681a23ebac697ca49babaaa73ac71d3 | Upstream static/shared/64-bit tests; failed-write state assertions; final library provider path and layer hash |
| Node executable with embedded zlib | 7fdf238278572555edea211d2fc69b8903689983656eaa7ec7d3361521d016cc | Addon resolves gzwrite to process.execPath, checks state resets, compression roundtrip; final executable hash; no dynamic libz dependency |

This is strong build-and-behavior evidence that both intended copies contain the correction. It is not independent binary disassembly or a vendor attestation. Test addons and regression executables are absent from the final application image. Final DOCX/PDF smoke tests passed as UID 65532 with no network calls. Existing acceptance was reviewed, not rerun.

## Regression coverage and missing exploit-specific tests

`gzwrite-regression.c` opens a temporary file read-only, wraps it in transparent write mode, uses a small gzip buffer, writes a larger external buffer to force a failed direct write, checks avail_in==0 and next_in==state->in, calls gzclearerr, then repeats the failed write and assertions. It verifies the loaded provider via dladdr. Compilation does not define NDEBUG, so assertions remain enabled. The Node addon uses the same test logic against the executable's symbols. The final image build forces the verification stage as a dependency.

Missing coverage is material and must not be described as completed:

- No full failure -> clear/recovery -> gzprintf or gzvprintf sequence with memory-safety instrumentation and boundary assertions.
- No nonblocking EAGAIN/partial-write scenario or controlled recovery to a writable descriptor. Applicability to the older fatal-error implementation needs a version-appropriate harness.
- Transparent-write failure is exercised; the compressed-output failure branch is not separately demonstrated.
- No unpatched negative-control run demonstrating that the exact regression fails before patching, nor sanitizer-backed fuzzing of error/retry combinations.

The state assertions directly target the corrected invariant, so these omissions do not negate the existing PASS results. They limit confidence about the complete exploit sequence and other branches. A focused validation against retained exact binaries, plus an isolated negative-control library if needed, is the preferred next technical work before real-customer acceptance. Any compilation/cloud job requires its own approval; none was run here. No evidence currently demonstrates that another application-image rebuild is necessary.

## External input reachability

The reviewed imported-assessment handler accepts PDF bytes through pdf-parse and DOCX bytes through mammoth.extractRawText. Mammoth's unzip/zipfile path uses JSZip; JSZip's compression worker uses pako. PDFKit's image/document output calls Node deflateSync. The pinned Node binding invokes inflate/deflate, not gzwrite/gzprintf/gz_vacate. Storage registration validates object metadata and ownership; storing or downloading bytes does not itself invoke the gzip-file writer.

Therefore no supported CRM4 document/upload path to the affected gzip-file error state machine was identified. This is scoped static analysis, not proof that every parser is safe or every native caller is unreachable. Malformed-document resource exhaustion, unrelated parser vulnerabilities, native loading/code execution, future dependencies and optional integrations remain outside this particular conclusion. Prior image inventory found no application .node addons; the validation-only addon was excluded. The inspected system libcrypto compression dependency used inflate/deflate in the earlier binary analysis.

Hash receipts identify the inspected handler, document libraries and Node binding. For the private exception, accept only known synthetic fixtures prepared by the owner; no customer-derived, emailed, public or otherwise untrusted documents. This restriction removes the intended hostile-document entry scenario during the test; it is not an acceptable substitute for production validation.

## Debian, Google and residual findings

Debian still reports its trixie source package unfixed as checked on the assessment date. CRM4's locally maintained +crm4.1 version is not an official Debian fixed release. Google reports that exact custom version, so it detected the new package metadata; it still classifies CVE-2026-85091 HIGH and supplies no concrete fixed version. Its response does not show patch-level analysis or separate coverage of Node's embedded copy.

A version/backport recognition limitation is the leading engineering explanation, not a confirmed statement from Google. The wording 'Google does not recognise the backport' must remain an inference until confirmed. The scan neither proves the compiled fix failed nor independently verifies it. Preserve the finding without suppression, renaming packages, changing version claims or submitting a misleading not-affected VEX.

The separate LOW zlib CVE-2026-27171 and all other low/minimal findings remain in the ledger; this review does not resolve them. No application vulnerability occurrences were returned, and the previous npm audit was zero, but neither establishes complete embedded-component coverage.

## Node reproducibility limitation

The successful prior validation Node hash was `ac7adf673431129b91a0026fc5d66b0f8ec32b7892ce9df23ed8fb76e917990e`; final Node differs. System zlib is bit-identical. Both builds used the same pinned archives and eight recipe files and passed their own provider tests. Registry bytes match the final build's own hash receipt.

The recipe sets locale, timezone and SOURCE_DATE_EPOCH, but uses randomly named source directories and parallel compilation; it does not set file/debug prefix mapping or demonstrate deterministic generated/intermediate files. Preserved compiler logs differ even after path normalization and sorting, including generated intermediate names and directory ordering. Those are plausible sources of nondeterminism, not an established explanation of the binary difference. The prior validation binary was not exported, so direct ELF section/build-ID comparison cannot now establish the cause without additional authorised work.

Security implication: no evidence of a substituted binary was found in the recorded chain, but independent bit-for-bit reconstruction and attribution of every changed byte are unavailable. This reduces supply-chain assurance and must be accepted explicitly for a limited synthetic test. Preserve both artifacts/logs and hashes; future validation should export binaries, generated configuration and section metadata to permit comparison. Do not call this reproducible merely because inputs are pinned.

## Proposed private exception and stop conditions

The accountable owner may explicitly accept this residual risk for a maximum seven-day synthetic-only test, tied to the exact digest and this assessment. The exception expires automatically unless reassessed; it is not acceptance of real-customer use. Separate deployment approval must name the digest, configuration and IAM boundaries.

Before the application can be used, verify fail-closed IAP with only brusseljeroen@gmail.com, separately authorised CRM4 Firebase membership, no public invocation, isolated CRM4 project/data, existing ownership/workspace/audit rules and mocked providers. IAP is a planned deployment control, not asserted live: no Cloud Run service was deployed. Firebase membership controls remain necessary because IAP alone does not protect every Firebase endpoint. No real staff or customer identities/data may be created under this exception.

Use known synthetic documents only; do not expose a client intake workflow to customers. Retain nonroot distroless execution, constrained resources, existing minimum runtime permissions and no production credentials. These reduce exposure/blast radius but do not prove absence of a memory-safety defect. Record the operator, test scope and expiry; review crashes, authorisation failures and unexpected provider/network activity. Stop access on scope drift, public access, real-data ingress, suspicious crashes or evidence contradicting the backport. Disable access/stop the service under the deployment's separately approved rollback procedure; do not roll back to an older vulnerable image.

## Production requirements and exact next decision

Production remains NO-GO. Required assurance work: close the targeted regression gaps or obtain equivalent independently reviewed evidence; formally resolve/accept the outstanding HIGH with security accountability and maintenance ownership; address the Node provenance limitation through binary comparison or a documented independent review of the exact final build chain; review all residual findings; and pass the existing real-customer readiness, privacy, backup/recovery, browser and staff/lead-import gates. A vendor release is preferable for ongoing maintenance but is not logically required just to make the scanner green.

**Recommended next approval:** accept the bounded seven-day synthetic risk exception described above, then separately approve the exact private deployment configuration after its preflight. This assessment alone authorises neither action. Additional technical validation is required before production; mandatory further code remediation or an identical rebuild/rescan is not established by current evidence. If focused testing fails or a supported path exposes an incomplete fix, remediation becomes mandatory and requires a new reviewed build/scan request.

No external support request was sent, no finding suppressed, and no IAM, build, scan, deployment, staff or data operation occurred. CRM2/CRM3/CRM5 and production remain unchanged.
