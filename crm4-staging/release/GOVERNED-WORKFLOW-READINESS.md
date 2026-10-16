# Governed synthetic workflow and fixture review

Preparation only. Baseline: c775f796. Shared CRM Framework reused without modifying its handlers, role checks, rules, application source or container. No cloud operation was performed. No current rehearsal window is proposed; the elapsed slot must not be reused.

## Decision

**GO for review of one additional fictional identity; NO-GO for execution or deployment.** The minimum existing-handler route uses `workflow@crm4.example.test`, primary role `lister`, roles exactly `["lister", "closer"]`. The separate existing owner Administrator performs the supervisor and Processing stages. Neither receives platformAdmin. This is one additional account, four synthetic identities in total including temporary bootstrap and portal client. Two separate staff logins are unnecessary for this owner-operated fixture and are not proposed here.

The mocked Assessment Assistant route is already implemented in the assessed runtime. Its assigned Lister can confirm extraction and finalise the reviewed draft. Supervisor approval and appointment completion remain separate owner actions. This result does **not** certify the manual Framework B assessment route: that route requires assessmentAuthor and a different assessmentApprover/assessmentIssuer. Its authority-management export is not registered in the assessed callable surface. Do not grant profile capabilities directly or invoke an unregistered export. A separate manual-assessment rehearsal would need another scoped design review.

## Actor-to-workflow matrix

| Stage / governed handler | Required authority in this route | Proposed actor |
| --- | --- | --- |
| crm4AdminCreateUser; crm4AdminUpdateMembership | Genuine project-local platformAdmin; target must differ from actor | bootstrap@crm4.example.test, temporary only |
| crm4ListerCreateReferralLead; callbacks | Active CRM4 Lister, assigned lead ownership | workflow@crm4.example.test |
| AssessmentAssistant UpdateClientIdentity / Analyse / ConfirmReview / GenerateDraft / Finalise | Assigned CRM4 Lister; extraction/draft review checks; explicit synthetic AI marker | workflow@crm4.example.test |
| crm4ListerSubmitToManager | Lister, completed linked assessment, appointment input | workflow@crm4.example.test |
| crm4ManagerUpdateLead; ManagerSendToCloser; UpdateAppointment | CRM4 Manager or Administrator; status/assignment checks | owner@crm4.example.test, existing Administrator |
| crm4CloserRecordClosedDeal; agreement/PDF; payment email | Assigned Closer; correct assessment, appointment, agreement and payment option | workflow@crm4.example.test |
| processingMarkAgreementSigned; processingConfirmCrm2Payment | Existing Processing/supervisor checks; exact agreement/version and amount | owner@crm4.example.test |
| PublishAdministrationOnboardingSlots | Existing Processing/supervisor authority | owner@crm4.example.test |
| CloserBookAdministrationOnboarding | Assigned Closer, available governed slot | workflow@crm4.example.test |
| paidClientGetWorkspace; paidClientActivateLogin | Existing paid-client staff/supervisor and paid/onboarding prerequisites | owner@crm4.example.test |
| Portal dashboard, messages, upload/register/download | Genuine verified-email client, ACTIVE own CRM4 case, own UID path | portal-client@crm4.example.test |
| Checklist, requirements, evidence, Processing handover | Existing Processing/supervisor permissions and completion safeguards | owner@crm4.example.test |

The historical function name `processingConfirmCrm2Payment` is retained inside the isolated CRM4 registration. This does not authorise any CRM2 access. No real payment occurs; notifications and AI are captured. See `tools/register-handlers.cjs`, `tools/staff-capabilities.cjs`, `tools/staff-factory-extension.cjs`, `tools/admin-capability-extension.cjs` and the hash-checked backend sources. Owner Administrator still fails Lister referral creation; Administrator + dual-role membership remains invalid.

## Exact additional identity approval requested

Extend the synthetic-only incident residual-risk acceptance to **workflow@crm4.example.test**, operated solely by the same supervised owner, with **Lister + Closer in CRM4 only**. No platformAdmin/custom administrative claims, assessment authority profile writes, Google IAM role, or additional human IAP access. Unique strong non-reused password, entered privately using the reviewed masked procedure; no command-line, history, logs, Git, screenshots or exported token/password material.

Proposed ceremony, requiring later execution approval:

1. Verify exact project/number, absence of conflicting identity and scope approval. Existing temporary bootstrap authenticates genuinely; capture its UID and operator audit correlation.
2. Use crm4AdminCreateUser for the existing owner Administrator and the new Lister identity; use crm4AdminUpdateMembership for the new actor with primary lister and roles [lister, closer]. Check individual membership audit and operation receipts. Never update the bootstrap's own membership.
3. Immediately remove bootstrap platformAdmin, revoke its refresh tokens and disable it after these governed membership operations. Verify no bootstrap CRM membership and no owner/workflow platformAdmin.
4. Privately set unique synthetic passwords under separately approved credential custody. Sign in separately as owner and workflow actor behind the same sole owner's IAP session. No new Google account access.
5. Create the fictional referral with a unique requestId and portal-client@crm4.example.test. Follow the complete governed route above. Portal verified-email state is established only by paidClientActivateLogin.
6. At containment, revoke workflow refresh tokens and disable its exact UID after verifying its exact email and no administrative claim. `disable-workflow-actor` is prepared and separately gated by scopeApproved plus containment authorisation. Retained-token denial still depends on the independently verified expiry rules/application gate; disabling alone is not presented as instantaneous ID-token revocation. Preserve audit records. A fresh bootstrap is not authorised to reactivate or edit memberships.

Existing risk acceptance for the other three identities remains intact. Provider-side retention uncertainty, outstanding HIGH CVE-2026-85091 and Node binary reproducibility limitation remain open. No production/customer/staff use is accepted.

## Receipt-bound fixture and cleanup

`fixture-receipts.cjs` collects actual NEW_LEAD_CREATED response and read-back evidence: project, actor UID, random requestId hash/request document, generated lead ID, original ownership, CRM4 markers, provenance timestamp, document create/update times and individually attributable referral audit. Replays, duplicate outcomes, conflicting ownership, missing audit or out-of-window creation fail. Actual case ID is derived from the governed handler's contract (`crm4-` plus the returned lead ID), never from a rehearsal-name prefix.

Portal verification binds the exact client UID/email/verified state, absence of membership/admin claim, ACTIVE case, CRM4 lead link, clientPortalAccess and activation audit by the owner. Cloud collection must freshly verify project number 558324850479; emulator evidence is explicitly labelled demo/EMULATOR and cannot pass cloud approval validation.

After real governed creation (only if later approved), the operator reviews and hashes the binding as an execution receipt annex. The pre-execution bundle approves the collection procedure, not invented lead/case IDs. `browser-fixture-binding.js` must be loaded before the browser probe/activation scripts, with the independently reviewed expected hash supplied from the approval annex. Node probes and cleanup require the same binding hash. A hash demonstrates integrity, not authenticity: authenticated handler responses and independent read-back establish provenance.

`resource-receipts.cjs` accepts explicit resource paths and creation/upload receipts only. Unknown collections, unrelated case links, timestamp drift and generation mismatch are rejected. Audit collections are deliberately not deletion targets. Snapshot current updateTime after authorised workflow/canary writes and bind it to the original createTime. Uploaded objects require exact bucket/name/generation and creation receipt. Review and hash the exact resource inventory; cleanup refuses items outside that inventory and retains updateTime/ifGenerationMatch preconditions. Do not refresh preconditions blindly after a 412.

The finite cleanup inventory can include lead, portal case/access, documents, requirements, messages, processing case and linked assessment/version/document records when their specific creation receipts pass. Any unsupported child, reservation, agenda/slot or notification record must remain isolated for explicit review; never infer deletion eligibility from a name, prefix, query result or a `createdByThisRun` boolean alone. Request/membership/activation audits must be preserved. **Do not report complete fixture removal while an active unsupported resource remains.** Account disabling, expiry and service/IAP withdrawal are independent containment steps. No wildcard cleanup or production-like state seeding is authorised.

## Local evidence and limits

`governed-journey-emulator.cjs` reuses the existing continuous-journey test flow. Only the emulator bootstrap Auth identity and its temporary claim are created administratively. Memberships, lead, assessment, appointment, agreement, payment, onboarding, Processing and portal state use registered governed handlers; no direct Firestore completed-state writes. All identities authenticate genuinely against loopback Auth. Passwords are random, unique and memory-only.

The first governed browser journey completed with one dual actor and the unmodified owner role. Receipt validation was then added. The release-rule upload initially failed because the local browser adapter intentionally uses demo-quaerens-crm4.appspot.com, which release rules correctly reject; a subsequent probe exposed a test-only modular/compat Auth mismatch. Neither failed observation was reported as PASS. The final harness retains the existing browser/demo-bucket functional test and separately tests an actual governed case with the exact release rules and approved bucket name on the loopback Storage emulator. This is not live cloud or native IAP acceptance. Final result and source hashes are in the accompanying evidence file.

No additional functional handler blocker was found for the selected mocked Assistant route. Manual-assessment capability provisioning remains outside the accepted route. Native IAP expiry, listeners across expiry, post-expiry canary, retained sessions/tokens, expired restart, live resumable continuation and cloud audit visibility still require the separately approved managed rehearsal; emulator results cannot substitute for those checks.

## Remaining approvals and sequence

1. Approve the exact additional workflow identity and extend synthetic-only risk acceptance, temporary bootstrap provisioning scope and disabling/revocation containment scope to it. This is not permission to execute now.
2. Review receipt-bound fixture/resource inventory procedure, browser helper loading and handling of unsupported cleanup resources. Preserve the immutable image and existing security evidence.
3. Confirm a new supervised UTC slot. Refresh redacted read-only project/permission/IAM/rules checks and seal a new inactive bundle. Do not reuse an elapsed window or an old seal with these changed tools.
4. Separately approve exact deployment/IAP/audit/rules/identity mutations and bounded containment. During execution append verified generated IDs/UIDs to the receipt annex before probes or cleanup. Any failure or inconclusive observation remains NO-GO.

Exact assessed image: `europe-west1-docker.pkg.dev/quaerens-crm4-spain-test/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb`.

**Private deployment: NO-GO pending the above approvals and managed acceptance. Production and real customer use: NO-GO. STOP before execution.**
