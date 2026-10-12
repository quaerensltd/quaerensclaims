'use strict';
// Preserve callable-specific deployed JavaScript. No archive, env or credential
// files are copied. Bundles remain unserved and unregistered until verified.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { sourceDirectory } = require('./backend-source.cjs');
const catalog = require('../backend-catalog.json');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function transform(source) {
  if (/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|["'](?:sk_live_|re_)[A-Za-z0-9]{20,}/.test(source)) throw new Error('Credential-shaped literal; source not materialised');
  return source.replace(/\r\n/g, '\n').replace(/crm2/g, 'crm4').replace(/CRM2/g, 'CRM4');
}
async function materialize(name) {
  const definition = catalog.matched.find(f => f.name === name);
  if (!definition || definition.state !== 'ACTIVE') throw new Error('Active catalog entry required');
  const source = definition.source.storageSource;
  const directory = await sourceDirectory(source.bucket, source.object, source.generation);
  const root = path.resolve(__dirname, '../backend-sources', name.replace(/^crm2/, 'crm4'));
  const entryModules = {
    legacyCloserGetProcessingLinks: 'legacyCloserProcessingLinks.js',
    frameworkBAssessmentApprove: 'frameworkB.js',
    frameworkBAssessmentGenerateDocuments: 'frameworkB.js',
    frameworkBAssessmentIssue: 'frameworkB.js',
    frameworkBAssessmentRequestCorrections: 'frameworkB.js',
    crm2AssessmentAssistantCompleteIssue: 'crm2AssessmentAssistant.js',
    paidClientGlobalClientSearch: 'paidClientWorkspace.js',
    portalClientClaimInvitation: 'clientPortal.js',
    portalStaffCreateInvitation: 'clientPortal.js',
    portalStaffCreateMessage: 'clientPortal.js',
    portalStaffListCases: 'clientPortal.js',
    portalStaffRegisterDocument: 'clientPortal.js',
    portalStaffUpsertCase: 'clientPortal.js',
    crm2ListerRetryManagerNotification: 'crm2OperationalFlow.js',
    crm2ListerSendGeneralInformationEmail: 'crm2OperationalFlow.js',
    crm2SendCallbackConfirmation: 'crm2OperationalFlow.js',
    crm2ManagerSendAppointmentConfirmation: 'crm2OperationalFlow.js',
    crm2CloserSendAdministrationOnboardingConfirmation: 'crm2AdministrationOnboarding.js',
    crm2AdminCreateUser: 'index.js',
    crm2AdminUpdateMembership: 'index.js',
    crm2AdminSendPasswordSetupEmail: 'index.js',
    crm2AdminProvisionExistingProcessing: 'index.js',
    crm2ManagerDownloadLinkedAssessmentReport: 'crm2OperationalFlow.js',
    crm2CloserDownloadLinkedAssessmentReport: 'crm2OperationalFlow.js',
    crm2ManagerPreviewAppointmentEmail: 'crm2OperationalFlow.js',
    crm2CloserPreviewAgreementEmail: 'crm2OperationalFlow.js',
    crm2PreviewCallbackConfirmation: 'crm2OperationalFlow.js',
    crm2CloserPreviewAdministrationOnboardingConfirmation: 'crm2AdministrationOnboarding.js',
    crm2SaveCallback: 'crm2OperationalFlow.js',
    crm2ListAgenda: 'crm2OperationalFlow.js',
    crm2CancelAdministrationOnboarding: 'crm2AdministrationOnboarding.js',
    processingBlockAdministrationOnboardingSlot: 'crm2AdministrationOnboarding.js',
    portalStaffRevokeAccess: 'clientPortal.js',
    paidClientCreateMessage: 'paidClientWorkspace.js',
    paidClientRegisterUpload: 'paidClientWorkspace.js',
    portalClientCreateMessage: 'clientPortal.js',
    portalClientRegisterUpload: 'clientPortal.js',
    portalClientGetDocumentUrl: 'clientPortal.js',
    paidClientStaffCreateMessage: 'paidClientWorkspace.js',
    paidClientMarkMessageRead: 'paidClientWorkspace.js',
    paidClientDownloadDocument: 'paidClientWorkspace.js',
    crm2AssessmentAssistantStartCorrection: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantPreviewCorrectionPdf: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantFinaliseCorrection: 'crm2AssessmentAssistant.js',
    crm2ListerSubmitToManager: 'crm2OperationalFlow.js',
    paidClientGetWorkspace: 'paidClientWorkspace.js',
    paidClientActivateLogin: 'paidClientWorkspace.js',
    paidClientUpdateOnboardingChecklist: 'paidClientWorkspace.js',
    paidClientAddDocumentRequirement: 'paidClientWorkspace.js',
    paidClientUpdateEvidence: 'paidClientWorkspace.js',
    portalClientGetDashboard: 'clientPortal.js',
    portalClientListCases: 'clientPortal.js',
    processingPublishAdministrationOnboardingSlots: 'crm2AdministrationOnboarding.js',
    crm2CloserGetAgreement: 'crm2OperationalFlow.js',
    crm2CloserSaveAgreement: 'crm2OperationalFlow.js',
    crm2CloserSendAgreement: 'crm2OperationalFlow.js',
    crm2CloserPreparePaymentEmail: 'crm2OperationalFlow.js',
    crm2CloserSendPaymentEmail: 'crm2OperationalFlow.js',
    crm2UpdateAppointment: 'crm2OperationalFlow.js',
    crm2AssessmentAssistantDownloadFinalPdf: 'crm2AssessmentAssistant.js',
    crm2CloserGetLinkedAssessment: 'crm2OperationalFlow.js',
    crm2AssessmentAssistantUpdateClientIdentity: 'crm2AssessmentAssistant.js',
    processingCompleteAdministrationOnboarding: 'crm2AdministrationOnboarding.js',
    crm2CloserListAdministrationOnboardingSlots: 'crm2AdministrationOnboarding.js',
    processingMarkAgreementSigned: 'processingOperations.js',
    processingConfirmCrm2Payment: 'processingOperations.js',
    crm2AssessmentAssistantAnalyse: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantConfirmReview: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantSaveCorrections: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantPreviewDraftPdf: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantReprojectDraft: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantFinalise: 'crm2AssessmentAssistant.js',
    crm2ManagerUpdateLead: 'crm2OperationalFlow.js',
    crm2ManagerSendToCloser: 'crm2OperationalFlow.js',
    crm2CloserRecordClosedDeal: 'crm2OperationalFlow.js',
    crm2AssessmentAssistantGenerateDraft: 'crm2AssessmentAssistant.js',
    crm2AssessmentAssistantGetState: 'crm2AssessmentAssistant.js',
    crm2ManagerGetLinkedAssessment: 'crm2OperationalFlow.js',
    crm2ListerCreateReferralLead: 'crm2ManualReferral.js',
    crm2CloserBookAdministrationOnboarding: 'crm2AdministrationOnboarding.js',
    processingListOperationalDashboard: 'processingOperations.js'
    ,processingListAdministrationOnboarding: 'crm2AdministrationOnboarding.js'
  };
  if (!entryModules[name]) throw new Error('Reviewed entry module mapping required');
  const pending = [entryModules[name]], seen = new Set(), records = [], unresolved = new Set(), packages = new Set();
  while (pending.length) {
    const file = pending.shift(); if (seen.has(file)) continue; seen.add(file);
    let bytes;
    try { bytes = await directory.readJavaScript(file); }
    catch (error) { throw new Error(`${file}: ${error.message}`); }
    const originalIndex = file === 'index.js' && name.startsWith('crm2Admin') ? sha(bytes) : null;
    if (originalIndex) bytes = Buffer.from(require('./select-admin-source.cjs').select(bytes.toString('utf8'), name));
    const text = bytes.toString('utf8');
    const converted = transform(text);
    for (const match of text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
      const ref = match[1];
      if (!ref.startsWith('.')) { packages.add(ref); continue; }
      const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
      const resolved = [candidate, candidate + '.js', candidate + '/index.js'].find(p => directory.entries.some(e => e.name === p));
      if (!resolved || !/\.(?:js|cjs|mjs)$/.test(resolved) || /secret|credential|service.?account/i.test(resolved)) { unresolved.add(candidate); continue; }
      pending.push(resolved);
    }
    const targetName = file.replace(/crm2/g, 'crm4'), target = path.resolve(root, targetName);
    if (!target.startsWith(root + path.sep)) throw new Error('Escaping source path');
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, converted);
    records.push({ original: file, target: targetName, originalSha256: sha(bytes), cloneSha256: sha(Buffer.from(converted)), ...(originalIndex ? { fullEntrypointSha256: originalIndex, selection: 'Exact export plus lexical declaration closure; entrypoint is never executed' } : {}) });
  }
  const result = { callable: name.replace(/^crm2/, 'crm4'), originalCallable: name, source,
    executable: false, reason: 'Provider adapters, runtime assets and backend isolation acceptance pending',
    records, packages: [...packages].sort(), unresolved: [...unresolved].sort() };
  fs.writeFileSync(path.join(root, 'source-manifest.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ callable: result.callable, sourceFiles: records.length, unresolved: result.unresolved }));
  return result;
}
module.exports = { materialize, transform };
if (require.main === module) materialize(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
