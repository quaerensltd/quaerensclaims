const { normaliseCaseSummary } = require("./qcms.case-summary");

function adaptBuilderStateToQCMSCaseSummary(builderState = {}, options = {}) {
  const source = options.sourceBuilder || builderState.sourceBuilder || builderState.builder || null;
  const user = builderState.platformUser || builderState.user || builderState.consumer || {};
  const respondent = builderState.respondent || builderState.supplier || builderState.airline || builderState.organisation || null;

  return normaliseCaseSummary({
    sourceBuilder: source,
    sourceBuilderVersion: options.sourceBuilderVersion || builderState.sourceBuilderVersion || builderState.version || null,
    complaintCategory: options.complaintCategory || builderState.complaintCategory || builderState.category || null,
    complaintType: options.complaintType || builderState.complaintType || builderState.route || null,
    complaintTitle: options.complaintTitle || builderState.complaintTitle || builderState.title || null,
    platformUser: user,
    contactDetails: builderState.contactDetails || {},
    businessOrOrganisation: builderState.businessOrOrganisation || respondent,
    respondent,
    complaintIssues: builderState.complaintIssues || builderState.issues || [],
    complaintSummary: builderState.complaintSummary || builderState.summary || null,
    keyFacts: builderState.keyFacts || builderState.facts || [],
    chronology: builderState.chronology || builderState.timeline || [],
    financialPosition: builderState.financialPosition || builderState.financial || undefined,
    requestedOutcomes: builderState.requestedOutcomes || builderState.outcomes || [],
    evidenceSummary: builderState.evidenceSummary || null,
    evidenceItems: builderState.evidenceItems || builderState.evidence || [],
    missingEvidence: builderState.missingEvidence || [],
    generatedDocuments: builderState.generatedDocuments || builderState.documents || [],
    supportingFiles: builderState.supportingFiles || builderState.files || [],
    complaintStatus: builderState.complaintStatus || null,
    submissionStatus: builderState.submissionStatus || null,
    officialRoute: builderState.officialRoute || undefined,
    escalationPosition: builderState.escalationPosition || null,
    vulnerabilityIndicators: builderState.vulnerabilityIndicators || [],
    riskFlags: builderState.riskFlags || [],
    metadata: {
      sourceUrl: options.sourceUrl || builderState.sourceUrl || null,
      completionDate: options.completionDate || builderState.completionDate || null,
      savedDraftId: options.savedDraftId || builderState.savedDraftId || null,
      complaintRoute: options.complaintRoute || builderState.complaintRoute || null,
      architectureVersion: "1.0.0-alpha.1",
      localOnly: true
    }
  });
}

module.exports = {
  adaptBuilderStateToQCMSCaseSummary
};
