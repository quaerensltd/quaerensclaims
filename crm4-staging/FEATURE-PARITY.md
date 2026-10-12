# CRM4 functional parity — continuous-client evidence

Local emulators only. Not production certification. Business source versions stay
separately pinned. The same-client journey completes through active Processing
and the next governed evidence transition without pre-completed client fixtures.

| Capability | Continuous-client result | Qualification |
|---|---|---|
| Staff authentication | Tested | Five roles through actual login |
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
| Upload crash recovery | Tested in CRM4 boundary | Atomic registration, metadata/identity conflict denial, partial-registration repair, staff-only aged orphan cleanup |
| Portal access revocation | Tested | Own pinned source; wrong roles/workspaces denied; revoked client denied |
| Portal receipt timestamps | Tested | Both timestamp shapes; visible browser dates at responsive widths |
| Onboarding completion | Tested | Same client; replay protected |
| Processing next evidence transition | Tested | HIGH-priority evidence request; audit retained |
| Cross-workspace/security | Regression tested | Link conflicts/QAR/version/workspace rejected; portal wrong-case denial |
| Responsive 390/768/1440 | Covered views tested | Five views no overflow/exceptions; tables scroll inside cards |
| Exact CRM2 visual parity | Unverified | No authenticated baseline comparison this phase |
| Remaining callable inventory | Incomplete | 50 pinned handlers + 2 CRM4 recovery controls; 37/82 static inventory names covered |

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
