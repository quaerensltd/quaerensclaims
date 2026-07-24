"use strict";

(function(root, factory) {
  const questions = factory();
  if (typeof module === "object" && module.exports) module.exports = questions;
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.questions = questions;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const journeyIssueOptions = [
    { id: "delayed", label: "My train was delayed" },
    { id: "cancelled", label: "My train was cancelled" },
    { id: "missedConnection", label: "I missed a connection" },
    { id: "abandoned", label: "I abandoned my journey" },
    { id: "replacementBus", label: "I used a replacement bus" },
    { id: "alternativeTransport", label: "I arranged alternative transport" },
    { id: "seatUnavailable", label: "My reserved seat was unavailable" },
    { id: "overcrowding", label: "The train was severely overcrowded" },
    { id: "incorrectInformation", label: "I received incorrect journey or ticket information" },
    { id: "delayRepayRejected", label: "My Delay Repay claim was rejected" },
    { id: "refundRejected", label: "My refund request was rejected" },
    { id: "other", label: "Another rail problem" }
  ];

  const requestedOutcomeOptions = [
    "Delay Repay compensation",
    "Ticket refund",
    "Return-ticket refund",
    "Season-ticket compensation",
    "Expense reimbursement",
    "Reconsideration of rejected Delay Repay",
    "Reconsideration of rejected refund",
    "Seat-reservation refund",
    "First-class fare difference",
    "Apology",
    "Explanation",
    "Correction of records",
    "Accessibility remedy",
    "Goodwill payment",
    "Other"
  ].map(label => ({ id: label, label: label }));

  const evidenceOptions = [
    ["ticket", "Ticket or travel pass"],
    ["booking", "Booking confirmation or itinerary"],
    ["paymentRecord", "Payment record"],
    ["railcard", "Railcard evidence"],
    ["seatReservation", "Seat reservation"],
    ["delayNotification", "Delay or cancellation notification"],
    ["replacementOffered", "Replacement travel offered or refused"],
    ["nationalRailScreenshot", "National Rail or app screenshot"],
    ["arrivalEvidence", "Arrival-time evidence"],
    ["connectionDetails", "Connection details"],
    ["alternativeTravel", "Alternative travel evidence"],
    ["operatorMessages", "Operator messages or emails"],
    ["staffAdvice", "Staff advice or instructions"],
    ["screenshots", "Screenshots of journey information"],
    ["receipts", "Receipts for direct expenses"],
    ["delayRepayClaim", "Original Delay Repay claim"],
    ["claimReference", "Claim or case reference"],
    ["operatorDecision", "Operator or retailer decision"],
    ["appeal", "Appeal or review request"],
    ["passengerAssist", "Passenger Assist booking or accessibility record"],
    ["photos", "Photos or videos"],
    ["journeyNotes", "Journey notes or timeline"]
  ].map(item => ({ id: item[0], label: item[1] }));

  const multiValueFields = ["journeyIssues", "evidence", "requestedOutcomes"];

  function issueLabel(id) {
    const option = journeyIssueOptions.find(item => item.id === id);
    return option ? option.label : id;
  }

  function issueFlags(data) {
    const issues = Array.isArray(data.journeyIssues) ? data.journeyIssues : [];
    return journeyIssueOptions.reduce((acc, option) => {
      acc[option.id] = issues.includes(option.id);
      return acc;
    }, {});
  }

  return { journeyIssueOptions, requestedOutcomeOptions, evidenceOptions, multiValueFields, issueLabel, issueFlags };
});
