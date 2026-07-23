"use strict";

(function(root, factory) {
  const evidence = factory(root.QCBFBaggage && root.QCBFBaggage.analysis);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./baggage.analysis"));
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.evidence = evidence;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  const evidenceItems = [
    ["booking", "Booking confirmation, ticket or itinerary"],
    ["boarding", "Boarding pass or proof of travel"],
    ["bagTag", "Checked baggage tag or bag receipt"],
    ["pir", "Property Irregularity Report (PIR) or airport baggage report"],
    ["tracking", "WorldTracer, airline tracking or baggage reference"],
    ["photos", "Photographs or videos of damaged baggage or contents"],
    ["receipts", "Receipts for essential purchases, repair, replacement or proof of value"],
    ["messages", "Airline emails, app messages, chat logs or complaint replies"],
    ["delivery", "Delivery confirmation or date baggage was returned"],
    ["insurance", "Travel insurance policy, claim decision or payment details"],
    ["police", "Police report where contents are alleged missing or stolen"],
    ["mobility", "Medical, accessibility or mobility equipment evidence where relevant"]
  ];

  function labelFor(id) {
    const item = evidenceItems.find(row => row[0] === id);
    return item ? item[1] : id;
  }

  function buildEvidenceStatus(data) {
    const available = Array.isArray(data.evidence) ? data.evidence : [];
    return evidenceItems.map(([id, label]) => {
      let status = available.includes(id) ? "Available" : "Missing";
      if (id === "pir" && data.pirCompleted === "No") status = "Requested";
      if (id === "police" && !analysis.issueList(data).some(issue => /missing|stolen/i.test(issue))) status = "Not applicable";
      if (id === "mobility" && !analysis.issueList(data).some(issue => /mobility/i.test(issue))) status = "Not applicable";
      if (id === "insurance" && data.insuranceHeld === "No") status = "Not applicable";
      return { id, label, status };
    });
  }

  function buildEvidenceChecklist(data) {
    const position = analysis.evidencePosition(data);
    const rows = buildEvidenceStatus(data).map((item, index) => (index + 1) + ". " + item.label + " - " + item.status).join("\n");
    const missing = position.missing.length ? position.missing.map(item => "- " + item).join("\n") : "No key missing evidence flagged by the builder.";
    return "EVIDENCE CHECKLIST\n\nEvidence position: " + position.label + "\n\nCurrent evidence status:\n" + rows + "\n\nMissing or requested evidence:\n" + missing + "\n\nEvidence note:\nYou can still prepare the complaint pack if some documents are missing. The pack should explain what is available, what has been requested and what is not applicable.";
  }

  function buildMissingEvidence(data) {
    const statusRows = buildEvidenceStatus(data).filter(item => item.status === "Missing" || item.status === "Requested");
    if (!statusRows.length && !data.missingEvidence) return "MISSING EVIDENCE\n\nNo missing evidence has been specifically recorded.";
    return "MISSING EVIDENCE\n\n" + statusRows.map(item => "- " + item.label + " (" + item.status + ")").join("\n") + (data.missingEvidence ? "\n\nNotes entered:\n" + data.missingEvidence : "");
  }

  return { evidenceItems, labelFor, buildEvidenceStatus, buildEvidenceChecklist, buildMissingEvidence };
});
