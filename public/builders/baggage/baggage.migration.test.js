"use strict";

const assert = require("assert");
const config = require("./baggage.config");
const questions = require("./baggage.questions");
const analysis = require("./baggage.analysis");
const evidence = require("./baggage.evidence");
const resources = require("./baggage.resources");
const submission = require("./baggage.submission");
const documents = require("./baggage.documents");

function baseData(overrides) {
  return Object.assign({
    leadPassenger: "Jane Passenger",
    additionalPassengers: "John Passenger",
    passengerCount: "2",
    airline: "British Airways",
    operatingAirline: "British Airways",
    flightNumber: "BA123",
    bookingReference: "ABC123",
    travelDate: "2026-07-18",
    departureAirport: "London Heathrow",
    arrivalAirport: "Madrid",
    checkedBags: "2",
    bagsAffected: "1",
    baggageTag: "BA123456",
    pirCompleted: "Yes",
    pirReference: "LHRBA12345",
    reportedAtAirport: "Yes",
    reportedDate: "2026-07-18",
    complaintDate: "2026-07-20",
    baggageIssues: ["delayed"],
    problemDetails: "The checked bag was not delivered on arrival and was returned two days later.",
    evidence: ["booking", "boarding", "bagTag", "pir", "tracking", "receipts"],
    requestedOutcomes: ["written explanation", "reimbursement of essential purchases"],
    amountRequested: "145",
    currency: "GBP",
    financialItems: [
      { description: "Toiletries and clothing", category: "Delayed essentials", currency: "GBP", originalPrice: "0", currentValue: "145", replacementAmount: "145", amountRequested: "145", proofStatus: "Available", receiptStatus: "Available", reimbursedElsewhere: "0" }
    ],
    timeline: [
      { date: "2026-07-18", event: "PIR completed", response: "Reference issued" },
      { date: "2026-07-20", event: "Bag delivered", response: "Returned by courier" }
    ]
  }, overrides || {});
}

function assertPack(data, expectedIssue) {
  const docs = documents.buildAll(data, { packReference: "QB-2026-ABC123" });
  assert.ok(docs.full.includes("QUAERENS CONSUMER COMPLAINT FILE"));
  assert.ok(docs.full.includes("QB-2026-ABC123"));
  assert.ok(docs.full.includes(expectedIssue));
  assert.ok(docs.full.includes("MONTREAL CONVENTION CONTEXT"));
  assert.ok(docs.full.includes("1,519 SDR per passenger"));
  assert.ok(docs.full.includes("not a guaranteed"));
  assert.ok(docs.full.includes("Smart Submission"));
  assert.ok(docs.letter.includes("I am not seeking double recovery"));
  assert.ok(!/success probability|guaranteed compensation|guaranteed reimbursement/i.test(docs.full));
  return docs;
}

assert.strictEqual(config.id, "baggage");
assert.strictEqual(config.storageNamespace, "qcbf-baggage");
assert.ok(config.stages.length === 8);
assert.ok(questions.multiValueFields.includes("baggageIssues"));

const delayed = baseData();
assert.strictEqual(analysis.deadlineStatus(delayed).label, "Submit promptly");
assertPack(delayed, "Baggage delayed");

const lost = baseData({
  baggageIssues: ["lost"],
  lostDeclared: "Yes",
  daysOutstanding: "32",
  problemDetails: "The bag has not been returned and the airline has indicated it may be lost.",
  requestedOutcomes: ["written explanation", "lost contents value"]
});
assertPack(lost, "Baggage lost");

const damaged = baseData({
  baggageIssues: ["damaged"],
  damageDescription: "The suitcase shell and wheel were cracked.",
  financialItems: [{ description: "Suitcase repair", category: "Damaged bag", currency: "GBP", repairAmount: "85", amountRequested: "85", proofStatus: "Available", receiptStatus: "Available" }]
});
assert.strictEqual(analysis.deadlineStatus(damaged).label, "Time-sensitive");
assertPack(damaged, "Baggage damaged");

const missingContents = baseData({
  baggageIssues: ["missingContents"],
  contentsInventory: "Camera charger and clothing missing.",
  tamperingVisible: "Unsure",
  policeReport: "No"
});
assertPack(missingContents, "Contents missing or stolen");

const mobility = baseData({
  baggageIssues: ["mobility"],
  mobilityImpact: "Wheelchair was delayed, causing accessibility support problems.",
  evidence: ["booking", "boarding", "bagTag", "pir", "mobility"],
  requestedOutcomes: ["accessibility support response", "written explanation"]
});
assertPack(mobility, "Mobility equipment damaged, delayed or lost");

const noPir = baseData({ pirCompleted: "No", pirReference: "", evidence: ["booking", "boarding", "bagTag"] });
const status = evidence.buildEvidenceStatus(noPir).find(item => item.id === "pir");
assert.strictEqual(status.status, "Requested");
assert.ok(analysis.completeness(noPir).missing.includes("Airport report or explanation") === false || analysis.completeness(noPir).status !== "Ready to Submit");

const connecting = baseData({
  connectionJourney: "Yes",
  differentAirlines: "Yes",
  connectingAirports: "Amsterdam",
  checkedThrough: "Yes"
});
assertPack(connecting, "Baggage delayed");

const route = resources.routeForAirline("Unknown Test Airline");
assert.strictEqual(route.verified, false);
assert.ok(submission.buildSubmissionInstructions(baseData()).includes("Official page"));

console.log("Baggage QCBF migration tests passed");
