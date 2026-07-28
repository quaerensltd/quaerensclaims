const { SERVICE_LEVELS } = require("./qcms.config");

const QCMS_PUBLIC_COPY = Object.freeze({
  completionTitle: "Your Complaint Pack is complete.",
  completionText: "You can download your Complaint Pack and submit it yourself free of charge. If you would prefer Quaerens to review, prepare and manage the complaint process for you, you may explore the optional Quaerens Complaint Management Service(TM) below.",
  freeDIYTitle: "Continue with Free DIY",
  freeDIYText: "Download your Complaint Pack and submit it independently.",
  exploreTitle: "Explore QCMS",
  exploreText: "Review the optional service scope before deciding whether to instruct Quaerens.",
  scoreDisclaimer: "These indicators measure how complete and organised your Complaint Pack appears based on the information you provided. This does not assess legal merit, predict the result or guarantee any outcome.",
  privacyMessage: "Your Complaint Pack currently remains stored locally in your browser. Exploring QCMS does not send your information to Quaerens. Nothing will be transferred unless you later give clear permission during the instruction process.",
  feeDisclaimer: "The final service scope and fee will be confirmed before any instruction or payment is accepted.",
  choiceText: "Some Platform Users prefer to submit complaints themselves. Others prefer Quaerens to manage the administration. The choice is entirely yours.",
  manualReviewNoTransfer: "No information has been sent to Quaerens.",
  unavailableRecommendation: "We could not generate a service recommendation from the available information. Your free Complaint Pack remains available. Review the missing information or continue with the DIY route."
});

const SERVICE_DISPLAY_CONTENT = Object.freeze({
  "QCMS-L1": {
    publicName: "Complaint Submission Service",
    description: "For straightforward Complaint Packs that are substantially complete and require review and correct submission through the appropriate email address, portal or complaint form.",
    included: [
      "Basic review of the completed Complaint Pack",
      "Basic information check",
      "Confirmation of the submission route",
      "Submission through the appropriate route",
      "Retention of submission confirmation",
      "Copy of the submitted complaint"
    ],
    notIncluded: [
      "Extensive evidence reconstruction",
      "Repeated correspondence",
      "Detailed financial schedules",
      "External escalation",
      "Legal representation",
      "Court proceedings"
    ],
    separateAgreement: [
      "Further follow-up after the initial submission",
      "External escalation support",
      "Specialist or regulated support if needed"
    ]
  },
  "QCMS-L2": {
    publicName: "Managed Complaint Service",
    description: "For complaints involving several documents, multiple issues, billing or financial discrepancies, or information that requires review before submission.",
    included: [
      "Review of the Complaint Pack",
      "Review of supporting evidence",
      "Identification of missing information",
      "Reasonable request for missing documentation",
      "Preparation of the final complaint",
      "Organisation of supporting documents",
      "Submission through the appropriate route",
      "Monitoring of the initial complaint stage",
      "One reasonable follow-up where included in the confirmed scope",
      "Progress updates"
    ],
    notIncluded: [
      "Litigation",
      "Legal representation",
      "Independent expert reports",
      "Multiple external appeals",
      "Unrelated complaints",
      "Open-ended case management"
    ],
    separateAgreement: [
      "Additional complaint stages",
      "External ombudsman or tribunal preparation",
      "Specialist evidence or professional reports"
    ]
  },
  "QCMS-L3": {
    publicName: "Enhanced Managed Complaint Service",
    description: "For more complex complaints involving substantial evidence, incomplete financial information, multiple transactions, detailed chronology or a higher administrative workload.",
    included: [
      "Detailed evidence audit",
      "Structured missing-information review",
      "Chronology preparation",
      "Financial schedule preparation where relevant",
      "Multiple-issue complaint preparation",
      "Complaint bundle organisation",
      "Submission",
      "Agreed follow-ups",
      "Management through the initial formal complaint outcome within the confirmed scope"
    ],
    notIncluded: [
      "Court proceedings",
      "Solicitor representation",
      "Expert witness work",
      "Independent technical reports",
      "Unlimited correspondence",
      "Appeals outside the confirmed service scope"
    ],
    separateAgreement: [
      "Extended complaint management",
      "Specialist technical reports",
      "External appeal stages"
    ]
  },
  "QCMS-REVIEW": {
    publicName: "Service Review Required",
    description: "Your complaint may fall outside the standard fixed-fee service levels. This may be because it involves court proceedings, several unrelated complaints, an unclear jurisdiction, specialist technical evidence or a scope that requires individual review.",
    included: [
      "Individual service-scope review before any fee is suggested",
      "Confirmation that no automatic payment is being offered",
      "The free DIY route remains available"
    ],
    notIncluded: [
      "Automatic fixed-fee checkout",
      "Payment collection",
      "Legal representation unless separately confirmed",
      "Any instruction before a future agreement is accepted"
    ],
    separateAgreement: [
      "Any managed service after scope review",
      "Specialist or regulated support if needed"
    ]
  }
});

const PLATFORM_USER_RESPONSIBILITIES = Object.freeze([
  "Providing accurate information",
  "Supplying requested documents",
  "Checking factual accuracy",
  "Responding to reasonable information requests",
  "Informing Quaerens of relevant correspondence",
  "Retaining original records"
]);

const DIY_QCMS_COMPARISON = Object.freeze([
  ["Complaint Pack generated", "Included", "Included"],
  ["PDF/RTF/TXT downloads", "Included", "Included"],
  ["Evidence checklist", "Included", "Included"],
  ["Timeline", "Included", "Included"],
  ["Official routes", "Included", "Included"],
  ["Review by Quaerens", "Platform User handles this", "Quaerens handles this where included"],
  ["Missing information identified by a person", "Platform User handles this", "Quaerens handles this where included"],
  ["Submission handled", "Platform User handles this", "Quaerens handles this where included"],
  ["Portal form completed where included", "Platform User handles this", "Depends on confirmed scope"],
  ["Supporting documents organised", "Platform User handles this", "Quaerens handles this where included"],
  ["Initial complaint monitored", "Platform User handles this", "Depends on confirmed scope"],
  ["Follow-up included where specified", "Platform User handles this", "Depends on confirmed scope"]
]);

const FUTURE_CONSENT_PREVIEW = Object.freeze([
  "Review your Case Summary",
  "Confirm the service scope",
  "Authorise transfer of the Complaint Pack",
  "Confirm information accuracy",
  "Agree to the Service Agreement",
  "Sign digitally",
  "Make secure payment"
]);

function getServiceDisplayContent(serviceCode) {
  return SERVICE_DISPLAY_CONTENT[serviceCode] || SERVICE_DISPLAY_CONTENT["QCMS-REVIEW"];
}

function getServiceFeeLabel(serviceCode) {
  const service = SERVICE_LEVELS[serviceCode] || SERVICE_LEVELS["QCMS-REVIEW"];
  if (service.standardFeePence === null) return "Manual review required";
  return `${service.currency === "GBP" ? "£" : service.currency} ${Math.round(service.standardFeePence / 100)}`;
}

module.exports = {
  QCMS_PUBLIC_COPY,
  SERVICE_DISPLAY_CONTENT,
  PLATFORM_USER_RESPONSIBILITIES,
  DIY_QCMS_COMPARISON,
  FUTURE_CONSENT_PREVIEW,
  getServiceDisplayContent,
  getServiceFeeLabel
};
