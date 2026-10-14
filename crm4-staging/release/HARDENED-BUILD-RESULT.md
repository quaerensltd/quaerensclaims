# Hardened CRM4 replacement build result

**Build succeeded; deployment remains NO-GO.** One replacement build was submitted under the owner's approval. No paid scan, deployment, real-account provisioning or IAM change occurred.

- Source commit: `753b7c7700165848c6ac1f1f74c5ce5033560d31`.
- Build: `bd36421c-8ddc-4b67-b3ff-10bef07b359f`, europe-west1, project quaerens-crm4-spain-test / 558324850479.
- Immutable image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce`.
- Source/context hashes match the approved remediation receipt exactly: source `2150619e1596a949bdf01b3a51c5dee0c239dd573a4e4d3e38958ece680e3f8c`; context `79563e1c6b646db9781688767e167cb655e2768b393ab9b6f4c0f3d5feed4cc6`. Dependency-lock SHA-256 `bde138edf2752278b1830fde437f4c6db53b90671505430cbb3e9eed4ff197e8` unchanged. The archived source was independently unpacked and verified before upload; Cloud Build provenance SHA256 matches the uploaded archive and exact object generation.
- Dedicated crm4-build identity, immutable crm4-release repository, private build-source bucket and reviewed builder/install/runtime pins preserved. No source or dependency substitution.
- Linux final-stage smoke passed: Node 22.23.3, UID 65532; DOCX extraction, PDF generation and runtime imports, no test network calls.
- Final registry manifest/config/layers read and hash-verified. Base compressed blobs were recompressed by the build: their uncompressed OCI rootfs diff IDs exactly match the reviewed distroless base. Application package inventory applies layer whiteout semantics. 289 installed npm packages; none of the original scan's flagged npm package names remain. argparse is 2.0.1; sprintf-js absent.
- Final compressed layer total: 116,950,863 bytes, versus the prior image's recorded 171,539,370 bytes (about 32% smaller). This is compressed image storage, not runtime memory or a security score.

The actual base filesystem confirms the earlier package comparison: Perl/ACL/attr/global npm are absent, and the reviewed retained OS libraries remain. The 100 predicted removed findings and 28 retained-package findings are still a comparison, not a vulnerability scan. Zlib CVE-2026-85091 remains open, along with reassessment of retained/new vulnerabilities. No clean-image claim is made.

Complete receipts are in `evidence/hardened-build`: submission intent/result (one attempt), source upload/generation, archive verification, build/provenance, all 242 retrieved log entries, registry digest/config/manifest, base verification and actual installed package inventory. Final read-only verification confirms unchanged project IAM, zero Cloud Run services and exactly two total builds (the original plus this one). Actual itemized build cost is unavailable; no cost is inferred from elapsed time.

**Activation remains deliberately disabled.** The exact approved candidate embeds deploymentApproved:false. A separately reviewed configuration activation and CRM4_DEPLOYMENT_APPROVED=true are required before any private deployment. Approve its secure delivery method or a separately hashed activation build; neither is silently included here. Current synthetic-only provisioning/configuration and capture-only providers also prevent treating this as a real-customer-ready release.

## Next precise approval

Approve **ONE paid On-Demand scan of the exact digest above**, project quaerens-crm4-spain-test / 558324850479, location europe, existing provisioner martijnpronk76@gmail.com and existing scanning API; no new IAM/API grants, rebuild or deployment. [Prepared command/script and acceptance criteria](owner-hardened-scan/README.md) retain the project/identity checks, installed-extractor detection, submission guard and receipts. The script has been syntax-checked only; it has not been run.

After scan review, private deployment and owner membership each require separate approval. Real staff, production-mode changes and customer-data admission require further scoped approvals and the [real-customer checklist](REAL-CUSTOMER-LAUNCH.md). The two confirmed dual-role staff must remain individual, CRM4-only accounts; their identities and production provisioning remain pending.

Rollback: no running application changed. Keep source/image/audit receipts; deletion of the exact uploaded generation or new image is a separate action, not performed. Never deploy the prior NO-GO image as a rollback.
