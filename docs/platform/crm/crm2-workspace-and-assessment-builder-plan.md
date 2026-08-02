# CRM2 Workspace and Assessment Builder Plan

Version: 0.1  
Status: Production-safe implementation plan  
Date: 2 August 2026

## Purpose

CRM2 is a second operational workspace for a new internal team. The existing Quaerens CRM remains the live CRM and keeps its current name, routes, staff workflows and lead-management responsibilities.

This plan records the safe implementation boundary for the first CRM2 release. The goal is to provide controlled CRM2 access and assessment-builder exploration without disrupting the existing CRM or mixing CRM2 activity with internet-generated leads.

## Current CRM Position

The current CRM is a set of public static HTML pages backed directly by Firebase client-side SDK calls. The live CRM pages use collections such as:

- `leadAssignments`
- `processingCases`
- `processingCaseEvents`
- `processingCaseTasks`
- `processingFiles`
- `assessmentReports`
- `closerAssignments`

The current Firestore rules are permissive. For that reason, CRM2 must not be introduced by casually duplicating live CRM pages or adding new client-side writes into live CRM collections without a proper workspace-aware permission model.

## Implementation Boundary

The first CRM2 release will be a contained internal workspace foundation:

- Add a CRM2 entry point from the Admin Centre.
- Add a CRM2 workspace page.
- Add Solar and Spray Foam assessment-builder routes.
- Store assessment drafts locally in the browser for exploration.
- Generate clearly labelled draft report previews.
- Provide editable export options and print/PDF support through the browser.
- Avoid reading internet-generated leads.
- Avoid writing into live CRM collections.
- Avoid partner, office or third-party names in routes, labels, database fields or documentation.

## Shared Processing Principle

CRM and CRM2 are intended to feed the same Processing department. The future production integration must use workspace-aware records so Processing can filter, badge and audit records by source workspace.

The target model is:

| Field | Purpose |
| --- | --- |
| `workspaceId` | Identifies CRM, CRM2, CRM3 or CRM4 |
| `workspaceLabel` | Human-readable workspace name |
| `sourceWorkspace` | Workspace that created or referred the case |
| `processingStatus` | Shared Processing queue status |
| `createdByWorkspaceUser` | Staff user responsible for creating the record |

## Deferred Production Gates

These items are required before CRM2 can become a fully live case-management workspace:

1. Workspace-aware authentication and authorisation.
2. Firestore security rules that separate CRM, CRM2 and future workspaces.
3. A shared Processing schema migration.
4. A safe backfill strategy for existing records where `workspaceId` is missing.
5. Server-side or rules-level prevention of CRM2 receiving internet-generated leads.
6. High-fidelity DOCX/PDF report generation matching approved report templates.
7. Audit logging for assessment report creation and export.

## Report Builder Principle

Solar and Spray Foam report builders should ultimately generate:

- An editable Word document.
- A matching PDF.
- A structured evidence schedule.
- A clear preliminary assessment summary.
- A cautious outcome section that avoids guarantees.

Until the high-fidelity document generator is completed and verified, the public interface must describe generated outputs as draft assessment previews and not as final assessment reports.

## Future Workspace Scalability

CRM2 must be the pattern for CRM3 and CRM4:

- No hard-coded partner names.
- No workspace-specific route names beyond `crm2`, `crm3`, etc.
- Shared UI language.
- Workspace-aware data model.
- Shared Processing compatibility.

## Safe Release Decision

For this release, CRM2 will be shipped as a controlled workspace foundation and draft assessment-builder environment. It will not claim complete live CRM integration, final report generation, or enforced data isolation until the deferred gates are completed.
