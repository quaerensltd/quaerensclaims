# CRM4 Spain dual-role implementation and release checkpoint

Classification: Shared CRM Framework. Starting commit: `581dbde5` on `feature/crm4-isolated-clone`; it was already synchronized with origin when work resumed. No existing work was discarded. All changes are confined to `crm4-staging`; no CRM2/CRM3/CRM5 or production resource changes.

## Implemented

The canonical staff contract accepts an active CRM4 membership with its existing primary `role` plus the exact optional `roles: ["lister", "closer"]` combination. Unknown, duplicated, elevated or malformed combinations fail closed. A staff UID remains the actor for both capabilities. Neither membership nor request claims are rewritten to impersonate another role.

The existing callable-specific source bundles remain byte-for-byte unchanged. `staff-factory-extension.cjs` verifies each source hash against its preserved manifest and applies explicit authorization-hook changes when loading the existing referral, operational-flow and onboarding factories. Hook drift fails startup. Existing assessment, approval, assignment, closing, agreement, payment and Processing workflows remain responsible for their original decisions. The extension retains ownership checks and makes the dual-staff agenda a union of that individual's Lister and Closer items, never a supervisor-wide view.

The browser uses an ESM build generated from the same capability contract. Existing dashboards, panels and agreement page accept the appropriate capability; both dashboard links appear for a dual staff member without another login. The existing Manager assignment selector recognizes dual staff. The protected membership editor offers Lister + Closer for existing members. Its existing platform-admin update operation audits the capability set in the membership/audit batch; a single-role update removes the role set. Self-edit and synthetic-only account restrictions remain. Real staff creation is still unapproved.

Firestore read rules accept only the proper individual assignments and a CRM4 record marker, including when a foreign-marked record is placed in the CRM4 collection. Existing browser queries now include the matching workspace predicate. Ten composite index candidates include the reviewed dashboard queries; dynamic/cloud query coverage still requires cloud acceptance.

Document tickets now revoke after account-session revocation, staff capability changes, disabled membership and conflicting portal workspace markers. They remain short-lived and IAP-bound. This is not a claim that all underlying assignment changes invalidate every already-issued ticket immediately.

## Executed evidence

- Full local suite after callable/browser integration: **97/97 PASS**, no failures or skips (249.4 seconds). The later admin extension and query-generation refinements have separate focused results; do not sum overlapping invocations.
- Administrator regression and record-workspace rule tests after membership-update extension: **8/8 PASS** (46.4 seconds).
- Two-individual runtime acceptance: both create a Spray Foam referral, use both callback capabilities, see only their own agenda, close only their assigned lead after prerequisites, retain unchanged memberships and emit one per-person closing audit event on retry. Manager/Processing escalation and CRM2/CRM3/CRM5 membership access denied.
- Two-individual browser acceptance: each signs in once and opens both existing dashboards; 12 viewport captures across 390/768/1440; no JavaScript errors. Mobile, tablet and desktop captures inspected. Existing emulator banner and inherited disabled-feature wording remain; this is not cloud UI certification.
- Existing single-role manual Spray Foam continuous journey: COMPLETE, lead `NVLs9e7rMVb7mYBM8Iji`.
- Dual-staff manual Spray Foam continuous journey: COMPLETE, lead `pfa4ciP13q21KGobBS21`, including assessment approval/issuance, Manager assignment, agreement, captured payment steps, client portal, Administration and Processing. The first attempt exposed a legacy agreement-page role guard; it was fixed and the complete journey rerun successfully.
- Release Storage rules compiled and passed loopback emulator checks: valid CRM4 owner upload allowed; CRM2/CRM3/CRM5 and conflicting markers, revoked access and unsafe MIME denied. Original local Storage rules restored in finally. No deployed rules changed.
- 99 generated browser scripts parsed successfully before the final small membership-editor/guard refinements; clone/provenance and focused tests cover the final checkpoint.

Synthetic runtime/browser identities exist only in local emulators. `release/staff-policy.json` describes the three proposed cloud identities and does not create them. Historical tests use additional synthetic Manager/Processing identities to regress existing governed stages; this does not change the requested two-staff-plus-owner cloud staffing plan.

## Precise remaining private-deployment requirements

1. Confirm the actual Google Cloud organization/folder, or explicitly confirm No organization. Read-only discovery of an empty organization list is insufficient.
2. Obtain separate explicit authorization to create infrastructure/billing linkage/budget, grant IAM and deploy application code. Existing flags remain false. The requested USD 25 monthly budget alert has not been created and is not a hard cap.
3. Provision only the independent `quaerens-crm4-spain-test` project and regional resources in `europe-west1` under that authorization. Record assigned project number, service URL, independent Firebase public configuration and dedicated managed identity.
4. Configure and verify IAP/IAM with **brusseljeroen@gmail.com only**; keep the owner Firebase CRM4 Administrator membership separate and properly authorized. No real staff identities until emails and account approval are supplied. Later staff Google IAP access would require a separate allowlist change; Firebase staff membership alone must not bypass the owner-only IAP policy.
5. Build and inspect the actual container with an approved pinned Node image digest, install the locked package, generate project-specific web assets and supply the approved runtime configuration. Docker is unavailable locally; no container/image build or deployed URL has been certified.
6. Under explicit deployment approval, verify real IAP JWT/audience behavior, revoked Firebase tokens, named managed identity/IAM isolation, EU Firestore/Storage, indexes for all exercised queries, cloud persistence/restarts/concurrency, private browser routing and provider egress isolation. Emulator and mocked IAP results do not prove cloud IAM or index sufficiency.
7. Retain Manager/administrator assessment approval and Processing payment safeguards. Two dual-role staff do not acquire Manager, assessment issuer or Processing powers. The owner/authorized operational arrangements must satisfy those existing gates; no stage was bypassed to make a two-staff demo appear complete.

All email/payment/AI integrations remain captured or mocked. Existing cloned categories remain; Spray Foam is the primary tested manual route. Previously documented unavailable legacy/Solar creation paths and Dialler integrations are not silently represented as implemented.

Final focused acceptance after the last capability/query-generation refinements: **21/21 PASS** (14.7 seconds). Review packaging now includes hash-verified browser inputs and the clone manifest, and uses a content-addressed output directory to avoid stale-file carryover. It remains explicitly nondeployable pending the gates above.

Final post-editor verification: all 99 browser scripts parse; regenerated offline package contains 581 verified files; package regression 1/1 passed.
