# Bootstrap creation failure — read-only disposition

Owner reports create-bootstrap reached the private password prompt and exited with PRIVATE_ACTION_FAILED. No password or fragment requested or retrieved.

At 2026-10-19T12:52:33.778Z, independent quota-attributed reads verify the exact project and number, zero Firebase users and zero CRM4 memberships. Thus no current synthetic identity, custom claim or membership needs revocation. The watcher receipt is TIMEOUT_NO_PASS, has no observed bootstrap UID, and its PID is no longer alive. It started at 12:40:57.535Z and its ten-minute deadline was 12:50:57.534Z; final heartbeat was 12:51:01.574Z. The receipt remains in place, unmodified.

The filtered Auth audit query for the attempt interval returned no events and no next page. Absence of audit records does not independently prove no historical mutation (coverage/ingestion limits). The unchanged helper does not delete users, so the empty inventory and lack of an observed UID support a stop before successful creation. Do not describe a generic failure or timeout as successful provisioning or successful revocation.

Exact creation failure cause: NOT DETERMINABLE from retained evidence. credentials.cjs suppresses exception details into one message and does not record the failed stage. After masked input the possible gates include fresh watcher readiness (state, PID, heartbeat age, deadline), project/operator reads, identity lookup, password minimum length and Auth create. Expiry/stale readiness is plausible, not confirmed. The watcher timeout is established, but its occurrence does not by itself establish that it caused Terminal B's earlier failure. Owner has been asked only for approximate failure time and whether input was completed/interrupted; no password details.

No cloud writes, new provisioning attempts, watcher restart, receipt removal or containment mutation performed during this review. Current identity inventory requires no revocation action.

Minimum recovery for separate approval:
1. Add narrow local diagnostic receipts for stage, UTC time, non-sensitive error category and watcher freshness. Never record password, tokens, fingerprints, raw errors/API payloads or exact password contents. Preserve all guards; do not lengthen/bypass the heartbeat simply to make it pass.
2. Validate the relevant failure paths locally, reseal any changed tools and record the actual failure timing if supplied by the owner.
3. Preserve/archive the terminal watcher receipt rather than deleting evidence. Only after confirming its PID is dead and inventories remain empty, explicitly authorise one new watcher session and fresh heartbeat verification. No automatic retries or marker bypass.
4. Following approval, arm the watcher first, verify live readiness and a usable remaining interval, then provide one creation command. Password stays private. If a gate fails, stop again with the safe stage receipt.
5. Retain the original governed handler, two identities, immediate revocation rules, 24 October 09:00 UTC expiry and 10:00 UTC containment deadline. No new IAM, credentials, API enablement or application change is needed for this recovery investigation.

Status: SAFE CURRENT INVENTORY / BOOTSTRAP NOT COMPLETE. Production and real-customer use remain NO-GO.
