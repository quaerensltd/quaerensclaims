# Saturday owner-only deployment and operational launch

## Decision and sealed package

**Ready for explicit conditional execution approval; not deployed. Permanent staff/customer use remains NO-GO.** The permanent CRM4 Spain service is the business objective. This seven-day synthetic exception is an interim validation step, not the operating model.

- Target: quaerens-crm4-spain-test / 558324850479, europe-west1.
- Start: **Saturday 17 October 2026, 09:00 UTC / 11:00 mainland Spain**.
- Expiry: **Saturday 24 October 2026, 09:00 UTC / 11:00 mainland Spain**, exactly 168 hours.
- Containment authority ends: **24 October 2026, 10:00 UTC / 12:00 mainland Spain**.
- Operator: martijnpronk76@gmail.com. Sole IAP tester: brusseljeroen@gmail.com.
- Exact assessed image: europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb.
- Package: `evidence/saturday-owner-test-20261017/`; canonical proposal SHA-256 **5e3b937eb705ac18abdc00a29c9f0e4dba6127cb8773ec7c49912b7c49efa734**.
- SHA256SUMS.json SHA-256: **0c87132a69d7424754648dcc3cc11355e3f1884542e1d90ee44345759c2f1edb**.

Only the three timestamps changed from the simplified proposal at dc3856f9. Generated Cloud Run arguments, both expiry rule files and IAP condition were independently compared with the existing generators; unchanged artifacts/source hashes were verified. The previous 30/30 local tests remain valid; no unchanged functional suite, build or scan was repeated. The preflight is honestly retained as **16 October 14:58 UTC evidence**, not a Saturday verification. Refresh project identity, image, permissions, policies/etags, rule releases and identity/resource conflicts before execution; stop on drift. No changes or credentials were applied or handled during preparation.

## Exact execution approval requested

Approve this canonical hash and fixed window, with only execution-approval metadata and verified receipt-derived account UIDs resolved at execution:

1. Create Cloud Run `crm4-spain-test` using the exact image and sealed startup payload; dedicated crm4-runtime account, nonroot runtime, 1 CPU/1 GiB, min 0/max 2, concurrency 8, timeout 120s. Native IAP and invoker IAM checks enabled; no public invocation. Preserve the planned run.app origin and capture-only providers.
2. Generate the missing IAP service identity `service-558324850479@gcp-sa-iap.iam.gserviceaccount.com`. Grant only service-level roles/run.invoker to it, and window-conditioned roles/iap.httpsResourceAccessor to brusseljeroen@gmail.com on `projects/558324850479/iap_web/cloud_run-europe-west1/services/crm4-spain-test`. Stop on unexpected project-level grants.
3. Configure the existing OAuth client `558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com`; owner privately enters the replacement secret. Preserve its matching saved IAP redirect URI. No additional OAuth client, tester, domain or API-key change.
4. Publish only the sealed expiry additions to existing Firestore/Storage rule releases. All original membership, ownership and workspace predicates remain intact.
5. Add only the seven specified audit categories: IAP ADMIN_READ/DATA_READ/DATA_WRITE, datastore DATA_READ/DATA_WRITE, Storage DATA_READ/DATA_WRITE. Preserve unrelated IAM, exemptions, sinks and retention.
6. Create only temporary bootstrap@crm4.example.test and governed owner@crm4.example.test Administrator. Bootstrap has temporary project-local platformAdmin but no CRM membership/IAM/IAP; immediately remove its claim, revoke tokens and disable it after owner creation or failure. Owner never receives platformAdmin. Unique passwords and OAuth secret remain in private custody. Workflow and portal identity provisioning is excluded.

Authorise immediate failure/request/end-of-window containment until the deadline: revoke and disable those exact two identities; withdraw the exact conditioned IAP and service-invoker bindings; delete only the verified test Cloud Run service using fresh image/etag checks. Keep expired rules and audit/account history. No wildcard cleanup, account deletion or restoration of timeless access. Unexpected records/resources require separate handling behind denied access. Unverified containment is failure, not success.

Before owner inspection, establish live project/digest/config correctness, sole-tester IAP, anonymous/unauthorised denial, independent Firebase membership, bootstrap revocation, exact rule hashes, capture-only providers and attributable audit visibility. Confirm configured expiry and shutdown authority. Specialist tests for forced restart, canary writes, persistent listeners and uploads crossing expiry remain **deferred, not passed**. Preserve the open HIGH, Node reproducibility limitation and Firebase incident risk acceptance.

This is not a scheduled automation. Approval, operator availability and owner-private credential entry are still required. A missed start does not shift the deadline or grant permission to deploy later automatically; report timing changes before proceeding.

## Minimum path to permanent staff operation

| Priority | Mandatory outcome | Practical minimum |
| --- | --- | --- |
| 1 — security decision | Production-suitable disposition for HIGH CVE-2026-85091 and Node binary evidence, plus Firebase incident remediation/disposition suitable for future real accounts | Complete the focused exploit/error-path evidence identified in ZLIB-SECURITY-DISPOSITION.md; obtain supported Firebase guidance or a reviewed supported alternative. Existing synthetic risk acceptance cannot be promoted to production. Rebuild/rescan only if changed source/runtime or new technical evidence requires it. No speculative secret rotation. |
| 2 — real-operations release | Remove synthetic-only limitations through an explicitly reviewed production contract while preserving access/role/ownership/audit checks | Current code enforces private-synthetic-test, capture-only providers, owner-only IAP and example.test provisioning. A production release is a justified future code/build change, not an environment toggle. Explicitly commission this independent project if suitable; do not create another project by default. Any incident-driven move needs its own decision. |
| 3 — staff and genuine workflow | Two verified individual staff identities, each Lister + Closer, separate owner Administrator; approved supervisor/Processing responsibilities | Obtain names/emails and private-access identities, secure enrollment/offboarding and appropriate strong authentication. Use existing authorised supervisor roles where sufficient; do not invent extra staff. Prove a real assessment route and handover with synthetic cases. Mock AI reports, payment confirmations and captured email receipts cannot represent actual business actions. The manual-assessment authority-provisioning gap must be fixed if that route is chosen. |
| 4 — available leads | Safe initial intake/allocation and auditable corrections | Existing preview is offline only. Complete the smallest governed per-staff import/resume path with preview, authoritative duplicate checks, truthful ownership and batch receipts; approve the exact real batch separately. Existing legacy direct-write CSV page is unsuitable. Implement necessary reassignment or explicitly defer it with fixed initial allocation and an agreed no-reassignment procedure; do not build a large bulk administration interface first. |
| 5 — privacy and operations | Known permitted data flows, recovery, audit and incident ownership | Confirm lawful lead source/contact use, notices, retention/deletion, processor arrangements and Firebase Auth processing-location implications. Demonstrate a restore and document recovery objectives; keep access/audit logs, alerts, rollback and accountable incident contacts. Risk-appropriate document handling must cover untrusted customer files, unlike this synthetic exception. |
| 6 — release acceptance | Deployed synthetic end-to-end test with each staff account, denial/isolation checks and explicit real-data admission | Reuse passed evidence; test changed code and newly deployed integrations only. Approve the production image/configuration, identities and first import before admitting customers. Replace the temporary cutoff only under that production approval. |

Privacy/security planning follows a proportionate, risk-based approach; it is not a demand for a new certification programme. See the [EDPB small-business security guidance](https://www.edpb.europa.eu/sme/be-compliant/secure-personal-data_en) and [processor guidance](https://www.edpb.europa.eu/sme/find-practical-info/faq_en).

**Postponable:** specialist seven-day expiry rehearsal; custom domain/branding; integrated telephony where an approved manual calling process works; AI assistance; extra categories; richer dashboards; elaborate bulk tooling and recurring recovery exercises beyond an initial proven restore. Email/payment integrations can wait only if the minimum operational workflow has a truthful, approved manual alternative. Core access revocation, secure documents, recovery and audit are not optional.

## Effort and next decision

Saturday owner access: allow **roughly 2–6 supervised engineering hours** after approval and credential availability; 09:00 UTC is the execution start, not a guarantee of a working login at that instant. Stop for genuine integration failures rather than expanding the rehearsal programme.

Permanent operation: planning allowance **5–10 focused engineering working days after security direction, staff details and the minimum business workflow are agreed**, covering the production contract, minimal intake, recovery and deployed acceptance. This is not a guaranteed calendar launch date: Google support/remediation and any changed-runtime security work can extend it. Start the support/security decision and staff/privacy decisions alongside Saturday inspection; implement only the selected minimum path after separate approval.

**Request:** approve the Saturday canonical hash, six mutation groups, two-identity scope, fixed UTC window and bounded containment above. Until then, execution remains unauthorised; real-customer/staff access remains NO-GO.
