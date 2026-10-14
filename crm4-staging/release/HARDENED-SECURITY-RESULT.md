# Hardened CRM4 image: completed security scan

**NO-GO for the first private synthetic deployment. Production restrictions remain unchanged.** The new scan completed successfully and matches the approved immutable image exactly. This report uses its new findings; the old image is used only as the comparison baseline.

Image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce`

Correct operation: `projects/quaerens-crm4-spain-test/locations/europe/operations/d46b1b50-94e5-4f50-bdcc-7ebcbc3cf2e9`

Scan: `projects/quaerens-crm4-spain-test/locations/europe/scans/59fa583e-0441-426a-bdc0-33392f0ade8d`

The supplied operation began d461b550 and returned NOT_FOUND through both REST and gcloud. A read-only project operation listing identified the single new operation beginning d46b1b50 with the exact approved digest. That operation was fetched directly and verified done without error. The lookup error, inventory and corrected receipt are retained; no replacement scan was submitted.

## Complete comparison

| Effective severity | Original image | Hardened image |
|---|---:|---:|
| Critical | 5 | 0 |
| High | 20 | 1 |
| Moderate/medium | 15 | 0 |
| Low | 50 | 17 |
| Minimal | 36 | 7 |
| Unknown | 2 | 0 |
| Total | 128 | 25 |

103 original CVE occurrences are no longer reported (80.5% reduction), including all five effective critical and 19 of 20 effective high findings. All 25 current CVE IDs were present in the baseline; none are new. All current findings are OS packages: glibc, GCC 14 runtime libraries and zlib. No npm/application dependency occurrences were returned, versus 21 previously. This does not guarantee absence of undiscovered vulnerabilities or complete scanner language coverage. Prior build evidence independently verifies 289 installed npm packages against the lock.

The response has one page, 25 unique occurrence IDs and 25 package issues, no continuation token, and every resourceUri equals the hardened digest. No fix is reported for any of these 25 package issues. Raw and normalized results are retained in evidence/hardened-security.

## Severity interpretation

Counts use Google's effective severity, which for OS packages reflects distribution assessment. Both severity fields are preserved below. Raw reported ratings are 1 critical, 7 high, 5 medium and 12 unspecified: they are not silently discarded. [Google severity definitions](https://docs.cloud.google.com/artifact-analysis/docs/severity-levels).

The raw critical CVE-2019-1010022 is effective MINIMAL for glibc. Debian labels it unimportant and notes that upstream does not treat it as a security issue. We retain the finding, not claim it is patched or absent. [Debian assessment](https://security-tracker.debian.org/tracker/CVE-2019-1010022).

## Blocking zlib finding

CVE-2026-85091 remains **HIGH** (reported and effective), affecting scanned Debian 13 zlib source version 1:1.3.dfsg+really1.3.1-1. The built binary package inventory has the corresponding +b1 rebuild suffix; this is not a different fixed upstream version. The scanner reports no fixed version (MAXIMUM sentinel).

Debian still marks this Trixie package vulnerable. Its description identifies a heap overflow in nonblocking gzwrite/gzprintf buffer handling, while its notes say that behavior was introduced in 1.3.1.2. That affected-range discrepancy is unresolved evidence, not permission to suppress the result. An upstream fix commit is linked, but a reviewed fixed package/runtime or defensible exact-binary non-applicability assessment is still required. [Current Debian record and upstream references](https://security-tracker.debian.org/tracker/CVE-2026-85091).

IAP, nonroot execution, capture-only providers and synthetic records limit exposure; they do not establish that a native memory-corruption issue is unreachable. No exploitability proof, security exception or waiver has been approved. Therefore private synthetic deployment remains NO-GO. Next engineering step is a focused zlib source/binary-linkage/applicability review or a maintained fixed runtime candidate. Any rebuild, paid rescan or deployment needs separate approval.

## Every returned finding

| CVE | Package and scanned source version | Effective | Reported | Fix |
|---|---|---|---|---|
| [CVE-2026-85091](https://security-tracker.debian.org/tracker/CVE-2026-85091) | zlib 1:1.3.dfsg+really1.3.1-1 | HIGH | HIGH | None reported |
| [CVE-2026-102010](https://security-tracker.debian.org/tracker/CVE-2026-102010) | gcc-14 14.2.0-19 | LOW | HIGH | None reported |
| [CVE-2026-18374](https://security-tracker.debian.org/tracker/CVE-2026-18374) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-19499](https://security-tracker.debian.org/tracker/CVE-2026-19499) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-19542](https://security-tracker.debian.org/tracker/CVE-2026-19542) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-27171](https://security-tracker.debian.org/tracker/CVE-2026-27171) | zlib 1:1.3.dfsg+really1.3.1-1 | LOW | MEDIUM | None reported |
| [CVE-2026-5435](https://security-tracker.debian.org/tracker/CVE-2026-5435) | glibc 2.41-12+deb13u4 | LOW | HIGH | None reported |
| [CVE-2026-6238](https://security-tracker.debian.org/tracker/CVE-2026-6238) | glibc 2.41-12+deb13u4 | LOW | MEDIUM | None reported |
| [CVE-2026-6368](https://security-tracker.debian.org/tracker/CVE-2026-6368) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-6791](https://security-tracker.debian.org/tracker/CVE-2026-6791) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-77117](https://security-tracker.debian.org/tracker/CVE-2026-77117) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-80489](https://security-tracker.debian.org/tracker/CVE-2026-80489) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-8674](https://security-tracker.debian.org/tracker/CVE-2026-8674) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-86805](https://security-tracker.debian.org/tracker/CVE-2026-86805) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-89092](https://security-tracker.debian.org/tracker/CVE-2026-89092) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-95619](https://security-tracker.debian.org/tracker/CVE-2026-95619) | gcc-14 14.2.0-19 | LOW | HIGH | None reported |
| [CVE-2026-95818](https://security-tracker.debian.org/tracker/CVE-2026-95818) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2026-97399](https://security-tracker.debian.org/tracker/CVE-2026-97399) | glibc 2.41-12+deb13u4 | LOW | UNSPECIFIED | None reported |
| [CVE-2010-4756](https://security-tracker.debian.org/tracker/CVE-2010-4756) | glibc 2.41-12+deb13u4 | MINIMAL | MEDIUM | None reported |
| [CVE-2018-20796](https://security-tracker.debian.org/tracker/CVE-2018-20796) | glibc 2.41-12+deb13u4 | MINIMAL | HIGH | None reported |
| [CVE-2019-1010022](https://security-tracker.debian.org/tracker/CVE-2019-1010022) | glibc 2.41-12+deb13u4 | MINIMAL | CRITICAL | None reported |
| [CVE-2019-1010023](https://security-tracker.debian.org/tracker/CVE-2019-1010023) | glibc 2.41-12+deb13u4 | MINIMAL | HIGH | None reported |
| [CVE-2019-1010024](https://security-tracker.debian.org/tracker/CVE-2019-1010024) | glibc 2.41-12+deb13u4 | MINIMAL | MEDIUM | None reported |
| [CVE-2019-1010025](https://security-tracker.debian.org/tracker/CVE-2019-1010025) | glibc 2.41-12+deb13u4 | MINIMAL | MEDIUM | None reported |
| [CVE-2019-9192](https://security-tracker.debian.org/tracker/CVE-2019-9192) | glibc 2.41-12+deb13u4 | MINIMAL | HIGH | None reported |

## Remaining release boundaries

- Close the zlib blocker and review any resulting candidate/scan before private deployment. Low/minimal findings stay tracked; severity differences do not authorize deleting records or disabling checks.
- Private deployment still needs exact runtime configuration activation (current image embeds deploymentApproved:false), IAP/OAuth credential application, scoped service access and separately authorized owner/synthetic membership. No Cloud Run service exists yet.
- Real operations still require reviewed production-mode/real-email provisioning changes, two confirmed individual dual-role identities with CRM4-only access, independent review/Processing responsibilities, privacy/retention/restore/incident sign-offs and deployed synthetic browser acceptance.
- Real lead import remains separately gated on governed bulk assignment/reassignment, durable batch/correction safeguards, approved preview and exact batch/customer-data authorization. See REAL-CUSTOMER-LAUNCH.md and import-preparation/README.md.

No completed workflow tests were repeated for this read-only assessment. Classification checks verify counts, unique IDs, digest match, complete pagination and comparison sets. Post-scan verification records the unchanged image, two total builds, zero Cloud Run services and unchanged IAM. No rebuild, scan submission, deployment, user provisioning or customer import was performed. Original evidence is preserved.
