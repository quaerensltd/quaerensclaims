const assert = require("assert");
const config = require("./energy.config");
const analysis = require("./energy.analysis");
const docs = require("./energy.documents");

const scenarios = [
  ["Delayed electricity switch", { whatHappened: ["My switch was delayed"], energyType: "Electricity only", jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", requestedOutcomes: ["Complete the switch"] }, /switch/i],
  ["Gas switch failed while electricity completed", { whatHappened: ["My switch failed"], energyType: "Dual fuel", problemSummary: "Gas failed but electricity completed", jurisdiction: "Wales", propertyCountry: "Wales", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", requestedOutcomes: ["Complete the switch"] }, /switch/i],
  ["Erroneous transfer without consent", { whatHappened: ["I was switched without permission"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Reverse the erroneous transfer"] }, /Erroneous/i],
  ["Old and new suppliers both billing", { whatHappened: ["Both suppliers are billing me"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Correct the bill"] }, /Duplicate/i],
  ["Supplier objection with disputed balance", { whatHappened: ["My old supplier blocked or objected to the switch"], problemSummary: "Supplier says a disputed balance remains", jurisdiction: "Scotland", propertyCountry: "Scotland", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Provide the bill calculation"] }, /switch/i],
  ["Wrong opening reading", { whatHappened: ["My opening reading is wrong"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Use the correct meter reading"] }, /Meter|Billing/i],
  ["Wrong closing reading", { whatHappened: ["My closing reading is wrong"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Use the correct meter reading"] }, /Meter|Billing/i],
  ["Estimated bill dispute", { whatHappened: ["My bill is based on estimated readings"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the bill"] }, /Billing/i],
  ["Wrong meter serial on account", { whatHappened: ["My meter serial number is wrong"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the meter details"] }, /Meter/i],
  ["Crossed-meter concern", { whatHappened: ["The wrong meter is linked to my account"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the meter details"] }, /Meter|Billing/i],
  ["Smart meter not sending readings", { whatHappened: ["My smart meter stopped sending readings"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Provide meter-reading history"] }, /Meter/i],
  ["In-home display failure only", { whatHappened: ["My in-home display is not working"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Provide a written explanation"] }, /Meter/i],
  ["Smart-meter appointment missed", { whatHappened: ["My smart meter installation was delayed"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Provide a written explanation"] }, /Meter/i],
  ["Direct Debit increased significantly", { whatHappened: ["My Direct Debit increased unexpectedly"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Reduce or explain the Direct Debit"] }, /Payment|Direct Debit/i],
  ["Duplicate Direct Debit payment", { whatHappened: ["A payment was duplicated"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Return a duplicate payment"] }, /Payment/i],
  ["Payment made but not credited", { whatHappened: ["I paid but the account was not credited"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Correct the account balance"] }, /Payment/i],
  ["Credit balance refund delayed", { whatHappened: ["My credit balance has not been returned"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Refund the credit balance"] }, /credit/i],
  ["Final bill wrong after moving out", { whatHappened: ["My final bill is wrong", "I moved out but bills continued"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Issue a correct final bill"] }, /Moving|final/i],
  ["Previous occupier debt concern", { whatHappened: ["I am being billed for another person"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Remove charges for the wrong period"] }, /Moving/i],
  ["Tariff promised but not applied", { whatHappened: ["I was promised a tariff that was not applied"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Apply the correct tariff"] }, /Tariff/i],
  ["Historical catch-up bill", { whatHappened: ["I received a large catch-up bill"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Provide the bill calculation"] }, /Historical|Billing/i],
  ["Back-billing concern", { whatHappened: ["I believe back-billing may be relevant"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Provide the bill calculation"] }, /Historical/i],
  ["Prepayment top-up not applied", { whatHappened: ["Credit was not applied"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Prepayment electricity", requestedOutcomes: ["Correct the account balance"] }, /Payment|Prepayment/i],
  ["Vulnerable consumer support not provided", { whatHappened: ["Priority Services support was not provided"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Provide vulnerability support"] }, /vulnerability|Prepayment/i],
  ["Complaint ignored", { whatHappened: ["The supplier ignored my complaint"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Provide a written explanation"] }, /Complaint handling/i],
  ["Deadlock letter recorded", { whatHappened: ["I received a deadlock letter"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Provide a written explanation"] }, /Complaint handling/i],
  ["Debt collector involved", { whatHappened: ["I am being asked to repay an incorrect balance"], problemSummary: "Debt collector contacted me", jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Pause collection while the complaint is reviewed"] }, /Payment|Billing/i],
  ["Letter Before Claim", { whatHappened: ["I received a Letter Before Claim"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Gas only", requestedOutcomes: ["Pause collection while the complaint is reviewed"] }, /Urgent/i],
  ["Unsafe meter warning", { whatHappened: ["My meter is unsafe or damaged"], urgentNotes: "sparking meter", jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Provide a written explanation"] }, /Urgent/i],
  ["Dual fuel different issues", { whatHappened: ["My switch failed", "My bill is incorrect"], jurisdiction: "Wales", propertyCountry: "Wales", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Correct the bill"] }, /switch|Billing/i],
  ["Northern Ireland warning", { whatHappened: ["My bill is incorrect"], jurisdiction: "Northern Ireland", propertyCountry: "Northern Ireland", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the bill"] }, /Billing/i],
  ["Business account limited scope", { whatHappened: ["My bill is incorrect"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Business", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the bill"] }, /Billing/i],
  ["Missing supplier", { whatHappened: ["My bill is incorrect"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", energyType: "Electricity only", requestedOutcomes: ["Correct the bill"] }, /Billing/i],
  ["Missing bill", { whatHappened: ["My bill is incorrect"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the bill"] }, /Billing/i],
  ["Missing meter evidence", { whatHappened: ["My meter serial number is wrong"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Correct the meter details"] }, /Meter/i],
  ["Multiple suppliers", { whatHappened: ["Both suppliers are billing me"], supplierName: "Supplier A", previousSupplier: "Supplier B", newSupplier: "Supplier C", jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", energyType: "Dual fuel", requestedOutcomes: ["Correct the bill"] }, /Duplicate/i],
  ["Multiple accounts", { whatHappened: ["My account was split incorrectly"], jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Dual fuel", requestedOutcomes: ["Correct the account balance"] }, /Tariff|Energy/i],
  ["Multiple meter readings", { whatHappened: ["The supplier ignored my meter readings"], openingReading: "123", closingReading: "456", jurisdiction: "England", propertyCountry: "England", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Electricity only", requestedOutcomes: ["Use the correct meter reading"] }, /Meter|Billing/i],
  ["Corrupted draft safe", { whatHappened: ["Another billing problem"], jurisdiction: "Unsure", propertyCountry: "Unsure", accountResidential: "Domestic residential", consumerName: "A", supplierName: "Supplier", energyType: "Unknown", requestedOutcomes: ["Provide a written explanation"] }, /Energy|Billing/i]
];

assert.strictEqual(config.id, "energy");
assert.strictEqual(config.packPrefix, "QE");
assert.strictEqual(config.storageNamespace, "qcbf-energy");

for (const [name, data, expected] of scenarios) {
  const result = analysis.analyse(data);
  assert.ok(expected.test(result.issueType), `${name}: unexpected issue type ${result.issueType}`);
  assert.ok(result.evidence.length >= 7, `${name}: evidence recommendations missing`);
  assert.ok(result.routes.length >= 1, `${name}: route analysis missing`);
  assert.ok(result.documentType, `${name}: document type missing`);
  assert.ok(result.healthSummary.rows.length >= 3, `${name}: health summary missing`);
  assert.ok(result.smartSubmission.rows.length >= 12, `${name}: smart submission readiness missing`);
  assert.ok(result.financialPosition.rows.length >= 5, `${name}: financial position missing`);
  assert.ok(!/guaranteed|success score/i.test(docs.build(data)), `${name}: unsupported guarantee wording`);
}

const fullData = {
  customerName: "Alex Consumer",
  customerEmail: "alex@example.com",
  accountNumber: "E-12345",
  propertyAddress: "1 Test Street",
  postcode: "TE1 1ST",
  jurisdiction: "England",
  customerType: "Domestic household customer",
  supplierName: "Example Energy",
  previousSupplier: "Old Energy",
  fuelType: "Dual fuel",
  meterType: "Smart meter",
  issueGroups: ["switching", "billing", "meter", "payments"],
  issueSummary: "The switch was delayed, both suppliers billed, the smart meter stopped sending readings and a refund remains outstanding.",
  issueStartDate: "2026-01-05",
  switchRequestedDate: "2026-01-06",
  switchCompletedDate: "2026-02-10",
  billDate: "2026-02-20",
  paymentDate: "2026-02-28",
  refundRequestDate: "2026-03-01",
  complaintDate: "2026-03-05",
  finalResponseDate: "2026-04-01",
  disputedAmount: "240.50",
  creditBalance: "180",
  extraCosts: "25",
  currentDirectDebit: "160",
  recordedAccountBalance: "420",
  requestedRefund: "180",
  refundsReceived: "0",
  paymentMethod: "Direct Debit",
  evidence: ["bills", "readings", "switch", "payments", "complaint"],
  requestedOutcomes: ["correct bill", "refund credit", "resolve switch"],
  preferredOutcome: "Correct the account, explain the switch delay and refund the credit balance.",
  officialRouteVerified: true
};

const fullAnalysis = analysis.analyse(fullData);
assert.ok(fullAnalysis.smartSubmission.message.includes("Quaerens does not submit complaints automatically"), "Smart Submission message missing");
assert.ok(fullAnalysis.smartSubmission.rows.some((row) => row[0] === "Official Route" && row[1] === "Verified"), "Official route status missing");
assert.ok(fullAnalysis.smartSubmission.rows.some((row) => row[0] === "Evidence Position" && /Supported|Developing|Limited/.test(row[1])), "Evidence readiness label invalid");
assert.ok(fullAnalysis.timeline.events.length >= 6, "Timeline events missing");
assert.ok(fullAnalysis.financialSchedule.entries.length >= 5, "Financial schedule entries missing");

const limitedEvidence = analysis.analyse({
  customerName: "A",
  supplierName: "Supplier",
  jurisdiction: "England",
  issueGroups: ["meter"],
  issueSummary: "Meter serial and smart readings are disputed."
});
assert.strictEqual(limitedEvidence.completeness.status, "Needs Evidence", "Meter scenario should need evidence");

const inconsistentDates = analysis.analyse({
  customerName: "A",
  supplierName: "Supplier",
  jurisdiction: "England",
  issueGroups: ["billing"],
  issueSummary: "Bill dispute.",
  issueStartDate: "2026-05-01",
  complaintDate: "2026-04-01"
});
assert.ok(inconsistentDates.timeline.warnings.length >= 1, "Timeline warning missing for inconsistent dates");

const pack = docs.build(fullData);
[
  "PREMIUM COVER PAGE",
  "EXECUTIVE SUMMARY",
  "ENERGY ACCOUNT HEALTH SUMMARY",
  "ENERGY COMPLAINT ANALYSIS",
  "FINANCIAL SCHEDULE",
  "ENERGY TIMELINE",
  "COMPLAINT LETTER",
  "SMART SUBMISSION",
  "BEFORE YOU SUBMIT",
  "OFFICIAL RESOURCES",
  "SELF-SERVICE DISCLAIMER"
].forEach((heading) => assert.ok(pack.includes(heading), `Pack section missing: ${heading}`));
assert.ok(!/Submit Now|Complaint sent|Success|Case opened|Compensation due|Legally owed|Guaranteed saving|Automatically refundable|success score/i.test(pack), "Unsupported submission or outcome wording found");

const txt = docs.buildTxt(fullData);
assert.ok(txt.shortComplaint.includes("Example Energy"), "Short complaint TXT missing supplier");
assert.ok(txt.fullComplaint.includes("SMART SUBMISSION"), "Full complaint TXT missing Smart Submission");
assert.ok(txt.completeSummary.includes("COMPLETE SUMMARY"), "Complete summary TXT missing");
assert.ok(!/<[a-z][\s\S]*>/i.test(`${txt.shortComplaint}${txt.fullComplaint}${txt.completeSummary}`), "TXT output contains HTML");

const copy = docs.buildCopy(fullData);
assert.ok(copy.email.includes("Dear Example Energy"), "Email copy missing greeting");
assert.ok(copy.supplierPortal.includes("Issue:"), "Supplier portal copy missing issue");
assert.ok(copy.energyOmbudsmanForm.includes("Energy Ombudsman form summary"), "Ombudsman copy missing");
assert.ok(copy.complaintPortal.includes("Complaint portal summary"), "Complaint portal copy missing");
assert.ok(!/<[a-z][\s\S]*>/i.test(Object.values(copy).join("")), "Copy output contains HTML");

assert.strictEqual(docs.architectures.pdf.status, "Prepared", "PDF architecture not prepared");
assert.strictEqual(docs.architectures.word.status, "Prepared", "Word architecture not prepared");
assert.strictEqual(docs.architectures.txt.status, "Prepared", "TXT architecture not prepared");
assert.strictEqual(docs.architectures.print.status, "Prepared", "Print architecture not prepared");

console.log(`Energy Part 1B-B migration tests passed: ${scenarios.length} fictional scenarios plus export architecture checks`);
