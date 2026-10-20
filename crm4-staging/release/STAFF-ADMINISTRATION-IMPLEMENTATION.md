# CRM4 staff administration — local implementation

Shared CRM Framework. Scope: CRM4 clone and local adapters only. No shared CRM2/3 source, production data, cloud resources, existing deployed image or security rules changed.

## Completed

- Existing corporate administration component offers Lister, Closer and Lister & Closer. Combined selection uses primary lister plus roles [lister, closer], not a new privilege type. Existing same-session Lister and Closer navigation is reused.
- Active CRM4 Managers can create, change, block/reactivate and issue setup invitations for operational staff. Active CRM4 Administrators can additionally manage Manager, Processing and Administrator memberships. Membership is re-read server-side; platformAdmin alone confers no access to these staff endpoints.
- Self-management, malformed authority, mixed-workspace targets, unauthorised elevation and administrative-claim-bearing target management/reset are denied. Existing synthetic-email restrictions remain.
- Membership updates re-check actor/target in a Firestore transaction. The last active Administrator is protected against concurrent cross-demotions; incomplete creations and pending access changes do not count as replacement Administrators.
- Per-user pending audit markers prevent conflicting Auth changes. Disabled access is recorded in membership, Firebase Auth state is synchronized and refresh tokens revoked; read-back precedes COMPLETE. A failed synchronization remains visible and cannot report success. The same still-authorised actor may reconcile the exact requested state using the existing Save action; changed requests are rejected until resolved.
- Creation retains the existing handler/recovery workflow and corporate setup-email rendering. A predetermined UID prevents adoption of unrelated Auth accounts. Auth begins disabled; creation is marked pending until access synchronization. Actor-bound operation records preserve idempotent retries and attributable creation audit. Combined roles survive creation and are removed on single-role changes.
- Firebase generates password setup/reset links using the existing workflow. Links/passwords are not returned to clients or stored in audit/capture receipts. Providers remain capture-only. UI messages explicitly state that no email was delivered.
- The existing source-selection integrity checks remain. The CRM4 browser adapter reproduces the changed generated files; source manifest verification covers 598 files and includes the authority module.

## Validation

19 targeted tests passed across local runs: 6 staff lifecycle/capability tests (including the multi-scenario real Auth/Firestore emulator journey), 6 existing administration recovery/failure tests, 3 browser contract tests and 4 authority unit tests. Coverage includes the three staff choices, role removal/change, blocking/reactivation, inactive actors, privileged and cross-CRM denial, custom-claim reset protection, same-session workspace links, concurrent Administrator changes, interrupted creation, exact replay, lost capture acknowledgement and explicit Auth failure reconciliation.

The initial runs exposed test-fixture/expected-code and browser adapter encoding issues; these were corrected and the affected tests rerun. No security predicate was weakened. Existing role/ownership and record-scope regressions passed. Generated browser code parses and regenerates exactly; no live visual or real-email acceptance is claimed. Historical temporary-platformAdmin bootstrap ceremony tests are not acceptance criteria for this approved membership-authority change. This is targeted regression coverage, not a claim that every historical release test was rerun.

## Remaining limitations and deployment gates

1. Not deployed. The current owner dashboard continues to use the previous assessed image. A new sealed candidate, reviewed dependency/source evidence and separately authorised build/deployment are required. No rebuild or rescan was performed here.
2. Synthetic-only restriction remains. Real staff addresses and provisioning, permanent operational configuration, live email delivery and real customer processing require separate approval. Provider delivery and Firebase action-link destination/template must be verified in that approved environment; capture acceptance is not delivery proof.
3. Auth and Firestore are separate services. Pending states and exact reconciliation make partial failures visible, not atomic. Persistent credential/network failure can block reconciliation; loss of the original actor's authority requires an explicitly reviewed operator recovery, not a silent bypass. Underlying SDK transport may retry; operation/UID checks prevent unrelated-account adoption.
4. First private acceptance of the changed UI should verify Manager and Administrator screens, all three staff logins/workspaces and the setup/reset completion flow using fictional users, once separately authorised. Existing unchanged Storage evidence is preserved.
5. Open HIGH vulnerability, Node reproducibility limitation and Firebase incident disposition remain. Existing expiry (24 October 2026 09:00 UTC) and containment deadline (10:00 UTC) are unchanged. Production remains NO-GO.

No further authentication framework, custom watcher, browser credential snippet or new identity provider was introduced.
