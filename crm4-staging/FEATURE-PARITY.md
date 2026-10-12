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
| Notification failure/retry | Incomplete — inherited defect reproduced | Message persists, but replay does not retry pending notification; diagnostic PASS is not resilience PASS |
| Onboarding completion | Tested | Same client; replay protected |
| Processing next evidence transition | Tested | HIGH-priority evidence request; audit retained |
| Cross-workspace/security | Regression tested | Link conflicts/QAR/version/workspace rejected; portal wrong-case denial |
| Responsive 390/768/1440 | Covered views tested | Five views no overflow/exceptions; tables scroll inside cards |
| Exact CRM2 visual parity | Unverified | No authenticated baseline comparison this phase |
| Remaining callable inventory | Incomplete | 49 explicit local handlers; 36 of 82 static inventory names covered; see CALLABLE-COVERAGE.md |

## Required before deployment

- Linkage incompatibility resolved in the approved CRM4 boundary, not the pinned
  bundles or assessment records. Broader role/provider/concurrency coverage and
  remaining portal action coverage are still needed. Core upload/message flows
  now pass; notification failure recovery does not.
- Complete authenticated CRM2 visual comparison and remaining dependency coverage;
  the exercised same-client journey is not proof of every CRM2 workflow.
- Decide independent infrastructure/provider configuration, persistent isolated
  document storage and deployment packaging under separate authority. Existing
  local transport and captured providers are not deployable production services.
