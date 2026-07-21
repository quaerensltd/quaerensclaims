"use strict";

const { readiness, evidencePosition, confidence } = require("./Engines");

function statusEngine(config, data, evidenceItems, confidenceSignals, submission) {
  const ready = readiness(config || {}, data || {});
  const evidence = evidencePosition(evidenceItems || []);
  const confidenceStatus = confidence(confidenceSignals || []);
  const submissionStatus = resolveSubmissionStatus(submission);
  const draftStatus = resolveDraftStatus(data);

  return {
    readiness: ready,
    evidence,
    confidence: confidenceStatus,
    submission: submissionStatus,
    draft: draftStatus,
    badges: [
      ready.status,
      evidence.level,
      confidenceStatus.label,
      submissionStatus.label,
      draftStatus.label
    ].filter(Boolean)
  };
}

function resolveSubmissionStatus(submission) {
  if (!submission) return { label: "Submission Route Pending", tone: "warning" };
  if (submission.status === "matched" || submission.preferredMethod) {
    return { label: "Submission Route Identified", tone: "success", method: submission.preferredMethod || submission.method };
  }
  if (submission.status === "not-listed") return { label: "Manual Submission Review", tone: "warning" };
  return { label: "Submission Route Pending", tone: "neutral" };
}

function resolveDraftStatus(data) {
  const keys = Object.keys(data || {}).filter((key) => {
    const value = data[key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
  return keys.length ? { label: "Draft In Progress", tone: "info", populatedFields: keys.length } : { label: "Draft Not Started", tone: "neutral", populatedFields: 0 };
}

module.exports = { statusEngine, resolveSubmissionStatus, resolveDraftStatus };
