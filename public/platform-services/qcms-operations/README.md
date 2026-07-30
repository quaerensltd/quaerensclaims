# QCMS Operations - Release 1.4.1 Workspace Interaction & Navigation Polish

Version: 1.4.1-alpha.1
Release name: Workspace Interaction & Navigation Polish
Status: Local prototype, isolated from production systems

## Purpose

QCMS Operations is the operational workspace for instructed QCMS complaint cases. Release 1.4 turns each mock case into an action-first Case Workspace for Complaint Managers who need to understand the case, move it forward, request evidence, prepare complaint material and record internal activity.

This module remains separate from Operations CRM. Operations CRM continues to handle business workflow activity. QCMS Operations focuses only on instructed complaint-management work.

## Release 1.4.1 Improvements

Release 1.4.1 keeps the Release 1.4 Case Workspace and adds interaction polish:

- application-style left navigation with active, hover and keyboard focus states;
- local mock action dialogs for Generate Complaint, Request Evidence, Send Reminder, Assign Complaint, Record Response and Close Complaint;
- mock state updates for case status, manager, readiness, next action, evidence checklist, activity and operational timeline;
- localStorage persistence for prototype sessions;
- reset control to restore original fixture data;
- accessible dialog behavior with Escape close, focus return and keyboard traversal.

No live operational system is connected. The actions demonstrate intended workflow behavior only.

## Release 1.4 Workspace Modules

The Case Workspace now includes:

- Complaint Journey;
- Complaint Summary;
- Today's Task;
- Complaint Readiness;
- Evidence Checklist;
- Operational Timeline;
- Expected Next Milestone;
- Messages;
- Internal Notes;
- Workspace Actions.

The previous tab-led case view has been replaced with a practical workspace layout. The page now answers what the case is about, where it is in the complaint journey, what the Complaint Manager should do today and what evidence is still missing.

## Case Workspace Modules

### Complaint Journey

Shows the case across the operational stages used by QCMS Operations:

1. Instructed
2. Triage
3. Evidence
4. Complaint Draft
5. Ready for Submission
6. Submitted
7. Awaiting Response
8. Resolved

### Complaint Summary

Displays the issue, desired outcome, financial exposure, current status and next action in a compact summary panel.

### Today's Task

Highlights the single most useful next action, who owns it, the due date and why it matters.

### Complaint Readiness

Uses progress rows for authority, evidence, complaint preparation, response monitoring and outcome position. This is deliberately complaint-management language rather than sales pipeline language.

### Evidence Checklist

Lists expected evidence items and whether they are received, requested, partial, missing or not applicable.

### Workspace Actions

Mock action buttons are available for future operational flows:

- Generate Complaint
- Request Evidence
- Send Reminder
- Assign Complaint
- Record Response
- Close Complaint

These buttons now open local mock forms. Confirming a form updates only the browser prototype state and fixture-derived mock data.

## State Persistence

The browser prototype stores changed mock case data in localStorage under a QCMS Operations release-specific key. The reset mock data button clears this browser state and restores `qcms-operations.fixtures.js`.

Tests use in-memory state only and reset fixtures between action checks.

## Architecture Guardrails

Release 1.4 does not:

- connect to Firebase;
- connect to Stripe;
- connect to production client data;
- modify Operations CRM;
- create APIs;
- implement Client Portal or Partner Portal features;
- deploy any production changes.

## Data Boundary

All case information is mock local data in `qcms-operations.fixtures.js`. It exists only to support UI, workflow and regression testing.

## Files

- `qcms-operations.config.js`
- `qcms-operations.fixtures.js`
- `qcms-operations.model.js`
- `qcms-operations.render.js`
- `qcms-operations.app.js`
- `qcms-operations.styles.css`
- `qcms-operations.test.js`
- `../../qcms-operations.html`

## Verification

Run:

```powershell
node public\platform-services\qcms-operations\qcms-operations.test.js
```

The regression test confirms the Release 1.4.1 version, Operations Centre dashboard, Case Register, Case Workspace modules, navigation polish, mock action behavior, reset behavior, fixture data shape and architectural guardrails.
