const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const adapter = require("./energy.qcms.adapter");

const baseEnergy = {
  customerName: "Fictional Energy User",
  customerEmail: "fictional@example.invalid",
  supplierName: "Example Energy",
  propertyAddress: "1 Example Street",
  postcode: "EX1 1AA",
  jurisdiction: "England and Wales",
  issueGroups: ["Billing issue"],
  issueSummary: "A bill appears incorrect.",
  complaintDate: "2026-07-01",
  currentStage: "Draft complaint",
  evidence: ["bills", "complaint"],
  tariffName: "Example tariff",
  disputedAmount: "120",
  requestedOutcomes: ["Bill correction"]
};

function handoff(overrides = {}) {
  return adapter.createEnergyQCMSHandoff({ ...baseEnergy, ...overrides });
}

function expectBand(label, overrides, serviceCode, fee) {
  const result = handoff(overrides);
  assert.equal(result.recommendation.serviceCode, serviceCode, label);
  assert.equal(result.recommendation.indicativeFee, fee, `${label} fee`);
  assert.equal(result.consentStatus, "NOT_REQUESTED");
  assert.equal(result.transferStatus, "LOCAL_ONLY");
  assert.equal(result.instructionStatus, "NOT_STARTED");
  assert.equal(result.caseSummary.metadata.localOnly, true);
  return result;
}

expectBand("simple energy complaint", {}, "QCMS-L1", "GBP 59");

expectBand("moderate energy complaint", {
  issueGroups: ["Billing issue", "Refund issue"],
  issueSummary: "Billing and refund problem with supplier response incomplete.",
  evidence: ["bill", "payment", "complaint", "photos"]
}, "QCMS-L2", "GBP 199");

expectBand("complex energy complaint", {
  issueGroups: ["Billing issue", "Meter issue", "Refund issue"],
  evidence: ["bill", "payment", "complaint", "photos", "ombudsman", "meter"],
  disputedAmount: "2500",
  extraCosts: "400",
  financialSummary: "Requires account history reconstruction across multiple bills.",
  issueSummary: "Multiple bills, meter readings and refund issues need reconstruction."
}, "QCMS-L3", "GBP 349");

expectBand("out of scope or unverified route", {
  jurisdiction: "Spain",
  supplierName: "",
  issueGroups: ["Court papers"],
  issueSummary: "Court papers received and specialist legal review may be needed."
}, "QCMS-REVIEW", "Manual review required");

assert.equal(handoff({ disputedAmount: "5000" }).recommendation.serviceCode, "QCMS-L1", "value alone must not uplift");
assert.equal(handoff({ vulnerabilityDetails: "Elderly customer needing extra communication support." }).recommendation.serviceCode, "QCMS-L1", "vulnerability alone must not uplift");
assert.equal(handoff({ issueSummary: "I need to use a supplier portal to complain about my bill." }).recommendation.serviceCode, "QCMS-L1", "portal route alone must not uplift");

const incompleteHtml = adapter.renderEnergyQCMSCompletion({});
assert.match(incompleteHtml, /Complete the free Energy Complaint Pack first/);
assert.match(incompleteHtml, /remain stored locally in your browser/);

const escapedHtml = adapter.renderEnergyQCMSCompletion({
  ...baseEnergy,
  issueSummary: "<script>alert(1)</script>",
  supplierName: "Bad <img src=x onerror=alert(1)> Supplier",
  accountNumber: "null"
});
assert.doesNotMatch(escapedHtml, /<script/i);
assert.doesNotMatch(escapedHtml, /onerror/i);
assert.doesNotMatch(escapedHtml, />undefined</i);
assert.doesNotMatch(escapedHtml, />null</i);
assert.match(escapedHtml, /Bad ‹img src=x event-attribute-removed=alert\(1\)› Supplier/);

const adapterSource = fs.readFileSync(path.join(__dirname, "energy.qcms.adapter.js"), "utf8");
[
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /sendEmail/i,
  /upload/i,
  /createCRM/i,
  /analytics/i
].forEach((pattern) => assert.doesNotMatch(adapterSource, pattern, `adapter must remain local-only: ${pattern}`));

console.log("Energy QCMS integration tests passed");
