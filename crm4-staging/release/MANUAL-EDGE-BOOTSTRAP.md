# CRM4 ordinary Edge handoff — prepared, not executed

## Decision and scope

Local preparation is ready for one consolidated execution approval. Live execution and dashboard acceptance have NOT passed. No watcher, account or cloud change was started during this preparation. The application image, Shared CRM Framework handlers, rules, IAM and existing security evidence are unchanged.

Use only project `quaerens-crm4-spain-test` (558324850479), the existing service and image `sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`. Operator: martijnpronk76@gmail.com; sole IAP tester: brusseljeroen@gmail.com. Only bootstrap@crm4.example.test and owner@crm4.example.test may be created. Expiry remains 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Stop if insufficient ceremony/cleanup time remains.

## Minimal change

The existing coordinated procedure now accepts a small non-sensitive downloaded receipt from ordinary Edge, instead of requiring Codex browser control. There is no browser integration, automation-controlled Google sign-in, localhost server, extension, cookie transfer or new authentication endpoint. Codex owns the watcher, independent readiness process, ten-minute deadline, fresh cloud checks and cleanup. The owner does not run PowerShell commands or relay watcher messages.

The inactive proposal is `evidence/manual-edge-handoff/proposal.json`, sealed by `proposal.sha256`. All execution/containment flags remain false. After approval, Codex must seal a fresh session with the same reviewed tool hashes and approved scope; previous sessions and commands must not be reused.

## Owner's single supervised action

Remain available in ordinary Microsoft Edge and the private credential window Codex opens. Authenticate through Google IAP normally. Codex supplies the current reviewed snippet file and its SHA-256 at each browser phase; do not execute historical snippets.

1. On the exact CRM4 origin, open Edge DevTools → Sources → Snippets. Copy only the supplied checksum-verified file into a snippet and run it. The READY check must succeed and its receipt must reach the coordinator BEFORE the watcher starts. This also verifies the download handoff works before any account exists.
2. For each phase, click the page's **Save [phase] verification receipt** button. Save the exact displayed filename in `C:\Users\CasaT\Downloads` (use Save As if Edge uses another directory). Codex detects it automatically. Do not rename, edit or send the file in chat.
3. Enter passwords only in the private masked terminal or the ceremony's password field, with DevTools closed. Never enter a password in Console, Sources, chat or command arguments. The bootstrap password is entered privately during creation and again in the governed browser ceremony. The owner password is set privately only after verified bootstrap revocation, then used in CRM4's normal login page.
4. The four reviewed phases are ready, governed owner creation, retained-token revocation verification, and owner login verification. Codex advances them automatically from their receipts and independent checks. No manual watcher coordination is needed. Stop on a blocked snippet, timeout or failed check; do not disable browser security or bypass a self-XSS warning.

Ordinary Edge interaction is intentionally manual. Do not claim that this local test exercised live Google IAP or the owner's actual browser. If manual steps cannot finish within the existing bounded waits, the operation fails closed and contains created identities; it does not silently extend the session.

## Script review and checksum controls

`coordinated-bootstrap/browser.cjs` generates phase snippets using the unchanged `managed-rehearsal/browser-ceremony.js`. Their exact hashes are in the proposal. Each runtime snippet contains fresh request nonce, deadline and, when known, synthetic UID; therefore its final checksum cannot honestly be precomputed before execution. Codex verifies the sealed generator and ceremony, generates the file, provides its SHA-256 and verifies the file remains byte-identical while waiting. No owner-authored or remotely fetched replacement JavaScript is permitted.

Every phase rejects any origin except `https://crm4-spain-test-558324850479.europe-west1.run.app` and any expired request before DOM access or network requests. READY checks the deployed SDK project. Creation uses genuine Firebase sign-in and the existing `crm4AdminCreateUser` handler, with exact bootstrap UID, platformAdmin, project and deadline checks. It creates only the governed CRM4 Administrator owner, without platformAdmin. Revocation uses the existing ceremony to verify retained-token and refresh rejection. Login verifies the expected owner UID and project claims, and rejects platformAdmin.

The SDK's normal authentication requests and the existing same-origin governed handler use tokens internally, as before. No cookies, passwords, bearer tokens, refresh tokens or fingerprints are exported to files or Codex. The downloadable JSON has only nonce, exact origin, state and the expected synthetic UID where applicable. Publication explicitly allow-lists those fields. The receiver rejects extra fields, stale/replayed/wrong-origin receipts, incorrect UIDs, oversized files and changed snippets. It reads only the exact expected UUID filename, not arbitrary Downloads contents.

Browser receipts are operator observations, not independent proof of cloud security. Separate project/inventory/membership/claim/revocation/audit checks remain mandatory. A fabricated receipt cannot substitute for those checks. No real customer data is allowed in the browser or receipts.

## Coordinated execution and failure containment

After one final approval, Codex verifies sealed files and fresh project/operator/IAM/IAP/image/rules/expiry state, prior-session closure, zero Firebase users and zero CRM4 memberships. READY and receipt transport precede watcher startup. A separate process independently checks heartbeat and security-validation freshness; the full ten-minute ceremony starts only after acknowledgement. Existing 30-second CLI limits, 15-second HTTP limits, freshness requirements, non-overlapping reads and revocation controls are unchanged.

Codex then coordinates private bootstrap creation, genuine governed owner provisioning, immediate bootstrap claim removal/token revocation/disabling, independent read-back and browser retained-token checks. It sets the owner password privately, verifies owner login, sole CRM4 membership, lack of elevation, audit visibility and unauthorised/anonymous denial before declaring dashboard readiness.

On failure, cancel the watcher and perform the existing authorised revocation/disable procedure. Independently verify bootstrap disabled, claim removed and tokens revoked. If an owner was created and acceptance fails, disable and revoke only that receipt-bound owner. Preserve accounts disabled for audit and preserve all failure receipts. Unknown/pre-existing identities are never modified as a shortcut. Persistent credential/network failure can prevent verified cleanup; report uncertainty as FAIL and stop, never PASS. No automatic retry.

## One consolidated approval request

Approve ONE freshly sealed coordinated manual-Edge session and ONE bootstrap creation attempt for the two named synthetic identities, plus immediate bootstrap claim removal, refresh-token revocation and disabling; if mandatory acceptance fails, approve disabling/revoking only the ceremony-created owner. Codex coordinates all readiness, timing and verification. Owner participation is limited to ordinary Edge interaction and private passwords. No IAM expansion, rule changes, additional identity, rebuild or rescan is included.

The open HIGH CVE-2026-85091, Node binary reproducibility limitation and Firebase incident/provider-retention uncertainty remain accepted only for the previously bounded synthetic scope. Managed expiry edge-case rehearsals remain deferred, not passed. Production and real-customer use remain NO-GO.

## Local timing correction discovered during acceptance

The final emulator run correctly failed before its intended governed-denial injection. Review identified a pre-existing arming race: two successive clock reads were used to require an exact 600000 ms interval; a one-millisecond tick could falsely fail that check. An advancing-clock regression failed on the old implementation. Arming now captures one timestamp for the deadline calculation and armedAt. The interval remains exactly 600000 ms, capped by the global deadline; no timeout, freshness or revocation predicate was relaxed. Original failed-run evidence remains locally preserved and its hash is recorded.

## Acceptance evidence

65/65 local tests passed; two fully intercepted browser scenarios passed, including actual receipt downloads; all six final emulator scenarios passed: success, governed-handler failure, read failure, readiness failure, post-owner acceptance failure, and coordinator disconnection. Genuine emulator Auth, the governed handler, separate watcher/verifier processes, membership audit, retained-token rejection and cleanup were exercised with the manual receipt exchange. Browser and emulator layers were tested separately. No live Google authentication or ordinary Edge session is claimed. See evidence/manual-edge-handoff/validation.json for hashes and preserved failed-run disposition.
