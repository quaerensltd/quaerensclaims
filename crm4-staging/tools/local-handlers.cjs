'use strict';
// Local integration entrypoint, not a deployed Firebase export. Only reviewed
// non-provider handlers are exposed; all other factory exports stay private.
function createLocalHandlers(env = process.env) {
  if (env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') {
    throw Error('Explicit demo project and loopback Firestore emulator required');
  }
  // Validate the real SDK environment as well as a caller-provided environment.
  if (process.env.GCLOUD_PROJECT !== env.GCLOUD_PROJECT || process.env.FIRESTORE_EMULATOR_HOST !== env.FIRESTORE_EMULATOR_HOST) throw Error('SDK environment mismatch');
  if (process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL && process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL !== 'archive@example.test') throw Error('Synthetic archive recipient required');
  process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL = 'archive@example.test';
  const { initializeApp, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = initializeApp({ projectId: 'demo-quaerens-crm4' }, 'crm4-local-' + require('node:crypto').randomUUID());
  const db = getFirestore(app);
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const forbidden = () => { throw Error('External providers are disabled in CRM4 local integration'); };
  const providers = require('./local-providers.cjs').createLocalProviders();
  if (!process.env.STORAGE_EMULATOR_HOST) process.env.STORAGE_EMULATOR_HOST = 'http://127.0.0.1:9199';
  if (process.env.STORAGE_EMULATOR_HOST !== 'http://127.0.0.1:9199') throw Error('CRM4 loopback Storage required');
  const storage = require('./local-storage.cjs').createLocalStorage(app);
  const localAuth = () => {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Loopback Auth emulator required');
    return require('firebase-admin/auth').getAuth(app);
  };
  const deps = { db, admin: { firestore: require('firebase-admin').firestore, storage: () => storage, auth: localAuth }, HttpsError, onCall: (...args) => args.at(-1),
    resendSecret: { value: forbidden }, resend: providers.resend };
  const referral = require('../backend-sources/crm4ListerCreateReferralLead/crm4ManualReferral.js').registerCrm2ManualReferral(deps);
  const manager = require('../backend-sources/crm4ManagerGetLinkedAssessment/crm4OperationalFlow.js').registerCrm2OperationalFlow(deps);
  const processing = require('../backend-sources/processingListOperationalDashboard/processingOperations.js').registerProcessingOperations(deps);
  const onboarding = require('../backend-sources/crm4CloserBookAdministrationOnboarding/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps);
  const assessment = require('../backend-sources/crm4AssessmentAssistantGetState/crm4AssessmentAssistant.js').registerCrm2AssessmentAssistant({ ...deps, openaiSecret: { value: forbidden } });
  const processingOnboarding = require('../backend-sources/processingListAdministrationOnboarding/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps);
  const handlers = {
    crm4ListerCreateReferralLead: referral.crm4ListerCreateReferralLead,
    crm4ManagerGetLinkedAssessment: manager.crm4ManagerGetLinkedAssessment,
    crm4CloserBookAdministrationOnboarding: onboarding.crm4CloserBookAdministrationOnboarding,
    crm4AssessmentAssistantGetState: assessment.crm4AssessmentAssistantGetState,
    processingListOperationalDashboard: processing.processingListOperationalDashboard,
    processingListAdministrationOnboarding: processingOnboarding.processingListAdministrationOnboarding
  };
  // Each callable uses its own pinned deployment package, never another
  // callable's convenient factory version. Unlisted exports remain inaccessible.
  for (const suffix of ['UpdateClientIdentity', 'Analyse', 'ConfirmReview', 'SaveCorrections', 'GenerateDraft', 'PreviewDraftPdf', 'ReprojectDraft', 'Finalise', 'DownloadFinalPdf', 'StartCorrection', 'PreviewCorrectionPdf', 'FinaliseCorrection']) {
    const name = 'crm4AssessmentAssistant' + suffix;
    const factory = require('../backend-sources/' + name + '/crm4AssessmentAssistant.js').registerCrm2AssessmentAssistant;
    handlers[name] = factory({ ...deps, openaiSecret: { value: () => 'LOCAL_SYNTHETIC_NOT_A_CREDENTIAL' } })[name];
  }
  for (const suffix of ['ManagerUpdateLead', 'ManagerSendToCloser', 'CloserRecordClosedDeal', 'CloserGetLinkedAssessment', 'ListerSubmitToManager', 'UpdateAppointment', 'CloserGetAgreement', 'CloserSaveAgreement', 'CloserSendAgreement', 'CloserPreparePaymentEmail', 'CloserSendPaymentEmail']) {
    const name = 'crm4' + suffix;
    handlers[name] = require('../backend-sources/' + name + '/crm4OperationalFlow.js').registerCrm2OperationalFlow(deps)[name];
  }
  const { isolated } = require('./local-ai.cjs');
  for (const suffix of ['Approve', 'GenerateDocuments', 'Issue', 'RequestCorrections']) {
    const name = 'frameworkBAssessment' + suffix;
    const original = require('../backend-sources/' + name + '/frameworkB.js').registerFrameworkB(deps)[name];
    handlers[name] = require('./manual-assessment-boundary.cjs').manualBoundary(db, deps, name, original);
  }
  const completeName = 'crm4AssessmentAssistantCompleteIssue';
  handlers.crm4ManualAssessment = require('./manual-authoring.cjs').manualAuthoring(deps);
  handlers.frameworkBAssessmentIssue = require('./manual-issue-recovery.cjs').manualIssueRecovery(deps,
    require('../backend-sources/frameworkBAssessmentIssue/frameworkB.js').registerFrameworkB);
  handlers[completeName] = require('./manual-assessment-boundary.cjs').manualBoundary(db, deps, completeName,
    require('../backend-sources/' + completeName + '/crm4AssessmentAssistant.js').registerCrm2AssessmentAssistant(deps)[completeName]);
  for(const suffix of ['ListerRetryManagerNotification','ListerSendGeneralInformationEmail','SendCallbackConfirmation','ManagerSendAppointmentConfirmation']) {
    const name='crm4'+suffix;handlers[name]=require('../backend-sources/'+name+'/crm4OperationalFlow.js').registerCrm2OperationalFlow(deps)[name];
  }
  handlers.crm4CloserSendAdministrationOnboardingConfirmation=require('../backend-sources/crm4CloserSendAdministrationOnboardingConfirmation/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps).crm4CloserSendAdministrationOnboardingConfirmation;
  for (const suffix of ['CreateUser','UpdateMembership','SendPasswordSetupEmail','ProvisionExistingProcessing']) {
    const name='crm4Admin'+suffix;
    handlers[name]=require('./local-admin.cjs').loadAdmin(name,deps);
  }
  handlers.crm4AdminCreateUser = require('./admin-create-recovery.cjs').adminCreateRecovery(deps);
  for (const name of ['crm4SaveCallback', 'crm4ListAgenda', 'crm4ManagerDownloadLinkedAssessmentReport', 'crm4CloserDownloadLinkedAssessmentReport', 'crm4ManagerPreviewAppointmentEmail', 'crm4CloserPreviewAgreementEmail', 'crm4PreviewCallbackConfirmation']) {
    handlers[name] = require('../backend-sources/' + name + '/crm4OperationalFlow.js').registerCrm2OperationalFlow(deps)[name];
  }
  for (const name of ['crm4CancelAdministrationOnboarding', 'processingBlockAdministrationOnboardingSlot', 'crm4CloserPreviewAdministrationOnboardingConfirmation']) {
    handlers[name] = require('../backend-sources/' + name + '/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps)[name];
  }
  for (const name of ['processingCompleteAdministrationOnboarding', 'crm4CloserListAdministrationOnboardingSlots', 'processingPublishAdministrationOnboardingSlots']) {
    handlers[name] = require('../backend-sources/' + name + '/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps)[name];
  }
  for (const name of ['processingMarkAgreementSigned', 'processingConfirmCrm2Payment']) {
    handlers[name] = require('../backend-sources/' + name + '/processingOperations.js').registerProcessingOperations(deps)[name];
  }
  for (const name of ['paidClientGetWorkspace', 'paidClientActivateLogin', 'paidClientUpdateOnboardingChecklist', 'paidClientAddDocumentRequirement', 'paidClientUpdateEvidence', 'paidClientStaffCreateMessage', 'paidClientMarkMessageRead', 'paidClientDownloadDocument', 'paidClientCreateMessage', 'paidClientRegisterUpload']) {
    handlers[name] = require('../backend-sources/' + name + '/paidClientWorkspace.js').registerPaidClientWorkspace(deps)[name];
  }
  for (const name of ['portalClientGetDashboard', 'portalClientListCases', 'portalClientCreateMessage', 'portalClientRegisterUpload', 'portalClientGetDocumentUrl']) {
    handlers[name] = require('../backend-sources/' + name + '/clientPortal.js').registerClientPortal(deps)[name];
  }
  handlers.paidClientGetWorkspace = require('./linkage-boundary.cjs').workspaceBoundary(db, deps,
    require('../backend-sources/paidClientGetWorkspace/paidClientWorkspace.js').registerPaidClientWorkspace);
  const recovery = require('./portal-recovery.cjs').createPortalRecovery(db, deps);
  handlers.paidClientGlobalClientSearch = require('./search-boundary.cjs').searchBoundary(db,deps,
    require('../backend-sources/paidClientGlobalClientSearch/paidClientWorkspace.js').registerPaidClientWorkspace);
  for(const name of ['portalStaffListCases','portalStaffUpsertCase','portalStaffCreateInvitation','portalClientClaimInvitation','portalStaffCreateMessage','portalStaffRegisterDocument']) {
    handlers[name]=require('./legacy-portal-boundary.cjs').legacyPortal(db,deps,name,
      require('../backend-sources/'+name+'/clientPortal.js').registerClientPortal);
  }
  for (const name of ['paidClientCreateMessage','paidClientRegisterUpload','paidClientStaffCreateMessage']) handlers[name] = recovery.wrap(name, require('../backend-sources/' + name + '/paidClientWorkspace.js').registerPaidClientWorkspace);
  handlers.crm4RecoverPortalNotification = recovery.recover;
  handlers.crm4ReconcilePortalUpload = recovery.reconcileUpload;
  const revoke = require('../backend-sources/portalStaffRevokeAccess/clientPortal.js').registerClientPortal(deps).portalStaffRevokeAccess;
  handlers.portalStaffRevokeAccess = async request => {
    const caseId = request.data?.caseId;
    if (typeof caseId !== 'string' || !caseId.startsWith('crm4-') || caseId.includes('/')) throw new HttpsError('permission-denied','CRM4 case required');
    const portal = (await db.collection('clientPortalCases').doc(caseId).get()).data();
    if (!portal || [portal.workspaceId,portal.crmLink?.workspaceId].some(v=>v && v!=='CRM4')) throw new HttpsError('permission-denied','CRM4 case required');
    return revoke(request);
  };
  for (const name of ['paidClientActivateLogin', 'paidClientUpdateOnboardingChecklist', 'paidClientAddDocumentRequirement', 'paidClientUpdateEvidence']) {
    const original = handlers[name];
    handlers[name] = async request => {
      await db.runTransaction(tx => require('./linkage-boundary.cjs').verifyRequest(db, tx, request, deps));
      return original(request);
    };
  }
  for (const name of Object.keys(handlers)) {
    const handler = isolated(handlers[name]);
    handlers[name] = async request => {
      if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Demo authentication required');
      if (request.data?.leadId) {
        const lead = await db.collection('crm4Leads').doc(request.data.leadId).get();
        if (lead.exists && lead.data().workspaceId !== 'CRM4') throw new HttpsError('permission-denied', 'Local CRM4 workspace boundary');
      }
      return handler(request);
    };
  }
  return { db, app, providerReceipts: providers.receipts, downloadTickets: storage.tickets, storageObjects: storage.objects, handlers: Object.freeze(handlers), async close() { await db.terminate(); await deleteApp(app); } };
}
module.exports = { createLocalHandlers };
