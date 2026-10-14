# CRM4 Spain initial lead import: preview-first preparation

Shared CRM Framework. No real leads were supplied, processed or imported. The hardened image is frozen at source commit 753b7c77; this offline adapter and its new tests are **not in that image** and do not add a live endpoint. Real import requires production security acceptance and a separately approved exact batch.

## Existing functionality verified

The cloned `local-public/manager-lead-upload.html` contains CSV preview and sequential client `addDoc` writes. It detects duplicates using the combined contact string inside the file, lacks authoritative cross-database/atomic duplicate reservation and safe partial-batch resume, and interpolates CSV fields into HTML. Current release Firestore rules deny direct lead writes. Preserve this denial; do not use that inherited page for real uploads or relax rules. Its preview rendering must not process untrusted real files without a governed replacement adapter and safe text rendering.

The registered `crm4ListerCreateReferralLead` callable already enforces active CRM4 Lister capability, server-derived actor ownership and audit, normalized contact duplicate checks, transactional duplicate reservations and per-actor request-id replay. Reuse it for authenticated per-staff ingestion; never impersonate staff from an administrator import session. An owner-operated bulk import assigning another UID needs a separately reviewed CRM4 server boundary with explicit actor-versus-owner audit and fresh membership/assignment checks. No such privileged bulk endpoint has been enabled here.

`crm4ManagerSendToCloser` supplies a governed manager/administrator handoff to an active Closer after approval, supporting the accepted dual-role membership extension. It intentionally refuses changing an already assigned Closer and directs users to a separately governed reassignment workflow. `crm4ManagerUpdateLead` rejects arbitrary ownership fields. **General Lister/Closer reassignment and owner-operated bulk assignment remain launch requirements**, not capabilities to simulate with direct database edits.

## Prepared offline preview

Run from the repository root, using only the supplied synthetic fixture for now:

```
node crm4-staging/tools/lead-import-preview.cjs crm4-staging/release/import-preparation/synthetic.csv crm4-staging/release/import-preparation/synthetic-context.json
```

No SDK/network or write operation exists in this tool. CLI output contains row numbers, status/reasons and assignee, excluding normalized contact payloads. The included synthetic-preview.json contains synthetic payloads for inspection only. Future real CSV/context/preview/receipts belong in restricted operational storage, never chat, Git, source archives or shared logs; approve location/access/retention before using real records. Contact hashes remain sensitive linkage data, not anonymized data.

Schema: sourceRowId, forename, surname, assigneeUid required; email or telephone required per row. Optional supported fields: claimType, referralSource/referralSourceOther, workspaceId, addressLine1/addressLine2, town, county, postcode, notes. No arbitrary fields, role, status, assessment state, creator, audit or ownership metadata may be imported. Stable unique sourceRowId is the owner's batch row reference. Every accepted row is CRM4-only and the handler supplies authoritative workspace markers. Exactly two distinct active dual-role staff are required; CSV chooses only one of these two verified UIDs. Do not infer employee identities from names or roster order.

Spray Foam defaults to the existing foam_insulation route; solar_support remains recognized for schema compatibility, not production-category certification. Require truthful referral provenance; never invent consent or source classification. Both names and a valid contact are required. Email is normalized to lowercase. Nine-digit Spanish numbers beginning 6/7/8/9 become +34; explicit international +country or 00country numbers are checked against basic E.164 shape, with Spanish length/prefix checks. Ambiguous other national numbers/extensions are rejected for manual correction. This checks format, not whether a number exists, is reachable or may lawfully be called.

CSV is bounded to 2 MiB/2,000 data rows, supports quoted commas/newlines and escaped quotes, and rejects malformed rows, unknown/duplicate headers, excess field lengths, NUL and formula-like non-phone fields. Preview duplicates are detected independently by email OR normalized phone, against the batch and supplied CRM4-only existing-contact inventory. No duplicate overwrites or automatic merges. An existing-data snapshot can become stale: `duplicateCheckFinal:false` is intentional; production commit must repeat authoritative duplicate reservation inside the existing transaction boundary.

A preview binds input hash, normalized accepted rows, staff snapshot, existing-data revision and deterministic per-row request IDs. Never alter a reviewed batch after approval. Display all accepted/rejected/duplicate rows, reasons, totals and per-person allocation using text nodes, not HTML interpolation. Approval binds exact batch/input/preview hashes and accepted sourceRowIds; rejected/duplicate rows are excluded and require separate correction/review.

Synthetic preview: **2 accepted, 2 rejected, 1 duplicate**. Accepted rows allocate one each to staff-one/staff-two; the duplicate shares a normalized phone; the rejected examples have a missing name and foreign workspace marker.

## Execution and partial-failure contract to finish before real imports

- Server authenticates the actual initiator, checks fresh active CRM4 authority, validates the exact two approved target memberships, accepted preview hash and data-source permission. Do not trust the offline roster or client-provided actor/role.
- Persist a restricted batch receipt with initiating UID, approved source/input hash, accepted sourceRowIds, intended owner, deterministic request ID, outcome/lead ID and timestamps. Row-state transitions must be durable and retry-safe. Do not copy full customer records into logs.
- Per-staff minimum path: each individually authenticated staff member submits only their allocated accepted rows through the existing callable. A central bulk path needs the governed server boundary described above. Existing creator/owner audit stays truthful in either path.
- Resume only unchanged approved rows using the same individual actor and exact request ID. Server reservations catch duplicates appearing after preview. Stop on revocation, changed allocation, stale approval, ambiguous write outcome or inconsistent receipt; reconcile known request/lead records before retrying. Existing handler replay does not validate altered request bodies, so preview immutability and payload binding must be enforced by the future commit adapter.
- Never delete already progressed leads, audit events, contact reservations, assessments, documents, appointments or provider receipts as a blanket rollback. Pause the batch and quarantine remaining rows. An authorized correction uses an auditable conditional update with expected record revision and reason; reassignment must separately check both owners and lifecycle state. Preserve creator and original events; append a correction event.
- A pristine imported-record reversal needs a reviewed server operation verifying batch ownership, unchanged update time, no downstream references and matching duplicate reservations before any conditional changes. It is not currently implemented or authorized. Prefer forward correction; do not resurrect rejected duplicates by blindly deleting reservation keys.

## Synthetic acceptance and limits

New tests exercise schema/phone/authority/formula validation, within-file/existing duplicates, deterministic preview/retry hashes and allocation changes. Local-emulator acceptance invokes the real registered creation callable under two distinct synthetic actors, simulates an interrupted batch followed by exact replay, checks cross-owner duplicate non-disclosure, ownership/audit, callback progression, unauthorized/early handoff denial, approved manager-to-dual-role Closer handoff and **denial of unsafe reassignment**, plus revoked membership denial. An explicit synthetic approval fixture isolates the handoff test; this does not claim a new full assessment journey or successful generic reassignment implementation.

No completed 113-test suite or live Storage acceptance is repeated for this offline addition. Targeted tests address its changed behavior. Successful real reassignment, owner-operated bulk import, durable production batch receipts/corrections, safe browser preview and deployed synthetic import acceptance remain mandatory before real import, and must be included in a subsequent approved release build if implemented.

## Exact future import approval request

After production security/operational acceptance: approve the specific restricted CSV location and SHA-256, preview hash, source/lawful-use attestation, accepted row IDs/count, exact allocation counts and two verified Firebase UIDs, named initiating actor, governed execution route, retention/access for source and receipts, batch limit and pause/correction plan. Explicitly exclude rejected/duplicate rows and all CRM2/3/5 records. Request separate approval for later corrections or additional batches; no standing permission to import arbitrary customer files is implied.
