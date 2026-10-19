# Stopped watcher and heartbeat investigation

## Independently verified containment state

At 2026-10-19T13:33:14.560Z, exact active project quaerens-crm4-spain-test / 558324850479, authenticated operator martijnpronk76@gmail.com with no impersonation: PID 79316 exited; final local receipt FAIL_CLOSED, no armedAt/bootstrapUid, no acknowledgement file. Current Firebase user inventory empty with no next-page token; CRM4 memberships empty with no next-page token. Consequently there is no Firebase bootstrap account or elevated bootstrap custom claim, and no existing identity requires revocation. This establishes current absence; it is not a claim of a complete historical Auth audit. No cloud mutations, credentials read, watcher restart or account creation in this investigation.

Owner reports using Terminal B rather than Terminal A, then one Ctrl+C and normal prompt. Terminal labels are instructional, not a security property: tools bind project, manifest, PID/session and identities, not terminal letters. This is not the cause.

## Confirmed timing defect; historical assertion remains unknown

Retained sanitized diagnostics show successful membership-read completion gaps of 38.351, 34.302, 45.497 and 31.152 seconds. Watcher publishes heartbeat only after a complete serial cycle: operator CLI, impersonation CLI, project read, Auth lookup, user inventory, membership read. Token acquisition repeatedly invokes synchronous gcloud subprocesses. The freshness threshold is 30 seconds. Thus successful, progressing cloud reads can leave the last published heartbeat stale. This is an implementation timing mismatch, not evidence of missing IAM or failed project isolation.

A deterministic local reproduction with fictional receipts and the observed 38.351-second gap confirms that waiting acknowledgement rejects the stale receipt and armed readiness produces WATCHER_HEARTBEAT_STALE; a subsequently fresh receipt passes. This does not turn the actual failed attempt into PASS. Its verifier captured only the combined heartbeat stage, not the exact failed assertion or observed age. The original assertion therefore remains unproven.

The final diagnostic firstFailure is auth-lookup / GUARD_OR_REQUEST_FAILED at 13:29:15.945Z, during the owner-reported Ctrl+C shutdown, followed by completion FAIL. This occurred after the independent readiness stop. It must not be presented as its cause or as proof of a Firebase permission denial. Raw error bodies were deliberately not retained.

## Minimum correction before another attempt

1. Record each readiness assertion separately, with non-sensitive observed timestamps, age, session identity, PID and exact fixed failure category. Preserve evidence before acknowledgement; an evidence-write failure must not silently advance readiness.
2. Remove unnecessary repeated synchronous gcloud token launches through bounded, in-memory token reuse tied to the same verified operator; retain explicit operator/project/no-impersonation checks and no new credentials or IAM. Use bounded asynchronous reads where independent checks can run concurrently. Measure actual complete validation cycle duration.
3. Keep process liveness distinct from freshness of completed security validation. A timer-only heartbeat must not make stalled/failed cloud checks appear healthy. Do not merely increase the freshness limit. Reject stale validation, uncertain completion and late/mismatched acknowledgements.
4. Test slow successful reads, delayed/failed reads, stalled process, acknowledgement races, cancellation, deadline, genuine-token governed creation and immediate revocation in local/emulator tests. Demonstrate the readiness timing contract before sealing a fresh session.

No correction or replacement execution package was activated here. Do not restart/reuse the failed receipt, delete receipts or repeat creation. Another live session remains NO-GO pending verified correction and owner approval. The ten-minute ceremony never started. Fixed 24 October expiry, existing image and all residual security restrictions remain unchanged. Production/real-customer use remains NO-GO.
