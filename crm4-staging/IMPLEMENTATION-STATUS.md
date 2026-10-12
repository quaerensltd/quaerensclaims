# CRM4 implementation checkpoint

## Latest browser-integration checkpoint

Local browser login is enabled by explicit CRM4 emulator rules, not wildcard
access. Active membership/workspace checks govern reads; Lister leads must be
assigned to that user, Closer leads must be assigned/linked to that Closer, and
Manager/Administrator can read workspace operational collections. Self-membership
and self-capability reads support the shared login/editor contract. Membership,
lead, assessment and provider-state client writes remain denied; own attendance
writes are scoped to the signed-in UID. CRM2/CRM3 collections remain denied.
This local policy is narrower than the historical repository rules and is not
certification of complete current-production rule equivalence.

Synthetic fixture seeding (`tools/synthetic-fixtures.cjs`) requires demo Auth and
Firestore emulator endpoints. It creates named example.test role accounts, an
assigned Lister lead, Closer appointment-ready lead, available onboarding slot
and Processing case. These are local-only persistent development fixtures, not
customer records. They disappear when non-exported emulator state is stopped.

`tests/browser-workflows.cjs` logs in through the actual form, renders Manager,
Lister, Closer, Assessment Assistant and Processing pages at 390/768/1440 and
submits the actual Lister referral form. The protected local callable creates
exactly one matching synthetic record. Authenticated browser traffic cannot
reach production APIs. Browser screenshots/results are under ignored
`.scratch/browser-workflows/`. Runtime failure assertions are separate from
responsive observations; Manager/Closer 390px overflow remains a failed visual
gate. Full visual parity against authenticated CRM2 is NOT certified.

Local clone boundary corrections: Processing login destination, Tailwind CDN
script permission (production API connect restrictions unchanged), and absent
loader null guards on Staff/Processing/Lister pages. Reproducible transforms and
clone hashes are updated. No educational/public/CRM2/CRM3 asset is edited.

The separately pinned `processingListAdministrationOnboarding` dependency is
added to local callable transport. Seven source bundles / six enabled callable
handlers now exist. Assessment state works; analysis/confirmation/generation/
preview/finalisation are NOT yet integrated end-to-end. Manager write actions,
all Closer/Processing transitions and complete dependency closure remain open.
External providers remain captured or unavailable. No production changes.

Regression suite: 46/46 PASS, including actual emulator rule permission checks.
This is a partial functional implementation, not a complete CRM2 parity claim.

Status: **LOCAL FRONTEND CLONED; SIX PINNED BACKEND BUNDLES; FIVE LOCAL AUTHENTICATED HANDLERS — NOT DEPLOYABLE**.

## Backend continuation checkpoint

### Authenticated transport continuation (12 October 2026)

`tools/serve-callables.cjs` now offers a loopback-only development callable
transport on port 5001, compatible with the generated SDK endpoint. It validates
Auth-emulator ID tokens, restricts browser origin, bounds request size/time and
exposes only five pinned handlers: Lister referral creation, Manager linked
assessment read, Assessment Assistant state, Closer onboarding booking and Processing dashboard. Unknown
functions (including finalisation) fail closed. This is local development
infrastructure, not a deployed Firebase Function or a replacement CRM workflow.

Set GCLOUD_PROJECT to `demo-quaerens-crm4`, FIRESTORE_EMULATOR_HOST to
`127.0.0.1:8080`, FIREBASE_AUTH_EMULATOR_HOST to `127.0.0.1:9099` before starting.
No real credentials are used. `local-providers.cjs` captures synthetic/internal
notification receipts in memory, with no SDK/network or actual delivery. It
rejects non-test client recipients and preserves provider idempotency keys.

Current suite: **45/45 PASS**. Existing CRM2 security regression also PASS.
Authenticated synthetic tests cover Manager/Lister/Closer/Processing identities,
invalid tokens/origins, unavailable operations, wrong roles/workspaces, onboarding
booking/replay, two capture-only notifications and Processing dashboard read.
Assessment state requires the copied Manager capability contract; missing
capabilities and Closer access are denied. Its separately pinned source is older
than GenerateDraft's source and has not been silently upgraded or consolidated.
The pinned production handler logic is unchanged. Auth users and test records
are removed after tests. These fixtures are ephemeral, not production data.

Frontend direct Firestore access still uses deny-all rules. Therefore this
transport does NOT yet make authenticated browser screens fully operational.
Assessment generation remains unexposed: its extraction/review dependencies,
runtime document assets, AI/provider adapter and complete pinned callable set
are not ready. Remaining source/dependency closure and role-rule reconciliation
are implementation work, not permission to weaken boundaries or claim parity.

The six bundles contain 38 fingerprinted JavaScript files. These are development
source snapshots, not independently packaged/deployable Functions. CRM2/CRM3
files and original shared framework sources remain byte-for-byte unchanged in
this branch's continuation diff. No production provisioning was attempted.

Five callable-specific deployed source trees now live in `backend-sources/`:
Assessment Assistant GenerateDraft, Manager linked-assessment read, Lister manual
referral creation, Closer administration onboarding and Processing dashboard.
Their 34 JavaScript files retain original source hashes and transformed hashes.
Only CRM2/CRM4 boundary names and line endings change. Shared CRM business logic
is reused, not independently reimplemented. Differing deployed package versions
remain separate; no consolidation is implied.

`tools/materialize-backend.cjs` follows literal JavaScript module dependencies
from explicitly reviewed entry modules. It does not copy archives wholesale,
environment files, secret bindings or credentials. Zero unresolved literal
JavaScript imports is **not** complete runtime dependency closure: for example,
the governed Information Brochure PDF is a runtime filesystem dependency and is
not copied. Dynamic dependencies, package-version locks and provider routes still
need reconciliation before these bundles can be deployed or broadly registered.

`tools/local-handlers.cjs` exposes only Lister referral creation and Manager
linked-assessment reading to local integration tests. It requires the exact demo
project and loopback Firestore environment, uses a named Admin app and supplies
throwing provider stubs. This is not a callable HTTP server, authentication-token
verifier or production Firebase entrypoint. Test request authentication is
synthetic; client-facing rules remain deny-all. Other factory exports are private.

Current verification: **39/39 tests PASS** (36 source/mock/isolation tests and
three real-emulator/guard tests). Actual copied Lister code creates one synthetic
lead, handles idempotent replay and rejects duplicate creation in local Firestore.
Actual Manager code reads an existing synthetic DRAFT without modifying it;
CRM2/CRM3 membership is denied. Temporary test documents/accounts are removed.
Browser login smoke rerun at 390/768/1440: no errors or horizontal overflow.
These results do not certify other workflows, output rendering or live providers.

Backend test command (with installed Firebase packages on NODE_PATH):

```
node --test crm4-staging/tests/backend-assessment.test.cjs crm4-staging/tests/backend-workflows.test.cjs crm4-staging/tests/clone.test.cjs crm4-staging/tests/isolation.test.mjs
```

With Auth/Firestore demo emulators running separately:

```
node --test crm4-staging/tests/backend-emulator.test.cjs crm4-staging/tests/emulator.test.cjs
```

No production application requests, records, emails, payments, deployments or
infrastructure changes were made. Source retrieval was read-only. The unexecuted
broad index-discovery copy is quarantined under ignored `.scratch/`; it is not
part of this release or any runtime.

## Continuation result

`local-public/` now contains 67 fingerprint-derived CRM source/assets, including
52 HTML routes. These cover login, Admin, Manager, Lister, Closer, assessments,
onboarding interfaces, processing, Case Action Engine and Client Portal screens.
Nine generated modular Firebase SDK adapters and one compatibility adapter route
Auth/Firestore/Functions/Storage to the demo project's loopback emulators.
Original production client configuration is replaced; CRM2 workspace/route names
become CRM4. Only blank-line whitespace/EOF is normalised beyond these boundary
transformations. No business logic, report engine or CSS redesign was performed.

Serve **only through the guarded local server**, not arbitrary static hosting:

```
node crm4-staging/tools/serve-local.cjs
```

Open `http://127.0.0.1:4404/crm4-login.html`. Do not enter production credentials.
The server is loopback-only, read-only, no-store/noindex and manifest-allowlisted.
Its CSP denies production API connections. The historical `public/` staging
snapshot remains unserved. CRM3 route access is rejected.

Local emulator configuration: `firebase.local.json`, project
`demo-quaerens-crm4`. Firestore and Storage are deliberately deny-all until the
backend/rule contract is reconciled. This is **not functional workflow parity**.

### Verified

- 13 local source/isolation tests pass, plus one real emulator integration test
  (14 total). Existing `crm2-functions-security.test.js` also passes against the
  unchanged branch source; this is not certification of the mixed live backend.
- Real Auth/Firestore emulator test passes using a temporary synthetic account;
  CRM2, CRM3 and CRM4 collection reads are denied, with no production requests.
- Browser login smoke passes at 390/768/1440: inputs visible, no horizontal
  overflow, no JavaScript errors, no external production connection attempts.
- All three login screenshots visually inspected; authenticated workspace
  screens/workflows are **NOT VERIFIED**.
- 125 literal callable dependencies matched to current deployed metadata.
  Dynamic dependency discovery remains a limitation, not a certified closure.

### Backend baseline decision

`backend-baseline-comparison.json` proves differing non-secret JavaScript hashes
across the currently deployed GenerateDraft, ManagerGetLinkedAssessment and
AdminCreateUser packages: `index.js`, `frameworkB.js` and
`crm2OperationalFlow.js` each have three versions; Assessment Assistant has two.
The shared workspace access module matches in these samples.

Consequently a single historical `functions/` directory is not an exact current
CRM2 backend. This continuation uses per-callable source-version preservation;
consolidation would require separate review. No consolidation has been silently
applied. No source
archive was downloaded wholesale: inspection used ZIP metadata and selected
JavaScript byte ranges, excluding secret/configuration entries.

Remaining: complete per-callable source/dependency pinning, isolated server
entrypoints, current role/rule contract, provider test adapters, functional role
fixtures, full workflow regressions and authenticated visual parity. Production
Firebase/domain/provider provisioning and deployment remain unauthorised.

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

The original service factory is retained as a tested reference. Generated SDK
adapters now enforce the same demo/loopback boundary in `local-public/`. It is not
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

1. Complete dynamic frontend dependency closure, including role-specific shared
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
