const assert = require("assert");
const config = require("./gym.config");
const questions = require("./gym.questions");
const analysis = require("./gym.analysis");
const docs = require("./gym.documents");
const { registry } = require("../../complaint-builder/registry");

const scenario = {
  packReference: "QG-2026-TEST01",
  whatHappened: ["The gym refused to cancel", "I have been charged after cancelling"],
  jurisdiction: "England",
  memberName: "Alex Example",
  gymName: "Example Fitness",
  membershipType: "Fixed-term membership",
  currentStage: "Cancellation refused",
  requestedOutcomes: ["Cancel the membership", "Refund payments taken after cancellation"],
  membershipNumber: "GYM123",
  monthlyFee: "39.99",
  amountDisputed: "79.98",
  evidence: ["Signed contract or digital terms", "Cancellation request", "Payment receipts or bank statements"]
};

assert.strictEqual(config.id, "gym");
assert.strictEqual(config.storageNamespace, "qcbf-gym");
assert.strictEqual(config.packPrefix, "QG");
assert.ok(questions.whatHappened.includes("I want to cancel my membership"));
assert.ok(questions.whatHappened.includes("I received a Letter Before Claim"));
assert.ok(questions.membershipTypes.includes("Monthly rolling membership"));

const result = analysis.analyse(scenario);
assert.strictEqual(result.issueType, "Billing or refund dispute");
assert.strictEqual(result.urgent, false);
assert.ok(result.evidenceChecklist.includes("Membership agreement"));
assert.ok(result.financialPosition.estimatedPosition > 0);

const urgent = analysis.analyse({ ...scenario, whatHappened: ["I received a Letter Before Claim"] });
assert.strictEqual(urgent.urgent, true);
assert.ok(/strict deadlines/i.test(urgent.caution));

const pack = docs.buildAll(scenario);
assert.ok(pack.text.includes("Gym Membership Cancellation & Dispute Pack"));
assert.ok(pack.text.includes("QG-2026-TEST01"));
assert.ok(pack.text.includes("Cancellation or Complaint Letter"));
assert.ok(pack.text.includes("Smart Submission"));

const gymEntry = registry.list().find((entry) => entry.id === "gym");
assert.ok(gymEntry, "Gym builder registered");
assert.strictEqual(gymEntry.status, "migrated");

console.log("Gym QCBF migration tests passed");
