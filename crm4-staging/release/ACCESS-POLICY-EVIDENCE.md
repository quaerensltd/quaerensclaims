# CRM4 Spain access policy and offline preparation

Classification: Shared CRM Framework. This checkpoint changes only CRM4 staging files. Preserved backend source manifests remain unchanged; no CRM2, CRM3 or CRM5 source changes.

## Confirmed policy and actual limitations

Two individual staff accounts must each support Lister and Closer in CRM4 Spain only. The owner needs a third, separate central administrator account. `staff-policy.json` records exactly these three synthetic identity requests, without provisioning accounts or granting privileges. No shared passwords, duplicate role accounts, role swapping or administrator elevation substitutes for dual-role support.

The preserved Lister contract requires `membership.role === "lister"`. The Closer contract also selects authority from a single `membership.role`. Arrays, a separate `roles` property and comma-separated roles do not grant both capabilities. Tests call both pinned factories for each proposed staff identity and prove denial occurs at membership access, before lead ownership, assignment or audit reads/writes. This is negative acceptance evidence, not a successful dual-role workflow test. Existing regression covers the existing single-role workflows; dual-role ownership, closing safeguards and individual audit history cannot yet be certified.

A possible shared-framework improvement is a canonical capability resolver that accepts a reviewed role set, preserves the individual actor UID and workspace, and evaluates action-specific ownership and safeguards. Existing singular roles would need backward compatibility. Every staff callable, browser route and security rule would need consistent treatment; all existing CRM implementations would need regression. This is a proposal only. No resolver or shared behavior has been changed. The requirement to use dual roles if already supported does not establish compatibility when the current contract lacks it.

## Infrastructure status

Project `quaerens-crm4-spain-test`, region `europe-west1`, Firebase Payment billing, USD 25/month alert and synthetic Auth processing limitation are approved in principle. Read-only discovery found the open billing account `016627-0BEE7F-D03ADE`. The CLI returned no visible organizations, which does not confirm that No organization is the correct parent. Neither actual parent/folder nor named Google IAP testers has been established. The active CLI account is not presumed to be an authorized tester or owner.

No resources, billing links, APIs, budgets, cloud accounts or deployments were created. The budget amount is a requested alert, not a spend cap. No real customer records, credentials or secrets were imported.

## Prepared locally

- Reused the preserved callable registration through a common CRM4-only registration module; original pinned factories and their role decisions are unchanged.
- Added a gated cloud bootstrap with exact project, dedicated managed identity, deployment flag, provider restrictions and separate named Firebase app.
- Added private IAP request verification, same-origin callable routing, revoked Firebase-token verification and allowlisted static assets. Unit tests mock JWT verification; actual IAP deployment is not certified.
- Added durable captured-provider receipts and expiring document tickets bound to the IAP actor, with account/membership revocation checks. No provider delivery is enabled.
- Added cloud SDK wrappers and a public-config-only web build, independent dependency lock and Docker candidate. No container image has been built; Docker is unavailable locally.
- Prepared Firestore/Storage rule candidates and six statically derived composite index candidates with source evidence. Index coverage is incomplete for dynamic/frontend queries; local emulators do not certify production index readiness. Cloud rules have not been deployed or separately accepted.
- Generated an offline review package of 508 verified files, explicitly `deployable:false`. It is not a deployable cloud image and contains no generated cloud-public output or actual cloud configuration.

## Validation scope

Focused cloud preparation/package tests: 5/5 passed. Private HTTP and durable capture/document-ticket tests: 2/2 passed. Full existing local regression result is recorded below once complete. The first durable test attempt omitted required demo environment variables and correctly failed closed; the corrected demo-only invocation passed.

All cloud-shaped identifiers and web API keys in tests are synthetic fixtures. Browser/IAM/Firestore index/cloud Storage concurrency acceptance and positive dual-role acceptance remain outstanding. Historical browser evidence in PREPARATION-EVIDENCE.md predates this checkpoint and is not a claim of cloud acceptance.

Final execution: full local suite 89/89 PASS (246.3 seconds), no failures or skips. Final focused cloud suite 7/7 PASS (14.0 seconds); its two cloud-boundary tests were added after the full-suite invocation. Do not sum these overlapping invocations. Server syntax and git diff whitespace checks passed.
