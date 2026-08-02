# CRM2 Workspace and Assessment Builder Report

Version: 0.1  
Status: Production-safe foundation completed locally  
Date: 2 August 2026

## 1. CRM2 Workspace

Created a contained CRM2 workspace page at:

- `/crm2.html`

The page introduces CRM2 as a separate internal workspace and confirms that the existing CRM remains unchanged.

## 2. Admin Centre Access

Added a CRM2 entry point to the Admin Centre so the new team can reach the workspace without using a partner-specific or office-specific route.

## 3. Solar Assessment Route

Created a Solar assessment route inside:

- `/crm2-assessment-builder.html`

The route captures:

- Client and property details.
- Provider details.
- Finance or payment route.
- Issue summary.
- Financial position.
- Evidence available.
- Evidence gaps or cautions.
- Assessment checks.

## 4. Spray Foam Assessment Route

Created a Spray Foam assessment route inside:

- `/crm2-assessment-builder.html`

The route includes Spray Foam-specific assessment focus areas:

- Mortgage, remortgage or sale impact.
- Surveyor or valuer comments.
- Product paperwork and installation records.
- Removal, roof repair or reinstatement quotes.
- Finance or credit-card route where relevant.

## 5. Report Builder Status

The current release creates a clearly labelled draft assessment preview and supports:

- Live preview.
- Local draft saving.
- Editable RTF download.
- TXT download.
- Print / save as PDF through the browser.

This is intentionally not described as a final high-fidelity report generator.

## 6. Word/PDF Limitation

The approved high-fidelity Word and matching PDF reports have not been completed in this release. That work requires:

- Approved report templates.
- A proper document-generation engine.
- Visual QA against the intended Quaerens report design.
- Secure workspace-aware storage.

## 7. Existing CRM

The existing CRM remains unchanged. The implementation does not rename the CRM, redesign it, or replace any CRM route.

## 8. Shared Processing

The planned shared Processing model is documented but not activated against live collections. The next implementation gate should add workspace-aware fields, badges and filtering after Firestore security rules are updated.

## 9. Lead Isolation

CRM2 does not read from `leadAssignments`, `claimSubmissions`, internet-generated form collections or the existing CRM lead flow in this release.

## 10. Security Boundary

The first CRM2 release avoids writing to live Firebase CRM collections because the current Firestore rules are permissive and the live CRM uses direct client-side collection access.

## 11. Future CRM3 and CRM4

The CRM2 architecture avoids partner names and records the future workspace model for CRM3 and CRM4.

## 12. Files Changed

- `docs/platform/crm/crm2-workspace-and-assessment-builder-plan.md`
- `docs/platform/crm/crm2-workspace-and-assessment-builder-report.md`
- `public/admin-centre.html`
- `public/crm2.html`
- `public/crm2-assessment-builder.html`

## 13. Known Limitations

- CRM2 is a controlled workspace foundation, not yet a fully live case-management workspace.
- Drafts are stored locally in the browser.
- No live Processing case creation occurs from CRM2 yet.
- No server-side workspace permissions have been added yet.
- Final DOCX/PDF assessment report generation remains a future milestone.

## 14. Next Recommended Gate

Before CRM2 stores live case records, complete:

1. Workspace-aware Firebase security rules.
2. Shared Processing schema and queue badges.
3. CRM2 staff role access controls.
4. Approved Solar and Spray Foam report templates.
5. High-fidelity document generation and visual QA.
