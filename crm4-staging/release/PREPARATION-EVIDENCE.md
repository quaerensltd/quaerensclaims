> Superseding local implementation checkpoint: dual Lister + Closer capability support is now implemented and locally tested for two individual CRM4 accounts. Earlier single-role-only limitations below describe historical evidence. See [current acceptance and remaining deployment gates](DUAL-ROLE-ACCEPTANCE.md). Cloud provisioning, IAM grants and application deployment remain unapproved.

> Owner tester confirmed, 13 October 2026: the proposed IAP allowlist is brusseljeroen@gmail.com only. This confirms the tester identity, not an IAM grant or Firebase role. Resource provisioning, IAM changes, real accounts and application deployment require separate authorization. Organization/folder remains unconfirmed. Owner CRM4 Administrator membership must be separately authorized; staff remain deferred pending dual-role acceptance.

> Current decision, 13 October 2026: infrastructure approved in principle for quaerens-crm4-spain-test, europe-west1, Firebase Payment and a USD 25 monthly budget alert. Synthetic Firebase Authentication processing limitation accepted. Resource creation is paused pending the actual organization/folder and separate provisioning authorization. Application deployment, public access and real accounts remain unapproved. Offline runtime/routing/rules/index candidates now exist; cloud acceptance is unexecuted. See [current access and preparation evidence](ACCESS-POLICY-EVIDENCE.md).

# CRM4 Spain preparation evidence — 13 October 2026

Shared CRM Framework. Existing branch `feature/crm4-isolated-clone`, starting HEAD `99177d207f6d5bbbab6a7f8e6de683a97605b67f`. The pre-existing CRM4-only manual completion, linkage, browser and Solar diagnostic changes were preserved, inspected and verified; no clone restart or backend-source consolidation.

## Executed

- Baseline: 79/81 passing. Both failures were successful raw-media uploads receiving 403. Installed Firebase Storage emulator discards MIME metadata for that protocol. Tests now use the SDK-compatible multipart metadata protocol; security rules were not weakened. Owner/role/inactive/foreign workspace/overwrite/read/unsafe MIME denials still pass.
- Complete suite after persistence changes: **84/84 PASS**, no failures/skips, Node 22.14.0. Subsequently added offline package regression: **1/1 PASS**. The package regression was run separately, not misreported as part of the 84-test invocation.
- Existing CRM2 Cloud Function security regression: PASS using installed dependencies; CRM2 source unchanged. First invocation lacked NODE_PATH and could not load dotenv; rerun with dependencies passed.
- v9 continuous synthetic browser journey: COMPLETE, lead `a0yrwCFTLBHGYshUn0W4`, including portal evidence upload/download, Processing and same-QAR correction.
- Manual Spray Foam continuous synthetic browser journey: COMPLETE, lead `t2EUWUl5TMyBOWCB4xUP`, author/reviewer, captured issue, manual completion, Manager/Closer, agreement/payment acknowledgment, client portal, Administration and Processing.
- Manual authoring browser: PASS, assessment `rOUpqnilDV7d7N1OhKc7`, QAR `QAR-20261013-E000B5E9`; same-QAR version 2, retained version 1 and both PDF hashes verified. AI-only completion remains denied. Manual completion replay emits one event.
- Manual-authoring screenshots at 390/768/1440 inspected: responsive, no horizontal overflow; expected emulator warning overlays remain. Legacy working-copy preview and disabled original Processing control remain visible beside the explicit governed manual controls. This is not exact CRM2 visual parity or cloud UI certification.
- Runtime Storage: fresh adapter reads persisted document; stale cache ignored; deleted object fails instead of falling back to cached bytes. Corruption regression now changes stored bytes. Cloud adapter candidate pins named app, project, bucket and allowed object paths; mock-backed contract tests pass, cloud integration unexecuted.
- Offline review package: 487 hash-verified files at generation time, pinned independent dependency lock, approved brochure fingerprint. No source snapshots changed; no root functions/public assets or credentials packaged. Package explicitly reports `deployable:false`.

Browser JSON and screenshots remain in ignored `.scratch/continuous-journey`, `.scratch/manual-continuous-journey` and `.scratch/manual-authoring`. They contain synthetic test data only. Provider activity was captured; no email, payment or real AI request. The emulator state is temporary and is not a cloud backup.

## Remaining gates

See [cloud test plan](CLOUD-TEST-PLAN.md). New project/API/billing approval, named testers and Auth location acceptance are external decisions. Cloud bootstrap/routing, deployable rules/indexes, durable general capture provider, IAP integration and cloud-specific persistence/concurrency acceptance are still engineering work. This release is **not deployment-ready**, and no private cloud browser URL exists yet. Solar manual creation and legacy migration remain unavailable; neither blocks the tested Spray Foam-only synthetic scope but neither is implied to be complete.

Persistent local Storage survives a handler restart, not loss of a non-exported emulator. Generation-match checks against the emulator are not certified atomic under competing processes. No production IAM/data access was exercised. Local denial tests and source isolation cannot prove cloud IAM isolation before the independent project exists.

## Reproduction

Run the demo Auth/Firestore/Storage emulators with `crm4-staging/firebase.local.json`, project `demo-quaerens-crm4`. Supply installed dependency resolution through NODE_PATH (or the independent package after a reviewed install).

```
node --test crm4-staging/tests/*.test.cjs crm4-staging/tests/*.test.mjs
node crm4-staging/tests/continuous-journey.cjs
# Repeat with CRM4_JOURNEY_MODE=manual.
node crm4-staging/tests/manual-authoring-browser.cjs
node scripts/crm2-functions-security.test.js
node crm4-staging/release/verify-source.cjs
```

Browser tests require CRM4_PLAYWRIGHT_MODULE pointing to the installed Playwright module and Edge. Do not point any test to a real Firebase project.
