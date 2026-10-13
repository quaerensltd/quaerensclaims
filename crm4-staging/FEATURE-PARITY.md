# CRM4 functional parity — continuous-client evidence

## Latest manual boundary verification

| Feature | Executed result | Remaining boundary |
|---|---|---|
| Spray Foam manual lifecycle | Browser retested through version 2, protected Manager download/hash | Manual operational completion not supported |
| Solar manual creation | Rejection verified with Solar permission; disabled UI verified | All preserved manual Create contracts permit Spray Foam only |
| Legacy compatibility | Pure preflight and conflict/digest tests pass | Explicit migration plan only; no records migrated |
| Manual handoff | Manager linked report/download pass; completion rejects without lead mutation | Closer/onboarding/Processing continuation NOT EXECUTED for manual reports |
| Regressions | 79/79 plus CRM2 security pass | Does not establish missing Solar/manual handoff parity |

See MANUAL-LEGACY-COMPATIBILITY.md. Runtime coverage remains 84; no new callable.

## Current manual authoring acceptance

Actual Spray Foam browser lifecycle through two issued versions: tested, including
independent approval, same-QAR correction, hashes and 390/768/1440 responsive views.
Concurrent/stale saves and source/v9 isolation tested. Solar manual authoring and
manual Processing handoff remain unavailable; no legacy record migration.
See MANUAL-AUTHORING-EVIDENCE.md; supersedes older manual-authoring gaps below.

## Final-contract acceptance — 13 October 2026 (supersedes affected rows below)

| Feature | Actual evidence | Limitation |
|---|---|---|
| Manual Framework B operations | Authenticated local approval/corrections, immutable PDF/DOCX, captured issue, legacy completion | Full manual authoring UI and issuance crash recovery unverified; v9 remains separate |
| Legacy portal v2 | Actual projection/message/upload/invitation forms; client claim/download/revocation contract tests | No arbitrary v2-to-v3 migration; old UI identical-message replay conservatively deduplicated |
| Global search | Actual Processing UI; role and explicit workspace visibility tests | Legacy source references can appear separately; no automatic migration |
| Legacy Closer Processing links | Both page guards and source denial tested | Inapplicable to CRM4, intentionally not exposed |
| Admin resilience | Concurrent-create rejection, partial Auth failure, setup replay duplication reproduced; retry converges | NOT atomic/exactly-once recovery acceptance |
| Staff callback email | Provider failure leaves unsent state; retry/replay captures once | Not universal legacy-email crash certification |
| Responsive views | Seven screens, 21 checks at 390/768/1440, no overflow/page exceptions | Current authenticated CRM2 visual baseline unavailable; emulator warning visible |
| Runtime inventory | 81 pinned + 2 recovery; 68/82 static names | 11 out of scope, 1 inapplicable, 2 Stripe disabled; not all dynamic functionality certified |

No cloned UI or existing source snapshots changed in this phase. New visual
inspection covered portal Admin and search. Same-client v9 journey re-executed.
Historical rows below describe earlier evidence, not additional acceptance claims.

Local emulators only. Not production certification. Business source versions stay
separately pinned. The same-client journey completes through active Processing
and the next governed evidence transition without pre-completed client fixtures.

| Capability | Continuous-client result | Qualification |
|---|---|---|
| Staff authentication | Tested | Five roles through actual login |
| Admin create/setup/block/reactivate/provision | Tested via authenticated browser callables and emulator | Exact selected source; synthetic identities, captured setup emails; concurrent-create/crash recovery incomplete |
| Callback/agenda/confirmation | Tested via authenticated browser callables | Owner, stale-preview rejection, replay and captured email |
| Manager/Closer report download and previews | Tested via authenticated browser callables | Protected returned PDF bytes/hash checked; Lister denied |
| General-information and appointment notifications | Tested via authenticated browser callables | Pinned brochure, capture-only providers, replay; not blanket crash-recovery acceptance |
| Onboarding cancellation/slot blocking | Tested in emulator | Actual booking precedes cancellation; concurrent cancel yields one event; role and booked-slot guards |
| Lister referral | Tested | Authenticated callable; replay same lead |
| Assessment input/analysis/review | Tested | Synthetic AI adapter only |
| Generation/finalisation | Tested | Same assessment; memory-only documents; capture-only email |
| Correction/regeneration | Tested in same-client journey | Manager start/replay, preview, finalise/replay; same QAR, immutable previous version |
| Manager review/assignment | Tested | Formal handoff follows completed assessment |
| Appointment completion | Tested as Manager | Closer denied by preserved role contract |
| Closer deal | Tested | Duplicate replay retained |
| Agreement generation/send | Tested in actual page | Real template/PDF; provider capture only |
| Signature acknowledgment | Tested | Processing; stale version denied |
| Payment prerequisites | Tested | Synthetic manual acknowledgment; no Stripe/money |
| Administration slot/booking | Tested | Published by handler, not seeded; duplicate protected |
| Paid Client Workspace | Tested | Validated read alias; atomic projection/creation |
| Portal activation/login | Tested | Actual synthetic portal login; wrong case denied |
| Portal messages and uploads | Tested in actual forms | Client message, staff reply, emulator upload, protected byte-exact download |
| Portal upload security | Tested | Owner create only; wrong client, unverified, disabled, overwrite, direct read, unsafe MIME denied |
| Payment/appointment concurrency | Tested | Three concurrent payment acknowledgments yield one event; two leads yield one slot booking |
| Client notification failure/retry | Tested in CRM4 boundary | Durable outbox, bounded retries, concurrent/restarted recovery, legacy pending recovery, terminal failure; captures only |
| Staff portal notification recovery | Tested in CRM4 boundary | Staff-only recovery, concurrent retry, new runtime instance, legacy pending recovery and terminal failure; original message retained |
| Upload crash recovery | Tested in CRM4 boundary | Atomic registration, metadata/identity conflict denial, partial-registration repair, staff-only aged orphan cleanup |
| Portal access revocation | Tested | Own pinned source; wrong roles/workspaces denied; revoked client denied |
| Portal receipt timestamps | Tested | Both timestamp shapes; visible browser dates at responsive widths |
| Onboarding completion | Tested | Same client; replay protected |
| Processing next evidence transition | Tested | HIGH-priority evidence request; audit retained |
| Cross-workspace/security | Regression tested | Link conflicts/QAR/version/workspace rejected; portal wrong-case denial |
| Responsive 390/768/1440 | Covered views tested | Five views no overflow/exceptions; tables scroll inside cards |
| Exact CRM2 visual parity | Unverified | No authenticated baseline comparison this phase |
| Remaining callable inventory | Incomplete | 69 pinned handlers + 2 CRM4 recovery controls; 56/82 static inventory names covered; 11 intentionally excluded CRM3/Guided Support names |

## Required before deployment

- Linkage incompatibility resolved in the approved CRM4 boundary, not the pinned
  bundles or assessment records. Broader role/provider/concurrency coverage and
  remaining portal action coverage are still needed. Core upload/message flows
  now pass, including current client notification recovery. Broader staff/legacy
  notification failure recovery remains unverified.
- Complete authenticated CRM2 visual comparison and remaining dependency coverage;
  the exercised same-client journey is not proof of every CRM2 workflow.
- Decide independent infrastructure/provider configuration, persistent isolated
  document storage and deployment packaging under separate authority. Existing
  local transport and captured providers are not deployable production services.
# Recovery extension — 13 October 2026

- Admin CreateUser: durable operation, concurrent/failure/restart recovery and
  one setup capture tested. Original source snapshots unchanged.
- Manual Issue: transactional synthetic capture/status/audit, crash rollback and
  retry from fresh runtime with demo Storage tested.
- Actual manual authoring UI: input/preview/RTF and responsive checks executed;
  governed save/review/issue journey BLOCKED by legacy collection contract.
- See ADMIN-RECOVERY-EVIDENCE.md; prior blanket Admin/issuance gaps are historical.
