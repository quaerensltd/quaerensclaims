const ARCHITECTURE_VERSION = "1.0.0-alpha.3";
const SCHEMA_VERSION = "1.0.0";

const VALUE_STATES = Object.freeze({
  UNKNOWN: "UNKNOWN",
  NOT_APPLICABLE: "NOT_APPLICABLE"
});

const CONSENT_STATES = Object.freeze({
  NOT_REQUESTED: "NOT_REQUESTED",
  PRESENTED: "PRESENTED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED"
});

const TRANSFER_STATES = Object.freeze({
  LOCAL_ONLY: "LOCAL_ONLY",
  TRANSFER_REQUESTED: "TRANSFER_REQUESTED",
  TRANSFER_VALIDATED: "TRANSFER_VALIDATED",
  TRANSFER_PENDING: "TRANSFER_PENDING",
  TRANSFERRED: "TRANSFERRED",
  TRANSFER_FAILED: "TRANSFER_FAILED",
  DELETED: "DELETED"
});

const INSTRUCTION_STATES = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  SERVICE_CONFIRMATION_VIEWED: "SERVICE_CONFIRMATION_VIEWED",
  AUTHORITY_PRESENTED: "AUTHORITY_PRESENTED",
  AUTHORITY_ACCEPTED: "AUTHORITY_ACCEPTED",
  AUTHORITY_WITHDRAWN: "AUTHORITY_WITHDRAWN",
  ACCURACY_CONFIRMED: "ACCURACY_CONFIRMED",
  AGREEMENT_VIEWED: "AGREEMENT_VIEWED",
  AGREEMENT_ACCEPTED: "AGREEMENT_ACCEPTED",
  SIGNATURE_PENDING: "SIGNATURE_PENDING",
  SIGNATURE_COMPLETED: "SIGNATURE_COMPLETED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  CRM_READY: "CRM_READY",
  CRM_CREATED: "CRM_CREATED",
  CLIENT_CREATED: "CLIENT_CREATED",
  FAILED: "FAILED"
});

const PAYMENT_STATES = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
  CONFIRMED: "CONFIRMED"
});

const SIGNATURE_STATES = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED"
});

const COMPLEXITY_LEVELS = Object.freeze({
  SIMPLE: "Simple",
  MODERATE: "Moderate",
  COMPLEX: "Complex",
  ENHANCED_REVIEW_REQUIRED: "Enhanced Review Required"
});

const READINESS_STATUSES = Object.freeze({
  EARLY_DRAFT: "Early Draft",
  INFORMATION_INCOMPLETE: "Information Incomplete",
  EVIDENCE_REVIEW_RECOMMENDED: "Evidence Review Recommended",
  READY_FOR_INITIAL_COMPLAINT: "Ready for Initial Complaint",
  READY_FOR_FOLLOW_UP: "Ready for Follow-up",
  POTENTIALLY_READY_FOR_ESCALATION: "Potentially Ready for Escalation",
  ROUTE_VERIFICATION_REQUIRED: "Route Verification Required"
});

const ADMINISTRATION_BANDS = Object.freeze({
  UNDER_1_HOUR: "Under 1 hour",
  ONE_TO_TWO_HOURS: "1-2 hours",
  TWO_TO_FOUR_HOURS: "2-4 hours",
  FOUR_TO_EIGHT_HOURS: "4-8 hours",
  EIGHT_PLUS_MANUAL_REVIEW: "8+ hours / Manual Review"
});

const EVIDENCE_STATUSES = Object.freeze({
  REQUIREMENT: {
    REQUIRED: "required",
    RECOMMENDED: "recommended",
    OPTIONAL: "optional",
    NOT_APPLICABLE: "not applicable"
  },
  AVAILABILITY: {
    AVAILABLE: "available",
    MISSING: "missing",
    UNCLEAR: "unclear"
  }
});

const EVIDENCE_CATEGORIES = Object.freeze([
  "identity/contact",
  "contract/booking documents",
  "invoices/bills",
  "payment proof",
  "correspondence",
  "photographs",
  "technical reports",
  "statements",
  "chronology",
  "financial loss evidence",
  "complaint response",
  "final response/deadlock letter",
  "submission confirmation"
]);

const REASON_CODES = Object.freeze({
  SINGLE_SIMPLE_SUBMISSION: "SINGLE_SIMPLE_SUBMISSION",
  PORTAL_SUBMISSION_REQUIRED: "PORTAL_SUBMISSION_REQUIRED",
  MULTIPLE_ISSUES: "MULTIPLE_ISSUES",
  MISSING_CORE_INFORMATION: "MISSING_CORE_INFORMATION",
  MULTIPLE_DOCUMENTS: "MULTIPLE_DOCUMENTS",
  FINANCIAL_RECONSTRUCTION: "FINANCIAL_RECONSTRUCTION",
  LONG_CHRONOLOGY: "LONG_CHRONOLOGY",
  MULTIPLE_RESPONDENTS: "MULTIPLE_RESPONDENTS",
  FOLLOW_UP_REQUIRED: "FOLLOW_UP_REQUIRED",
  ESCALATION_STAGE: "ESCALATION_STAGE",
  TECHNICAL_EVIDENCE: "TECHNICAL_EVIDENCE",
  DEBT_COLLECTION_PRESENT: "DEBT_COLLECTION_PRESENT",
  ROUTE_REQUIRES_VERIFICATION: "ROUTE_REQUIRES_VERIFICATION",
  MANUAL_SCOPE_REVIEW: "MANUAL_SCOPE_REVIEW"
});

const PUBLIC_REASON_TEXT = Object.freeze({
  [REASON_CODES.SINGLE_SIMPLE_SUBMISSION]: "The information suggests a single, relatively straightforward submission task.",
  [REASON_CODES.PORTAL_SUBMISSION_REQUIRED]: "The complaint route may require a portal or structured submission process.",
  [REASON_CODES.MULTIPLE_ISSUES]: "Several complaint issues may need to be organised clearly.",
  [REASON_CODES.MISSING_CORE_INFORMATION]: "Some core information appears to be missing or unclear.",
  [REASON_CODES.MULTIPLE_DOCUMENTS]: "Several documents may need to be reviewed and put in order.",
  [REASON_CODES.FINANCIAL_RECONSTRUCTION]: "The financial position may need to be reconstructed from available records.",
  [REASON_CODES.LONG_CHRONOLOGY]: "The chronology appears to cover a longer sequence of events.",
  [REASON_CODES.MULTIPLE_RESPONDENTS]: "More than one respondent or organisation may be involved.",
  [REASON_CODES.FOLLOW_UP_REQUIRED]: "The complaint appears to involve follow-up after an initial response.",
  [REASON_CODES.ESCALATION_STAGE]: "The matter appears to be at, or approaching, an escalation stage.",
  [REASON_CODES.TECHNICAL_EVIDENCE]: "Technical or specialist evidence may need to be organised.",
  [REASON_CODES.DEBT_COLLECTION_PRESENT]: "Debt collection or arrears activity may need careful administration.",
  [REASON_CODES.ROUTE_REQUIRES_VERIFICATION]: "The correct complaint or escalation route should be checked before submission.",
  [REASON_CODES.MANUAL_SCOPE_REVIEW]: "The scope appears to require manual service review before a fee is suggested."
});

const SERVICE_LEVELS = Object.freeze({
  "QCMS-L1": {
    serviceCode: "QCMS-L1",
    displayName: "Complaint Submission Service",
    currency: "GBP",
    standardFeePence: 5900,
    vatTreatment: "To be confirmed before launch",
    effectiveFrom: "2026-07-28",
    scopeSummary: "Basic administrative support for a simple, prepared complaint submission.",
    limitations: [
      "Does not guarantee an outcome.",
      "Does not replace the free DIY route.",
      "Does not include specialist legal or regulated advice."
    ],
    manualReviewTriggers: []
  },
  "QCMS-L2": {
    serviceCode: "QCMS-L2",
    displayName: "Managed Complaint Service",
    currency: "GBP",
    standardFeePence: 19900,
    vatTreatment: "To be confirmed before launch",
    effectiveFrom: "2026-07-28",
    scopeSummary: "Managed administration for a moderate complaint with multiple documents, issues or route steps.",
    limitations: [
      "Does not guarantee an outcome.",
      "Does not include specialist legal or regulated advice.",
      "Scope must be confirmed before any instruction."
    ],
    manualReviewTriggers: []
  },
  "QCMS-L3": {
    serviceCode: "QCMS-L3",
    displayName: "Enhanced Managed Complaint Service",
    currency: "GBP",
    standardFeePence: 34900,
    vatTreatment: "To be confirmed before launch",
    effectiveFrom: "2026-07-28",
    scopeSummary: "Enhanced administration where evidence audit, chronology work or financial reconstruction may be needed.",
    limitations: [
      "Does not guarantee an outcome.",
      "Does not include specialist legal or regulated advice.",
      "Scope must be confirmed before any instruction."
    ],
    manualReviewTriggers: [
      REASON_CODES.FINANCIAL_RECONSTRUCTION,
      REASON_CODES.LONG_CHRONOLOGY,
      REASON_CODES.TECHNICAL_EVIDENCE
    ]
  },
  "QCMS-REVIEW": {
    serviceCode: "QCMS-REVIEW",
    displayName: "Service Review Required",
    currency: "GBP",
    standardFeePence: null,
    vatTreatment: "Not applicable until scope is reviewed",
    effectiveFrom: "2026-07-28",
    scopeSummary: "Manual review is required before any service level or fee can be suggested.",
    limitations: [
      "No automatic fee is suggested.",
      "The Platform User can still continue with the free DIY Complaint Pack."
    ],
    manualReviewTriggers: [
      REASON_CODES.MANUAL_SCOPE_REVIEW,
      REASON_CODES.ROUTE_REQUIRES_VERIFICATION
    ]
  }
});

const FREE_DIY_MESSAGE = "Your Complaint Pack is complete. You can download it and submit it yourself free of charge.";
const CASE_SUMMARY_DISCLAIMER = "The Case Summary organises the information provided. It does not predict whether the complaint will succeed.";
const PART1A_LOCAL_ONLY_NOTICE = "Part 1A keeps all QCMS prototype data local. It does not submit information to Quaerens, collect payment, create a CRM case or create a QCMS instruction.";

module.exports = {
  ARCHITECTURE_VERSION,
  SCHEMA_VERSION,
  VALUE_STATES,
  CONSENT_STATES,
  TRANSFER_STATES,
  INSTRUCTION_STATES,
  PAYMENT_STATES,
  SIGNATURE_STATES,
  COMPLEXITY_LEVELS,
  READINESS_STATUSES,
  ADMINISTRATION_BANDS,
  EVIDENCE_STATUSES,
  EVIDENCE_CATEGORIES,
  REASON_CODES,
  PUBLIC_REASON_TEXT,
  SERVICE_LEVELS,
  FREE_DIY_MESSAGE,
  CASE_SUMMARY_DISCLAIMER,
  PART1A_LOCAL_ONLY_NOTICE
};
