# One supervised CRM4 bootstrap operation — consolidated procedure

Status: PREPARATION ONLY / execution NO-GO. This replaces manual READY-message and ten-minute-window handoffs. It does not authorise another live watcher or creation attempt.

## Verified starting state

At 2026-10-19T18:12:52.282Z, the recovery-07 watcher PID 79756 was absent, the exact CRM4 project was verified, and Firebase users and CRM4 memberships were both empty. Consequently no bootstrap elevated claim exists and no account revocation is necessary. See initial-state.json. Previous receipts remain intact.

## One coordinated operation

1. Codex verifies the exact project, operator, image, IAM/IAP, audit, Firebase restrictions, empty inventories, expiry rules and all sealed tools. Verify the private browser connection BEFORE starting any ceremony timer or creating any identity. Stop if browser control or cloud reads are unreliable.
2. Codex launches the existing watcher as an independently running supervised process, captures only its non-sensitive status and retains process identity. The owner does not open or coordinate PowerShell terminals or relay status messages.
3. A separate verification process reads the current operator/project/inventories and independently verifies the watcher heartbeat, completed-validation freshness, exact session and tool hashes. Only then write the existing exclusive acknowledgement. Codex confirms the full ten-minute armed interval directly from the watcher receipt. No extension or automatic restart.
4. Codex opens the existing masked private credential helper for the single approved bootstrap creation attempt. The owner types the unique password only into that private input. No password in agent stdin, commands, environment, files, IPC receipts, chat, logs, screenshots or browser-control output. Codex does not inspect the input value.
5. Codex loads the reviewed local browser ceremony on the exact already-IAP-authenticated CRM4 origin. The owner enters the bootstrap password privately there. Genuine Firebase sign-in supplies the existing governed crm4AdminCreateUser handler with the temporary authenticated actor. No local bypass, direct membership write, new IAP identity or administrative owner claim. Codex observes only a sanitized completion/failure status and independent membership/audit reads, not tokens or passwords.
6. The independent watcher immediately removes the bootstrap claim, revokes refresh tokens and disables the account on completion/failure/timeout. Codex independently verifies the account state and audit and runs the retained-token/refresh denial check through the existing browser ceremony. Missing or inconclusive evidence cannot produce PASS. Credential/network failure may prevent verified revocation; use the already approved scoped containment and report unresolved state explicitly.
7. Only after verified bootstrap revocation, Codex opens private owner password entry and coordinates owner login, CRM4 membership/claim checks, unauthorized denial and audit visibility. Only then return the dashboard. The owner may enter passwords in more than one private field, but does not coordinate timing or transmit readiness/results between tools.

Owner involvement is one private-entry workflow: keep the IAP-authenticated browser available and enter unique synthetic passwords only in the private prompts Codex opens. Codex handles all starts, status checks, acknowledgements, timing, transitions and teardown. No READY-message relay, terminal commands, copied tokens, credential sharing or browser-console scripting by the owner.

## Existing validation and unresolved blockers

The existing 94 tooling regressions, 123 CRM4 emulator regressions and four watcher lifecycle scenarios are preserved. They validate constituent security controls, not an end-to-end automated browser/terminal coordinator. The process-identity correction has 35 passing regressions. None is represented as validation of a new orchestration implementation.

Two blockers prevent claiming a complete validated operation:

- The native browser-control tool failed to initialise twice during this preparation (trusted Node process exited unexpectedly). No browser page or credential was inspected or modified. Without that connection, Codex cannot validate loading/controlling the existing same-origin ceremony while excluding private fields from captured output. Do not substitute an unverified browser driver or require the owner to relay events.
- Recovery-07 observed an operator-configuration timeout after 42.138 seconds against the 30-second bound. The precise host/CLI scheduling cause remains unproven. Coordination eliminates manual handoff delay but does not fix this execution reliability or guarantee timely cleanup. Do not silently raise timeouts, cache authorization, or bypass the watcher.

Before requesting execution approval, validate the actual coordinator and browser/terminal adapters with fictional fixtures: independent readiness before creation, full interval availability, private-input isolation, same-origin genuine Firebase handler use, automatic success/failure/timeout cleanup, browser disconnection, worker death, slow/failed operator reads, missing audit, uncertain revocation, and no PASS on failed acceptance. No additional identities or rehearsal programme are required. No live start is authorised merely by this plan.

## Consolidated execution scope to approve only after validation

One supervised watcher and one creation attempt; only bootstrap@crm4.example.test and owner@crm4.example.test; governed owner creation; immediate bootstrap claim removal, refresh-token revocation and disabling; private owner password setup; read-only independent authorization/audit/denial acceptance; existing scoped failure containment. Exact assessed image and existing IAM/IAP, rules and providers unchanged. No public access, extra identities, cloud configuration, permissions, rebuild or scan. Synthetic-only expiry 24 October 2026 09:00 UTC, containment deadline 10:00 UTC. Open HIGH finding, Node reproducibility and Firebase incident remain. Production NO-GO.

No execution approval is requested now: the complete coordinated path has not yet passed validation. No accounts, claims, cloud settings or live watcher were created during this preparation. Do not run the old commands.
