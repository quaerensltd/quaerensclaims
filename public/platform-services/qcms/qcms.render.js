const { SCHEMA_VERSION, ARCHITECTURE_VERSION, TRANSFER_STATES, VALUE_STATES, PUBLIC_REASON_TEXT } = require("./qcms.config");
const { validateCaseSummary } = require("./qcms.validation");
const { recommendQCMSService } = require("./qcms.recommendation");
const { getServiceLevel } = require("./qcms.pricing");
const { createInstructionWorkflow } = require("./qcms.instruction");
const {
  QCMS_PUBLIC_COPY,
  PLATFORM_USER_RESPONSIBILITIES,
  DIY_QCMS_COMPARISON,
  FUTURE_CONSENT_PREVIEW,
  getServiceDisplayContent,
  getServiceFeeLabel
} = require("./qcms.content");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normaliseDisplayValue(value) {
  if (value === null || value === undefined || value === "" || value === VALUE_STATES.UNKNOWN) return "Not yet recorded";
  if (value === VALUE_STATES.NOT_APPLICABLE) return "Not applicable";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not yet recorded";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function list(items, className = "qcms-list") {
  const safeItems = (items || []).filter(Boolean);
  if (!safeItems.length) return "";
  return `<ul class="${className}">${safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function fieldRows(rows) {
  return rows
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== "" && !(Array.isArray(row.value) && !row.value.length))
    .map((row) => `<div class="qcms-summary-row"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(normaliseDisplayValue(row.value))}</dd></div>`)
    .join("");
}

function explanationFor(label, value) {
  const map = {
    "Evidence Completeness": "Shows whether essential, recommended and optional evidence appears available or still needs review.",
    "Chronology Completeness": "Shows whether the sequence of events appears clear enough for complaint preparation.",
    "Financial Information Completeness": "Shows whether figures and supporting financial records appear organised.",
    "Complaint Readiness": "Shows the current preparation stage of the Complaint Pack.",
    Complexity: "Shows the likely administrative complexity, not legal merit.",
    "Overall Case Health": "A plain-English summary of preparation status, not a prediction.",
    "Estimated Administration": "Estimated Quaerens administration time if a managed service is later instructed."
  };
  return map[label] || value;
}

function renderHealthCard(label, value) {
  const safeValue = normaliseDisplayValue(value);
  return `<article class="qcms-health-card" aria-label="${escapeHtml(label)}: ${escapeHtml(safeValue)}">
    <span class="qcms-health-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(safeValue)}</strong>
    <p>${escapeHtml(explanationFor(label, safeValue))}</p>
  </article>`;
}

function renderEvidence(summary) {
  const items = summary.evidenceItems || [];
  const groups = {
    "Essential before submission": [],
    "Helpful but not essential": [],
    "May be relevant later": []
  };
  items.forEach((item) => {
    const line = `${normaliseDisplayValue(item.name)} - ${normaliseDisplayValue(item.availabilityStatus)}${item.availabilityStatus === "missing" ? ". This may help support or verify the complaint route." : ""}`;
    if (item.requirementStatus === "required") groups["Essential before submission"].push(line);
    else if (item.requirementStatus === "recommended") groups["Helpful but not essential"].push(line);
    else groups["May be relevant later"].push(line);
  });
  return Object.entries(groups).map(([heading, values]) => values.length ? `<div class="qcms-evidence-group"><h4>${escapeHtml(heading)}</h4>${list(values)}</div>` : "").join("");
}

function buildMissingItems(summary, recommendation) {
  const missing = [];
  if (!summary.respondent || (Array.isArray(summary.respondent) && !summary.respondent.length)) missing.push("Respondent or supplier details");
  if (!summary.complaintType) missing.push("Complaint type");
  if (!summary.chronology || !summary.chronology.length) missing.push("Chronology or key dates");
  if (!summary.financialPosition || summary.financialPosition.disputedValuePence === null || summary.financialPosition.disputedValuePence === undefined) missing.push("Financial values where relevant");
  (summary.evidenceItems || []).forEach((item) => {
    if (item.availabilityStatus === "missing") missing.push(item.name);
    if (item.availabilityStatus === "unclear") missing.push(`${item.name} status`);
  });
  (recommendation.missingRequirements || []).forEach((field) => missing.push(field));
  return [...new Set(missing)].filter(Boolean);
}

function renderRecommendation(summary, recommendation) {
  const service = getServiceLevel(recommendation.serviceCode);
  const content = getServiceDisplayContent(recommendation.serviceCode);
  const fee = recommendation.manualReviewRequired ? "Manual review required" : getServiceFeeLabel(recommendation.serviceCode);
  const primaryReason = recommendation.primaryReasons && recommendation.primaryReasons[0] ? recommendation.primaryReasons[0] : QCMS_PUBLIC_COPY.unavailableRecommendation;
  return `<section class="qcms-section qcms-recommendation" aria-labelledby="qcms-recommended-service">
    <p class="qcms-kicker">Recommended Service</p>
    <h2 id="qcms-recommended-service">${escapeHtml(content.publicName || service.displayName)}</h2>
    <div class="qcms-rec-grid">
      <div><span>Indicative Service Fee</span><strong>${escapeHtml(fee)}</strong></div>
      <div><span>Complexity</span><strong>${escapeHtml(recommendation.complexity)}</strong></div>
      <div><span>Estimated Administration</span><strong>${escapeHtml(recommendation.administrationEstimate)}</strong></div>
      <div><span>Manual Review</span><strong>${recommendation.manualReviewRequired ? "Required" : "Not currently required"}</strong></div>
    </div>
    <p>${escapeHtml(content.description)}</p>
    <p><strong>Reason:</strong> ${escapeHtml(primaryReason)}</p>
    <p class="qcms-muted">${escapeHtml(QCMS_PUBLIC_COPY.feeDisclaimer)}</p>
  </section>`;
}

function renderWhyRecommended(recommendation) {
  const reasons = [...(recommendation.primaryReasons || []), ...(recommendation.secondaryReasons || [])].filter(Boolean);
  return `<section class="qcms-section" aria-labelledby="qcms-why-service">
    <h2 id="qcms-why-service">Why this service has been recommended</h2>
    ${reasons.length ? list(reasons, "qcms-check-list") : `<p>${escapeHtml(QCMS_PUBLIC_COPY.unavailableRecommendation)}</p>`}
  </section>`;
}

function renderScope(recommendation) {
  const content = getServiceDisplayContent(recommendation.serviceCode);
  return `<section class="qcms-section" aria-labelledby="qcms-scope">
    <h2 id="qcms-scope">Service scope</h2>
    <div class="qcms-scope-grid">
      <article><h3>Included in your recommended service</h3>${list(content.included)}</article>
      <article><h3>Not included</h3>${list(content.notIncluded)}</article>
      <article><h3>May require a separate agreement</h3>${list(content.separateAgreement)}</article>
      <article><h3>Platform User responsibilities</h3>${list(PLATFORM_USER_RESPONSIBILITIES)}</article>
    </div>
  </section>`;
}

function renderComparison() {
  const rows = DIY_QCMS_COMPARISON.map(([label, diy, qcms]) => `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(diy)}</td><td>${escapeHtml(qcms)}</td></tr>`).join("");
  return `<section class="qcms-section" aria-labelledby="qcms-comparison">
    <h2 id="qcms-comparison">Submit It Yourself or use Quaerens Complaint Management Service&trade;</h2>
    <p>${escapeHtml(QCMS_PUBLIC_COPY.choiceText)}</p>
    <div class="qcms-table-wrap"><table class="qcms-comparison-table">
      <thead><tr><th>Support area</th><th>Submit It Yourself</th><th>Quaerens Complaint Management Service&trade;</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderActions(recommendation) {
  const qcmsButton = recommendation.manualReviewRequired ? "Request Service Review - Explore QCMS" : "Explore QCMS";
  return `<section class="qcms-actions" aria-label="Choose your next step">
    <a class="qcms-action qcms-action-free" href="#free-diy"><strong>${escapeHtml(QCMS_PUBLIC_COPY.freeDIYTitle)}</strong><span>${escapeHtml(QCMS_PUBLIC_COPY.freeDIYText)}</span></a>
    <button class="qcms-action qcms-action-qcms" type="button" data-qcms-prototype-action="explore"><strong>${escapeHtml(qcmsButton)}</strong><span>${escapeHtml(QCMS_PUBLIC_COPY.exploreText)}</span></button>
  </section>`;
}

function renderConsentPreview() {
  return `<section class="qcms-section qcms-consent-preview" aria-labelledby="qcms-consent-preview">
    <p class="qcms-kicker">Coming in the instruction stage</p>
    <h2 id="qcms-consent-preview">Before Quaerens can manage your complaint</h2>
    ${list(FUTURE_CONSENT_PREVIEW)}
    <p class="qcms-muted">These confirmations are not collected during QCMS Version 1.0 Part 1B.</p>
  </section>`;
}

function renderInstructionWorkflow(summary, recommendation) {
  const workflow = createInstructionWorkflow(summary, recommendation);
  const confirmation = workflow.serviceConfirmation;
  const crmRows = workflow.crm.fields.map((field) => `<li>${escapeHtml(field)}</li>`).join("");
  const auditRows = workflow.auditEventTypes.map((event) => `<tr><td>${escapeHtml(event)}</td><td>timestamp</td><td>status</td></tr>`).join("");
  const failureCards = workflow.failureStates.map((state) => `<article class="qcms-failure-card"><h4>${escapeHtml(state.label)}</h4><p>${escapeHtml(state.recovery)}</p></article>`).join("");
  const paymentCards = workflow.payment.interfaces.map((payment) => `<article><h4>${escapeHtml(payment.provider)}</h4><p>Interface contract only. No payment implementation is enabled.</p></article>`).join("");
  return `<section class="qcms-section qcms-instruction" aria-labelledby="qcms-instruction-title">
    <p class="qcms-kicker">Instruction architecture</p>
    <h2 id="qcms-instruction-title">Quaerens Complaint Management Service&trade;</h2>
    <p>This universal workflow shows how a Platform User may later become a Client after service scope, authority, agreement, signature and payment are complete.</p>
    <div class="qcms-rec-grid">
      <div><span>Complaint Pack</span><strong>${escapeHtml(confirmation.complaintPack)}</strong></div>
      <div><span>Recommended Service</span><strong>${escapeHtml(confirmation.recommendedService)}</strong></div>
      <div><span>Indicative Fee</span><strong>${escapeHtml(confirmation.indicativeFee)}</strong></div>
      <div><span>Estimated Administration</span><strong>${escapeHtml(confirmation.estimatedAdministration)}</strong></div>
    </div>
    <div class="qcms-instruction-flow" aria-label="Universal QCMS workflow">
      <span>Complaint Pack Complete</span><span>Case Summary</span><span>Recommendation</span><span>Explore QCMS</span><span>Service Scope</span><span>Authority</span><span>Accuracy Confirmation</span><span>Service Agreement</span><span>Digital Signature</span><span>Secure Payment</span><span>CRM Case</span><span>Client</span>
    </div>
    <div class="qcms-scope-grid">
      <article><h3>${escapeHtml(workflow.authority.heading)}</h3><p>${escapeHtml(workflow.authority.text)}</p><p>${escapeHtml(workflow.authority.ownershipText)}</p><p><strong>Checkbox:</strong> required and not pre-selected.</p></article>
      <article><h3>${escapeHtml(workflow.accuracy.heading)}</h3><p>${escapeHtml(workflow.accuracy.text)}</p><p>${escapeHtml(workflow.accuracy.relianceText)}</p><p><strong>Checkbox:</strong> required and not pre-selected.</p></article>
      <article><h3>Service Agreement</h3>${list(workflow.agreement.sections)}<p class="qcms-muted">Architecture placeholder only. Final legal terms are not drafted in this phase.</p></article>
      <article><h3>Digital Signature</h3>${list(["Typed name", "Date", "Timestamp", workflow.signature.ipPlaceholder, workflow.signature.browserPlaceholder, workflow.signature.devicePlaceholder])}</article>
    </div>
    <section class="qcms-nested-panel" aria-labelledby="qcms-payment-architecture">
      <h3 id="qcms-payment-architecture">Secure payment architecture</h3>
      <div class="qcms-scope-grid">${paymentCards}</div>
    </section>
    <section class="qcms-nested-panel" aria-labelledby="qcms-crm-schema">
      <h3 id="qcms-crm-schema">CRM handover payload schema</h3>
      <p>No CRM connection is enabled. The schema defines the future handover contract only.</p>
      <ul class="qcms-list qcms-columns">${crmRows}</ul>
    </section>
    <section class="qcms-nested-panel" aria-labelledby="qcms-audit-model">
      <h3 id="qcms-audit-model">Audit trail model</h3>
      <div class="qcms-table-wrap"><table class="qcms-comparison-table"><thead><tr><th>Event</th><th>Timestamp</th><th>Status</th></tr></thead><tbody>${auditRows}</tbody></table></div>
    </section>
    <section class="qcms-nested-panel" aria-labelledby="qcms-failure-states">
      <h3 id="qcms-failure-states">Failure and recovery states</h3>
      <div class="qcms-failure-grid">${failureCards}</div>
    </section>
    <section class="qcms-privacy" aria-labelledby="qcms-instruction-privacy">
      <h3 id="qcms-instruction-privacy">Privacy gate</h3>
      <p>${escapeHtml(workflow.privacyGate)}</p>
      <p>${escapeHtml(workflow.noAutomationNotice)}</p>
    </section>
  </section>`;
}

function renderQCMSExperience(input, options = {}) {
  const validation = validateCaseSummary(input || {});
  const summary = validation.normalisedData;
  let recommendation;
  try {
    recommendation = recommendQCMSService(summary);
  } catch (error) {
    recommendation = null;
  }
  const safeRecommendation = recommendation || {
    serviceCode: "QCMS-REVIEW",
    serviceName: "Service Review Required",
    indicativeFee: "Manual review required",
    complexity: "Enhanced Review Required",
    administrationEstimate: "8+ hours / Manual Review",
    primaryReasons: [QCMS_PUBLIC_COPY.unavailableRecommendation],
    secondaryReasons: [],
    missingRequirements: validation.missingFields || [],
    manualReviewRequired: true,
    evidenceCompleteness: "Unclear",
    chronologyCompleteness: "Unclear",
    financialCompleteness: "Unclear",
    complaintReadiness: "Information Incomplete",
    validation
  };
  const missingItems = buildMissingItems(summary, safeRecommendation);
  const caseRows = fieldRows([
    { label: "Complaint Pack", value: summary.complaintTitle },
    { label: "Complaint Category", value: summary.complaintCategory },
    { label: "Respondent or Supplier", value: summary.respondent },
    { label: "Complaint Issues", value: summary.complaintIssues },
    { label: "Current Complaint Stage", value: summary.complaintStatus },
    { label: "Documents Generated", value: summary.generatedDocuments },
    { label: "Supporting Files", value: summary.supportingFiles },
    { label: "Last Updated", value: summary.updatedAt }
  ]);
  const healthCards = [
    ["Evidence Completeness", safeRecommendation.evidenceCompleteness],
    ["Chronology Completeness", safeRecommendation.chronologyCompleteness],
    ["Financial Information Completeness", safeRecommendation.financialCompleteness],
    ["Complaint Readiness", safeRecommendation.complaintReadiness],
    ["Complexity", safeRecommendation.complexity],
    ["Overall Case Health", validation.errors.length ? "Needs review" : "Organised enough to review"],
    ["Estimated Administration", safeRecommendation.administrationEstimate]
  ].map(([label, value]) => renderHealthCard(label, value)).join("");

  return `<main class="qcms-experience" data-qcms-architecture="${ARCHITECTURE_VERSION}">
    <section class="qcms-complete" aria-labelledby="qcms-complete-title">
      <p class="qcms-kicker">Complaint Pack completion</p>
      <h1 id="qcms-complete-title">${escapeHtml(QCMS_PUBLIC_COPY.completionTitle)}</h1>
      <p>${escapeHtml(QCMS_PUBLIC_COPY.completionText)}</p>
      <p id="free-diy" class="qcms-free-message">${escapeHtml(safeRecommendation.freeDIYMessage || QCMS_PUBLIC_COPY.freeDIYText)}</p>
    </section>
    <section class="qcms-section" aria-labelledby="qcms-summary-title">
      <h2 id="qcms-summary-title">Your Complaint Summary</h2>
      <dl class="qcms-summary-grid">${caseRows || `<div class="qcms-summary-row"><dt>Case Summary</dt><dd>Not yet recorded</dd></div>`}</dl>
      <p class="qcms-muted">${escapeHtml(safeRecommendation.caseSummaryDisclaimer || QCMS_PUBLIC_COPY.scoreDisclaimer)}</p>
    </section>
    <section class="qcms-section" aria-labelledby="qcms-health-title">
      <h2 id="qcms-health-title">Case Health indicators</h2>
      <p class="qcms-disclaimer">${escapeHtml(QCMS_PUBLIC_COPY.scoreDisclaimer)}</p>
      <div class="qcms-health-grid">${healthCards}</div>
    </section>
    <section class="qcms-section" aria-labelledby="qcms-evidence-title">
      <h2 id="qcms-evidence-title">Evidence and missing information</h2>
      ${renderEvidence(summary)}
      <div class="qcms-missing-panel"><h3>Information to Review</h3><p>Your Complaint Pack may be easier to review or submit if you add the following information.</p>${missingItems.length ? list(missingItems) : "<p>No major missing information was detected in this fixture.</p>"}</div>
    </section>
    ${renderRecommendation(summary, safeRecommendation)}
    ${renderWhyRecommended(safeRecommendation)}
    ${renderScope(safeRecommendation)}
    ${renderComparison()}
    <section class="qcms-section qcms-privacy" aria-labelledby="qcms-privacy">
      <h2 id="qcms-privacy">Privacy and transfer position</h2>
      <p>${escapeHtml(QCMS_PUBLIC_COPY.privacyMessage)}</p>
      <p><strong>Transfer status:</strong> ${escapeHtml(normaliseDisplayValue(summary.transferStatus || TRANSFER_STATES.LOCAL_ONLY))}</p>
      ${safeRecommendation.manualReviewRequired ? `<p>${escapeHtml(QCMS_PUBLIC_COPY.manualReviewNoTransfer)}</p>` : ""}
    </section>
    ${renderConsentPreview()}
    ${renderInstructionWorkflow(summary, safeRecommendation)}
    ${renderActions(safeRecommendation)}
  </main>`;
}

module.exports = {
  escapeHtml,
  normaliseDisplayValue,
  renderQCMSExperience
};
