"use strict";

const config = require("./train.config");
const analysis = require("./train.analysis");
const evidence = require("./train.evidence");
const submission = require("./train.submission");

function createPackReference(seed) {
  const suffix = String(seed || Math.random().toString(36).slice(2, 8)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).padEnd(6, "X");
  return config.packPrefix + "-" + new Date().getFullYear() + "-" + suffix;
}

function buildPreviewCards(data, context) {
  const result = analysis.analyse(data);
  const evidenceStatus = evidence.buildEvidenceStatus(data);
  const submissionPlaceholder = submission.buildSubmissionPlaceholder(data);
  const packReference = (context && context.packReference) || createPackReference("PHASE1");

  return [
    { title: "Journey Summary", body: result.route },
    { title: "Journey Analysis", body: "Recorded delay: " + result.recordedDelay },
    { title: "Evidence Position", body: result.evidencePosition.level + " - " + result.evidencePosition.explanation },
    { title: "Complaint Pack Completeness", body: result.completeness.status },
    { title: "Financial Summary", body: "Recorded expenses: GBP " + result.financialTotal.toFixed(2) },
    { title: "Requested Outcome", body: (data.requestedOutcomes || []).join(", ") || "Not recorded" },
    { title: "Operator", body: result.operator },
    { title: "Timeline", body: data.timelineNotes || "Timeline notes not recorded" },
    { title: "Pack Reference", body: packReference },
    { title: "Downloads Placeholder", body: "PDF, Word, TXT, print and copy are Phase 2." },
    { title: "Operator Route Placeholder", body: submissionPlaceholder.preferredComplaintMethod },
    { title: "Evidence Items", body: evidenceStatus.map(item => item.label + ": " + item.status).join("; ") || "No dynamic evidence yet" }
  ];
}

module.exports = { createPackReference, buildPreviewCards };
