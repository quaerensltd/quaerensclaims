# Private service execution and containment — 18 October 2026

**STOPPED and contained. No verified private login URL.** The user authorised continuation from 52a5eca0 and accepted the existing IAP identity receipt. No identity generation was repeated.

Fresh checks verified the correct project/number, exact image, permissions, Auth/domain/key restrictions, bucket IAM, no users/services and the already-applied audit/rule state. The continuation guard was changed to validate the accepted identity receipt and current audit/rule baselines, and to prohibit repeating audit, rules or agent actions.

The exact sealed Cloud Run service was created successfully. Ready condition succeeded at 2026-10-18T11:18:04.417824Z; native iapEnabled was true, the runtime image matched sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb, and the planned hostname was returned. Only the approved IAP agent was granted service-level roles/run.invoker, verified by policy read-back.

The exact timed owner IAP policy was submitted. Google returned user:Brusseljeroen@gmail.com rather than user:brusseljeroen@gmail.com. The strict deep-equality check failed. Subsequent local comparison of the applied policy proves this capitalisation is the only difference: one member, one role, exact original time condition. There is no demonstrated access broadening. This was an overly strict execution-tool comparison, not evidence of a new application vulnerability. Native IAP browser enforcement, OAuth attachment, owner login and bootstrap revocation were not completed and are NOT marked PASS.

## Authorised containment completed

- Read current IAP policy/etag; removed only the approved owner binding, using Google's returned spelling. Verified empty bindings.
- Read current Cloud Run policy/etag; removed only the IAP agent invocation binding. Verified empty bindings.
- Reverified the project and exact service image; deleted only crm4-spain-test using its current etag. Verified service absence.
- Verified no Firebase users; no account/claim/token mutations were necessary.
- Final preflight confirms no regional Run services/users and unchanged bucket/Auth/domain/key controls. Project IAM equals the audit-verified policy; release pointers equal the applied expiry releases. No timeless rule restoration, audit deletion or retention changes.

Evidence is under evidence/private-execution-resumed-20261018/: run-create-operation, run-observed, invoker-verified, iap-access-applied, failure receipt, iap-comparison-diagnosis, containment-*-before/verified/delete, containment-complete and final-contained-preflight. The legacy projectPolicy/rules flags compare against pre-execution state and are expected false; the IAP-agent absence flag is not a valid global existence check, as established in the previous review.

## Prepared correction and next action

verify-owner-binding.cjs canonicalises only the approved Google user's email case; all other members, roles, conditions and binding counts remain exact. Six local checks pass: original spelling and returned spelling accepted; extra principal, different principal, changed condition and changed role rejected. This local correction has not been used to redeploy. It changes no sealed application source, image or manifest.

Do not replay receipts or run-create actions unchanged: use fresh preflight and a new receipt directory upon owner instruction to resume. Recreate only the same sealed service, reapply the same two scoped grants, complete private OAuth entry and the governed two-identity ceremony, then finish live denial/login/audit verification. No new permission scope is proposed. The owner was told to pause OAuth entry when containment began; no OAuth secret was received or retrieved by the agent.

Expiry remains 24 October 2026 09:00 UTC, containment deadline 10:00 UTC. HIGH CVE-2026-85091, Node reproducibility limitation and Firebase incident remain open. No rebuild, scan, real data/accounts, live providers or CRM2/3/5/production changes. Private browser readiness remains NO-GO; production remains NO-GO.
