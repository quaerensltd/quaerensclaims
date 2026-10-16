# Conditional acceptance and timestamped bundle result

16 October 2026; baseline 95573686. Shared CRM Framework. **Conditional incident risk acceptance recorded. NO-GO for execution because the governed end-to-end fixture does not fit the approved identity scope.** No cloud changes, accounts, claims, grants, rules publication, build, scan or deployment occurred. No exposed configuration was retrieved. Read-only Auth requests used a field mask and output allowlist; user inventory requested only localId/pagination metadata.

## Accepted risk and proposed timing

The owner conditionally accepted retained-provider-output and future synthetic-password-hash uncertainty for bootstrap@crm4.example.test, owner@crm4.example.test and portal-client@crm4.example.test only. Conditions include strong unique non-reused passwords, no real staff/customer accounts/data, no cross-project access, preserved authentication/IAP/Firebase/expiry controls, immediate bootstrap-authority revocation, and disabling/revoking all synthetic identities at teardown. The HIGH vulnerability and Node reproducibility limitations remain open. This acceptance grants no execution authority. Continue seeking supported Firebase guidance; the sanitized support draft remains unsent because no instruction to send it has been given.

The owner selected **15:00–15:30 UTC on 16 October 2026** (17:00–17:30 Madrid) as the replacement proposal. Named operator: martijnpronk76@gmail.com; supervisor/sole IAP tester: brusseljeroen@gmail.com. Actual attendance and execution approval remain separate. Proposed policy window: 2026-10-09T15:30:00.000Z to 2026-10-16T15:30:00.000Z, exactly 168 hours. Proposed containment deadline: 2026-10-16T16:30:00.000Z. Nothing is activated. If the proposed start cannot be met, obtain a new proposal and regenerate; do not shorten the rehearsal or extend access silently.

## Verified evidence

The filtered preseal read verified exact project 558324850479, immutable image, project/bucket IAM, original rules releases, Auth restrictions, authorised domain, browser-key restrictions, operator permissions including run.services.update/serviceusage.services.use, runtime actAs and bucket LIST/DELETE. No users or Run services exist; IAP agent remains absent as expected. No permission expansion is needed for the reviewed infrastructure proposal. The preflight receipt records its observation time; all policies still require fresh read/etag verification before any future mutation.

33 local tests passed. The two new tests exercise the real hash-verified referral factory and Shared CRM role resolver: an Administrator is denied referral creation before any lead write, and Administrator cannot be combined with Lister/Closer roles. No application or framework source changed.

## Proven fixture blockers

1. Governed `crm4ListerCreateReferralLead` requires Lister capability. The approved owner has Administrator membership; bootstrap may have no CRM membership and portal client may have no membership. None of the three approved identities can perform the workflow's lead-creation step. The dual-role adapter preserves this rule. Source: backend-sources/crm4ListerCreateReferralLead/crm4ManualReferral.js, tools/staff-factory-extension.cjs and tools/staff-capabilities.cjs. Existing owner platformAdmin prohibition and self-membership safeguards cannot be bypassed to fix this.
2. That handler uses Firestore-generated lead IDs. Existing rehearsal tools assume a `rehearsal-...` lead and `crm4-rehearsal-...` case. A governed auto-ID will not satisfy those guards. Future preparation must replace the prefix assumption with exact verified creation-receipt binding, including UID/case ownership, canary preconditions and cleanup allowlists; it must not broadly relax matching or seed fixed IDs in Firestore.
3. Assessment author/issuer and later workflow capabilities must be demonstrated through the existing governed journey under a specifically approved synthetic actor scope. The earlier six-check emulator fixture deliberately seeded upstream completed state locally; it never proved that the approved three identities could create that state in cloud. The preparation review should have caught this earlier. Those six checks remain valid component evidence, not end-to-end fixture authority.

The minimum safe next decision is whether to authorise **preparation of additional owner-operated fictional workflow actors/capabilities**, without additional human IAP testers, so the existing Lister/Closer and assessment separation requirements can be satisfied. Determine the minimum identities and exact governed membership/assessment grants before requesting execution approval. Do not assume one extra actor is sufficient, give bootstrap a membership, or give the owner permanent platformAdmin. An alternative administrator bypass or direct cloud seeding is not recommended. No such scope extension has been implemented or approved.

## Sealed review artifacts, not a final executable bundle

Directory: `../evidence/conditional-rehearsal-20261016-1500/`.

- Canonical manifest SHA-256: `e92cbabb7a5e3b8879b0451fcce42c246412686d3312f990c91d484641886a40`.
- Bundle-seal SHA-256: `be1428d7347c08369a6b04c26a8b708e34979e6bea1153177bef042056d99d12`.
- Eleven artifact hashes independently reread and verified. Kind: BLOCKED_REVIEW_SEAL. Execution, containment, canary and restart approval flags are false. Fixture IDs remain unresolved rather than fabricated.

The bundle includes proposed private Cloud Run/startup configuration, exact image, existing OAuth client reference/private secret entry requirement, service-specific IAP/invoker grants, audit-policy merge preserving unrelated IAM, original Firestore/Storage predicates conjoined with expiry, governed Firebase identities, one post-expiry canary, maximum 120-second service-level restart stimulus and containment scope. It binds the fresh preflight receipt and preparation-tool hashes. Hash integrity is not readiness or authorisation.

## Proposed execution sequence after blockers are resolved and a new seal approved

1. Reverify project/operator, image/source hashes, policy etags, empty/conflict-free identities/resources, permissions and supervised time. Stop on drift or insufficient live time.
2. Apply only approved audit additions; preserve sinks/retention. Establish only the IAP agent, exact private Run service, existing OAuth client through owner-private entry, service-scoped invoker and conditioned sole-tester IAP grant. Publish exact expiry rules without weakening predicates. Verify independent unauthorised denial before accounts.
3. Start bounded bootstrap watcher; create the temporary actor through genuine Firebase Auth, govern owner creation, then immediately clear bootstrap claim, revoke refresh tokens and disable. Verify. No further workflow actor exists until its own exact scope is approved.
4. Create the fictional case using the approved governed workflows and verified creation receipts; no direct seed. Verify portal client state, identity, active ownership and audit before upload baselines. All baseline probes must succeed before expiry.
5. At expiry collect independent native IAP decisions, retained-token/session results, listener terminal denial plus acknowledged one-field canary, resumable continuation denial and object absence, document-ticket evidence, expired startup and audit visibility. Use the optional service-level 0-to-1 stimulus only under explicit authority, restore 0 within 120 seconds, and verify. Missing evidence remains NO-GO.
6. Execute explicitly approved containment immediately on failure or completion: revoke/disable bootstrap/owner/client and any separately approved actors; withdraw only the exact conditioned IAP binding and service invoker; restore minimum instances; delete only the verified test service if authorised; generation/update-time safe fixture cleanup. Retain audit, retention history and expired rules. Never restore timeless access. Retained ID tokens require independent rule/window denial, not merely refresh-token revocation. Any failed containment or exceeded deadline is reported, never marked PASS.

The proposed containment authority ends at the named deadline, permits no broad IAM or cross-project operation, and is NOT granted by this report or risk acceptance. Deleting audit history, deleting accounts or restoring earlier timeless rules is outside it. Failed rollback requires a separately approved exact remedy rather than broadening authority.

**Recommendation:** retain this hashed review for inspection; do not approve it for execution. Resolve the actor and receipt-bound fixture design locally, then generate the actual final bundle for separate approval. The conditional incident acceptance is recorded and need not be requested again for the unchanged three-identity risk scope; additional identities require explicit extension. Production remains NO-GO.
