"use strict";

(function(root, factory) {
  const parking = root.QCBFParking || {};
  const api = factory(parking.analysis, parking.evidence, parking.submission, parking.resources, parking.config);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.documents = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, evidence, submission, resources, config) {
  if (!analysis && typeof require === "function") analysis = require("./parking.analysis");
  if (!evidence && typeof require === "function") evidence = require("./parking.evidence");
  if (!submission && typeof require === "function") submission = require("./parking.submission");
  if (!resources && typeof require === "function") resources = require("./parking.resources");
  if (!config && typeof require === "function") config = require("./parking.config");

  function value(text, fallback) {
    return text || fallback || "Not recorded";
  }

  function line(label, body) {
    return label + ": " + value(body);
  }

  function list(items) {
    const rows = (items || []).filter(Boolean);
    return rows.length ? rows.map(item => "- " + item).join("\n") : "- Not recorded";
  }

  function buildSummary(data, context) {
    const result = analysis.analyse(data || {});
    return [
      "QUAERENS CONSUMER COMPLAINT FILE",
      "",
      "Parking Ticket and Parking Charge Appeal Pack",
      "",
      line("Pack reference", context.packReference),
      line("Generated", new Date().toLocaleDateString("en-GB")),
      line("Builder", config.productName),
      line("Readiness", result.completeness.status),
      "",
      "NOTICE SUMMARY",
      line("Notice type", data.noticeType),
      line("Current stage", data.currentStage),
      line("Issuer", data.issuerName),
      line("Issuer route", result.issuerRoute),
      line("Notice number", data.noticeNumber),
      line("Vehicle registration", data.vehicleReg),
      line("Location", data.location),
      line("Event date", data.eventDate),
      line("Jurisdiction", result.jurisdiction),
      "",
      "FINANCIAL POSITION",
      result.financial.summary.join("\n")
    ].join("\n");
  }

  function buildAnalysis(data) {
    const result = analysis.analyse(data || {});
    return [
      "APPEAL ANALYSIS",
      line("Stage", result.stage.name),
      line("Evidence position", result.evidencePosition.level + " - " + result.evidencePosition.explanation),
      line("Jurisdiction note", result.jurisdictionCaution),
      "",
      "Potential points to review",
      list(result.grounds),
      "",
      "Deadline position",
      result.deadline.items.map(item => "- " + item.label + ": " + (item.value || "not recorded") + " (" + item.status + ")").join("\n"),
      "",
      result.deadline.message,
      "",
      result.stage.caution
    ].join("\n");
  }

  function buildEvidence(data) {
    const checklist = evidence.buildEvidenceChecklist(data || {});
    return [
      "EVIDENCE CHECKLIST",
      checklist.map(item => "- " + item.label + ": " + item.status).join("\n"),
      "",
      "Missing or useful evidence",
      list(evidence.missingEvidence(data || {}).map(item => item.label))
    ].join("\n");
  }

  function buildTimeline(data) {
    const rows = (data.timelineRows || []).filter(row => row && (row.date || row.event || row.note));
    const entries = rows.length ? rows.map(row => "- " + value(row.date, "Date not recorded") + ": " + value(row.event, "Event not recorded") + (row.note ? " - " + row.note : "")) : [value(data.timelineNotes, "Timeline not recorded.")];
    return ["TIMELINE", entries.join("\n")].join("\n");
  }

  function buildLetter(data, context) {
    const result = analysis.analyse(data || {});
    const selectedDocs = data.documentTypes || [];
    const isUrgent = result.stage.urgent;
    const heading = isUrgent ? "FACTS AND EVIDENCE SUMMARY" : "DRAFT PARKING APPEAL";
    return [
      heading,
      "",
      "To: " + value(data.issuerName, "Parking issuer"),
      "Reference: " + value(context.packReference),
      "Notice number: " + value(data.noticeNumber),
      "Vehicle registration: " + value(data.vehicleReg),
      "",
      "I am writing about a parking notice recorded as: " + value(data.noticeType) + ". The current stage recorded is: " + value(data.currentStage) + ".",
      "The parking event is recorded as taking place at " + value(data.location) + " on " + value(data.eventDate) + ".",
      "",
      isUrgent
        ? "This document is a factual evidence summary only. It is not a court defence, statutory declaration, witness statement or legal advice."
        : "Please treat this as an appeal or review request based on the facts and evidence set out below.",
      "",
      "What happened",
      value(data.narrative || (data.whatHappened || []).join("; "), "No narrative recorded."),
      "",
      "Points requested for review",
      list(result.grounds),
      "",
      "Requested outcome",
      list(data.requestedOutcomes),
      "",
      "Documents requested in this pack",
      list(selectedDocs),
      "",
      "Please confirm the outcome in writing and provide any photographs, payment records, signage evidence or appeal code relied on."
    ].join("\n");
  }

  function buildSubmission(data) {
    const smart = submission.smartSubmission(data || {});
    return [
      "QUAERENS SMART SUBMISSION",
      line("Readiness", smart.readiness),
      line("Preferred complaint method", smart.preferredMethod),
      line("Issuer route", smart.route.name),
      "",
      "Before submitting",
      list(smart.checks),
      "",
      smart.warning
    ].join("\n");
  }

  function buildResources() {
    return [
      "OFFICIAL AND AUTHORITATIVE RESOURCES",
      resources.officialSources.map(source => "- " + source.name + ": " + source.url + " (last checked " + source.verified + ")").join("\n")
    ].join("\n");
  }

  function buildAll(data, context) {
    const ctx = context || {};
    const docs = {
      summary: buildSummary(data || {}, ctx),
      analysis: buildAnalysis(data || {}),
      evidence: buildEvidence(data || {}),
      timeline: buildTimeline(data || {}),
      appeal: buildLetter(data || {}, ctx),
      submission: buildSubmission(data || {}),
      resources: buildResources()
    };
    docs.full = [docs.summary, docs.analysis, docs.evidence, docs.timeline, docs.appeal, docs.submission, docs.resources].join("\n\n");
    return docs;
  }

  return { buildAll, buildSummary, buildAnalysis, buildEvidence, buildTimeline, buildLetter, buildSubmission };
});
