# CRM4 local portal resilience boundary

## Final-contract extension — 13 October 2026

Legacy v2 uses `legacy-portal-boundary.cjs`: pinned factories run within one
Firestore transaction with buffered writes and nested transaction flattening.
Role checks still execute; deduplicated replies recheck staff authority. Exact
case/lead/version checks share the transaction. Interrupted message/audit writes
roll back together; competing v3 upgrades cannot be downgraded. New projections
use deterministic local IDs and refuse another projection for the same lead.

Invitation creation rejects an unexpired existing token or active/revoked case.
Claim validates verified email and current ownership/version; used tokens reject
without a second mapping. Raw tokens are not logged or stored in a replay ledger;
returned URLs are localhost-only. No invitation delivery occurs.

Staff message replay uses explicit request ID when supplied. The unchanged legacy
UI lacks one, so exact author/case/body replay is conservatively deduplicated;
intentional later identical messages need a distinct request ID. Registration binds
actual Storage metadata/path/document identity and replay payload. Shared uploads
are immutable and limited to active CRM4 staff on linked v2 cases; downloads remain
protected callable routes. Existing current-v3 paid-workspace outbox is unchanged.

Admin failure tests are diagnostics, NOT successful resilience certification.
Pinned source creates Auth/membership before email and updates membership before
Auth; it lacks setup idempotency. Tests reproduce racing-create rejection, partial
Auth failure and repeated setup capture. Explicit retries converge. No silent
business-source rewrite or claim of universal recovery. A governed cross-service
operation contract remains required. Callback failure/retry/replay is verified,
but not every legacy staff email crash path.

Scope: Shared CRM Framework reuse, CRM4 demo emulators only. Pinned callable
snapshots are unchanged. `portal-recovery.cjs` wraps paidClientCreateMessage and
paidClientRegisterUpload with a restricted buffered Firestore transaction view.
It does not replace their validation, templates or business record structures.

## Notification authority

- Message/upload, original notification and durable outbox commit together.
- Original provider calls only stage their exact payload/key inside the transaction.
  The boundary resets the staged legacy SENT marker to PENDING before commit.
- Outbox states: PENDING, PROCESSING, CAPTURED, TERMINAL_FAILURE. CAPTURED is never
  external delivery. Original notification SENT means local capture acceptance;
  capturedOnly=true and delivered=false remain explicit.
- A five-second lease serialises workers. Maximum three attempts; retry delays
  are one and two seconds. Not-due/leased requests do not consume another attempt.
  No timer/scheduler is installed. `crm4RecoverPortalNotification` requires an
  authorised owner with active portal mapping or active CRM4 Processing/Admin.
- Durable synthetic receipt identity is the hash of the existing provider key.
  It survives transport restart and models provider-side idempotency. It does not
  prove any real provider's retention/retry contract. Every receipt delivered=false.
- Attempt/result audits are durable. Terminal failures cannot be reset by replay.
- An exact legacy message replay may recover a PENDING notification without
  rewriting its message. Contradictory replay bodies/owners are rejected. Already
  sent historical notifications are not silently re-sent.

Tests execute failure -> backoff -> successful capture, concurrent retry, a new
boundary instance, a separate child process after commit interruption, repeated
request, interrupted acknowledgment, permanent failure and unauthorised recovery.
The unwrapped pinned-source diagnostic remains as historical evidence, not an
active-boundary acceptance failure.

## Storage registration and cleanup

Actual emulator metadata must match size/type. The immutable owner upload path,
client mapping and visible requirement remain mandatory. One object cannot be
registered under another document identity. Atomic registration prevents partial
Firestore state; matching repeats are idempotent, conflicting metadata rejected.
An exact legacy partial registration can repair its requirement/outbox without
rewriting the original document; a newer requirement document cannot be displaced.

`crm4ReconcilePortalUpload` is Processing/Admin-only. It checks one exact owned
path and retains recent objects for 24 hours. Registered evidence cannot be
cleaned. An aged orphan is first tombstoned in a transaction that conflicts with
registration, then deleted using the recorded Storage generation precondition.
An interrupted cleanup can resume; the durable marker prevents registration of
a quarantined/deleted path. Only synthetic test orphans were deleted. No broad
bucket scan, wildcard delete or production Storage action exists.

## Timestamp finding

The preserved frontend stamp formatter accepted `seconds` only. Callable values
carry `_seconds`; the source formatter therefore produced an empty date. CRM4's
reproducible presentation transform accepts both shapes, ISO strings and true
epoch zero. Invalid strings stay blank. The browser journey asserts visible
receipt dates; no assessment/financial semantics are changed.

## Limits

This boundary covers the two current client message/upload operations, not every
staff/legacy notification route. Real-provider exactly-once delivery, exhaustive
machine-crash/Storage fault combinations, automatic recovery scheduling and
production retention policy remain unverified/unauthorised. Exact authenticated
CRM2 visual comparison requires a safe equivalent-data baseline. The preserved
static source baseline and CRM4 screenshots do not establish current live parity.
Remaining callable gaps are listed in CALLABLE-COVERAGE.md. Not deployment-ready.
# Functional-completeness extension — 12 October 2026

The same outbox now wraps paidClientStaffCreateMessage. Staff authority and exact
assessment/lead/QAR/version linkage are verified inside the transaction. Workspace
projection, message, notification, activity and audit writes commit together.
Recovery of staff-origin notifications is staff-only; client case ownership does
not grant that recovery operation. Pinned business source is unchanged.

Staff tests execute provider failure, bounded backoff, new boundary instance,
concurrent retries, duplicate/conflicting replay, legacy PENDING-message recovery
without message rewriting, wrong-workspace denial and terminal failure. Existing
client tests retain the separate-process restart and uncertain-acknowledgment
controls. All providers remain captured, not delivered.

This is not recovery certification for Admin setup emails, general-information
email locks, legacy portal-v2 operations or every historical staff email path.
