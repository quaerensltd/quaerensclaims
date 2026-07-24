"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.resources, train.questions);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.compensation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(resources, questions) {
  if (!resources && typeof require === "function") resources = require("./train.resources");
  if (!questions && typeof require === "function") questions = require("./train.questions");

  function toNumber(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function minutes(value) {
    if (!value || !String(value).includes(":")) return null;
    const parts = String(value).split(":").map(Number);
    if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
    return parts[0] * 60 + parts[1];
  }

  function delayMinutes(data) {
    if (data.manualDelayMinutes !== undefined && data.manualDelayMinutes !== "") {
      const manual = toNumber(data.manualDelayMinutes);
      if (manual > 0) return Math.round(manual);
    }
    const scheduled = minutes(data.scheduledArrival);
    const actual = minutes(data.actualArrival);
    if (scheduled === null || actual === null) return null;
    let diff = actual - scheduled;
    if (diff < -720) diff += 1440;
    return Math.max(0, diff);
  }

  function passengerCount(data) {
    const fromField = Math.max(1, Math.round(toNumber(data.travellerCount || data.passengerCount)));
    const names = [data.leadPassenger].concat(String(data.additionalPassengers || "")
      .split(/\r?\n|,/)
      .map(item => item.trim())
      .filter(Boolean));
    return Math.max(fromField || 1, names.filter(Boolean).length || 1);
  }

  function expensesTotal(expenses) {
    return (expenses || []).reduce((sum, row) => sum + toNumber(row.amount), 0);
  }

  function ticketBasis(data) {
    const basis = String(data.singleReturn || data.ticketDirection || "").toLowerCase();
    if (basis.includes("return")) return "return";
    if (basis.includes("season") || String(data.ticketType || "").toLowerCase().includes("season")) return "season";
    if (String(data.ticketType || "").toLowerCase().includes("flexi")) return "flexi";
    return "single";
  }

  function bandForDelay(delay, operator) {
    const threshold = operator && operator.qualifyingThresholdMinutes ? operator.qualifyingThresholdMinutes : 30;
    if (delay === null) return { id: "unknown", label: "Delay not calculated", percentSingle: 0, percentReturn: 0 };
    if (delay < threshold) return { id: "below-threshold", label: "Below recorded scheme threshold", percentSingle: 0, percentReturn: 0 };
    if (delay < 30) return { id: "15-29", label: "15 to 29 minutes", percentSingle: 0.25, percentReturn: 0.125 };
    if (delay < 60) return { id: "30-59", label: "30 to 59 minutes", percentSingle: 0.5, percentReturn: 0.25 };
    if (delay < 120) return { id: "60-119", label: "60 to 119 minutes", percentSingle: 1, percentReturn: 0.5 };
    return { id: "120-plus", label: "120 minutes or more", percentSingle: 1, percentReturn: 1 };
  }

  function estimateDelayRepay(data) {
    const operator = resources.operatorRecord(data.trainOperator);
    const delay = delayMinutes(data);
    const passengers = passengerCount(data);
    const ticketPrice = toNumber(data.ticketPrice);
    const basis = ticketBasis(data);
    const band = bandForDelay(delay, operator);
    const issues = data.journeyIssues || [];
    const cancelledOrAbandoned = issues.includes("cancelled") || issues.includes("abandoned");
    const warnings = [];
    const assumptions = [];

    if (!operator.verified) {
      warnings.push("Check the operator's current official Delay Repay scheme before submitting.");
    }
    if (basis === "season" || basis === "flexi") {
      warnings.push("Season-ticket and Flexi-ticket compensation is operator-specific and should be checked against the current scheme.");
    }
    if (String(data.splitTickets || "").toLowerCase().includes("yes")) {
      warnings.push("Split tickets may need separate evidence and may affect how the operator assesses the claim.");
    }
    if (String(data.connectingOperator || "").trim()) {
      warnings.push("Where more than one operator is involved, keep the full itinerary and check which operator is responsible for the final-destination delay.");
    }

    let perPassengerEstimate = 0;
    let reason = "Delay information is incomplete.";
    if (delay !== null && ticketPrice > 0 && !cancelledOrAbandoned && basis !== "season" && basis !== "flexi") {
      const percentage = basis === "return" ? band.percentReturn : band.percentSingle;
      perPassengerEstimate = Number((ticketPrice * percentage).toFixed(2));
      reason = percentage > 0 ? "Estimated from the recorded final-destination delay and ticket price." : "Recorded delay appears below the operator threshold entered.";
      assumptions.push("Estimate uses the ticket price entered by the user and the final-destination arrival delay.");
    }
    if (cancelledOrAbandoned) {
      reason = "A refund or abandoned-journey route may be more relevant than Delay Repay, depending on what happened.";
    }

    const grossDelayRepay = Number((perPassengerEstimate * passengers).toFixed(2));
    const alreadyReceived = toNumber(data.compensationAlreadyReceived || data.amountAlreadyPaid);
    const netDelayRepay = Math.max(0, Number((grossDelayRepay - alreadyReceived).toFixed(2)));
    const expenses = expensesTotal(data.expenses);
    const possibleRefund = (cancelledOrAbandoned && ticketPrice > 0) ? Number((ticketPrice * passengers).toFixed(2)) : 0;

    return {
      operator: operator.name || data.trainOperator || "Not recorded",
      scheme: operator.delayRepayScheme || "Check current operator scheme",
      schemeVerified: !!operator.verified,
      source: operator.delayRepayPage || "",
      sourceVerifiedDate: operator.lastVerified || resources.checkedDate || "Not recorded",
      passengerCount: passengers,
      delayMinutes: delay,
      delayBand: band.label,
      ticketBasis: basis,
      ticketPrice: ticketPrice,
      perPassengerEstimate: perPassengerEstimate,
      grossDelayRepay: grossDelayRepay,
      alreadyReceived: alreadyReceived,
      netDelayRepay: netDelayRepay,
      possibleRefund: possibleRefund,
      expenses: expenses,
      estimatedTotalRequested: Number((netDelayRepay + possibleRefund + expenses).toFixed(2)),
      status: perPassengerEstimate > 0 ? "Estimated statutory compensation available" : "Further review required",
      reason: reason,
      assumptions: assumptions,
      warnings: warnings,
      estimatedOnly: "Estimated only. Subject to operator investigation, ticket terms, scheme rules and available evidence."
    };
  }

  function money(amount) {
    return "GBP " + toNumber(amount).toFixed(2);
  }

  return {
    delayMinutes: delayMinutes,
    passengerCount: passengerCount,
    expensesTotal: expensesTotal,
    estimateDelayRepay: estimateDelayRepay,
    money: money
  };
});
