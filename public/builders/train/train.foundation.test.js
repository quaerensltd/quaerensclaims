"use strict";

const assert = require("assert");
const config = require("./train.config");
const questions = require("./train.questions");
const analysis = require("./train.analysis");
const evidence = require("./train.evidence");
const resources = require("./train.resources");
const submission = require("./train.submission");
const page = require("./train.page");

function baseData(overrides) {
  return Object.assign({
    journeyIssues: ["delayed"],
    leadPassenger: "Jane Rail",
    additionalPassengers: "John Rail",
    email: "jane@example.com",
    telephone: "02080500725",
    journeyDate: "2026-07-18",
    departureStation: "Manchester Piccadilly",
    arrivalStation: "London Euston",
    departureTime: "09:00",
    scheduledArrival: "11:10",
    actualArrival: "11:58",
    journeyPurpose: "Work",
    singleReturn: "Single",
    journeyComplete: "Yes",
    railcard: "None",
    travellerCount: "2",
    trainOperator: "Avanti West Coast",
    connectingOperator: "",
    ticketType: "Advance",
    seasonTicket: "No",
    splitTickets: "No",
    ticketPrice: "86.50",
    bookingReference: "ABC123",
    seatReservation: "Coach C Seat 24",
    ticketNumber: "TKT123",
    ticketFormat: "Mobile ticket",
    delayRepayClaimed: "No",
    refundRequested: "No",
    operatorResponse: "",
    evidence: ["ticket", "booking", "delayNotification", "receipts"],
    requestedOutcomes: ["Delay Repay", "Explanation"],
    expenses: [{ category: "Taxi", amount: "24.50", currency: "GBP", receipt: "Available", reason: "Late onward connection", reimbursed: "No" }],
    timelineNotes: "Journey planned, train delayed, arrived late."
  }, overrides || {});
}

assert.strictEqual(config.id, "train");
assert.strictEqual(config.storageNamespace, "qcbf-train");
assert.strictEqual(config.packPrefix, "QT");
assert.strictEqual(config.frameworkVersion, "QCBF 1.2");
assert.strictEqual(config.stages.length, 8);
assert.deepStrictEqual(config.exports, ["PDF", "Word/RTF", "TXT", "Print", "Copy"]);
assert.ok(questions.journeyIssueOptions.length >= 12);
assert.ok(questions.multiValueFields.includes("journeyIssues"));

const delayed = baseData();
assert.strictEqual(analysis.delayMinutes(delayed), 48);
assert.strictEqual(analysis.potentialDelayRepay(delayed), "Potential Delay Repay may be relevant");
assert.strictEqual(analysis.evidencePosition(delayed).level, "Supported");
assert.strictEqual(analysis.completeness(delayed).status, "Ready for Review");
assert.strictEqual(analysis.expenseTotal(delayed.expenses), 24.5);
assert.ok(evidence.requiredEvidence(delayed.journeyIssues).includes("delayNotification"));
assert.ok(page.buildPreviewCards(delayed, { packReference: "QT-2026-RAIL01" }).some(card => card.body.includes("QT-2026-RAIL01")));

const cancelled = baseData({ journeyIssues: ["cancelled"], actualArrival: "", evidence: ["ticket", "operatorMessages", "announcements"], requestedOutcomes: ["Refund"] });
assert.strictEqual(analysis.potentialDelayRepay(cancelled), "May need review");
assert.ok(evidence.requiredEvidence(cancelled.journeyIssues).includes("replacementOffered"));

const missedConnection = baseData({ journeyIssues: ["missedConnection"], departureStation: "York", arrivalStation: "Bristol Temple Meads", connectingOperator: "CrossCountry" });
assert.strictEqual(analysis.analyse(missedConnection).connectionMissed, true);

const replacementBus = baseData({ journeyIssues: ["replacementBus"], journeyComplete: "Partly completed" });
assert.strictEqual(analysis.analyse(replacementBus).replacementTransport, true);

const abandoned = baseData({ journeyIssues: ["abandoned"], journeyComplete: "No - abandoned", requestedOutcomes: ["Refund", "Taxi Costs"] });
assert.strictEqual(analysis.analyse(abandoned).journeyAbandoned, true);

const delayRepayRejected = baseData({ journeyIssues: ["delayRepayRejected"], delayRepayClaimed: "Yes", operatorResponse: "Rejected", evidence: ["claimReference", "operatorDecision", "appeal", "ticket"] });
assert.strictEqual(analysis.potentialDelayRepay(delayRepayRejected), "May need review");

const refundRejected = baseData({ journeyIssues: ["refundRejected"], refundRequested: "Yes", operatorResponse: "Refund rejected", evidence: ["operatorDecision", "claimReference", "ticket"] });
assert.ok(evidence.requiredEvidence(refundRejected.journeyIssues).includes("operatorDecision"));

const alternativeTransport = baseData({ journeyIssues: ["alternativeTransport"], expenses: [{ category: "Alternative Rail", amount: "55", currency: "GBP" }] });
assert.strictEqual(analysis.analyse(alternativeTransport).alternativeTransport, true);

const multipleOperators = baseData({ trainOperator: "LNER", connectingOperator: "ScotRail", splitTickets: "Yes" });
assert.strictEqual(resources.operatorRecord(multipleOperators.trainOperator).verified, true);
assert.ok(submission.buildSubmissionPlaceholder(multipleOperators).preferredComplaintMethod.includes("Verify"));

const seasonTicket = baseData({ ticketType: "Season ticket", seasonTicket: "Yes", ticketPrice: "245" });
assert.strictEqual(seasonTicket.seasonTicket, "Yes");

const splitTicket = baseData({ splitTickets: "Yes", ticketType: "Split tickets" });
assert.strictEqual(splitTicket.splitTickets, "Yes");

assert.ok(/^QT-\d{4}-[A-Z0-9]{6}$/.test(page.createPackReference("abc123")));

console.log("Train QCBF Phase 1 foundation tests passed");
