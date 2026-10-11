# CRM4 implementation checkpoint

Status: **INCOMPLETE — NOT SERVABLE, NOT DEPLOYABLE**.

## Preserved source and current authority

The existing 15-file Atlas snapshot and all CRM2/CRM3 files are unchanged.
Development continues on `feature/crm4-isolated-clone`, based on
`e9810f463d9fd4d91fe56a30ec68a2fad448deb4`.

Read-only control-plane inspection confirmed frontend production deployment
`dpl_9VmUkTnLXPLVQovR7qmXYL6j1Rwf`. Public source fingerprints were checked against
that deployment's manifest. `source-inventory.json` records the inspected assets,
literal dependencies, callable names and collection references, not client data.
It is a partial static inventory, not a complete dependency/behaviour certificate.
Dynamic imports, generated routes, callable helper patterns and server-side
dependencies still require reconciliation.

The branch's initial snapshot is not the current operational CRM2: its public
source lacks `crm2-assessment-assistant.html` and `crm2-assessment-reproject.js`.
Current public source also includes shared CRM3 branches and payment/email APIs.
Those must not be blindly copied into an executable CRM4 environment.

## Implemented safe local foundation

- Read-only source inventory with explicit public file-type/path restrictions,
  symlink containment, source fingerprints and no application execution.
- Public GET-only inventory with exact deployment fingerprint verification.
- CRM4-specific Firebase service factory with a named app, CRM4 workspace identity,
  `demo-quaerens-crm4` project and explicit loopback Auth, Firestore, Functions and
  Storage emulator connections. No production fallback or default-app reuse.
- Unit tests for origin rejection, emulator wiring, app reuse rejection,
  credential/traversal exclusions, callable extraction and failure propagation.

The service factory is **not yet integrated into the application**. It is not
evidence that the original staging pages are isolated: they still contain their
original CRM2 connections and must remain unserved.

## Isolation design

Use a separate Firebase project for eventual CRM4 operation; local work uses only
a `demo-` emulator project. Do not reuse production Auth users, memberships,
Firestore, Storage, secrets, provider credentials or callbacks. Workspace checks
and role/capability checks must remain in the reused Shared CRM implementation.
Email/payment/portal providers need isolated test adapters before local workflows
can execute. No emulator Function backend is configured or enabled yet.

Creating real CRM4 infrastructure, choosing its production domain, binding test
or production providers and deploying require separate approval. No production
configuration is included in this checkpoint.

## Remaining implementation and acceptance

1. Complete current frontend dependency closure, including role-specific shared
   routes, Case Action Engine, processing, reporting and portal modules.
2. Resolve current deployed backend source per required callable; a historical
   monolithic repository `functions/index.js` is not sufficient authority.
3. Produce an isolated clone using those verified sources, preserving Shared CRM
   logic; replace all entry/route/config boundaries, not just visible CRM2 labels.
4. Supply isolated emulator rules, synthetic fixtures and provider test adapters;
   exercise every role and deny cross-workspace access.
5. Run CRM regressions, API/linkage tests and full workflow tests.
6. Compare desktop/tablet/mobile screens against current CRM2 using synthetic
   data. **Browser parity has not been tested or claimed.**
7. Commit subsequent verified implementation and prepare a deployment review.

No production record reads/writes, callable invocations, submissions, emails,
payments or deployments were performed for this checkpoint. Source/control-plane
GETs only were used. No production readiness is asserted.
