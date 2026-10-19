# Recovery 02 mandatory stop

The owner reported WATCHER_READY_FOR_VERIFICATION. Before independent acknowledgement the watcher had already exited FAIL_CLOSED. PID 49888 is absent; no .ack, armedAt or bootstrapUid exists. The initial readiness message is not a continuing certificate of readiness.

Exact recorded first failure: impersonation stage, REQUEST_TIMEOUT, 2026-10-19T13:53:33.541Z, elapsed 10269ms. The preceding operator CLI read passed in 6002ms. The failed action was the local gcloud config get-value auth/impersonate_service_account command, bounded at ten seconds. No impersonation or Firebase permission denial is inferred from this timeout. This stop is distinct from the earlier unclassified heartbeat failure.

Fresh independent read-only confirmation at 13:55:32.893Z: exact active CRM4 project 558324850479, operator martijnpronk76@gmail.com, no configured impersonation, zero Firebase users/no pagination, zero CRM4 memberships/no pagination. Therefore no existing bootstrap claim/account requires revocation. No cloud mutation, retry, new watcher or password step occurred.

The ten-second CLI deadline proved too short for an observed local configuration check. Before another attempt, review combining account/impersonation metadata into a single bounded asynchronous configuration read and choosing a measured subprocess deadline. Keep independent heartbeat and completed-validation freshness strictly under 30 seconds; never accept stale validation just because a longer subprocess is still alive. Verify live read-only timing before authorising a fresh session. This report does not implement or approve another attempt or change timeout values.

All receipts retained. Existing assessed image, rules, IAM and residual risks unchanged. No request to disable the otherwise unchanged private application is inferred from a pre-account local tooling timeout with independently empty inventories. Bootstrap execution remains NO-GO until corrected and reauthorised; production/real-customer use remains NO-GO.
