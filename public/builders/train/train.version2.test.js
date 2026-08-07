"use strict";

const assert = require("assert");
const config = require("./train.config");
const questions = require("./train.questions");
const resources = require("./train.resources");
const compensation = require("./train.compensation");
const analysis = require("./train.analysis");
const evidence = require("./train.evidence");
const submission = require("./train.submission");
const documents = require("./train.documents");
const page = require("./train.page");

const sample = {
  journeyIssues: ["delayed", "missedConnection"],
  leadPassenger: "Jane Rail",
  additionalPassengers: "John Rail",
  journeyDate: "2026-07-18",
  departureStation: "Manchester Piccadilly",
  arrivalStation: "London Euston",
  departureTime: "09:00",
  scheduledArrival: "11:10",
  actualArrival: "11:58",
  trainOperator: "Avanti West Coast",
  connectingOperator: "",
  ticketType: "Advance",
  singleReturn: "Single",
  ticketPrice: "86.50",
  travellerCount: "2",
  splitTickets: "No",
  bookingReference: "ABC123",
  journeyComplete: "Yes",
  requestedOutcomes: ["Delay Repay compensation", "Expense reimbursement"],
  evidence: ["ticket", "booking", "delayNotification", "arrivalEvidence", "receipts", "operatorMessages", "journeyNotes"],
  expenses: [{ category: "Taxi", amount: "24.50", receipt: "Available", reason: "Missed onward connection" }],
  timelineRows: [{ date: "2026-07-18", event: "Arrived 48 minutes late at final destination" }]
};

assert.strictEqual(config.builderVersion, "2.0-production");
assert.ok(config.exports.includes("PDF"));
assert.ok(questions.journeyIssueOptions.some(item => item.id === "delayRepayRejected"));
assert.ok(resources.officialSources.length >= 5);

const estimate = compensation.estimateDelayRepay(sample);
assert.strictEqual(estimate.delayMinutes, 48);
assert.strictEqual(estimate.passengerCount, 2);
assert.strictEqual(estimate.perPassengerEstimate, 43.25);
assert.strictEqual(estimate.grossDelayRepay, 86.5);
assert.strictEqual(estimate.expenses, 24.5);
assert.strictEqual(estimate.estimatedTotalRequested, 111);

[
  { minutes: 14, expected: 0 },
  { minutes: 30, expected: 43.25 },
  { minutes: 60, expected: 86.5 },
  { minutes: 120, expected: 86.5 }
].forEach(testCase => {
  const result = compensation.estimateDelayRepay(Object.assign({}, sample, {
    manualDelayMinutes: String(testCase.minutes),
    scheduledArrival: "",
    actualArrival: "",
    travellerCount: "1",
    additionalPassengers: "",
    expenses: []
  }));
  assert.strictEqual(result.grossDelayRepay, testCase.expected, testCase.minutes + " minute Delay Repay band");
});

const cancelled = Object.assign({}, sample, {
  journeyIssues: ["cancelled", "abandoned"],
  actualArrival: "",
  manualDelayMinutes: "",
  requestedOutcomes: ["Ticket refund"],
  expenses: []
});
const cancelledEstimate = compensation.estimateDelayRepay(cancelled);
assert.strictEqual(cancelledEstimate.grossDelayRepay, 0);
assert.strictEqual(cancelledEstimate.possibleRefund, 173);

assert.strictEqual(analysis.analyse(sample).completeness.status, "Ready to Submit");
assert.strictEqual(evidence.evidencePosition(sample).level, "Well Supported");

const smart = submission.smartSubmission(Object.assign({}, sample, { splitTickets: "Yes" }));
assert.ok(smart.operatorRoute.preferredComplaintMethod.includes("Verify"));
assert.ok(smart.checks.length >= 5);

const docs = documents.buildAll(sample, { packReference: "QT-2026-TEST01" });
assert.ok(docs.full.includes("QUAERENS CONSUMER COMPLAINT FILE"));
assert.ok(docs.full.includes("QUAERENS SMART SUBMISSION"));
assert.ok(docs.full.includes("Estimated total requested"));
assert.ok(!docs.full.includes("Phase 2 placeholder"));

const cards = page.buildPreviewCards(sample, { packReference: "QT-2026-TEST01" });
assert.ok(cards.some(card => card.title === "Compensation Summary"));
assert.ok(cards.some(card => card.body.includes("QT-2026-TEST01")));

console.log("Train QCBF Phase 2 production tests passed");
