"use strict";

(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.evidence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const evidenceItems = [
    "Original PCN, parking charge or notice",
    "Envelope or postal proof where relevant",
    "Notice to Keeper, Notice to Owner or rejection letter",
    "Photographs from the operator or council",
    "Your own photographs of signs, bays, machines and entrance",
    "Payment receipt, app screenshot or bank statement",
    "Ticket, permit, Blue Badge or authorisation",
    "Breakdown, medical, emergency or disability evidence",
    "Loading, delivery or appointment evidence",
    "Hire, lease, company vehicle or sale documents",
    "Copies of earlier appeals and replies",
    "POPLA, IAS or tribunal code where supplied",
    "Debt collector, Letter Before Claim or court paperwork",
    "Timeline of what happened and when"
  ];

  function buildEvidenceChecklist(data) {
    const present = new Set(data.evidence || []);
    return evidenceItems.map(label => ({
      label,
      status: present.has(label) ? "Recorded" : "May help if available"
    }));
  }

  function missingEvidence(data) {
    return buildEvidenceChecklist(data).filter(item => item.status !== "Recorded").slice(0, 8);
  }

  function evidencePosition(data) {
    const count = (data.evidence || []).length;
    if (count >= 8) return { level: "Well Supported", explanation: "Several core documents and supporting evidence have been recorded." };
    if (count >= 5) return { level: "Supported", explanation: "Useful evidence has been recorded, but the appeal may still benefit from the missing items listed." };
    if (count >= 2) return { level: "Developing", explanation: "Some evidence is recorded. Add the notice, photos, payment proof or correspondence where available." };
    return { level: "Limited", explanation: "The appeal pack can be started, but more documents will usually make the position clearer." };
  }

  return { evidenceItems, buildEvidenceChecklist, missingEvidence, evidencePosition };
});
