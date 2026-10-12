# CRM4 dependency closure checkpoint

## Current functional-completeness checkpoint

71 exposed handlers: 69 individually pinned callables plus two CRM4 recovery
controls. Static coverage 56/82. Of the 26 missing static names, 11 are deliberately
excluded CRM3/Guided Support functions. No automatic export registration.

19 newly integrated: four Admin operations; SaveCallback/ListAgenda; cancellation
and slot blocking; Manager/Closer report downloads; four confirmation/agreement
previews; Lister retry/general-information email; callback, Manager appointment
and Closer onboarding confirmations. Each uses its own catalog source generation.

Current gaps: AssessmentAssistantCompleteIssue; frameworkBAssessmentApprove,
GenerateDocuments, Issue, RequestCorrections; legacyCloserGetProcessingLinks;
paidClientGlobalClientSearch; two Stripe operations; portalClientClaimInvitation;
portalStaffCreateInvitation/CreateMessage/ListCases/RegisterDocument/UpsertCase.
Legacy portal-v2 operations must not downgrade current portal-v3 cases. Selected
source snapshots may be present for inspection without runtime registration.

The older counts and gap lists below are retained as historical checkpoints,
not the current integrated-handler inventory. DEPLOYMENT-READINESS.md and
RESILIENCE-CONTRACT.md describe remaining acceptance limitations.

Update 12 October: portalStaffRevokeAccess is now individually pinned, exposed
through the CRM4 case boundary and regression tested. Current counts: 50 pinned
handlers plus 2 CRM4 recovery controls; 37/82 static names covered. The historical
counts and defect diagnosis below are retained as baseline evidence. Current
client notification/upload recovery is specified in RESILIENCE-CONTRACT.md.

Scope: the preserved static CRM2 inventory, not an assertion that every dynamic
call has been discovered. 82 distinct inventory callable names; 36 have pinned
local counterparts. The local allow-list has 49 handlers including 13 additional
journey/correction/portal operations not captured by that static inventory.
Each callable uses its own source manifest and source generation.

Newly integrated: paidClientCreateMessage, paidClientRegisterUpload,
paidClientStaffCreateMessage, paidClientMarkMessageRead, paidClientDownloadDocument,
portalClientCreateMessage, portalClientRegisterUpload, portalClientGetDocumentUrl,
and Assessment Assistant StartCorrection/PreviewCorrectionPdf/FinaliseCorrection.
The actual current portal uses the paidClient message/upload contracts; the older
portal-prefixed variants are not substituted for them.

## Still unintegrated — explicit gaps

- Admin: CreateUser, ProvisionExistingProcessing, SendPasswordSetupEmail,
  UpdateMembership (CRM2 prefix in inventory).
- Assessment: CompleteIssue; frameworkBAssessmentApprove, GenerateDocuments,
  Issue, RequestCorrections. Legacy manual Assessment Builder parity unverified.
- Operations: CancelAdministrationOnboarding, ListAgenda, SaveCallback,
  PreviewCallbackConfirmation, SendCallbackConfirmation,
  processingBlockAdministrationOnboardingSlot.
- Manager: DownloadLinkedAssessmentReport, PreviewAppointmentEmail,
  SendAppointmentConfirmation.
- Closer: DownloadLinkedAssessmentReport, PreviewAdministrationOnboardingConfirmation,
  PreviewAgreementEmail, SendAdministrationOnboardingConfirmation.
- Lister: RetryManagerNotification, SendGeneralInformationEmail.
- Paid portal: paidClientGlobalClientSearch, portalClientClaimInvitation,
  portalStaffCreateInvitation, CreateMessage, ListCases, RegisterDocument,
  RevokeAccess, UpsertCase; legacyCloserGetProcessingLinks.
- External payment operations: CreateStripePaymentRequest, RefundStripePayment.
  Real provider activation remains prohibited; manual synthetic payments are tested.
- Out-of-CRM4 inventory links: five crm3Lister operations and six guidedSupportAdmin
  operations. These are intentionally not exposed by the isolated transport.

## Required design decision before resilience completion

The preserved paidClientCreateMessage saves the message and pending notification,
then calls the provider. If that fails, replay returns ALREADY_CREATED before
retrying the notification or creating the later audit/activity. This is reproduced
by portal-failure.test.cjs. No duplicate message is created, but notification
recovery is incomplete. Changing that CRM2-derived business contract requires an
explicitly governed correction, not silent snapshot edits or a shortcut handler.
The upload registration source also uses sequential writes/provider dispatch;
complete crash-recovery acceptance has not been established.

## Deployment status

Not ready. Exact current authenticated CRM2 visual comparison is unverified;
local responsive evidence is not its replacement. Independent infrastructure,
production storage/provider configuration and packaging require separate approval.
No production environment, account permissions or deployment configuration changed.

## Vercel status on deb3c41

Read-only evidence: deployment dpl_BEjm1A5XVHjTNn3GKWuqnb59owAu is ERROR with
errorCode git_info_fail and reason "Git information retrieval failed for this
deployment." Its Git source is the development branch/commit. No application
build error was established. This is not classified as an expected staging-only
failure or an application regression; the upstream Git integration cause remains
unresolved. No retry, deployment or setting change was performed.
