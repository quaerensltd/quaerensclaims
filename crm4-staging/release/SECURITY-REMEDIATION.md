# CRM4 Spain security-remediation candidate

Shared CRM Framework; CRM4 packaging/dependencies only. Baseline `1a1246a0`. The original image and its 128-finding scan remain preserved and **NO-GO**. No cloud build, paid scan, IAM mutation, deployment or user provisioning was performed.

## Exact build changes

- Two stages: official Node 22.23.3 on Debian 13 installs the existing exact lock with `npm ci --omit=dev --ignore-scripts`; only its installed application dependencies enter the final stage.
- Final image: maintained Google distroless Node 22 Debian 13, nonroot UID/GID 65532, explicit `/nodejs/bin/node` entrypoint. No global npm, Perl, shell or package manager. Verified base manifest/config and every runtime layer SHA-256; package metadata and file inventory are retained in evidence. This avoids carrying unused vulnerable packages rather than installing partial fixes into the old runtime.
- Both images use linux/amd64 manifest digests, recorded in `evidence/security-remediation/candidate-inputs.json`. The existing pinned Docker builder, dedicated build identity, private repository and source bucket remain unchanged. Source provenance SHA256 is explicit.
- Scoped Mammoth override: argparse 1.0.10 -> 2.0.1, removing sprintf-js 1.0.3. Mammoth remains 1.13.0 (latest registry release at review). No unrelated dependency versions changed. Legacy CLI aliases still work with deprecation warnings; DOCX library and CLI conversion were tested. Avoided incompatible automatic Mammoth downgrade and unrelated major SDK/PDF upgrades.
- Added an offline final-stage smoke check for Node 22, nonroot execution, DOCX extraction, PDF generation and runtime imports. Linux execution will occur during the separately approved replacement build. The local Windows smoke result does not certify Linux ABI compatibility.

The distroless runtime base has 54,609,006 compressed layer bytes; the install-stage base has 81,440,568. These are base sizes, not a claim about final image size. Root-owned application files remain read-only to the nonroot process; `/tmp` remains available. Existing application authorization, IAP, providers and data rules were not edited.

## Comparison of all 128 original occurrences

`evidence/security-remediation/finding-comparison.json` maps every occurrence to its candidate package disposition. Counts use the original scan's effective severity; original reported severity is retained. This is a package-presence prediction, **not a replacement vulnerability scan**. New base/runtime vulnerabilities may exist.

| Original severity | Original | Package expected absent | Retained package/family: reassess |
|---|---:|---:|---:|
| Critical | 5 | 5 | 0 |
| High | 20 | 19 | 1 |
| Moderate/medium | 15 | 15 | 0 |
| Low | 50 | 31 | 19 |
| Minimal | 36 | 28 | 8 |
| Unknown | 2 | 2 | 0 |
| Total | 128 | 100 | 28 |

All five critical Perl occurrences and the five patchable high Perl occurrences are addressed by removing Perl entirely. ACL/attr are absent too. All 21 original npm occurrences concern packages absent from the new runtime base and application lock. The final context contains only the independent release package manifests, not archived backend dependency locks. Updated glibc 2.41-12+deb13u4 and GCC 14 runtime libraries are retained and conservatively require reassessment. No `apt upgrade` against moving package repositories is added to the reproducible build.

## Individual review of the six originally unpatched high findings

- **CVE-2026-9538 — Perl Archive::Tar:** crafted tar sizes can exhaust memory during parsing. Stable Debian fixes were not available in the original scan; upstream Archive::Tar 3.10 / newer Perl is documented. Candidate contains no Perl, Archive::Tar or tar utility. Removal is the mitigation; confirm absence in the replacement image scan. [Debian review](https://security-tracker.debian.org/tracker/CVE-2026-9538).
- **CVE-2026-93748 — http-cache-semantics:** max-stale handling can disclose cached responses across users. No fix was recorded in the scan. Package is absent from the release lock and distroless base; global npm cache tooling is not copied. This is removal, not a claim that authenticated users make a vulnerable cache safe. [Advisory](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).
- **CVE-2026-54369 — ACL pathname symlink traversal:** requires a privileged caller operating on an attacker-controlled pathname. ACL package/library is absent; final runtime runs as UID 65532. Upstream ACL 2.4.0 is fixed, but stable distributions require a broader ABI update. Removal avoids introducing that ABI change. [Debian review](https://security-tracker.debian.org/tracker/CVE-2026-54369).
- **CVE-2026-54370 — ACL TOCTOU:** privileged recursive ACL operations can follow a substituted symlink. No ACL tools/library are present; no privileged runtime is introduced. Upstream 2.4.0 fixes exist; candidate removes the affected component. [Debian review](https://security-tracker.debian.org/tracker/CVE-2026-54370).
- **CVE-2026-54371 — attr traversal:** privileged getfattr/setfattr operations on attacker-controlled paths can be redirected. Both tools and libattr are absent; candidate remains nonroot. Upstream attr 2.6.0 is the documented fix; component removal addresses candidate exposure. [Debian review](https://security-tracker.debian.org/tracker/CVE-2026-54371).
- **CVE-2026-85091 — zlib, still OPEN:** candidate retains zlib1g `1:1.3.dfsg+really1.3.1-1+b1`. Debian marks Trixie vulnerable and has no fixed package recorded, while its description says the affected nonblocking gzwrite/gzprintf behavior was introduced in 1.3.1.2. Do not resolve this conflicting affected-range evidence by assumption. Upstream commit `df84af25dc1942490e1d1c899a07619152a46148` is linked as a fix. CRM4 processes untrusted documents and compressed data; no proof excludes all relevant native paths. IAP, active membership, request limits, nonroot operation and synthetic-only access constrain exposure but do not fix memory corruption. Require a replacement scan plus authoritative applicability evidence or a maintained fixed runtime before deployment; no risk exception is assumed. [Debian evidence and upstream links](https://security-tracker.debian.org/tracker/CVE-2026-85091).

The former three moderate npm audit entries represented one sprintf-js advisory propagated through argparse and Mammoth. The scoped override removes that dependency; refreshed production audit reports **zero** vulnerabilities. Audit coverage is not a guarantee that dependencies have no vulnerabilities. Existing deprecation warnings for jpeg-exif, node-domexception and crypto-js remain maintenance considerations.

## Approval boundaries

1. Approve one replacement regional build of this reviewed candidate using the existing dedicated build identity, private source bucket and immutable Artifact Registry repository. Reverify project ID/number and unchanged infrastructure, regenerate/verify context hashes, and separately confirm candidate activation (`deploymentApproved:true`) before submission. Current prepared configuration remains false; activating it changes the context/source hashes and must be recorded before upload. No deploy step exists in the build.
2. Approve one digest-specific paid scan of the resulting image. Capture image digest, provenance, Linux smoke logs and all severities. Existing on-demand scanning API is sufficient subject to fresh verification; no new IAM authority is implied.
3. Keep deployment NO-GO until remaining high applicability/remediation and any new critical/high findings are resolved. Then obtain separate approval for the exact private Cloud Run/IAP deployment, owner-controlled OAuth credential configuration, minimum resource-scoped access and separately authorized owner Firebase Administrator membership. Sole IAP tester remains brusseljeroen@gmail.com; staff remain unprovisioned. Browser acceptance and existing release gates still apply.

Rollback is a Git revert of this candidate before any approved build; no cloud rollback is needed. Do not deploy the prior vulnerable image as a rollback. Live Storage 38/38 acceptance is preserved and was not repeated.

See `evidence/security-remediation/validation.json` for final local test and context receipts. Maintained base documentation: [distroless Node](https://github.com/GoogleContainerTools/distroless/blob/main/nodejs/README.md).
