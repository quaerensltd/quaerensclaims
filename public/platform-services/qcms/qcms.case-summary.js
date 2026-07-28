const {
  SCHEMA_VERSION,
  CONSENT_STATES,
  TRANSFER_STATES,
  VALUE_STATES
} = require("./qcms.config");

const QCMS_CASE_SUMMARY_FIELDS = Object.freeze([
  "schemaVersion",
  "caseId",
  "createdAt",
  "updatedAt",
  "sourceBuilder",
  "sourceBuilderVersion",
  "complaintCategory",
  "complaintType",
  "complaintTitle",
  "platformUser",
  "contactDetails",
  "businessOrOrganisation",
  "respondent",
  "complaintIssues",
  "complaintSummary",
  "keyFacts",
  "chronology",
  "financialPosition",
  "requestedOutcomes",
  "evidenceSummary",
  "evidenceItems",
  "missingEvidence",
  "generatedDocuments",
  "supportingFiles",
  "complaintStatus",
  "submissionStatus",
  "officialRoute",
  "escalationPosition",
  "vulnerabilityIndicators",
  "complexityAssessment",
  "evidenceCompleteness",
  "complaintReadiness",
  "estimatedAdministration",
  "recommendedService",
  "recommendedFee",
  "recommendationReasons",
  "riskFlags",
  "consentStatus",
  "transferStatus",
  "metadata"
]);

const PLATFORM_USER_FIELDS = Object.freeze([
  "title",
  "firstName",
  "lastName",
  "fullName",
  "email",
  "telephone",
  "address",
  "postcode",
  "preferredContactMethod",
  "accessibilityNeeds",
  "communicationNeeds"
]);

function createCaseId(prefix = "QCMS") {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

function unknownValue() {
  return VALUE_STATES.UNKNOWN;
}

function notApplicableValue() {
  return VALUE_STATES.NOT_APPLICABLE;
}

function createPlatformUser(data = {}) {
  return PLATFORM_USER_FIELDS.reduce((user, field) => {
    user[field] = Object.prototype.hasOwnProperty.call(data, field) ? data[field] : null;
    return user;
  }, {});
}

function createEmptyCaseSummary(overrides = {}) {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    caseId: overrides.caseId || createCaseId(),
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    sourceBuilder: null,
    sourceBuilderVersion: null,
    complaintCategory: null,
    complaintType: null,
    complaintTitle: null,
    platformUser: createPlatformUser(),
    contactDetails: {},
    businessOrOrganisation: null,
    respondent: null,
    complaintIssues: [],
    complaintSummary: null,
    keyFacts: [],
    chronology: [],
    financialPosition: {
      currency: "GBP",
      disputedValuePence: null,
      documentedLossPence: null,
      refundRequestedPence: null,
      hasFinancialReconstructionNeed: false,
      notes: null
    },
    requestedOutcomes: [],
    evidenceSummary: null,
    evidenceItems: [],
    missingEvidence: [],
    generatedDocuments: [],
    supportingFiles: [],
    complaintStatus: unknownValue(),
    submissionStatus: unknownValue(),
    officialRoute: {
      routeName: null,
      routeUrl: null,
      routeType: unknownValue(),
      requiresPortal: false,
      verificationStatus: unknownValue()
    },
    escalationPosition: null,
    vulnerabilityIndicators: [],
    complexityAssessment: null,
    evidenceCompleteness: null,
    complaintReadiness: null,
    estimatedAdministration: null,
    recommendedService: null,
    recommendedFee: null,
    recommendationReasons: [],
    riskFlags: [],
    consentStatus: CONSENT_STATES.NOT_REQUESTED,
    transferStatus: TRANSFER_STATES.LOCAL_ONLY,
    metadata: {
      sourceUrl: null,
      completionDate: null,
      savedDraftId: null,
      complaintRoute: null,
      architectureVersion: "1.0.0-alpha.1",
      localOnly: true
    },
    ...overrides,
    platformUser: createPlatformUser(overrides.platformUser || {})
  };
}

function normaliseArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function normaliseCaseSummary(input = {}) {
  const base = createEmptyCaseSummary(input && typeof input === "object" ? input : {});
  base.complaintIssues = normaliseArray(base.complaintIssues);
  base.keyFacts = normaliseArray(base.keyFacts);
  base.chronology = normaliseArray(base.chronology);
  base.requestedOutcomes = normaliseArray(base.requestedOutcomes);
  base.evidenceItems = normaliseArray(base.evidenceItems);
  base.missingEvidence = normaliseArray(base.missingEvidence);
  base.generatedDocuments = normaliseArray(base.generatedDocuments);
  base.supportingFiles = normaliseArray(base.supportingFiles);
  base.vulnerabilityIndicators = normaliseArray(base.vulnerabilityIndicators);
  base.recommendationReasons = normaliseArray(base.recommendationReasons);
  base.riskFlags = normaliseArray(base.riskFlags);
  return base;
}

module.exports = {
  QCMS_CASE_SUMMARY_FIELDS,
  PLATFORM_USER_FIELDS,
  createCaseId,
  createPlatformUser,
  createEmptyCaseSummary,
  normaliseCaseSummary,
  unknownValue,
  notApplicableValue
};
