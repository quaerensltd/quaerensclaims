# QCMS Operations Foundation

Version: 1.2.0-foundation  
Status: Local prototype foundation  
Blueprint: `docs/platform/quaerens-platform-blueprint-v1.1.md`

## Purpose

QCMS Operations is the dedicated operational workspace for instructed QCMS cases. It is for Complaint Managers after a Platform User has completed the QCMS instruction process and become a client.

This release creates the visual and structural foundation only. It uses mock local data and does not connect to production systems.

## Routes

- `/qcms-operations.html#dashboard`
- `/qcms-operations.html#cases`
- `/qcms-operations.html#case/QCMS-2026-0001`
- `/qcms-operations.html#case/QCMS-2026-0001/timeline`
- `/qcms-operations.html#case/QCMS-2026-0001/evidence`
- `/qcms-operations.html#case/QCMS-2026-0001/internal-notes`
- `/qcms-operations.html#case/QCMS-2026-0001/activity`

Other navigation entries are labelled foundation placeholders.

## Components

- Application shell and left navigation
- Dashboard workload metrics
- Priority action list
- Today-completable action list
- Stage summary
- Recent activity feed
- Cases register with search, filters and sorting
- Case workspace header
- Case tabs
- Case overview
- Case health panel
- Timeline view
- Evidence view
- Internal notes prototype
- Activity/audit trail

## Mock Data

The fixture set includes:

- 20 fictional instructed cases
- 3 Complaint Managers
- 3 QCMS service levels
- Solar, Spray Foam Insulation, Energy, Caravan/Holiday Park, Section 75, Car Finance, Broadband/Mobile and Travel routes
- Mixed stages, priorities, case-health positions, due dates and evidence completeness

## Architecture Boundaries

This module is intentionally isolated from:

- Operations CRM lead workflows
- public Complaint Packs
- QCMS commercial payment or instruction logic
- Client Portal
- Partner Portal
- Firebase
- Stripe
- email systems
- production secrets

QCMS Operations must not become a duplicate CRM, sales pipeline or campaign tool.

## Tests

Run:

```powershell
npm run test:qcms-operations
```

The test verifies the mock data, dashboard sections, cases register, filters, case workspace, placeholders, activity creation and architecture guardrails.
