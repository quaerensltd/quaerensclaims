const {
  SCHEMA_VERSION,
  CONSENT_STATES,
  TRANSFER_STATES,
  EVIDENCE_STATUSES
} = typeof require === "function" ? require("./qcms.config") : window.QuaerensQCMSConfig;
const { QCMS_CASE_SUMMARY_FIELDS, normaliseCaseSummary } = typeof require === "function" ? require("./qcms.case-summary") : window.QuaerensQCMSCaseSummary;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateEvidenceItem(item, index, warnings) {
  if (!isObject(item)) {
    warnings.push(`Evidence item ${index + 1} is not structured.`);
    return;
  }
  if (!item.category) warnings.push(`Evidence item ${index + 1} has no category.`);
  if (!item.requirementStatus) warnings.push(`Evidence item ${index + 1} has no requirement status.`);
  if (!item.availabilityStatus) warnings.push(`Evidence item ${index + 1} has no availability status.`);
  const requirement = Object.values(EVIDENCE_STATUSES.REQUIREMENT);
  const availability = Object.values(EVIDENCE_STATUSES.AVAILABILITY);
  if (item.requirementStatus && !requirement.includes(item.requirementStatus)) {
    warnings.push(`Evidence item ${index + 1} has an unrecognised requirement status.`);
  }
  if (item.availabilityStatus && !availability.includes(item.availabilityStatus)) {
    warnings.push(`Evidence item ${index + 1} has an unrecognised availability status.`);
  }
}

function validateCaseSummary(input) {
  const errors = [];
  const warnings = [];
  const missingFields = [];

  if (!isObject(input)) {
    return {
      valid: false,
      warnings: ["Input was not a structured object."],
      errors: ["QCMS Case Summary must be an object."],
      missingFields: QCMS_CASE_SUMMARY_FIELDS.slice(),
      normalisedData: normaliseCaseSummary({})
    };
  }

  const normalisedData = normaliseCaseSummary(input);

  if (normalisedData.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(`Schema version is ${normalisedData.schemaVersion || "missing"}; expected ${SCHEMA_VERSION}.`);
  }

  ["caseId", "sourceBuilder", "complaintCategory", "complaintType", "complaintTitle"].forEach((field) => {
    if (!normalisedData[field]) missingFields.push(field);
  });

  if (!normalisedData.platformUser || !isObject(normalisedData.platformUser)) {
    missingFields.push("platformUser");
  }

  if (!normalisedData.complaintIssues.length) missingFields.push("complaintIssues");
  if (!normalisedData.chronology.length) warnings.push("Chronology is empty or incomplete.");
  if (!normalisedData.evidenceItems.length) warnings.push("Evidence items are empty or incomplete.");
  if (!normalisedData.generatedDocuments.length) warnings.push("Generated documents are not recorded.");

  normalisedData.evidenceItems.forEach((item, index) => validateEvidenceItem(item, index, warnings));

  if (!Object.values(CONSENT_STATES).includes(normalisedData.consentStatus)) {
    errors.push("Consent status is not recognised.");
  }

  if (!Object.values(TRANSFER_STATES).includes(normalisedData.transferStatus)) {
    errors.push("Transfer status is not recognised.");
  }

  if (normalisedData.transferStatus !== TRANSFER_STATES.LOCAL_ONLY) {
    warnings.push("Part 1A should remain local-only; no transfer should occur.");
  }

  if (normalisedData.financialPosition && normalisedData.financialPosition.currency && normalisedData.financialPosition.currency !== "GBP") {
    warnings.push("Financial position is not recorded in GBP.");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    missingFields,
    normalisedData
  };
}

const QCMS_VALIDATION_API = {
  validateCaseSummary
};

if (typeof module === "object" && module.exports) module.exports = QCMS_VALIDATION_API;
if (typeof window !== "undefined") window.QuaerensQCMSValidation = QCMS_VALIDATION_API;
