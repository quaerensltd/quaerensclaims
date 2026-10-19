# Final startup preflight — PASS

Full read-only security checks passed using corrected bounded I/O: exact active CRM4 project/number, approved operator/no impersonation, unchanged project IAM/audit, service invocation/IAP/OAuth public ID, assessed image/startup, Auth restrictions, exact expiry rules/source hashes, zero users and zero CRM4 memberships. All previous watcher processes were absent; receipts/evidence retained.

Complete production-shaped read-only cycles using the actual corrected CLI, token, project, Auth lookup/inventory and membership adapters: startup 6584ms; waiting validation 3916ms; independent reader with separate token acquisition 8090ms. All successful operations completed within unchanged 10-second CLI and 15-second HTTP bounds; detailed UTC timings are in security.json and startup-sequence.json.

Heartbeat, completed-validation freshness, exclusive acknowledgement and exact 600000ms armed interval were tested only on a disposable local fixture. Heartbeat advanced; both freshness gates passed; a 30-second-stale receipt was rejected. No real watcher, live receipt or live acknowledgement was created. Actual live readiness must still be independently verified after owner starts the watcher. No simulation is claimed as live readiness PASS.

14 I/O regressions passed, including actual stalled-child timeout, network failure, overlapping read rejection, operator/impersonation mismatches and malformed output. 18 watcher regressions passed after adding only the fresh recovery-03 receipt name. Existing completed emulator evidence from 160fa361 is preserved and not unnecessarily repeated. No governed handler, application image, IAM/rule behavior or revocation change.

Prepared one supervised session and one creation attempt under the owner's conditional final-preflight instruction. Receipt crm4-bootstrap-watch-recovery-03.json. Manifest credential-approved.json SHA-256:
80425c4f340f33286161b5c2c7537958a5016cc9af9b88f904d73d503ab891fd

Next command, owner private PowerShell only:

node crm4-staging/release/managed-rehearsal/credentials.cjs watch-bootstrap crm4-staging/release/evidence/final-startup-preflight/credential-approved.json 80425c4f340f33286161b5c2c7537958a5016cc9af9b88f904d73d503ab891fd

Keep second terminal and IAP-authenticated browser ready. Report WATCHER_READY_FOR_VERIFICATION, with no password entry yet. Codex then independently verifies exact session/hash/live PID, fresh heartbeat AND completed validation, current project/empty inventories, and exclusively acknowledges. Full ten-minute window starts after that check; confirm ARMED before the one private creation command. Stop on failure; no automatic retry. Existing bootstrap revocation/token invalidation/disabling and governed owner/audit/unauthorised-denial requirements remain mandatory.

No cloud mutation, live watcher start, real credentials or account creation during this preflight. Fixed expiry 24 October 2026 09:00 UTC, containment 10:00 UTC, open HIGH finding, Node reproducibility and Firebase incident restrictions unchanged. Production/real-customer use NO-GO.
