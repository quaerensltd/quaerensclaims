# CRM4 functional parity — continuous-client evidence

Local emulators only. Not production certification. Business source versions stay
separately pinned. The complete journey currently fails, rather than substituting
pre-completed fixtures for missing transitions.

| Capability | Continuous-client result | Qualification |
|---|---|---|
| Staff authentication | Tested | Five roles through actual login |
| Lister referral | Tested | Authenticated callable; replay same lead |
| Assessment input/analysis/review | Tested | Synthetic AI adapter only |
| Generation/finalisation | Tested | Same assessment; memory-only documents; capture-only email |
| Correction/regeneration | Separate regression tested | Not repeated in continuous journey |
| Manager review/assignment | Tested | Formal handoff follows completed assessment |
| Appointment completion | Tested as Manager | Closer denied by preserved role contract |
| Closer deal | Tested | Duplicate replay retained |
| Agreement generation/send | Tested in actual page | Real template/PDF; provider capture only |
| Signature acknowledgment | Tested | Processing; stale version denied |
| Payment prerequisites | Tested | Synthetic manual acknowledgment; no Stripe/money |
| Administration slot/booking | Tested | Published by handler, not seeded; duplicate protected |
| Paid Client Workspace | BLOCKED | caseRef versus crm4LeadId contract mismatch |
| Portal activation/login | Unexecuted | Handler dependencies loaded, not functional certification |
| Onboarding completion | Separate seeded regression only | NOT proven for continuous client |
| Processing next evidence transition | Unexecuted | Awaiting upstream contract resolution |
| Cross-workspace/security | Existing regressions pass | Portal-specific boundaries still unverified |
| Responsive 390/768/1440 | Partial | Four views no overflow/exceptions; mobile tables cramped |
| Exact CRM2 visual parity | Unverified | No authenticated baseline comparison this phase |
| Remaining callable inventory | Incomplete | 38 explicit local handlers; no broad factory exposure |

## Required before deployment

- Approve/resolve the preserved assessment-linkage contract incompatibility,
  retaining workspace, lead ID, assessment ID and QAR verification. No direct
  record patch or shortcut handler is acceptable.
- Finish portal, onboarding and Processing chain and negative tests using the
  same client. Complete full-width workflow/visual acceptance and remaining
  dependency coverage; no claim of full parity until then.
- Decide independent infrastructure/provider configuration, persistent isolated
  document storage and deployment packaging under separate authority. Existing
  local transport and captured providers are not deployable production services.
