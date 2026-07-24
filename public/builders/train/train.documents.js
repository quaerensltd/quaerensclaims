"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.analysis, train.evidence, train.submission, train.resources, train.compensation, train.config);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.documents = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, evidence, submission, resources, compensation, config) {
  if (!analysis && typeof require === "function") analysis = require("./train.analysis");
  if (!evidence && typeof require === "function") evidence = require("./train.evidence");
  if (!submission && typeof require === "function") submission = require("./train.submission");
  if (!resources && typeof require === "function") resources = require("./train.resources");
  if (!compensation && typeof require === "function") compensation = require("./train.compensation");
  if (!config && typeof require === "function") config = require("./train.config");

  function value(text, fallback) {
    return text || fallback || "Not recorded";
  }

  function passengers(data) {
    const names = [data.leadPassenger].concat(String(data.additionalPassengers || "")
      .split(/\r?\n|,/)
      .map(item => item.trim())
      .filter(Boolean));
    return names.filter(Boolean);
  }

  function line(label, body) {
    return label + ": " + value(body);
  }

  function buildSummary(data, context) {
    const result = analysis.analyse(data);
    const comp = result.compensation;
    const pax = passengers(data);
    return [
      "QUAERENS CONSUMER COMPLAINT FILE",
      "",
      "Rail Journey Disruption",
      "",
      line("Pack reference", context.packReference),
      line("Generated", new Date().toLocaleDateString("en-GB")),
      line("Builder", config.productName),
      line("Readiness", result.completeness.status),
      "",
      "PASSENGER AND JOURNEY",
      line("Passenger count", comp.passengerCount),
      line("Passengers covered", pax.length ? pax.join(", ") : "Not recorded"),
      line("Journey", result.route),
      line("Travel date", data.journeyDate),
      line("Operator", result.operator),
      line("Ticket type", data.ticketType),
      line("Ticket basis", comp.ticketBasis),
      line("Booking reference", data.bookingReference),
      "",
      "JOURNEY ANALYSIS",
      line("What happened", (data.journeyIssues || []).join(", ")),
      line("Scheduled arrival", data.scheduledArrival),
      line("Actual arrival", data.actualArrival),
      line("Final-destination delay", result.recordedDelay),
      line("Possible route", result.requestedOutcome),
      line("Evidence position", result.evidencePosition.level + " - " + result.evidencePosition.explanation)
    ].join("\n");
  }

  function buildCompensation(data) {
    const comp = compensation.estimateDelayRepay(data);
    return [
      "COMPENSATION, REFUND AND EXPENSE SUMMARY",
      line("Estimated statutory Delay Repay per passenger", compensation.money(comp.perPassengerEstimate)),
      line("Passenger count", comp.passengerCount),
      line("Estimated Delay Repay total", compensation.money(comp.grossDelayRepay)),
      line("Compensation already received", compensation.money(comp.alreadyReceived)),
      line("Net recorded Delay Repay estimate", compensation.money(comp.netDelayRepay)),
      line("Possible ticket refund route", compensation.money(comp.possibleRefund)),
      line("Documented expenses", compensation.money(comp.expenses)),
      line("Estimated total requested", compensation.money(comp.estimatedTotalRequested)),
      "",
      comp.estimatedOnly,
      "",
      "Assumptions",
      (comp.assumptions.length ? comp.assumptions : ["No calculation assumptions recorded yet."]).map(item => "- " + item).join("\n"),
      "",
      "Cautions",
      (comp.warnings.length ? comp.warnings : ["Check current operator scheme rules before submitting."]).map(item => "- " + item).join("\n")
    ].join("\n");
  }

  function buildEvidence(data) {
    const rows = evidence.buildEvidenceChecklist(data);
    return [
      "EVIDENCE CHECKLIST",
      rows.map(row => "- " + row.label + ": " + row.status).join("\n") || "No evidence recorded.",
      "",
      "Missing or requested evidence",
      evidence.missingEvidence(data).map(row => "- " + row.label).join("\n") || "No key missing items recorded."
    ].join("\n");
  }

  function buildTimeline(data) {
    const timeline = (data.timelineRows || []).filter(row => row && (row.date || row.event));
    const rows = timeline.length ? timeline.map(row => "- " + value(row.date, "Date not recorded") + ": " + value(row.event, "Event not recorded")) : [value(data.timelineNotes, "Timeline notes not recorded.")];
    return ["TIMELINE", rows.join("\n")].join("\n");
  }

  function buildLetter(data, context) {
    const result = analysis.analyse(data);
    const comp = result.compensation;
    return [
      "DRAFT RAIL COMPLAINT LETTER",
      "",
      "To: " + value(result.operator, "Train operator"),
      "Reference: " + value(context.packReference),
      "",
      "I am writing about a rail journey from " + value(data.departureStation) + " to " + value(data.arrivalStation) + " on " + value(data.journeyDate) + ".",
      "The issue recorded in this complaint pack is: " + value((data.journeyIssues || []).join(", ")) + ".",
      "",
      "The final-destination delay currently recorded is " + value(result.recordedDelay) + ". The pack covers " + comp.passengerCount + " passenger(s).",
      "Based on the information entered, the estimated statutory Delay Repay figure is " + compensation.money(comp.grossDelayRepay) + ", with documented expenses of " + compensation.money(comp.expenses) + ". Any refund or expense request should be assessed separately from Delay Repay.",
      "",
      "Please review the attached evidence, journey timeline and financial summary, and confirm the complaint or compensation route that applies.",
      "",
      "This letter is generated from the Quaerens self-service builder. I have reviewed the contents before sending."
    ].join("\n");
  }

  function buildSubmission(data) {
    const smart = submission.smartSubmission(data);
    const route = smart.operatorRoute;
    return [
      "QUAERENS SMART SUBMISSION",
      line("Readiness", smart.readiness),
      line("Preferred complaint method", route.preferredComplaintMethod),
      line("Official website", route.officialWebsite),
      line("Delay Repay page", route.delayRepayPage),
      line("Refund page", route.refundPage),
      line("Customer relations", route.customerRelations),
      line("Rail Ombudsman position", smart.ombudsmanReadiness),
      "",
      "Before submitting",
      smart.checks.map(item => "- " + item).join("\n"),
      "",
      smart.warning
    ].join("\n");
  }

  function buildResources() {
    return [
      "OFFICIAL RESOURCES",
      resources.officialSources.map(source => "- " + source.name + ": " + source.url).join("\n")
    ].join("\n");
  }

  function buildAll(data, context) {
    const ctx = context || {};
    const docs = {
      summary: buildSummary(data || {}, ctx),
      compensation: buildCompensation(data || {}),
      evidence: buildEvidence(data || {}),
      timeline: buildTimeline(data || {}),
      complaint: buildLetter(data || {}, ctx),
      submission: buildSubmission(data || {}),
      resources: buildResources()
    };
    docs.full = [
      docs.summary,
      "",
      docs.compensation,
      "",
      docs.evidence,
      "",
      docs.timeline,
      "",
      docs.complaint,
      "",
      docs.submission,
      "",
      docs.resources
    ].join("\n\n");
    return docs;
  }

  return {
    buildAll: buildAll,
    buildSummary: buildSummary,
    buildCompensation: buildCompensation,
    buildEvidence: buildEvidence,
    buildTimeline: buildTimeline,
    buildLetter: buildLetter,
    buildSubmission: buildSubmission
  };
});
