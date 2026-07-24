"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.questions, train.analysis);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.evidence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(questions, analysis) {
  if (!questions && typeof require === "function") questions = require("./train.questions");
  if (!analysis && typeof require === "function") analysis = require("./train.analysis");

  const evidenceRules = {
    delayed: ["ticket", "booking", "delayNotification", "arrivalEvidence", "receipts"],
    cancelled: ["ticket", "operatorMessages", "replacementOffered", "arrivalEvidence", "receipts"],
    missedConnection: ["ticket", "booking", "connectionDetails", "delayNotification", "receipts"],
    abandoned: ["ticket", "alternativeTravel", "receipts", "operatorMessages"],
    replacementBus: ["operatorMessages", "replacementOffered", "arrivalEvidence"],
    alternativeTransport: ["alternativeTravel", "receipts", "journeyNotes"],
    seatUnavailable: ["seatReservation", "ticket", "operatorMessages"],
    overcrowding: ["ticket", "photos", "journeyNotes"],
    incorrectInformation: ["screenshots", "operatorMessages", "journeyNotes"],
    delayRepayRejected: ["claimReference", "operatorDecision", "appeal", "ticket"],
    refundRejected: ["operatorDecision", "claimReference", "ticket", "booking"],
    accessibility: ["passengerAssist", "operatorMessages", "journeyNotes"],
    other: ["journeyNotes", "operatorMessages"]
  };

  function unique(list) {
    return Array.from(new Set((list || []).filter(Boolean)));
  }

  function requiredEvidence(journeyIssues) {
    const selected = journeyIssues || [];
    let required = ["ticket", "journeyNotes"];
    selected.forEach(issue => {
      required = required.concat(evidenceRules[issue] || evidenceRules.other);
    });
    return unique(required);
  }

  function labelFor(id) {
    const found = (questions.evidenceOptions || []).find(item => item.id === id);
    return found ? found.label : id.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase());
  }

  function buildEvidenceStatus(data) {
    const selected = (data && data.evidence) || [];
    const required = requiredEvidence((data && data.journeyIssues) || []);
    const optional = (questions.evidenceOptions || []).map(item => item.id).filter(id => !required.includes(id));
    return required.concat(optional).map(id => {
      const status = selected.includes(id) ? "Available" : (required.includes(id) ? "Requested" : "Not applicable");
      return { id: id, label: labelFor(id), status: status, required: required.includes(id) };
    });
  }

  function buildEvidenceChecklist(data) {
    return buildEvidenceStatus(data).filter(item => item.required || item.status === "Available");
  }

  function missingEvidence(data) {
    return buildEvidenceStatus(data).filter(item => item.required && item.status !== "Available");
  }

  function evidencePosition(data) {
    return analysis.evidencePosition(data || {});
  }

  return {
    requiredEvidence: requiredEvidence,
    buildEvidenceStatus: buildEvidenceStatus,
    buildEvidenceChecklist: buildEvidenceChecklist,
    missingEvidence: missingEvidence,
    evidencePosition: evidencePosition
  };
});
