# Supervised recovery 02 — activation preparation

Approved by owner following acfc1ac8 for one supervised watcher session and one bootstrap creation attempt, only bootstrap@crm4.example.test and owner@crm4.example.test. Fresh read-only preflight PASS: exact project/operator, project IAM/audit, service IAM/IAP and public OAuth, assessed image/startup, Auth restrictions, empty user/membership inventories, expiry rules/source hashes, previous failed receipt preserved and previous process exited. Corrected bounded live Auth read adapter PASS in 2604ms: bootstrap absent, zero users. No live watcher, account, claim or cloud mutation during preparation.

Approved local manifest: credential-approved.json
SHA-256: 544417a0f966ea25dfa42c72ed649e2e945bf3883e2feb4f1fcef5b174243866
New receipt: crm4-bootstrap-watch-recovery-02.json. Do not reuse/delete older receipts or repeat a failed start.

Step 1 only: owner starts watch-bootstrap with this exact manifest/hash in either private PowerShell terminal and reports WATCHER_READY_FOR_VERIFICATION. No password entry yet. Codex must independently verify current PID/session/seal, heartbeat age and separate validationCompletedAt age both strictly under 30 seconds, correct project and empty inventories. Record precise named failure/UTC/elapsed evidence. Only then exclusively acknowledge the local session. Verify ARMED, independentlyVerifiedAt <= armedAt, deadline - armedAt = 600000 and expiry cap before giving the single creation command. No acknowledgement has yet been written.

The full ten minutes begin after independent verification; time spent on later communication/checks consumes that interval. Keep the second terminal and authenticated CRM4 browser ready before starting. No deadline extension or weakened freshness checks. Failures require STOP and scoped containment; no automatic retry.

Subsequent approved steps remain governed owner creation through existing handler, immediate bootstrap claim removal/token revocation/disabling, independent revocation/owner membership/audit/unauthorised-denial verification. No real identities/data. Fixed expiry 24 October 2026 09:00 UTC; containment 10:00 UTC. Open HIGH vulnerability, Node reproducibility limitation and Firebase incident remain accepted only for synthetic scope. Production NO-GO.
