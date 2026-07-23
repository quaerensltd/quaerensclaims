"use strict";

const questions = require("./train.questions");

function toMinutes(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(String(value))) return null;
  const parts = String(value).split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function delayMinutes(data) {
  const scheduled = toMinutes(data.scheduledArrival);
  const actual = toMinutes(data.actualArrival);
  if (scheduled === null || actual === null) return null;
  let delay = actual - scheduled;
  if (delay < -720) delay += 1440;
  return Math.max(0, delay);
}

function potentialDelayRepay(data) {
  const issues = questions.issueFlags(data);
  const delay = delayMinutes(data);
  if (issues.cancelled || issues.abandoned || issues.delayRepayRejected) return "May need review";
  if (delay === null) return "Further information required";
  if (delay >= 15) return "Potential Delay Repay may be relevant";
  return "Delay below common Delay Repay starting point";
}

function evidencePosition(data) {
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  if (evidence.length >= 7) return { level: "Well Supported", explanation: "Several key documents and records have been marked as available." };
  if (evidence.length >= 4) return { level: "Supported", explanation: "The evidence position is supported but may still benefit from missing records." };
  if (evidence.length >= 2) return { level: "Developing", explanation: "Some useful evidence has been identified, but gaps remain." };
  return { level: "Limited", explanation: "Only limited evidence is currently recorded. The builder can still identify what may help." };
}

function completeness(data) {
  const missing = [];
  if (!Array.isArray(data.journeyIssues) || !data.journeyIssues.length) missing.push("What happened to the journey");
  if (!data.leadPassenger) missing.push("Lead passenger");
  if (!data.journeyDate) missing.push("Journey date");
  if (!data.departureStation) missing.push("Departure station");
  if (!data.arrivalStation) missing.push("Arrival station");
  if (!data.trainOperator) missing.push("Train operator");
  if (!Array.isArray(data.requestedOutcomes) || !data.requestedOutcomes.length) missing.push("Requested outcome");

  if (missing.length >= 4) return { status: "Needs Key Information", missing };
  if (missing.length) return { status: "In Progress", missing };
  if (evidencePosition(data).level === "Limited") return { status: "Needs Evidence", missing };
  return { status: "Ready for Review", missing };
}

function expenseTotal(expenses) {
  return (expenses || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function analyse(data) {
  const flags = questions.issueFlags(data);
  const delay = delayMinutes(data);
  return {
    operator: data.trainOperator || "Not recorded",
    route: [data.departureStation, data.arrivalStation].filter(Boolean).join(" to ") || "Not recorded",
    scheduledArrival: data.scheduledArrival || "Not recorded",
    actualArrival: data.actualArrival || "Not recorded",
    recordedDelay: delay === null ? "Further information required" : delay + " minutes",
    delayMinutes: delay,
    journeyCompleted: data.journeyComplete || "Not recorded",
    replacementTransport: flags.replacementBus || data.replacementTransport === "Yes",
    journeyAbandoned: flags.abandoned || data.journeyComplete === "No - abandoned",
    connectionMissed: flags.missedConnection,
    alternativeTransport: flags.alternativeTransport,
    delayRepayClaimed: data.delayRepayClaimed || "Not recorded",
    refundRequested: data.refundRequested || "Not recorded",
    operatorResponse: data.operatorResponse || "Not recorded",
    potentialDelayRepay: potentialDelayRepay(data),
    evidencePosition: evidencePosition(data),
    completeness: completeness(data),
    financialTotal: expenseTotal(data.expenses),
    issueLabels: (data.journeyIssues || []).map(questions.issueLabel)
  };
}

module.exports = { toMinutes, delayMinutes, potentialDelayRepay, evidencePosition, completeness, expenseTotal, analyse };
