const assert = require("assert");
const {
  ARCHITECTURE_VERSION,
  SCHEMA_VERSION,
  REASON_CODES,
  EVIDENCE_STATUSES
} = require("./qcms.config");
const { normaliseCaseSummary } = require("./qcms.case-summary");
const { recommendQCMSService } = require("./qcms.recommendation");
const { renderQCMSExperience, escapeHtml } = require("./qcms.render");
const { getServiceLevel } = require("./qcms.pricing");
const {
  flightFixture,
  energyFixture,
  carFinanceFixture,
  manualReviewFixture,
  holidayFixture,
  incompleteFixture
} = require("./qcms.fixtures");

function assertIncludes(haystack, needle, message) {
  assert(haystack.includes(needle), message || `Expected output to include ${needle}`);
}

function assertNotIncludes(haystack, needle, message) {
  assert(!haystack.includes(needle), message || `Expected output not to include ${needle}`);
}

function assertSafePublicOutput(html) {
  [
    "QCBF",
    "SINGLE_SIMPLE_SUBMISSION",
    "PORTAL_SUBMISSION_REQUIRED",
    "MULTIPLE_ISSUES",
    "MISSING_CORE_INFORMATION",
    "FINANCIAL_RECONSTRUCTION",
    "best value",
    "most popular",
    "limited availability",
    "claim now",
    "buy now",
    "win probability",
    "success score"
  ].forEach((phrase) => assertNotIncludes(html.toLowerCase(), phrase.toLowerCase()));
  assertNotIncludes(html, "<script>");
  assertIncludes(html, "does not assess legal merit, predict the result or guarantee any outcome");
  assertIncludes(html, "Your Complaint Pack is complete.");
  assert(html.indexOf("Your Complaint Pack is complete.") < html.indexOf("Recommended Service"));
  assertIncludes(html, "Continue with Free DIY");
  assertIncludes(html, "Explore QCMS");
  assertIncludes(html, "Exploring QCMS does not send your information to Quaerens");
  assertIncludes(html, "Nothing is transferred until");
  assertIncludes(html, "No CRM connection is enabled");
  assertIncludes(html, "No payment implementation is enabled");
}

function run() {
  assert.strictEqual(ARCHITECTURE_VERSION, "1.0.0-alpha.4");
  assert.strictEqual(SCHEMA_VERSION, "1.0.0");

  const flight = recommendQCMSService(flightFixture);
  assert.strictEqual(flight.serviceCode, "QCMS-L1");
  const flightHtml = renderQCMSExperience(flightFixture);
  assertIncludes(flightHtml, "Complaint Submission Service");
  assertIncludes(flightHtml, "£ 59");
  assertIncludes(flightHtml, "Authority to Use My Complaint Pack");
  assertIncludes(flightHtml, "Information Accuracy");
  assertIncludes(flightHtml, "Digital Signature");
  assertIncludes(flightHtml, "CRM handover payload schema");
  assertSafePublicOutput(flightHtml);

  const energy = recommendQCMSService(energyFixture);
  assert.strictEqual(energy.serviceCode, "QCMS-L2");
  const energyHtml = renderQCMSExperience(energyFixture);
  assertIncludes(energyHtml, "Managed Complaint Service");
  assertIncludes(energyHtml, "£ 199");
  assertSafePublicOutput(energyHtml);

  const carFinance = recommendQCMSService(carFinanceFixture);
  assert(["QCMS-L3", "QCMS-REVIEW"].includes(carFinance.serviceCode));
  const carFinanceHtml = renderQCMSExperience(carFinanceFixture);
  assertIncludes(carFinanceHtml, carFinance.serviceName);
  assertSafePublicOutput(carFinanceHtml);

  const manual = recommendQCMSService(manualReviewFixture);
  assert.strictEqual(manual.serviceCode, "QCMS-REVIEW");
  assert.strictEqual(manual.manualReviewRequired, true);
  const manualHtml = renderQCMSExperience(manualReviewFixture);
  assertIncludes(manualHtml, "Service Review Required");
  assertIncludes(manualHtml, "Manual review required");
  assertIncludes(manualHtml, "Request Service Review");
  assertIncludes(manualHtml, "No information has been sent to Quaerens.");
  assertNotIncludes(manualHtml, "Final total payable");
  assertSafePublicOutput(manualHtml);

  const incompleteHtml = renderQCMSExperience(incompleteFixture);
  assertIncludes(incompleteHtml, "Not yet recorded");
  assertIncludes(incompleteHtml, "Information to Review");
  assertSafePublicOutput(incompleteHtml);

  const hostile = renderQCMSExperience(normaliseCaseSummary({
    complaintTitle: "<img src=x onerror=alert(1)>",
    complaintCategory: "Test",
    complaintType: "Hostile",
    complaintIssues: ["<script>alert(1)</script>"],
    respondent: "<b>Respondent</b>",
    evidenceItems: [
      { name: "<script>alert(2)</script>", category: "correspondence", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.MISSING }
    ],
    generatedDocuments: ["Complaint Pack"]
  }));
  assertIncludes(hostile, "&lt;img");
  assertNotIncludes(hostile, "<img src=x");
  assertNotIncludes(hostile, "<script>");

  const disputedValueOnly = renderQCMSExperience(normaliseCaseSummary({
    sourceBuilder: "parking",
    complaintCategory: "Parking",
    complaintType: "Parking charge",
    complaintTitle: "High value alone",
    complaintIssues: ["Parking charge"],
    financialPosition: { disputedValuePence: 9000000, hasFinancialReconstructionNeed: false },
    evidenceItems: [
      { name: "Parking notice", category: "correspondence", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE }
    ],
    generatedDocuments: ["Appeal pack"]
  }));
  assertIncludes(disputedValueOnly, "Complaint Submission Service");

  const vulnerable = renderQCMSExperience(normaliseCaseSummary({
    sourceBuilder: "gym",
    complaintCategory: "Fitness",
    complaintType: "Gym cancellation",
    complaintTitle: "Vulnerability does not alter fee",
    complaintIssues: ["Cancellation issue"],
    vulnerabilityIndicators: ["Accessibility need recorded"],
    evidenceItems: [
      { name: "Membership agreement", category: "contract/booking documents", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE }
    ],
    generatedDocuments: ["Complaint pack"]
  }));
  assertIncludes(vulnerable, "Complaint Submission Service");

  const l1Fee = getServiceLevel("QCMS-L1").standardFeePence;
  assert.strictEqual(l1Fee, 5900);
  assertIncludes(flightHtml, "£ 59");

  assertIncludes(flightHtml, "qcms-health-grid");
  assertIncludes(flightHtml, "qcms-comparison-table");
  assertIncludes(flightHtml, "data-qcms-architecture=\"1.0.0-alpha.4\"");

  const deterministicA = renderQCMSExperience(holidayFixture);
  const deterministicB = renderQCMSExperience(holidayFixture);
  assert.strictEqual(deterministicA, deterministicB);

  console.log("QCMS Part 1B UI tests passed");
}

if (require.main === module) {
  run();
}

module.exports = { run };
