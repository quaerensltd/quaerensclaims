# CRM4 immutable image security assessment

**NO-GO for private deployment of this image.** The owner-submitted scan completed successfully and all result pages were retrieved. The operation and every finding match the approved immutable digest. No rebuild, deployment or new scan was performed.

Image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:f62e96fef639c362e2aeb86630bbf6487c861017acdc74aa5b7f52a64b8d253e`

Scan: `projects/quaerens-crm4-spain-test/locations/europe/scans/e6e2de76-501a-4f75-94f1-b616961db8d9`. Operation: `projects/quaerens-crm4-spain-test/locations/europe/operations/0bfd60c9-b78f-46ce-8225-be11a402aab4`. Scan initiated 14 October 2026 at 11:06 Europe/Madrid. Raw operation/results and normalized assessment are preserved under evidence/image-security.

## Complete classification

Counts are Google effective-severity vulnerability occurrences, not npm audit dependency-chain counts. MEDIUM is shown as moderate. Each occurrence is counted once per package type; one npm occurrence includes two installed pacote versions, so there are 129 package issues across 128 occurrences.

| Effective severity | OS | npm | Total |
| --- | ---: | ---: | ---: |
| CRITICAL | 5 | 0 | 5 |
| HIGH | 10 | 10 | 20 |
| Moderate | 5 | 10 | 15 |
| LOW | 49 | 1 | 50 |
| MINIMAL | 36 | 0 | 36 |
| UNKNOWN | 2 | 0 | 2 |

MINIMAL and UNKNOWN findings are retained separately, not silently merged into low or treated as clean. Original upstream severities are also retained in assessment.json and the full table below. Google effective severity accounts for distribution-specific assessments; it is not our own downgrade. [Google severity definitions](https://docs.cloud.google.com/artifact-analysis/docs/severity-levels).

## Deployment blockers and practical interpretation

All five critical occurrences affect Debian Perl 5.36.0-7+deb12u3; the scanner reports fixes in 5.36.0-7+deb12u4. Their IDs are CVE-2026-8376, CVE-2026-13221, CVE-2026-57433, CVE-2026-42496 and CVE-2026-12087. Debian independently confirms the old and fixed package versions for CVE-2026-8376. That advisory has 32-bit/attacker-controlled-regex prerequisites: a package finding alone is not proof that the CRM request path can exploit it. No architecture/reachability waiver is being asserted for the five critical findings. [Debian advisory](https://security-tracker.debian.org/tracker/CVE-2026-8376).

The ten high OS occurrences cover Perl, zlib, acl and attr. The ten high npm occurrences cover pacote, http-cache-semantics, sigstore, picomatch, ip-address and brace-expansion. Several have fixes reported; 19 of the 25 critical/high occurrences have at least one fixed package version. MAXIMUM/no fixedVersion in the raw result means no concrete fix is reported in that scan, not that the vulnerability is harmless.

Except sprintf-js, the flagged npm packages are absent from the isolated application package-lock.json. They therefore require investigation in the base-image/package-manager tooling or another packaged dependency tree; that attribution is an inference, not verified filesystem-path evidence. They remain in the image findings and are not dismissed as unreachable. The earlier npm audit covered the application lockfile and did not cover all image OS/global tooling packages, which explains why it was not an image-security clearance.

## The three known moderate dependency entries

The actual image scan confirms sprintf-js 1.0.3 / CVE-2026-97058 (GHSA-hp3w-g68c-fv3c), moderate, with no fix reported. The prior three npm audit entries (sprintf-js, argparse and mammoth) represent one underlying advisory plus dependent packages, not three independent CVEs. The existing synthetic DOCX extraction test passed without loading argparse or sprintf-js. Thus the observed document-library path has limited exposure, but the vulnerable package remains installed and no global non-exploitability claim is justified. Do not force the old suggested Mammoth downgrade. [Underlying advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).

## Required next work and boundaries

Prepare an updated pinned base/runtime proposal that removes or fixes affected OS packages and excludes unnecessary package-manager/CLI tooling from the final runtime, preserving the Shared CRM Framework and document workflows. Resolve remaining npm findings, including a supported treatment for sprintf-js, or provide package-specific reachability/architecture evidence for explicit risk review. No source/base/dependency changes or rebuild are included in this assessment. A replacement build and scan require separate approval; do not deploy this existing digest pending resolution.

After a reviewed replacement image passes security acceptance, the existing private-deployment gates remain: exact digest approval, native IAP, two service-specific IAM bindings, owner-private OAuth credential configuration, separate Firebase Administrator membership and deployed browser acceptance. The 38/38 Storage evidence remains intact.

One completed owner-submitted scan is observed. No new scan was submitted here. Actual billed cost is not returned by the scan API and remains unavailable; reconcile the operation in billing reports. No zero-cost claim is made.

## All findings

| ID | Effective | Original | Type | Package and installed version | Fix reported |
| --- | --- | --- | --- | --- | --- |
| CVE-2026-12087 | CRITICAL | CRITICAL | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-13221 | CRITICAL | CRITICAL | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-42496 | CRITICAL | CRITICAL | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-57433 | CRITICAL | CRITICAL | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-8376 | CRITICAL | CRITICAL | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-102276 | HIGH | HIGH | NPM | brace-expansion 2.0.2 | 2.1.5 |
| CVE-2026-102278 | HIGH | HIGH | NPM | brace-expansion 2.0.2 | 2.1.6 |
| CVE-2026-13149 | HIGH | UNSPECIFIED | NPM | brace-expansion 2.0.2 | 2.1.2 |
| CVE-2026-14257 | HIGH | UNSPECIFIED | NPM | brace-expansion 2.0.2 | 2.1.3 |
| CVE-2026-33671 | HIGH | HIGH | NPM | picomatch 4.0.3 | 4.0.4 |
| CVE-2026-42497 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-48815 | HIGH | HIGH | NPM | sigstore 3.1.0 | 4.1.1 |
| CVE-2026-48959 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-48962 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-54369 | HIGH | HIGH | OS | acl 2.3.1-3 | No concrete fix reported |
| CVE-2026-54370 | HIGH | HIGH | OS | acl 2.3.1-3 | No concrete fix reported |
| CVE-2026-54371 | HIGH | HIGH | OS | attr 1:2.5.1-4 | No concrete fix reported |
| CVE-2026-57432 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-69152 | HIGH | HIGH | NPM | brace-expansion 2.0.2 | 2.1.4 |
| CVE-2026-69192 | HIGH | HIGH | NPM | ip-address 10.1.0 | 10.3.1 |
| CVE-2026-7017 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-85091 | HIGH | HIGH | OS | zlib 1:1.2.13.dfsg-1 | No concrete fix reported |
| CVE-2026-93748 | HIGH | HIGH | NPM | http-cache-semantics 4.2.0 | No concrete fix reported |
| CVE-2026-9496 | HIGH | UNSPECIFIED | NPM | pacote 19.0.2; pacote 20.0.1 | 21.5.1; 21.5.1 |
| CVE-2026-9538 | HIGH | HIGH | OS | perl 5.36.0-7+deb12u3 | No concrete fix reported |
| CVE-2024-10041 | MEDIUM | MEDIUM | OS | pam 1.5.2-6+deb12u2 | No concrete fix reported |
| CVE-2025-15649 | MEDIUM | MEDIUM | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-101911 | MEDIUM | MEDIUM | NPM | ip-address 10.1.0 | 10.7.1 |
| CVE-2026-101912 | MEDIUM | MEDIUM | NPM | ip-address 10.1.0 | 10.7.1 |
| CVE-2026-101913 | MEDIUM | MEDIUM | NPM | ip-address 10.1.0 | 10.5.1 |
| CVE-2026-102277 | MEDIUM | MEDIUM | NPM | brace-expansion 2.0.2 | 2.1.7 |
| CVE-2026-104844 | MEDIUM | MEDIUM | NPM | postcss-selector-parser 7.1.1 | 7.1.6 |
| CVE-2026-13595 | MEDIUM | MEDIUM | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-15534 | MEDIUM | MEDIUM | OS | perl 5.36.0-7+deb12u3 | No concrete fix reported |
| CVE-2026-19487 | MEDIUM | MEDIUM | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-33672 | MEDIUM | MEDIUM | NPM | picomatch 4.0.3 | 4.0.4 |
| CVE-2026-33750 | MEDIUM | HIGH | NPM | brace-expansion 2.0.2 | 2.0.3 |
| CVE-2026-42338 | MEDIUM | MEDIUM | NPM | ip-address 10.1.0 | 10.1.1 |
| CVE-2026-48758 | MEDIUM | MEDIUM | NPM | @sigstore/core 2.0.0 | 3.2.1 |
| CVE-2026-97058 | MEDIUM | MEDIUM | NPM | sprintf-js 1.0.3 | No concrete fix reported |
| CVE-2016-2781 | LOW | MEDIUM | OS | coreutils 9.1-1 | No concrete fix reported |
| CVE-2023-50495 | LOW | MEDIUM | OS | ncurses 6.4-4 | No concrete fix reported |
| CVE-2024-56433 | LOW | UNSPECIFIED | OS | shadow 1:4.13+dfsg1-1+deb12u2 | No concrete fix reported |
| CVE-2025-13151 | LOW | HIGH | OS | libtasn1-6 4.19.0-2+deb12u1 | No concrete fix reported |
| CVE-2025-30258 | LOW | MEDIUM | OS | gnupg2 2.2.40-1.1+deb12u2 | No concrete fix reported |
| CVE-2025-6141 | LOW | MEDIUM | OS | ncurses 6.4-4 | No concrete fix reported |
| CVE-2025-68972 | LOW | MEDIUM | OS | gnupg2 2.2.40-1.1+deb12u2 | No concrete fix reported |
| CVE-2025-69720 | LOW | HIGH | OS | ncurses 6.4-4 | No concrete fix reported |
| CVE-2026-102010 | LOW | HIGH | OS | gcc-12 12.2.0-14+deb12u1 | No concrete fix reported |
| CVE-2026-105712 | LOW | UNSPECIFIED | OS | gnupg2 2.2.40-1.1+deb12u2 | No concrete fix reported |
| CVE-2026-13757 | LOW | MEDIUM | OS | p11-kit 0.24.1-2 | No concrete fix reported |
| CVE-2026-15059 | LOW | UNSPECIFIED | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2026-16742 | LOW | UNSPECIFIED | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2026-18374 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-18477 | LOW | MEDIUM | OS | tar 1.34+dfsg-1.2+deb12u1 | No concrete fix reported |
| CVE-2026-18508 | LOW | MEDIUM | OS | tar 1.34+dfsg-1.2+deb12u1 | No concrete fix reported |
| CVE-2026-18938 | LOW | MEDIUM | OS | p11-kit 0.24.1-2 | No concrete fix reported |
| CVE-2026-19499 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-19542 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-27171 | LOW | MEDIUM | OS | zlib 1:1.2.13.dfsg-1 | No concrete fix reported |
| CVE-2026-27456 | LOW | MEDIUM | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-3184 | LOW | MEDIUM | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-40228 | LOW | LOW | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2026-41991 | LOW | MEDIUM | OS | gzip 1.12-1 | No concrete fix reported |
| CVE-2026-41992 | LOW | HIGH | OS | gzip 1.12-1 | No concrete fix reported |
| CVE-2026-42250 | LOW | UNSPECIFIED | OS | bzip2 1.0.8-5 | No concrete fix reported |
| CVE-2026-5435 | LOW | HIGH | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-54411 | LOW | UNSPECIFIED | OS | pam 1.5.2-6+deb12u2 | No concrete fix reported |
| CVE-2026-5450 | LOW | CRITICAL | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-5704 | LOW | MEDIUM | OS | tar 1.34+dfsg-1.2+deb12u1 | No concrete fix reported |
| CVE-2026-57062 | LOW | UNSPECIFIED | OS | gnupg2 2.2.40-1.1+deb12u2 | No concrete fix reported |
| CVE-2026-5928 | LOW | HIGH | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-6238 | LOW | MEDIUM | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-6368 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-6791 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-7010 | LOW | MEDIUM | OS | perl 5.36.0-7+deb12u3 | 5.36.0-7+deb12u4 |
| CVE-2026-76642 | LOW | HIGH | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-77117 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-78408 | LOW | HIGH | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-78409 | LOW | HIGH | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-78410 | LOW | HIGH | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-80489 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-82560 | LOW | HIGH | OS | perl 5.36.0-7+deb12u3 | No concrete fix reported |
| CVE-2026-8674 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-86805 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-89092 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-9358 | LOW | LOW | NPM | postcss-selector-parser 7.1.1 | 7.1.3 |
| CVE-2026-95619 | LOW | HIGH | OS | gcc-12 12.2.0-14+deb12u1 | No concrete fix reported |
| CVE-2026-95818 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2026-97399 | LOW | UNSPECIFIED | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2005-2541 | MINIMAL | CRITICAL | OS | tar 1.34+dfsg-1.2+deb12u1 | No concrete fix reported |
| CVE-2007-5686 | MINIMAL | MEDIUM | OS | shadow 1:4.13+dfsg1-1+deb12u2 | No concrete fix reported |
| CVE-2010-4756 | MINIMAL | MEDIUM | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2011-3374 | MINIMAL | LOW | OS | apt 2.6.1 | No concrete fix reported |
| CVE-2011-3389 | MINIMAL | MEDIUM | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2011-4116 | MINIMAL | LOW | OS | perl 5.36.0-7+deb12u3 | No concrete fix reported |
| CVE-2013-4392 | MINIMAL | LOW | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2017-18018 | MINIMAL | MEDIUM | OS | coreutils 9.1-1 | No concrete fix reported |
| CVE-2018-20796 | MINIMAL | HIGH | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2018-6829 | MINIMAL | HIGH | OS | libgcrypt20 1.10.1-3+deb12u1 | No concrete fix reported |
| CVE-2019-1010022 | MINIMAL | CRITICAL | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2019-1010023 | MINIMAL | HIGH | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2019-1010024 | MINIMAL | MEDIUM | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2019-1010025 | MINIMAL | MEDIUM | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2019-9192 | MINIMAL | HIGH | OS | glibc 2.36-9+deb12u14 | No concrete fix reported |
| CVE-2022-0563 | MINIMAL | MEDIUM | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2022-27943 | MINIMAL | MEDIUM | OS | gcc-12 12.2.0-14+deb12u1 | No concrete fix reported |
| CVE-2022-3219 | MINIMAL | LOW | OS | gnupg2 2.2.40-1.1+deb12u2 | No concrete fix reported |
| CVE-2023-31437 | MINIMAL | MEDIUM | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2023-31438 | MINIMAL | MEDIUM | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2023-31439 | MINIMAL | MEDIUM | OS | systemd 252.39-1~deb12u2 | No concrete fix reported |
| CVE-2023-31486 | MINIMAL | HIGH | OS | perl 5.36.0-7+deb12u3 | No concrete fix reported |
| CVE-2024-2236 | MINIMAL | MEDIUM | OS | libgcrypt20 1.10.1-3+deb12u1 | No concrete fix reported |
| CVE-2025-14104 | MINIMAL | MEDIUM | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2025-5278 | MINIMAL | MEDIUM | OS | coreutils 9.1-1 | No concrete fix reported |
| CVE-2026-102473 | MINIMAL | MEDIUM | OS | dash 0.5.12-2 | No concrete fix reported |
| CVE-2026-102474 | MINIMAL | MEDIUM | OS | dash 0.5.12-2 | No concrete fix reported |
| CVE-2026-53910 | MINIMAL | UNSPECIFIED | OS | diffutils 1:3.8-4 | No concrete fix reported |
| CVE-2026-56391 | MINIMAL | MEDIUM | OS | coreutils 9.1-1 | No concrete fix reported |
| CVE-2026-56392 | MINIMAL | MEDIUM | OS | coreutils 9.1-1 | No concrete fix reported |
| CVE-2026-67693 | MINIMAL | HIGH | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-88647 | MINIMAL | CRITICAL | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-88648 | MINIMAL | UNSPECIFIED | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-95184 | MINIMAL | HIGH | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-95209 | MINIMAL | HIGH | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-95210 | MINIMAL | CRITICAL | OS | gnutls28 3.7.9-2+deb12u7 | No concrete fix reported |
| CVE-2026-53613 | UNKNOWN | UNSPECIFIED | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
| CVE-2026-53615 | UNKNOWN | UNSPECIFIED | OS | util-linux 2.38.1-5+deb12u3 | No concrete fix reported |
