# Final patched CRM4 image scan — 15 October 2026

**NO-GO for private synthetic deployment; production remains NO-GO.** Shared CRM Framework release-security assessment only. No application or framework behavior changed.

Operation: `projects/quaerens-crm4-spain-test/locations/europe/operations/e5d1cd31-6ae1-438c-aca7-f1d001c02ef2`

Image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`

The operation completed without error. All 25 occurrences match the exact image URI, are unique, and were retrieved across 1 page(s) with no remaining page token. Raw responses and classification are retained in evidence/patched-image-scan/. No additional scan or cloud mutation was performed.

## Classification

Effective (distribution-context) severity: critical 0, high 1, medium/moderate 0, low 17, minimal 7, unknown 0. Raw reported severity is preserved separately: {"HIGH":7,"UNSPECIFIED":12,"MEDIUM":5,"CRITICAL":1}. In particular, the raw CRITICAL glibc CVE-2019-1010022 is effective MINIMAL; this is the returned scanner classification, not a suppression by this review.

All findings are OS package issues. No application/npm vulnerability occurrences were returned; this is not proof of comprehensive embedded-code coverage. The prior npm audit found zero; it was not rerun. Every package issue has fixedVersion.kind=MAXIMUM, so no concrete fixed package version is supplied by this scan.

| CVE | Source package | Installed source version | Effective | Raw |
|---|---|---|---|---|
| CVE-2010-4756 | glibc | 2.41-12+deb13u4 | MINIMAL | MEDIUM |
| CVE-2018-20796 | glibc | 2.41-12+deb13u4 | MINIMAL | HIGH |
| CVE-2019-1010022 | glibc | 2.41-12+deb13u4 | MINIMAL | CRITICAL |
| CVE-2019-1010023 | glibc | 2.41-12+deb13u4 | MINIMAL | HIGH |
| CVE-2019-1010024 | glibc | 2.41-12+deb13u4 | MINIMAL | MEDIUM |
| CVE-2019-1010025 | glibc | 2.41-12+deb13u4 | MINIMAL | MEDIUM |
| CVE-2019-9192 | glibc | 2.41-12+deb13u4 | MINIMAL | HIGH |
| CVE-2026-102010 | gcc-14 | 14.2.0-19 | LOW | HIGH |
| CVE-2026-18374 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-19499 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-19542 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-27171 | zlib | 1:1.3.dfsg+really1.3.1-1+crm4.1 | LOW | MEDIUM |
| CVE-2026-5435 | glibc | 2.41-12+deb13u4 | LOW | HIGH |
| CVE-2026-6238 | glibc | 2.41-12+deb13u4 | LOW | MEDIUM |
| CVE-2026-6368 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-6791 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-77117 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-80489 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-85091 | zlib | 1:1.3.dfsg+really1.3.1-1+crm4.1 | HIGH | HIGH |
| CVE-2026-8674 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-86805 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-89092 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-95619 | gcc-14 | 14.2.0-19 | LOW | HIGH |
| CVE-2026-95818 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |
| CVE-2026-97399 | glibc | 2.41-12+deb13u4 | LOW | UNSPECIFIED |

The CVE/package set is unchanged from the preceding hardened image: 0 added, 0 removed. The original 128 count remains reduced to 25, but the final patch has not reduced the scanner finding count. This comparison uses each image's own scan.

## Zlib disposition

CVE-2026-85091 remains HIGH against Debian 13 source package zlib, version 1:1.3.dfsg+really1.3.1-1+crm4.1. This exact custom version matches the image's verified dpkg metadata, so the scanner recognised the updated package version rather than simply reporting the old image. Its response contains no code-level patch evaluation or separate Node-embedded-zlib occurrence.

The [Debian tracker](https://security-tracker.debian.org/tracker/CVE-2026-85091), checked 2026-10-15, still lists trixie upstream packaging as vulnerable and unfixed. It identifies [upstream commit df84af25](https://github.com/madler/zlib/commit/df84af25dc1942490e1d1c899a07619152a46148) as the fix. The CRM4 backport implements the same two state resets on the older direct-write error path. The custom package suffix is not vendor recognition of a fix.

Preserved build evidence independently supports remediation: both source copies received patch SHA-256 358df2b489c7e9ac0bfe033a3e2d81378a222d5ca8048d3dedf3dda4a63849ca; system upstream tests and system/embedded failed-write regressions passed; the embedded provider was the actual Node executable; final distroless runtime checks and DOCX/PDF smoke tests passed. Registry-layer hashes match that build's system library and Node binary. See evidence/patched-application-build/{patch-receipt.json,acceptance-highlights.txt,final-runtime-verification.json}. The source-preparation receipt's compilationPerformed=false refers only to that preparation phase; later build logs establish compilation.

System library SHA-256: 27ec58df686ab3e3299191216f6fb3507681a23ebac697ca49babaaa73ac71d3. Node SHA-256: 7fdf238278572555edea211d2fc69b8903689983656eaa7ec7d3361521d016cc. Node still reports bundled version 1.3.1-e00f703. The scan cannot establish that embedded code is separately inventoried or patched; runtime regression evidence must remain distinct from scanner coverage.

Assessment: a package-version/backport recognition gap is plausible, supported by the custom version and compiled patch evidence, but not independently confirmed by the scanner vendor. Do not treat the returned HIGH as proof the patch failed, or mark it resolved/false-positive merely because tests passed. It remains open for a supported security disposition. CVE-2026-27171 remains a separate LOW zlib finding and is not resolved by this patch claim.

## Reproducibility and next gate

System zlib is bit-identical to the prior successful Linux validation. Node is not: prior hash ac7adf673431129b91a0026fc5d66b0f8ec32b7892ce9df23ed8fb76e917990e differs from the final image's hash despite matching pinned archives and eight recipe files. Both builds passed their own provider/regression checks. The prior validation binary was not exported, so the exact binary-level cause is undetermined. No bit-for-bit reproducibility claim is made; evidence/patched-application-build/validation-comparison.json is preserved.

The next useful step is a documented review of the custom backport, failed-write regressions and scanner recognition/coverage, ideally with Google or the package maintainer. No external support message was sent. A competent security disposition must explicitly address the outstanding HIGH, embedded copy and reproducibility limitation before a GO can be issued. Do not change version metadata to evade detection or repeat the same build/scan without new evidence. If that review requires a maintained replacement image, request separate build and scan approval.

Even after security clearance, private IAP deployment requires separate approval and browser acceptance. IAM changes, real staff provisioning, customer imports and real-customer operations remain unauthorised. No CRM2/CRM3/CRM5 or production resources changed. Actual scan charges are not present in the operation/findings receipts.
