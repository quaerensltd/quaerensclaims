# CRM / CRM2 shared-application feature map

Status vocabulary: **Identical and enabled**, **Identical but workspace-scoped**, **Deliberately disabled**, **Not applicable**, **Blocked**.

This is the production-gate register. A `Blocked` row prevents commit and deployment.

| CRM1 route / feature | Roles | CRM1 data / writes | CRM2 expected behaviour | Status | Test status |
|---|---|---|---|---|---|
| `/login.html` authentication and role routing | All | `users`, attendance | Resolve trusted membership and enter the same role dashboard | Identical but workspace-scoped | Static pending |
| `/staff-dashboard.html` dashboard, counts, quick actions | Lister | `leadAssignments`, `staffAttendance` | CRM2 lead counts; same navigation | Identical but workspace-scoped | Browser pending |
| `/lister-leads.html` queue, detail, outcomes, notes, Manager submission | Lister | `leadAssignments`, `closedLeadsArchive` | `crm2Leads`; closure retained as rejected | Identical but workspace-scoped | Browser/security pending |
| `/lister-leads.html` manual lead creation | Lister, Manager, Administrator | New shared-CRM form | Create `manual_crm2` record with immutable workspace/audit metadata | Identical but workspace-scoped | Browser/security pending |
| `/lister-callbacks.html` callbacks and follow-up | Lister | `leadAssignments`, attendance | CRM2 callbacks from `crm2Leads`; no CRM1 attendance writes | Identical but workspace-scoped | Browser/security pending |
| `/lister-intro-emails.html` intro-email queue and manual-send workflow | Lister | `leadAssignments`, clipboard/manual send | CRM2 record association and status history without CRM1 recipients | Identical but workspace-scoped | Static passed; browser pending |
| `/manager-dashboard.html` dashboard, review/booking/report counts | Manager, Administrator | CRM lead/submission/assignment collections | CRM2 metrics from `crm2Leads` only | Identical but workspace-scoped | Browser pending |
| `/manager-dashboard.html#crm2UserAdministration` user and membership administration | Trusted CRM2 Administrator only | Protected Authentication and `crm2Memberships` | Token-claim-gated shared panel calling `crm2AdminCreateUser` and `crm2AdminUpdateMembership`; no direct writes | Administrator-only shared capability | Browser, static and security passed |
| `/manager-panel.html` review, assignment and progression | Manager, Administrator | `claimSubmissions`, `leadAssignments`, users | CRM2 review and assignment in `crm2Leads`; memberships supply staff | Identical but workspace-scoped | Browser/security pending |
| `/manager-leads-overview.html` leads overview and assessment actions | Manager, Administrator | leads, submissions, assignments, assessments | CRM2-only overview using `crm2Leads`/`crm2Assessments` | Identical but workspace-scoped | Static passed; browser pending |
| `/manager-lead-upload.html` CSV preview, validation and batch import | Manager, Administrator | `leadAssignments`, users | Existing upload UI writes `lead_upload_crm2`, batch/audit metadata, CRM2 listers | Identical but workspace-scoped | Browser/security pending |
| `/manager-risk-dashboard.html` processing risk/task metrics | Manager, Administrator | `processingCases`, `processingCaseTasks` | Processing integration unavailable | Deliberately disabled | Direct-route gate pending |
| `/manager-intro-emails-overview.html` intro-email reporting | Manager, Administrator | `leadAssignments` | CRM2-only email activity/reporting | Identical but workspace-scoped | Static passed; browser pending |
| `/manager-weekly-attendance.html` weekly attendance | Manager, Administrator | `staffAttendance`, users | CRM2 memberships and `crm2Attendance` only | Identical but workspace-scoped | Security passed; browser pending |
| `/closer-dashboard.html` assigned files and counts | Closer | `closerAssignments`, processing | CRM2 approved/assigned leads only; processing unavailable | Identical but workspace-scoped | Browser pending |
| `/closer-panel.html` appointment, onboarding, client-file actions | Closer | closer/lead/processing records | CRM2 statuses in `crm2Leads`; processing blocked | Identical but workspace-scoped | Browser/security pending |
| `/closer-detail.html` legacy closer detail | Closer | closer/lead/processing records | Canonical redirect to the existing workspace-aware Closer Panel | Identical but workspace-scoped | Static passed; browser pending |
| `/client-file.html` client details, chronology, notes, agenda, agreements | All CRM roles | timeline, agenda, email, agreement, processing collections | Lead from `crm2Leads`; activity from `crm2Activities`; processing absent | Identical but workspace-scoped | Browser/security pending |
| `/client-search.html` client search/direct record access | All CRM roles | leads, closer, processing, submissions | Search only `crm2Leads`; no CRM1/internet/processing results | Identical but workspace-scoped | Browser/security pending |
| `/agenda.html` create/update/complete follow-ups | All CRM roles | `agendaItems` | Typed `crm2Activities` agenda records | Identical but workspace-scoped | Browser/security pending |
| `/dialer.html` lead queue, call outcome and callback creation | Lister, Manager, Closer | leads and agenda | Keep visible but prevent CRM1 queue/outcome access until transport and writes are isolated | Deliberately disabled | Static/direct-route pending |
| `/agreement-generator.html` generate, download, send and log | Manager, Closer, Administrator | agreements, timeline, email function | Existing interface with CRM2 activity records and workspace-labelled send | Identical but workspace-scoped | Email/security/browser pending |
| Solar and Spray Foam assessment builder | All authorised CRM2 roles | `crm2Assessments` | Accessible from shared client workflow; multiple assessments retained | Identical but workspace-scoped | Integration pending |
| Processing routes and send-to-processing actions | Processing/Manager/Closer | processing collections | Visible as disabled, Integration Pending; no writes | Deliberately disabled | Static/browser pending |
| Automatic website/internet lead intake | CRM only | internet callbacks/leads | Never available in CRM2 | Not applicable | Security/query audit pending |

## Standalone CRM2 routes awaiting retirement

`crm2-admin.html` now redirects to the trusted Administrator-only section in the shared Manager dashboard. The remaining compatibility routes (`crm2-lister.html`, `crm2-manager.html`, `crm2-closer.html`, `crm2-cases.html`, `crm2-case.html`, and `crm2-lead-new.html`) remain pending final route retirement after the release gate. `crm2-login.html`, the entry redirect, workspace/auth configuration, and the assessment builder are retained.
