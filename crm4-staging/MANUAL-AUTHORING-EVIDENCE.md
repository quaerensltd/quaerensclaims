# CRM4 manual authoring compatibility — 13 October 2026

## Follow-on acceptance from 99855b4

- Added a pure read-only legacy preflight with deterministic source digest and
  explicit blocking reasons. No migration callable, identity allocation or writes.
  See MANUAL-LEGACY-COMPATIBILITY.md for traced legacy shape and proposed process.
- Solar rejection now tested with explicit Solar category permission: original
  Create returns invalid-argument and leaves no assessment/lead pointer. All four
  available manual bundles contain the same Spray Foam-only creation guard.
  Solar lifecycle is BLOCKED, not implemented or passed.
- Actual browser repeated Spray Foam author/save/reopen/edit/review/independent
  approve/documents/captured issue/correction/reissue. Fixture DIazb7YsVUTSBkRZIJrs,
  QAR-20261013-FC660ADF, two immutable versions and both PDF hashes verified.
- Authenticated Manager browser transport retrieved that same manual assessment
  and protected PDF successfully. CompleteIssue rejected manual source as expected;
  lead unchanged. Manual onboarding/Processing not executed: no preserved manual
  completion contract. No spoofed AI source or seeded completion was used.
- Full suite 79/79 PASS, zero skips/failures. CRM2 security PASS. Existing diagnostic
  tests remain diagnostics, not recovery acceptance. Initial browser assertion used
  Playwright isDisabled on an option; corrected to native option.disabled, rerun PASS.
- Separate v9 continuous browser journey PASS, lead T88rBXwHY8w7gyypcYf7, through
  Processing and same-QAR correction. This is not a manual handoff acceptance claim.
- 390/768/1440 screenshots inspected; no horizontal overflow/page exceptions.
  Emulator warning overlays remain visible; this is not exact CRM2 visual-parity
  certification. Existing working-copy preview remains separate from issued PDFs.

No pinned sources, production code/rules or cloned page changed in this follow-on.
Solar creation and manual completion need the explicit contracts documented above.

Shared CRM Framework reuse. Local demo emulators and synthetic users/records only.

## Authoritative preserved contracts

The captured CRM2 builder saves a draft to the legacy workspace collection and
explicitly marks Processing integration pending. It does not implement Framework B
approval or issuance. The preserved `frameworkBAssessmentApprove/frameworkB.js`
factory contains Create, Get, SaveDraft, SubmitReview and StartSupersedingRevision.
Create supports **Spray Foam only**, allocates a registered QAR and checks author
capability. Save validates the revision and structured evidence/content. Approval
requires another authorized identity and a complete checklist, then freezes a
hashed version. The already connected own-source GenerateDocuments and Issue
handlers retain document hashes, delivery and audit contracts.

No production source was fetched and no pinned bundle/manifest changed. The new
`crm4ManualAssessment` is explicitly a CRM4 compatibility endpoint reusing those
preserved factory exports, NOT a claim that new independently deployed authoring
callable versions have been captured. Existing v9 Assistant routes are untouched.

## Compatibility boundary

- Active CRM4 membership plus original capability/category/workspace checks.
- Exact lead/assessment/QAR linkage; no v9, AI-assisted or manual-upload adoption.
- Only newly authored records tagged `crm4ManualAuthoringVersion: 1` are editable.
  Existing legacy/manual records require a separate explicit migration contract.
- QAR allocation, creation, initial save, lead pointer and audits share a buffered
  Firestore transaction. Competing creation cannot allocate duplicate linked QARs.
- Save, submit and correction are transactional with required current revision.
  One concurrent save commits; the stale competitor receives `aborted`.
- Under-review content cannot be edited through this adapter. Original self-approval
  prohibition remains. Issued correction validates immutable identity/hash first.
- Free-text finance remains narrative, not parsed into amounts or recovery ranges.
  Evidence entered in this form stays client-reported, not verified.
- Original creator/reviewer/issuer capabilities remain in the pinned handlers.
  Manual operation admission additionally requires active CRM4 membership.
- No Firestore rules changed. No browser writes to either assessment collection.

## Browser implementation and executed journey

`adapt-manual-page.cjs` replaces only the old inline persistence module in the
cloned manual builder. The existing page shell, fields and draft presentation are
retained. Added workflow controls call authenticated local handlers, suppress
repeat pending clicks and show persistent errors. The original Processing button
remains disabled; this task does not invent a Processing handoff for manual reports.
Solar is explicitly unavailable rather than using Spray Foam business logic.

Actual separate author/reviewer logins executed:
author -> save -> reload -> edit -> save -> submit -> independent approval ->
generate PDF/DOCX -> capture-only issue -> correction draft -> edit/save -> submit
-> independent approval -> regenerate -> capture-only issue version 2.

Final browser fixture: `ffByD0Jdvx68vo04mQa7`, QAR `QAR-20261013-DD5D3F73`.
Same assessment/QAR, version 1 retained as SUPERSEDED, version 2 ISSUED; both stored
PDF hashes verified against generated bytes. No intermediate assessment states
were seeded. Only initial synthetic identities/capabilities and a lead were seeded.

Responsive browser checks and visual inspection: 390, 768, 1440, no horizontal
overflow or page exceptions. Expected Firebase emulator warning remains visible.
Visual review caught disabled form fields dropping the route from FormData; this
was corrected and the rerun explicitly asserts Spray Foam preview and ISSUED state.
Approval checkbox spacing was corrected using existing shared classes. Draft RTF
remains a working-copy export, separate from governed immutable issued documents.

## Tests and limitations

New authoring tests cover concurrent creation/saves, stale revisions, unauthorized
and inactive access, self-approval, mismatched linkage, legacy-record refusal and
v9 exclusion. Existing manual tests cover interrupted issuance, fresh-runtime
Storage recovery and concurrent issuance; source and clone integrity remain tested.
Initial complete-suite run found the exact callable allowlist missing the new
endpoint; the explicit allowlist was updated without relaxing its equality check.

Final full regression: **77/77 PASS**, no failures/skips (three original-source
diagnostics remain diagnostic, not new recovery acceptance). CRM2 Cloud Function
security test PASS. Syntax and git diff --check PASS. Separate v9 continuous
browser journey PASS, synthetic lead `J6tshianQJEBtDFg21E8`. Protected-source/rule
diff is empty. New runtime total: 84 endpoints; static inventory remains 68/82.

Not deployment-ready. Solar manual authoring, migration of legacy drafts, manual
Processing handoff, real-provider acceptance and independent production packaging
remain separate work. No real email, payment, production read/write, merge or deploy.
