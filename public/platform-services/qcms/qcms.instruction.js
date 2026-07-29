const {
  ARCHITECTURE_VERSION,
  SCHEMA_VERSION,
  CONSENT_STATES,
  INSTRUCTION_STATES,
  PAYMENT_STATES,
  SIGNATURE_STATES,
  TRANSFER_STATES
} = require("./qcms.config");
const { getServiceLevel } = require("./qcms.pricing");

const AUTHORITY_TEXT = "I authorise Quaerens Ltd to access and use the Complaint Pack, documents and supporting information I created solely for the purpose of providing the purchased Quaerens Complaint Management Service.";
const AUTHORITY_OWNERSHIP_TEXT = "Ownership of my information remains with me. Authority applies only to the instructed complaint.";
const ACCURACY_TEXT = "I confirm the information contained within my Complaint Pack is true and accurate to the best of my knowledge.";
const ACCURACY_RELIANCE_TEXT = "Quaerens relies upon the information supplied.";
const PRIVACY_GATE_TEXT = "Nothing is transferred until authority is accepted, the agreement is accepted, the digital signature is completed and payment is confirmed. Only then may QCMS create the CRM case.";
const NO_AUTOMATION_TEXT = "This prototype does not collect payment, create live signatures, create CRM cases or transfer Complaint Pack data.";

const AGREEMENT_SECTIONS = Object.freeze([
  "Summary",
  "Scope",
  "Fee",
  "Limitations",
  "Client responsibilities",
  "Quaerens responsibilities",
  "Cancellation",
  "Refund policy placeholder",
  "Privacy",
  "Data processing"
]);

const PAYMENT_PROVIDERS = Object.freeze([
  "Revolut",
  "Stripe",
  "PayPal",
  "Apple Pay",
  "Google Pay"
]);

const CRM_PAYLOAD_FIELDS = Object.freeze([
  "caseSummary",
  "recommendation",
  "service",
  "fee",
  "authority",
  "agreementAccepted",
  "signatureStatus",
  "paymentStatus",
  "generatedDocuments",
  "evidence",
  "complaintCategory",
  "platformUser"
]);

const AUDIT_EVENT_TYPES = Object.freeze([
  "Authority viewed",
  "Authority accepted",
  "Agreement viewed",
  "Agreement accepted",
  "Signature completed",
  "Payment started",
  "Payment cancelled",
  "Payment successful",
  "CRM created",
  "Transfer completed"
]);

const FAILURE_STATES = Object.freeze([
  {
    code: "PAYMENT_CANCELLED",
    label: "Payment cancelled",
    recovery: "The Platform User can return to the secure payment step when ready. No CRM case is created."
  },
  {
    code: "SIGNATURE_CANCELLED",
    label: "Signature cancelled",
    recovery: "The instruction remains incomplete until the signature step is completed."
  },
  {
    code: "BROWSER_CLOSED",
    label: "Browser closed",
    recovery: "The Platform User can reopen the flow and review any locally saved information."
  },
  {
    code: "TRANSFER_FAILED",
    label: "Transfer failed",
    recovery: "The workflow should pause and explain that the transfer must be retried before any CRM case is created."
  },
  {
    code: "CRM_UNAVAILABLE",
    label: "CRM unavailable",
    recovery: "The workflow should hold the completed instruction securely until the CRM handover is available."
  },
  {
    code: "AUTHORITY_WITHDRAWN",
    label: "Authority withdrawn",
    recovery: "The instruction stops unless authority is granted again."
  },
  {
    code: "CONSENT_REVOKED",
    label: "Consent revoked",
    recovery: "The instruction stops and no further processing should continue unless consent is renewed."
  },
  {
    code: "INCOMPLETE_AGREEMENT",
    label: "Incomplete agreement",
    recovery: "The Platform User must review and accept the Service Agreement before progressing."
  }
]);

function nowIso() {
  return new Date().toISOString();
}

function getIndicativeFee(recommendation) {
  if (!recommendation || recommendation.manualReviewRequired) return "Manual review required";
  const service = getServiceLevel(recommendation.serviceCode);
  if (!service || service.standardFeePence === null || service.standardFeePence === undefined) return recommendation.indicativeFee || "Manual review required";
  return `${service.currency} ${(service.standardFeePence / 100).toFixed(0)}`;
}

function createAuditEvent(event, status = "recorded", timestamp = nowIso()) {
  return Object.freeze({
    timestamp,
    event,
    status
  });
}

function createServiceConfirmation(caseSummary, recommendation) {
  return Object.freeze({
    title: "Quaerens Complaint Management Service",
    complaintPack: caseSummary && caseSummary.complaintTitle ? caseSummary.complaintTitle : "Complaint Pack",
    recommendedService: recommendation && recommendation.serviceName ? recommendation.serviceName : "Service Review Required",
    indicativeFee: getIndicativeFee(recommendation),
    serviceScope: recommendation && recommendation.serviceCode ? recommendation.serviceCode : "QCMS-REVIEW",
    estimatedAdministration: recommendation && recommendation.administrationEstimate ? recommendation.administrationEstimate : "Manual review required",
    caseSummary
  });
}

function createAuthorityContract() {
  return Object.freeze({
    heading: "Authority to Use My Complaint Pack",
    text: AUTHORITY_TEXT,
    ownershipText: AUTHORITY_OWNERSHIP_TEXT,
    checkboxRequired: true,
    preSelected: false,
    consentState: CONSENT_STATES.NOT_REQUESTED
  });
}

function createAccuracyContract() {
  return Object.freeze({
    heading: "Information Accuracy",
    text: ACCURACY_TEXT,
    relianceText: ACCURACY_RELIANCE_TEXT,
    checkboxRequired: true,
    preSelected: false,
    consentState: CONSENT_STATES.NOT_REQUESTED
  });
}

function createServiceAgreementArchitecture(recommendation) {
  return Object.freeze({
    documentType: "QCMS Service Agreement Placeholder",
    finalLegalTerms: false,
    serviceCode: recommendation && recommendation.serviceCode ? recommendation.serviceCode : "QCMS-REVIEW",
    sections: AGREEMENT_SECTIONS,
    status: "architecture placeholder only"
  });
}

function createSignatureArchitecture() {
  return Object.freeze({
    status: SIGNATURE_STATES.NOT_STARTED,
    typedName: null,
    date: null,
    timestamp: null,
    ipPlaceholder: "IP address placeholder - not collected in prototype",
    browserPlaceholder: "Browser placeholder - not collected in prototype",
    devicePlaceholder: "Device placeholder - not collected in prototype"
  });
}

function createPaymentArchitecture(recommendation) {
  return Object.freeze({
    status: PAYMENT_STATES.NOT_STARTED,
    implementation: false,
    indicativeFee: getIndicativeFee(recommendation),
    providers: PAYMENT_PROVIDERS,
    interfaces: PAYMENT_PROVIDERS.map((provider) => ({
      provider,
      canStartPayment: false,
      requiresRedirectOrWallet: provider === "Apple Pay" || provider === "Google Pay",
      status: PAYMENT_STATES.NOT_STARTED
    }))
  });
}

function createCRMPayloadSchema(caseSummary, recommendation) {
  return Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    architectureVersion: ARCHITECTURE_VERSION,
    fields: CRM_PAYLOAD_FIELDS,
    payload: {
      caseSummary,
      recommendation,
      service: recommendation && recommendation.serviceCode ? recommendation.serviceCode : "QCMS-REVIEW",
      fee: getIndicativeFee(recommendation),
      authority: CONSENT_STATES.NOT_REQUESTED,
      agreementAccepted: false,
      signatureStatus: SIGNATURE_STATES.NOT_STARTED,
      paymentStatus: PAYMENT_STATES.NOT_STARTED,
      generatedDocuments: caseSummary && caseSummary.generatedDocuments ? caseSummary.generatedDocuments : [],
      evidence: caseSummary && caseSummary.evidenceItems ? caseSummary.evidenceItems : [],
      complaintCategory: caseSummary && caseSummary.complaintCategory ? caseSummary.complaintCategory : null,
      platformUser: caseSummary && caseSummary.platformUser ? caseSummary.platformUser : null
    },
    connectionEnabled: false
  });
}

function createInstructionWorkflow(caseSummary, recommendation) {
  const auditTrail = [
    createAuditEvent("Authority viewed", "available in prototype"),
    createAuditEvent("Agreement viewed", "available in prototype")
  ];
  return Object.freeze({
    architectureVersion: ARCHITECTURE_VERSION,
    schemaVersion: SCHEMA_VERSION,
    instructionState: INSTRUCTION_STATES.NOT_STARTED,
    transferState: TRANSFER_STATES.LOCAL_ONLY,
    serviceConfirmation: createServiceConfirmation(caseSummary, recommendation),
    authority: createAuthorityContract(),
    accuracy: createAccuracyContract(),
    agreement: createServiceAgreementArchitecture(recommendation),
    signature: createSignatureArchitecture(),
    payment: createPaymentArchitecture(recommendation),
    crm: createCRMPayloadSchema(caseSummary, recommendation),
    auditTrail,
    auditEventTypes: AUDIT_EVENT_TYPES,
    failureStates: FAILURE_STATES,
    privacyGate: PRIVACY_GATE_TEXT,
    noAutomationNotice: NO_AUTOMATION_TEXT
  });
}

function canCreateCRMCase(workflow) {
  if (!workflow) return false;
  return workflow.authority.consentState === CONSENT_STATES.ACCEPTED &&
    workflow.accuracy.consentState === CONSENT_STATES.ACCEPTED &&
    workflow.signature.status === SIGNATURE_STATES.COMPLETED &&
    workflow.payment.status === PAYMENT_STATES.CONFIRMED;
}

module.exports = {
  AUTHORITY_TEXT,
  AUTHORITY_OWNERSHIP_TEXT,
  ACCURACY_TEXT,
  ACCURACY_RELIANCE_TEXT,
  PRIVACY_GATE_TEXT,
  NO_AUTOMATION_TEXT,
  AGREEMENT_SECTIONS,
  PAYMENT_PROVIDERS,
  CRM_PAYLOAD_FIELDS,
  AUDIT_EVENT_TYPES,
  FAILURE_STATES,
  createAuditEvent,
  createServiceConfirmation,
  createAuthorityContract,
  createAccuracyContract,
  createServiceAgreementArchitecture,
  createSignatureArchitecture,
  createPaymentArchitecture,
  createCRMPayloadSchema,
  createInstructionWorkflow,
  canCreateCRMCase
};
