'use strict';
// CRM4 admission checks; the individually pinned Framework B handlers retain
// capability checks, approval, rendering and issuance business logic.
function manualBoundary(db, deps, name, original) {
  const fail = message => { throw new deps.HttpsError('failed-precondition', message); };
  return async request => {
    const id = request.data?.id || request.data?.assessmentId;
    if (typeof id !== 'string' || !/^[\w-]+$/.test(id)) fail('Existing assessment ID required');
    const assessment = (await db.collection('professionalAssessments').doc(id).get()).data();
    const link = assessment?.crmLink;
    if (!link || link.workspaceId !== 'CRM4' || link.sourceCollection !== 'crm4Leads' || !/^[\w-]+$/.test(link.caseRef || '')) fail('Exact CRM4 assessment linkage required');
    const lead = (await db.collection('crm4Leads').doc(link.caseRef).get()).data();
    if (!lead || lead.workspaceId !== 'CRM4' || lead.assessmentId !== id ||
      [link.clientRef, link.crm4LeadId, request.data?.leadId].some(v => v && v !== link.caseRef) ||
      (lead.assessmentQar && lead.assessmentQar !== assessment.qarReference)) fail('Conflicting assessment/lead/QAR identity');
    // These older manual routes must never re-render or issue a current v9
    // Assistant projection. That pipeline has its own Finalise contract.
    if (assessment.generationContractVersion) fail('Use the existing versioned Assessment Assistant pipeline');
    for (const [key, expected] of [['expectedRevision', assessment.revision], ['expectedVersionId', assessment.currentVersionId]]) {
      if (request.data?.[key] !== undefined && request.data[key] !== expected) fail('Stale assessment version');
    }
    if (assessment.currentVersionId && /GenerateDocuments|Issue$/.test(name)) {
      const version = (await db.collection('professionalAssessmentVersions').doc(assessment.currentVersionId).get()).data();
      if (!version || version.assessmentId !== id || version.qarReference !== assessment.qarReference || version.version !== assessment.currentVersion) fail('Immutable version identity mismatch');
      const hash = require('node:crypto').createHash('sha256').update(JSON.stringify(version.projection)).digest('hex');
      if (version.projectionHash !== hash || assessment.approvedContentHash !== hash) fail('Approved projection integrity mismatch');
      if (name.endsWith('Issue')) {
        const documents = await db.collection('professionalAssessmentDocuments').where('versionId', '==', assessment.currentVersionId).get();
        if (documents.size !== 1 || documents.docs.some(d => d.data().assessmentId !== id || d.data().qarReference !== assessment.qarReference || d.data().version !== assessment.currentVersion)) fail('Canonical document identity mismatch');
      }
      if (name.endsWith('CompleteIssue')) {
        const deliveries = await db.collection('professionalAssessmentDeliveries').where('assessmentId', '==', id).where('versionId', '==', assessment.currentVersionId).get();
        if (!deliveries.docs.some(d => d.data().status === 'COMPLETE' && d.data().qarReference === assessment.qarReference)) fail('Current immutable version has not completed issuance');
      }
    }
    return original(request);
  };
}
module.exports = { manualBoundary };
