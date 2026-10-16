# Owner access attestation and synthetic-account risk decision

16 October 2026. Baseline e48216a1. Shared CRM Framework. This is a sanitized update to AUTH-CONFIG-INCIDENT-DISPOSITION.md; it does not retrieve the affected output or replace the preserved incident history.

## Owner declarations recorded

The owner states:

- The owner was the only person using the computer and Codex session involved in the incident.
- No other computer was used.
- The owner has not shared the affected session, exported its conversation or sent screenshots of its tool output to anyone else.

Evidence class: direct owner attestation in this task, not independent audit or forensic verification. These declarations reduce the identified likelihood of onward disclosure through owner activity. They do not certify absence of provider processing, provider administrators, retained copies, automatic backups or compromise. No such additional access is alleged or established by the evidence.

## Updated disposition

**GO for authorised sanitized, non-executing preparation. NO-GO for synthetic account creation or execution until separate approvals.** The owner-mediated sharing/device-use questions above are answered. The remaining material uncertainty is provider-side access and retention; local overwrite also remains distinct from forensic erasure. The configuration must not be described as restored to secrecy or the incident as eradicated.

The preserved zero-user inventory is dated 2026-10-16T10:54:57.269Z; it has not been refreshed in this documentation-only update. No current user password hashes were identified in that observation. Future synthetic users could use the exposed project hashing configuration. A party that later obtained both that configuration and user password hashes/salts could test password guesses offline. No direct token-forging, IAM, IAP or platformAdmin authority follows from this material alone, as explained in the formal assessment.

Recommendation: the owner declarations support a defensible, explicitly accepted synthetic-only residual risk; they do not eliminate it. The minimum route is owner acceptance of the retained-output/future-hash uncertainty, strong unique non-reused synthetic passwords, no hash exports, the existing time-bounded controls and separately approved revocation/containment. Alternatively, await Google's recommendation before deciding. Do not treat an unanswered support request as Google's approval. Any later adverse support advice or evidence of unauthorized access reopens the gate before further account or deployment action.

## Exact proposed residual-risk acceptance — NOT YET ACCEPTED

> Acting for Quaerens Ltd, I acknowledge that the Firebase password-hashing configuration for quaerens-crm4-spain-test (558324850479) was included in private Codex tool output. I have declared sole use of the affected computer/session and no sharing, conversation export or screenshot distribution. Provider-side access and retention have not been independently established, and deletion or retirement of the exposed configuration has not been verified. I understand that future synthetic accounts may use the same configuration and that disclosure of their password hashes and salts would create an offline password-guessing risk.
>
> I accept that residual risk solely for the separately approved, supervised CRM4 synthetic rehearsal, with no real staff or customer accounts/data, no password reuse and no password-hash exports. This acceptance covers only bootstrap@crm4.example.test, owner@crm4.example.test and portal-client@crm4.example.test, operated under the existing governed handlers and individual audit controls. The bootstrap identity may have only its separately approved temporary project-local platformAdmin claim; the owner must never receive that claim; the portal client must have no CRM membership, administrative claim, Google IAM or additional IAP grant. The sole IAP tester remains brusseljeroen@gmail.com.
>
> All passwords must be strong, unique and privately entered. The final approved bundle must enforce the exact 168-hour policy invariant, the separately confirmed supervised rehearsal period of no more than 30 minutes, and a bounded containment deadline. I require the approved disabling, refresh-token revocation and access withdrawal after testing or failure; expiry controls must independently deny retained-token access. No control or failed acceptance check may be waived on the basis of this risk acceptance.
>
> This is risk acceptance only. It does not authorise account creation, claims, IAM changes, rules publication, deployment, support-request submission, credential handling or execution. Those require separate explicit approval of the final sealed bundle and containment scope. It does not approve production or real-customer use. If new evidence or Google's advice materially changes the risk, stop and obtain a new disposition before proceeding.

The owner must explicitly accept, reject or amend this statement. The present access declaration and preparation approval do not constitute acceptance of it. No timestamps are activated by it. Never reuse an elapsed rehearsal slot.

## Firebase support submission handoff

FIREBASE-SUPPORT-DRAFT.md now includes the owner declarations, clearly labelled as attestation, and is ready to paste into a private Firebase support case. It asks about required remediation, supported key retirement, future/historical hash implications and the synthetic-only risk decision. It contains no sensitive configuration. No case has been submitted, no case number exists, and no response from Google is implied.

Owner options: submit the draft privately and return a sanitized case reference/recommendation, or explicitly instruct Codex to submit through an available authorised channel. Do not attach the affected task, tool output, raw logs, screenshots, passwords or user exports. Any configuration remediation suggested by support requires a new exact approval.

## Preparation and remaining execution gates

Existing 31/31 local checks and six portal emulator checks remain preserved; no implementation changed, so they were not repeated. No support message, cloud call, credential handling, new seal, window activation, rebuild or scan occurred. The next readiness steps are: decide incident residual risk; separately authorise any support/output-containment action; confirm both participants and a valid UTC slot; perform field-filtered read-only drift checks; prepare and approve the canonical manifest/hash and all account, audit, IAP/OAuth, IAM, rules, Run, canary, restart and containment deltas. Scope approval alone is not execution approval.

Exact image remains sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. Open HIGH CVE-2026-85091, Node reproducibility limitation and all framework safeguards remain unchanged. Production and real-customer use remain NO-GO.
