# Manual assessment compatibility decision — 13 October 2026

Shared CRM Framework; local source inspection and synthetic data only. No legacy
production records were read, enumerated, migrated or rewritten.

## Proven source contracts

- The original cloned builder (checkpoint `a27dbb2`) read/wrote `crm4Assessments`.
  Fields included `caseId`, `assessmentRoute`, `status` (`draft` or
  `ready-for-review`), form narrative, creator and audit. Its local-storage restore
  also used this legacy save path. It did not allocate a governed QAR or immutable
  version. Browser RTF/print output was not governed issuance.
- All four captured manual Framework B factories (Approve, GenerateDocuments,
  Issue, RequestCorrections bundles) restrict Create to `spray-foam`. Solar in
  the legacy screen is not evidence of a governed Solar creation contract.
- `crm4AssessmentAssistantCompleteIssue` explicitly requires `AI_ASSISTED`.
  A manually authored `FRAMEWORK_B` assessment is rejected, even after issuance.
  Changing its source to pass that check would falsify provenance.
- Manager linked-assessment and protected-download routes accept the linked manual
  report. This is report access, not proof of completed operational handoff.

## Read-only preflight implementation

`tools/manual-legacy-plan.cjs` consumes caller-supplied snapshots only. It has no
Firebase or network dependencies, no callable registration and no write path.
It returns a stable SHA-256 digest and explicit blockers. Even a compatible draft
returns `executable: false` and requires migration approval. A changed snapshot
changes the digest. Existing QAR/version/source metadata, linked leads, conflicting
workspace/lead identities, unsupported categories and missing author provenance
fail closed. No report amounts or evidence statuses are inferred.

## Proposed explicit migration (NOT IMPLEMENTED)

1. An authorised administrator selects a specific synthetic legacy record first.
   Review source, creator/audit, lead ownership and category. Never scan/import
   automatically on login or reopen.
2. Present the immutable source digest and proposed field mapping for approval.
   Legacy `reference` is not assumed to be a QAR; `ready-for-review` is not approval.
3. A separately reviewed authenticated migration operation must re-read and compare
   the digest, active membership/capabilities, unlinked CRM4 lead and source in a
   transaction. Use a durable unique operation key tied to source ID and digest.
4. Retain the legacy document unchanged. Preserve an immutable source snapshot and
   cross-reference. For an ungoverned draft, explicitly allocate a new governed ID
   and QAR; disclose that these were not present in the legacy record. Never invent
   historical versions, approvals, document hashes or verified evidence.
5. Import reviewed narrative as DRAFT / client-reported only. Require independent
   review, document generation and issuance through existing contracts. Retries
   return the same target; conflicting/changed source requires fresh approval.
6. Existing governed identities require a distinct identity-preserving adoption
   contract, not this draft import. Rollback must not delete source records or
   silently restore old lead pointers after later legitimate changes.

## Unresolved contracts / approval boundary

Solar needs an authoritative manual category-capable creation contract or explicit
approval to extend the existing manual category contract in a documented CRM4-only
adapter. Do not rewrite pinned modules, patch their code at runtime, create Solar
as Spray Foam then rename it, or use v9 AI generation as a substitute.

Manual operational completion needs an explicit reviewed completion contract:
Manager/Administrator plus issuer authority, exact lead/QAR/current issued version,
hashes and completed capture/delivery, atomic lead/audit update and replay/stale
protection while retaining `FRAMEWORK_B` source. No such manual-specific completion
contract exists in the available pinned sources. Do not seed `COMPLETED` to bypass
this gap. Downstream onboarding/Processing acceptance remains unexecuted for manual
reports until that contract is established. The separate v9 journey is unaffected.
