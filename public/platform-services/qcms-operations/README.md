# QCMS Operations™

Version: 1.3.0-alpha.1  
Release name: Operations Centre  
Status: Local prototype, isolated from production systems

## Purpose

QCMS Operations™ is the operational workspace for instructed QCMS complaint cases. It is designed for Complaint Managers who need to open new instructions, move active complaints forward, identify blocked files, prepare complaint material, monitor responses and complete cases.

This module is intentionally separate from Operations CRM™. Operations CRM™ remains the existing business workflow platform for lead and internal operational activity. QCMS Operations™ focuses only on instructed complaint-management work.

## Why The Dashboard Became An Operations Centre

Release 1.3 changes the top-level experience from a generic statistics view into a working operational cockpit. The first screen now answers:

- What needs doing today?
- Which cases can be completed?
- Which cases can be moved forward?
- Which cases are waiting on somebody else?
- Which case should the Complaint Manager open first?

General statistics are still present, but they are deliberately lower on the page. The primary purpose is daily execution, not passive reporting.

## Operations Centre Sections

The Operations Centre is organised in the order a Complaint Manager is likely to work:

1. Today's Mission
2. New Complaint Instructions
3. Immediate Action Required
4. Waiting On Others
5. Ready To Complete Today
6. Overdue
7. Operational Summary
8. Operational Feed

## Today’s Mission

The mission area shows:

- complaints that can be completed today;
- complaints that can be moved forward;
- estimated workload;
- immediate actions;
- waiting-on-client count;
- ready-for-submission count;
- new instructions.

The START WORKING button opens the highest-priority actionable mock case.

## New Complaint Instructions

New instructions are presented like an inbox. Each item shows:

- complaint type;
- client;
- priority;
- current stage;
- assigned or unassigned state;
- an Open Case action.

The mock data includes real complaint areas such as Flight Delay, Lost Luggage, Energy Switch, Spray Foam, Solar, Car Finance, Section 75, Cruise, Broadband and Caravan.

## Immediate Action Required

This replaces the older priority-action language. The table explains:

- client;
- complaint type;
- why action is required;
- due date;
- recommended next action;
- Open Case.

## Waiting On Others

Cases are grouped by operational waiting reason:

- Waiting on Client
- Waiting on Business
- Waiting on Partner
- Waiting on Authority
- Waiting on Finance
- Waiting on Documents

This makes blocked work visible without mixing it into the active action queue.

## Ready To Complete Today

This section identifies cases where a practical closing or submission action is available today. Each row shows the remaining action, estimated effort and case link.

## Overdue

Overdue work is separated from normal priority work so it cannot disappear inside the broader register. If no case is overdue, the UI displays a positive empty state.

## Operational Feed

The Operational Feed shows the latest five activity events and a View Full Activity link for the future full activity view.

## Case Register

The Case Register now includes:

- Case Age;
- Waiting Status;
- Operational Readiness;
- Current Status;
- Priority;
- Complaint Manager;
- Next Action;
- Due Date;
- Last Activity.

Case Age is calculated from the instruction date against the current local prototype date.

## Case Workspace

The case workspace retains the foundation tabs and adds 1.3 operational context:

- Waiting status;
- Case age;
- Operational Readiness;
- Recommended next action;
- key case details;
- timeline;
- documents;
- messages;
- internal notes.

## Readiness Language

Release 1.3 replaces the older evidence labels with operational readiness language:

- Excellent
- Good
- Needs Evidence
- Blocked

This is more useful for day-to-day complaint work because it describes what a Complaint Manager can do with the file.

## Data Boundary

This release uses mock local data only. It does not connect to:

- production client records;
- payment systems;
- signature systems;
- external complaint portals;
- existing CRM data.

No deployment is required for this release.

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

The regression test confirms the Operations Centre sections, new readiness language, waiting status, case age, highest-priority action routing and architectural guardrails.
