# CRM4 Spain zlib investigation — 14 October 2026

Decision: **NO-GO for the current image's first private synthetic deployment; production remains NO-GO.** This is Shared CRM Framework release-security work. No framework behavior, application source, dependency lock, Dockerfile, security rule, IAM policy or cloud resource changed. The current image and all prior acceptance evidence remain intact.

## Exact finding and interpretation

Image: `sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce` in the CRM4 Spain `crm4-release/crm4-spain` repository.

The completed hardened scan records HIGH `CVE-2026-85091`, occurrence `20d583e8-9514-45d0-b7b6-53dc09bbf927`, Debian 13/trixie source package `zlib`, source version `1:1.3.dfsg+really1.3.1-1`. Installed binary package is `zlib1g:amd64` version `1:1.3.dfsg+really1.3.1-1+b1`; the binary rebuild suffix is not a security patch. The scanner reports no available fixed version. Original scan and hardened scan remain unchanged: 128 → 25 findings, 103 removed, zero effective critical, one effective high, 17 low and seven minimal.

The digest-verified base layer contains `/usr/lib/x86_64-linux-gnu/libz.so.1.3.1`, SHA-256 `85590dd58edf5445e18bc7193e5ebc01ac5841f1ae187e97705a662e90c6421e`. See `evidence/zlib-investigation/binary-analysis.json` for library and Node hashes, dependencies and symbols; existing hardened-build evidence ties the base's uncompressed layers to the actual image.

The [Debian tracker](https://security-tracker.debian.org/tracker/CVE-2026-85091) still marks this exact source version vulnerable and lists no fixed release. The published description's 1.3.1.2–1.3.2 range is narrower than Debian's disposition. [Debian bug 1146895, message 36](https://bugs.debian.org/1146895#36) reports reproduction in older versions following a direct-write failure; lack of nonblocking support is not sufficient evidence of immunity. Subsequent maintainer discussion keeps that concern open. We did not independently execute that reproducer.

[Upstream fix df84af25](https://github.com/madler/zlib/commit/df84af25dc1942490e1d1c899a07619152a46148) resets pending input and its pointer when direct compression fails. This supports a real defect, not a demonstrated scanner false positive. Latest upstream release inspected was still 1.3.2, preceding this fix. Do not upgrade merely to unpatched 1.3.2 or suppress this CVE.

## Reachability and limits

ELF analysis of the actual pinned Node binary shows no `DT_NEEDED` dependency on `libz`, `libcrypto` or `libssl`. The image's application-layer inventory contains no `.node` native addons. Debian libcrypto does depend on libz, but its inspected compression imports are inflate/deflate, not gz-file writes. Deleting libz alone would leave an installed library dependency broken and is not the proposed solution.

Node itself exports bundled gzip-file functions, including `gzwrite`, `gzputc` and `gzprintf`. [Node v22.23.3 source](https://github.com/nodejs/node/blob/v22.23.3/deps/zlib/gzwrite.c) identifies bundled zlib 1.3.1 and retains the direct-write error path without the upstream pointer-reset change. This is source-level supporting evidence, not a reproducible-build attestation tying every source line to the binary. Replacing only Debian libz cannot establish that both copies are corrected.

CRM4's imported assessment handler passes supplied PDF bytes to pdf-parse and DOCX bytes to mammoth; document generation uses docx/PDFKit. The inspected JSZip path uses pako, PDFKit uses Node zlib, and Node's JS compression binding uses inflate/deflate. These operations are distinct from the vulnerable gzip-file descriptor state machine. Storage upload/download bytes are therefore not, by themselves, evidence of a reachable gzwrite exploit. No supported application path to that state machine was identified.

This is limited static evidence of reduced exposure, not proof of universal unreachability. Node supports dynamic loading and contains the functions; this investigation has not exhaustively proved every native caller, optional provider or runtime configuration unreachable, nor run Linux instrumentation. Authentication, IAP and synthetic-only restrictions reduce exposure but do not correct the package. We cannot issue a supported `not_affected` disposition or a clean security GO on that basis.

## Minimum correction and alternatives

Preferred maintained solution: retain nonroot distroless Debian 13 and the existing npm lock, then adopt a vendor image whose exact digest demonstrably fixes both OS zlib and the bundled Node copy (or provides a supported not-affected statement for the latter). No such verified replacement digest is established here. Debian's tracker and available package listing do not establish a fixed trixie package today.

For urgency, an inactive proposal `evidence/zlib-investigation/zlib-1.3.1-backport.patch.proposed` adapts the upstream pointer reset to the old direct-write path. Its unique context was checked against the downloaded Debian 1.3.1 source and Node v22.23.3 bundled source. It is **not applied, compiled, runtime-tested or an approved release candidate**. A custom correction would need both a reproducibly rebuilt glibc-compatible zlib package and the Node bundled copy addressed, authentic source checksums, explicit package/provenance metadata, upstream regression/reproducer acceptance, and ongoing patch ownership. Never replace only a library file while leaving misleading package metadata.

[Alpine's maintained 3.23 branch](https://github.com/alpinelinux/aports/blob/3.23-stable/main/zlib/APKBUILD) records the fix in zlib 1.3.2-r1. That is verified package-maintainer evidence, not verification of a complete Node image. Moving to Alpine changes libc/ABI, packaging and runtime validation and does not automatically fix a statically bundled Node copy. It is a broader fallback, not an approved substitution. No speculative replacement build was submitted.

## Approval and acceptance sequence

1. Finish and locally review a candidate with verified fixed OS and bundled-Node provenance, immutable base/source hashes, unchanged npm lock and isolated runtime configuration. The current patch proposal is not sufficient to approve a build. Choose vendor maintenance where available; custom backport maintenance needs explicit agreement before treating it as the release route.
2. Request **one replacement regional build** for the resulting exact reviewed commit/context in project `quaerens-crm4-spain-test` / `558324850479`, `europe-west1`, using the existing `crm4-build` identity, private source bucket and `crm4-release` repository. No new IAM, APIs, providers or deployment. Preserve the existing image and rollback evidence.
3. Validate actual resulting packages and Node binary, run focused gzip failure/recovery tests and DOCX/PDF/compression Linux smoke tests because native runtime code changed, and recheck source/context hashes. Preserve prior 113 local, 22 Storage-rule and 38 live Storage acceptance results; rerun unrelated workflows only if changed behavior or failures warrant it.
4. Request **one digest-specific on-demand scan** of that replacement after its digest exists. A custom patched version may still trigger the scanner: require documented patch provenance and supported vulnerability disposition, never conceal package metadata or silently waive HIGH findings.
5. Only after the security gate passes request the separate private IAP deployment approval. Real accounts, customer data/import and production release remain subject to the existing `REAL-CUSTOMER-LAUNCH.md` gates.

## Verification performed now

Verified local layer checksums before ELF extraction; identified exact libz hash and dynamic dependencies; compared both source patch contexts; inspected compression entry points and current vendor/package evidence. No build, scan, exploit execution, cloud mutation or deployment occurred. No completed functional acceptance suite was repeated. Source fetch receipts and hashes, binary analysis and a machine-readable disposition are retained in `evidence/zlib-investigation/`. The source-context check does not claim compiled patch acceptance.
