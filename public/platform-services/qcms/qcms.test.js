const assert = require("assert");
const { ARCHITECTURE_VERSION, SCHEMA_VERSION, FREE_DIY_MESSAGE, TRANSFER_STATES, EVIDENCE_STATUSES } = require("./qcms.config");
const { QCMS_CASE_SUMMARY_FIELDS, normaliseCaseSummary } = require("./qcms.case-summary");
const { validateCaseSummary } = require("./qcms.validation");
const { recommendQCMSService } = require("./qcms.recommendation");
const { getPricingConfig } = require("./qcms.pricing");
const { safeParse, PART1A_STORAGE_POLICY } = require("./qcms.storage");
const { adaptBuilderStateToQCMSCaseSummary } = require("./qcms.adapter");
const {
  energyFixture,
  flightFixture,
  carFinanceFixture,
  manualReviewFixture
} = require("./qcms.fixtures");

function assertNoOutcomePrediction(text) {
  const joined = Array.isArray(text) ? text.join(" ") : String(text);
  assert(!/likely win|case strong|recover GBP|guarantee|claim approved|case accepted/i.test(joined));
}

function run() {
  assert.strictEqual(ARCHITECTURE_VERSION, "1.0.0-alpha.2");
  assert.strictEqual(SCHEMA_VERSION, "1.0.0");
  assert(QCMS_CASE_SUMMARY_FIELDS.includes("platformUser"));
  assert(QCMS_CASE_SUMMARY_FIELDS.includes("recommendedFee"));

  const energy = recommendQCMSService(energyFixture);
  assert.strictEqual(energy.serviceCode, "QCMS-L2");
  assert.strictEqual(energy.indicativeFee, "GBP 199");
  assert.strictEqual(energy.complexity, "Moderate");
  assert(["2-4 hours", "4-8 hours"].includes(energy.administrationEstimate));
  assert.strictEqual(energy.freeDIYMessage, FREE_DIY_MESSAGE);

  const flight = recommendQCMSService(flightFixture);
  assert.strictEqual(flight.serviceCode, "QCMS-L1");
  assert.strictEqual(flight.indicativeFee, "GBP 59");
  assert.strictEqual(flight.complexity, "Simple");
  assert.strictEqual(flight.evidenceCompleteness.status, "Supported");

  const carFinance = recommendQCMSService(carFinanceFixture);
  assert(["QCMS-L3", "QCMS-REVIEW"].includes(carFinance.serviceCode));
  assert(["Complex", "Enhanced Review Required"].includes(carFinance.complexity));

  const manual = recommendQCMSService(manualReviewFixture);
  assert.strictEqual(manual.serviceCode, "QCMS-REVIEW");
  assert.strictEqual(manual.manualReviewRequired, true);
  assert.strictEqual(manual.indicativeFee, "Manual review required");

  const incomplete = validateCaseSummary({ schemaVersion: SCHEMA_VERSION });
  assert.strictEqual(incomplete.valid, true);
  assert(incomplete.missingFields.includes("sourceBuilder"));

  const malformed = validateCaseSummary(null);
  assert.strictEqual(malformed.valid, false);
  assert(malformed.errors.length > 0);

  const unknownBuilder = recommendQCMSService(normaliseCaseSummary({
    sourceBuilder: "unknown-builder",
    complaintCategory: "Other",
    complaintType: "Other",
    complaintTitle: "Unknown builder test",
    complaintIssues: ["Issue"],
    evidenceItems: [],
    generatedDocuments: ["Complaint pack"]
  }));
  assert(unknownBuilder.missingRequirements.length === 0);

  const naEvidence = recommendQCMSService(normaliseCaseSummary({
    sourceBuilder: "flight",
    complaintCategory: "Travel",
    complaintType: "Flight",
    complaintTitle: "N/A evidence test",
    complaintIssues: ["Delay"],
    evidenceItems: [
      { name: "Boarding pass", category: "contract/booking documents", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE },
      { name: "Expenses", category: "financial loss evidence", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.NOT_APPLICABLE, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.UNCLEAR }
    ],
    generatedDocuments: ["Complaint pack"]
  }));
  assert.strictEqual(naEvidence.evidenceCompleteness.score, 100);

  const disputedValueOnly = recommendQCMSService(normaliseCaseSummary({
    sourceBuilder: "parking",
    complaintCategory: "Parking",
    complaintType: "Parking charge",
    complaintTitle: "High value alone should not upgrade",
    complaintIssues: ["One issue"],
    chronology: [{ date: "01/01/2026", event: "Charge issued." }],
    financialPosition: {
      currency: "GBP",
      disputedValuePence: 1000000,
      documentedLossPence: null,
      refundRequestedPence: null,
      hasFinancialReconstructionNeed: false
    },
    evidenceItems: [
      { name: "Parking notice", category: "correspondence", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE }
    ],
    generatedDocuments: ["Appeal pack"]
  }));
  assert.strictEqual(disputedValueOnly.serviceCode, "QCMS-L1");

  const vulnerabilityOnly = recommendQCMSService(normaliseCaseSummary({
    sourceBuilder: "gym",
    complaintCategory: "Fitness",
    complaintType: "Gym cancellation",
    complaintTitle: "Vulnerability should not increase price",
    complaintIssues: ["Cancellation issue"],
    vulnerabilityIndicators: ["Accessibility need recorded"],
    evidenceItems: [
      { name: "Membership agreement", category: "contract/booking documents", requirementStatus: EVIDENCE_STATUSES.REQUIREMENT.REQUIRED, availabilityStatus: EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE }
    ],
    generatedDocuments: ["Complaint pack"]
  }));
  assert.strictEqual(vulnerabilityOnly.serviceCode, "QCMS-L1");

  const adapted = adaptBuilderStateToQCMSCaseSummary({
    builder: "energy",
    category: "Energy",
    route: "Billing",
    title: "Adapter test",
    issues: ["Billing"],
    evidence: [],
    documents: ["Complaint letter"]
  });
  assert.strictEqual(adapted.sourceBuilder, "energy");
  assert.strictEqual(adapted.transferStatus, TRANSFER_STATES.LOCAL_ONLY);

  assert.strictEqual(safeParse("{bad json", { ok: true }).ok, true);
  assert.strictEqual(PART1A_STORAGE_POLICY.sendsPersonalData, false);
  assert.strictEqual(PART1A_STORAGE_POLICY.createsCRMCase, false);

  const prices = getPricingConfig();
  assert.strictEqual(prices["QCMS-L1"].standardFeePence, 5900);
  assert.strictEqual(prices["QCMS-L2"].standardFeePence, 19900);
  assert.strictEqual(prices["QCMS-L3"].standardFeePence, 34900);

  [energy, flight, carFinance, manual].forEach((result) => {
    assert(result.freeDIYMessage.includes("free of charge"));
    assertNoOutcomePrediction(result.primaryReasons);
    assertNoOutcomePrediction(result.secondaryReasons);
  });

  const logged = [];
  const originalLog = console.log;
  console.log = (value) => logged.push(value);
  recommendQCMSService(flightFixture);
  console.log = originalLog;
  assert.strictEqual(logged.length, 0);

  console.log("QCMS Part 1A tests passed");
}

if (require.main === module) {
  run();
}

module.exports = { run };
