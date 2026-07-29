const {
  COMPLEXITY_LEVELS,
  READINESS_STATUSES,
  ADMINISTRATION_BANDS,
  EVIDENCE_STATUSES,
  REASON_CODES,
  PUBLIC_REASON_TEXT,
  FREE_DIY_MESSAGE,
  CASE_SUMMARY_DISCLAIMER
} = typeof require === "function" ? require("./qcms.config") : window.QuaerensQCMSConfig;
const { validateCaseSummary } = typeof require === "function" ? require("./qcms.validation") : window.QuaerensQCMSValidation;
const { getServiceLevel, formatIndicativeFee } = typeof require === "function" ? require("./qcms.pricing") : window.QuaerensQCMSPricing;

function countMissingRequiredEvidence(evidenceItems) {
  return evidenceItems.filter((item) => {
    if (!item || item.requirementStatus === EVIDENCE_STATUSES.REQUIREMENT.NOT_APPLICABLE) return false;
    return item.requirementStatus === EVIDENCE_STATUSES.REQUIREMENT.REQUIRED &&
      item.availabilityStatus !== EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE;
  }).length;
}

function assessEvidenceCompleteness(summary) {
  const applicable = summary.evidenceItems.filter((item) => item && item.requirementStatus !== EVIDENCE_STATUSES.REQUIREMENT.NOT_APPLICABLE);
  if (!applicable.length) {
    return {
      status: "Limited",
      score: 0,
      explanation: "No applicable evidence has been recorded yet."
    };
  }
  const available = applicable.filter((item) => item.availabilityStatus === EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE).length;
  const score = Math.round((available / applicable.length) * 100);
  const status = score >= 75 ? "Supported" : score >= 40 ? "Developing" : "Limited";
  return {
    status,
    score,
    explanation: "Measures whether expected evidence has been recorded. It does not assess the strength or outcome of the complaint."
  };
}

function assessChronologyCompleteness(summary) {
  const count = summary.chronology.length;
  return {
    status: count >= 5 ? "Developing" : count >= 2 ? "Basic" : "Limited",
    eventCount: count,
    explanation: "Measures whether key dates and events have been recorded."
  };
}

function assessFinancialCompleteness(summary) {
  const fp = summary.financialPosition || {};
  const hasAmounts = fp.disputedValuePence !== null || fp.documentedLossPence !== null || fp.refundRequestedPence !== null;
  return {
    status: hasAmounts ? "Developing" : "Limited",
    hasFinancialReconstructionNeed: Boolean(fp.hasFinancialReconstructionNeed),
    explanation: "Measures whether relevant amounts and losses have been recorded. It is not a recovery estimate."
  };
}

function collectReasonCodes(summary, validation) {
  const reasons = [];
  const issueCount = summary.complaintIssues.length;
  const respondentCount = Array.isArray(summary.respondent) ? summary.respondent.length : summary.respondent ? 1 : 0;
  const evidenceCount = summary.evidenceItems.length;
  const chronologyCount = summary.chronology.length;
  const riskFlags = summary.riskFlags || [];

  if (issueCount <= 1 && evidenceCount <= 6 && !validation.missingFields.length) reasons.push(REASON_CODES.SINGLE_SIMPLE_SUBMISSION);
  if (summary.officialRoute && summary.officialRoute.requiresPortal) reasons.push(REASON_CODES.PORTAL_SUBMISSION_REQUIRED);
  if (issueCount > 2) reasons.push(REASON_CODES.MULTIPLE_ISSUES);
  if (validation.missingFields.length || countMissingRequiredEvidence(summary.evidenceItems) > 0) reasons.push(REASON_CODES.MISSING_CORE_INFORMATION);
  if (evidenceCount > 8 || summary.supportingFiles.length > 5) reasons.push(REASON_CODES.MULTIPLE_DOCUMENTS);
  if (summary.financialPosition && summary.financialPosition.hasFinancialReconstructionNeed) reasons.push(REASON_CODES.FINANCIAL_RECONSTRUCTION);
  if (chronologyCount > 8) reasons.push(REASON_CODES.LONG_CHRONOLOGY);
  if (respondentCount > 1) reasons.push(REASON_CODES.MULTIPLE_RESPONDENTS);
  if (/follow/i.test(String(summary.complaintStatus)) || /final response|deadlock/i.test(String(summary.escalationPosition))) reasons.push(REASON_CODES.FOLLOW_UP_REQUIRED);
  if (/ombudsman|escalation|final response|deadlock/i.test(String(summary.escalationPosition))) reasons.push(REASON_CODES.ESCALATION_STAGE);
  if (summary.evidenceItems.some((item) => {
    const label = String(`${item.category || ""} ${item.name || ""}`);
    const isSpecialistLabel = /expert|inspection|survey|structural|technical report/i.test(label);
    return isSpecialistLabel && item.requirementStatus === "required";
  })) reasons.push(REASON_CODES.TECHNICAL_EVIDENCE);
  if (riskFlags.some((flag) => /debt|arrears|collection/i.test(String(flag)))) reasons.push(REASON_CODES.DEBT_COLLECTION_PRESENT);
  if (summary.officialRoute && summary.officialRoute.verificationStatus === "requires verification") reasons.push(REASON_CODES.ROUTE_REQUIRES_VERIFICATION);
  if (riskFlags.some((flag) => /court|jurisdiction|legal|specialist|unrelated/i.test(String(flag)))) reasons.push(REASON_CODES.MANUAL_SCOPE_REVIEW);

  return Array.from(new Set(reasons));
}

function assessComplexity(summary, validation) {
  const reasons = collectReasonCodes(summary, validation);
  const manual = reasons.includes(REASON_CODES.MANUAL_SCOPE_REVIEW) ||
    reasons.includes(REASON_CODES.ROUTE_REQUIRES_VERIFICATION) ||
    summary.complaintIssues.length > 6 ||
    (Array.isArray(summary.respondent) && summary.respondent.length > 3);

  if (manual) {
    return {
      classification: COMPLEXITY_LEVELS.ENHANCED_REVIEW_REQUIRED,
      reasonCodes: reasons,
      explanation: "Administrative scope should be checked manually before any service fee is suggested."
    };
  }

  const weightedReasons = reasons.filter((reason) => ![
    REASON_CODES.SINGLE_SIMPLE_SUBMISSION,
    REASON_CODES.PORTAL_SUBMISSION_REQUIRED
  ].includes(reason));

  if (weightedReasons.length >= 4 || reasons.includes(REASON_CODES.FINANCIAL_RECONSTRUCTION) || reasons.includes(REASON_CODES.TECHNICAL_EVIDENCE)) {
    return {
      classification: COMPLEXITY_LEVELS.COMPLEX,
      reasonCodes: reasons,
      explanation: "Administrative complexity appears higher because the material may need evidence audit, chronology work or financial reconstruction."
    };
  }

  if (weightedReasons.length >= 1 || summary.evidenceItems.length > 4 || summary.complaintIssues.length > 1) {
    return {
      classification: COMPLEXITY_LEVELS.MODERATE,
      reasonCodes: reasons,
      explanation: "Administrative complexity appears moderate because there are multiple moving parts to organise."
    };
  }

  return {
    classification: COMPLEXITY_LEVELS.SIMPLE,
    reasonCodes: reasons.length ? reasons : [REASON_CODES.SINGLE_SIMPLE_SUBMISSION],
    explanation: "Administrative complexity appears simple based on the information recorded."
  };
}

function assessReadiness(summary, validation, evidence) {
  if (validation.missingFields.length) return READINESS_STATUSES.INFORMATION_INCOMPLETE;
  if (summary.officialRoute && summary.officialRoute.verificationStatus === "requires verification") return READINESS_STATUSES.ROUTE_VERIFICATION_REQUIRED;
  if (evidence.status === "Limited") return READINESS_STATUSES.EVIDENCE_REVIEW_RECOMMENDED;
  if (/ombudsman|escalation|final response|deadlock/i.test(String(summary.escalationPosition))) return READINESS_STATUSES.POTENTIALLY_READY_FOR_ESCALATION;
  if (/follow/i.test(String(summary.complaintStatus))) return READINESS_STATUSES.READY_FOR_FOLLOW_UP;
  if (summary.generatedDocuments.length) return READINESS_STATUSES.READY_FOR_INITIAL_COMPLAINT;
  return READINESS_STATUSES.EARLY_DRAFT;
}

function estimateAdministration(complexity, reasons) {
  if (complexity === COMPLEXITY_LEVELS.ENHANCED_REVIEW_REQUIRED) return ADMINISTRATION_BANDS.EIGHT_PLUS_MANUAL_REVIEW;
  if (complexity === COMPLEXITY_LEVELS.COMPLEX) {
    return reasons.includes(REASON_CODES.FINANCIAL_RECONSTRUCTION) ? ADMINISTRATION_BANDS.FOUR_TO_EIGHT_HOURS : ADMINISTRATION_BANDS.TWO_TO_FOUR_HOURS;
  }
  if (complexity === COMPLEXITY_LEVELS.MODERATE) return ADMINISTRATION_BANDS.TWO_TO_FOUR_HOURS;
  return ADMINISTRATION_BANDS.UNDER_1_HOUR;
}

function serviceForComplexity(complexity, reasons) {
  if (complexity === COMPLEXITY_LEVELS.ENHANCED_REVIEW_REQUIRED || reasons.includes(REASON_CODES.MANUAL_SCOPE_REVIEW) || reasons.includes(REASON_CODES.ROUTE_REQUIRES_VERIFICATION)) {
    return "QCMS-REVIEW";
  }
  if (complexity === COMPLEXITY_LEVELS.COMPLEX) return "QCMS-L3";
  if (complexity === COMPLEXITY_LEVELS.MODERATE) return "QCMS-L2";
  return "QCMS-L1";
}

function recommendQCMSService(input) {
  const validation = validateCaseSummary(input);
  const summary = validation.normalisedData;
  const evidenceCompleteness = assessEvidenceCompleteness(summary);
  const chronologyCompleteness = assessChronologyCompleteness(summary);
  const financialCompleteness = assessFinancialCompleteness(summary);
  const complexity = assessComplexity(summary, validation);
  const readiness = assessReadiness(summary, validation, evidenceCompleteness);
  const administrationEstimate = estimateAdministration(complexity.classification, complexity.reasonCodes);
  const serviceCode = serviceForComplexity(complexity.classification, complexity.reasonCodes);
  const serviceLevel = getServiceLevel(serviceCode);
  const primaryReasons = complexity.reasonCodes.slice(0, 3).map((code) => PUBLIC_REASON_TEXT[code]);
  const secondaryReasons = complexity.reasonCodes.slice(3).map((code) => PUBLIC_REASON_TEXT[code]);

  return {
    serviceCode,
    serviceName: serviceLevel.displayName,
    indicativeFee: formatIndicativeFee(serviceLevel),
    complexity: complexity.classification,
    administrationEstimate,
    primaryReasons,
    secondaryReasons,
    reasonCodes: complexity.reasonCodes,
    missingRequirements: validation.missingFields,
    manualReviewRequired: serviceCode === "QCMS-REVIEW",
    confidence: validation.errors.length ? "Low" : validation.warnings.length ? "Medium" : "High",
    limitations: serviceLevel.limitations,
    evidenceCompleteness,
    chronologyCompleteness,
    financialCompleteness,
    complaintReadiness: readiness,
    freeDIYMessage: FREE_DIY_MESSAGE,
    caseSummaryDisclaimer: CASE_SUMMARY_DISCLAIMER,
    validation
  };
}

const QCMS_RECOMMENDATION_API = {
  assessEvidenceCompleteness,
  assessChronologyCompleteness,
  assessFinancialCompleteness,
  assessComplexity,
  assessReadiness,
  estimateAdministration,
  recommendQCMSService
};

if (typeof module === "object" && module.exports) module.exports = QCMS_RECOMMENDATION_API;
if (typeof window !== "undefined") window.QuaerensQCMSRecommendation = QCMS_RECOMMENDATION_API;
