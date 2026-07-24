"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.questions, train.resources, train.compensation);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.analysis = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(questions, resources, compensation) {
  if (!questions && typeof require === "function") questions = require("./train.questions");
  if (!resources && typeof require === "function") resources = require("./train.resources");
  if (!compensation && typeof require === "function") compensation = require("./train.compensation");

  function toNumber(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function delayMinutes(data) {
    return compensation.delayMinutes(data);
  }

  function expenseTotal(expenses) {
    return compensation.expensesTotal(expenses);
  }

  function issueFlags(data) {
    return questions.issueFlags(data || {});
  }

  function potentialDelayRepay(data) {
    const result = compensation.estimateDelayRepay(data || {});
    const flags = issueFlags(data || {});
    if (flags.delayRepayRejected || flags.refundRejected) return "May need review";
    if (result.perPassengerEstimate > 0) return "Potential Delay Repay may be relevant";
    if (result.delayMinutes !== null || flags.cancelled || flags.abandoned) return "May need review";
    return "Further information needed";
  }

  function evidencePosition(data) {
    const evidence = (data && data.evidence) || [];
    const count = Array.isArray(evidence) ? evidence.length : 0;
    const hasTicket = evidence.includes("ticket") || evidence.includes("booking");
    const hasOperator = evidence.includes("delayNotification") || evidence.includes("operatorMessages") || evidence.includes("operatorDecision");
    const hasPayment = evidence.includes("paymentRecord") || evidence.includes("receipts");
    if (count >= 7 && hasTicket && hasOperator) {
      return { level: "Well Supported", explanation: "The file includes core journey evidence and supporting operator or expense records. This does not predict success." };
    }
    if (count >= 4 && hasTicket) {
      return { level: "Supported", explanation: "The file has several useful items, but the assessment should still check gaps and scheme rules." };
    }
    if (count >= 2 || hasPayment) {
      return { level: "Developing", explanation: "Some useful evidence is recorded, but key journey or operator records may still be needed." };
    }
    return { level: "Limited", explanation: "The complaint pack can still be started, but the evidence position is currently limited." };
  }

  function completeness(data) {
    const missing = [];
    if (!data || !Array.isArray(data.journeyIssues) || !data.journeyIssues.length) missing.push("what happened");
    if (!data || !data.leadPassenger) missing.push("lead passenger");
    if (!data || !data.journeyDate) missing.push("journey date");
    if (!data || !data.departureStation) missing.push("departure station");
    if (!data || !data.arrivalStation) missing.push("arrival station");
    if (!data || !data.trainOperator) missing.push("train operator");
    if (!data || !Array.isArray(data.requestedOutcomes) || !data.requestedOutcomes.length) missing.push("requested outcome");

    const position = evidencePosition(data || {});
    if (missing.length >= 5) return { status: "Not Started", percent: 10, missing: missing };
    if (missing.length >= 2) return { status: "Needs Key Information", percent: 35, missing: missing };
    if (position.level === "Limited") return { status: "Needs Evidence", percent: 55, missing: missing.concat(["supporting evidence"]) };
    if (position.level === "Developing") return { status: "In Progress", percent: 70, missing: missing };
    if (position.level === "Supported") return { status: "Ready for Review", percent: 85, missing: missing };
    return { status: "Ready to Submit", percent: 95, missing: missing };
  }

  function outcomeType(data) {
    const outcomes = ((data && data.requestedOutcomes) || []).join(" ").toLowerCase();
    const flags = issueFlags(data || {});
    if (flags.delayRepayRejected) return "Delay Repay reconsideration";
    if (flags.refundRejected) return "Refund decision review";
    if (outcomes.includes("expense") || flags.alternativeTransport) return "Expense reimbursement request";
    if (outcomes.includes("refund") || flags.cancelled || flags.abandoned) return "Ticket refund request";
    if (outcomes.includes("delay")) return "Delay Repay compensation request";
    return "Rail complaint pack";
  }

  function analyse(data) {
    const safe = data || {};
    const flags = issueFlags(safe);
    const comp = compensation.estimateDelayRepay(safe);
    const operator = resources.operatorRecord(safe.trainOperator);
    const route = (safe.departureStation || "Departure station not recorded") + " to " + (safe.arrivalStation || "arrival station not recorded");
    const delay = delayMinutes(safe);
    const position = evidencePosition(safe);
    const complete = completeness(safe);

    return {
      route: route,
      operator: operator.name || safe.trainOperator || "Not recorded",
      operatorVerified: !!operator.verified,
      recordedDelay: delay === null ? "Not calculated" : delay + " minutes",
      delayMinutes: delay,
      possibleDelayRepay: potentialDelayRepay(safe),
      compensation: comp,
      evidencePosition: position,
      completeness: complete,
      financialTotal: expenseTotal(safe.expenses),
      requestedOutcome: outcomeType(safe),
      connectionMissed: !!flags.missedConnection,
      replacementTransport: !!flags.replacementBus,
      alternativeTransport: !!flags.alternativeTransport,
      journeyAbandoned: !!flags.abandoned,
      refundRoute: !!(flags.cancelled || flags.abandoned || flags.refundRejected),
      rejectionRoute: !!(flags.delayRepayRejected || flags.refundRejected),
      assumptions: comp.assumptions,
      warnings: comp.warnings
    };
  }

  return {
    toNumber: toNumber,
    delayMinutes: delayMinutes,
    expenseTotal: expenseTotal,
    expensesTotal: expenseTotal,
    potentialDelayRepay: potentialDelayRepay,
    evidencePosition: evidencePosition,
    completeness: completeness,
    outcomeType: outcomeType,
    analyse: analyse
  };
});
