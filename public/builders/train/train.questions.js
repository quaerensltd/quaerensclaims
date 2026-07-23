"use strict";

const journeyIssueOptions = [
  { id: "delayed", label: "My train was delayed" },
  { id: "cancelled", label: "My train was cancelled" },
  { id: "missedConnection", label: "I missed a connection" },
  { id: "abandoned", label: "I abandoned my journey" },
  { id: "replacementBus", label: "I travelled on a replacement bus" },
  { id: "alternativeTransport", label: "I arranged alternative transport" },
  { id: "seatUnavailable", label: "My reserved seat was unavailable" },
  { id: "overcrowding", label: "Severe overcrowding" },
  { id: "delayRepayRejected", label: "Delay Repay rejected" },
  { id: "refundRejected", label: "Refund request rejected" },
  { id: "incorrectInformation", label: "Incorrect information given" },
  { id: "other", label: "Something else" }
];

const requestedOutcomeOptions = [
  "Delay Repay",
  "Refund",
  "Alternative Transport Costs",
  "Taxi Costs",
  "Accommodation",
  "Goodwill Payment",
  "Explanation",
  "Review of Rejected Decision",
  "Other"
];

const multiValueFields = ["journeyIssues", "evidence", "requestedOutcomes"];

function issueLabel(id) {
  const option = journeyIssueOptions.find(item => item.id === id);
  return option ? option.label : id;
}

function issueFlags(data) {
  const issues = Array.isArray(data.journeyIssues) ? data.journeyIssues : [];
  return {
    delayed: issues.includes("delayed"),
    cancelled: issues.includes("cancelled"),
    missedConnection: issues.includes("missedConnection"),
    abandoned: issues.includes("abandoned"),
    replacementBus: issues.includes("replacementBus"),
    alternativeTransport: issues.includes("alternativeTransport"),
    seatUnavailable: issues.includes("seatUnavailable"),
    overcrowding: issues.includes("overcrowding"),
    delayRepayRejected: issues.includes("delayRepayRejected"),
    refundRejected: issues.includes("refundRejected"),
    incorrectInformation: issues.includes("incorrectInformation"),
    other: issues.includes("other")
  };
}

module.exports = { journeyIssueOptions, requestedOutcomeOptions, multiValueFields, issueLabel, issueFlags };
