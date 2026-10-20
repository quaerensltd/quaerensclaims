# CRM4 private dashboard acceptance — 20 October 2026

Browser access: PASS, owner-confirmed in ordinary Edge at /manager-dashboard.html. Owner reports Manager Panel, Leads Overview, Risk Dashboard, Processing, Agenda and Client Search navigation visible. This is owner evidence, not an independent automated UI inspection.

Independent read-only checks: PASS for enabled synthetic owner, no custom claims, active CRM4-only Administrator membership, matching UID and attributable COMPLETE initial-owner audit. Exactly one Firebase user and membership verified. Cloud Data Access audit sample readable (30 entries); this proves visibility, not complete correlation of every login/page action. Full project IAM/audit, private service/image/startup, service IAM/IAP, public OAuth ID, Auth restrictions and Firestore/Storage expiry-rule hashes match preserved evidence.

Read-only diagnostic corrections: a page size of one returned an inventory continuation token; a larger bounded page independently confirmed the single owner. An initial audit field projection returned HTTP 400; the supported timestamp/logName-only projection passed. Neither observation caused cloud changes. The sealed bootstrap tools remain unchanged.

Dashboard functionality: login/render/navigation PASS by owner report. Source review shows workspace access gating and separate platformAdmin-only user-management controls. The owner has no platformAdmin. Total staff filters staff-role records; the Administrator is not necessarily included. Zero staff is consistent with no staff provisioning. Zero online and visible navigation do not establish successful loading of every dataset or functioning attendance; counters and each destination remain functional acceptance items. No customer/fixture records were created to test them.

Remaining mandatory operational gates:

1. Resolve or formally approve for real-customer use the HIGH vulnerability/custom-backport and Node reproducibility dispositions; synthetic exception is not production approval. Obtain supported Firebase incident remediation guidance and production-suitable disposition of retained configuration exposure.
2. Approve and verify permanent production configuration replacing bounded synthetic-only access, including authorised staff IAP access, production identity recovery/offboarding and appropriate environment/providers. Preserve project isolation; expiry remains 24 October 09:00 UTC and containment 10:00 UTC until separately changed.
3. Provide the two real staff emails and approve governed individual Lister+Closer provisioning. Authorise a legitimate administration path for staff creation without extending the one-time owner exception or granting the owner platformAdmin implicitly.
4. Demonstrate assignment, calling approach, Spray Foam assessment, closing, payment/provider behaviour, documents and Processing handover with synthetic records; then complete staff-specific access/ownership/audit acceptance. Preserve prior local dual-role and live Storage evidence; repeat only for relevant changes or untested live workflows.
5. Confirm customer-data processing basis/notices, retention/deletion, processor arrangements, backup/recovery and incident responsibility; verify rollback/recovery for the operating service. Approve a previewed, duplicate-checked and reversible initial lead import separately.

Optional/deferred assurance: specialist forced-restart, canary, persistent-listener and resumable-upload expiry rehearsal is not a prerequisite to permanent operation as such; no claim those behaviours passed. No expansion requested here.

Decision: private owner dashboard access PASS within synthetic scope. Whole-system functional/production acceptance NOT complete. No defensible fixed production date until security and privacy dispositions are resolved; remaining ordinary workflow acceptance can be scheduled once authorised identities and configuration are agreed. No CRM1/2/3/5 or production resources changed.
