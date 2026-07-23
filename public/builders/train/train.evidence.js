"use strict";

const evidenceRules = {
  delayed: ["ticket", "booking", "screenshots", "delayNotifications", "receipts"],
  cancelled: ["ticket", "operatorMessages", "replacementOffered", "announcements", "alternativeTransport"],
  missedConnection: ["ticket", "booking", "connectionDetails", "delayNotifications", "receipts"],
  abandoned: ["ticket", "alternativeTravel", "receipts", "operatorMessages"],
  replacementBus: ["operatorMessages", "announcements", "replacementTransport", "arrivalEvidence"],
  alternativeTransport: ["alternativeTravel", "receipts", "reasonForAlternative"],
  seatUnavailable: ["seatReservation", "ticket", "operatorMessages"],
  overcrowding: ["ticket", "photos", "operatorMessages", "journeyNotes"],
  delayRepayRejected: ["claimReference", "operatorDecision", "appeal", "ticket"],
  refundRejected: ["operatorResponse", "refundRequest", "ticket", "booking"],
  incorrectInformation: ["screenshots", "operatorMessages", "announcements", "journeyNotes"],
  other: ["journeyNotes", "operatorMessages"]
};

const labels = {
  ticket: "Ticket or travel pass",
  booking: "Booking confirmation",
  screenshots: "Screenshots",
  delayNotifications: "Delay notifications",
  receipts: "Receipts",
  operatorMessages: "Operator messages",
  replacementOffered: "Replacement transport offered",
  announcements: "Station or onboard announcements",
  alternativeTransport: "Alternative transport evidence",
  connectionDetails: "Connection details",
  alternativeTravel: "Alternative travel records",
  replacementTransport: "Replacement bus or transport records",
  arrivalEvidence: "Arrival-time evidence",
  reasonForAlternative: "Reason alternative transport was used",
  seatReservation: "Seat reservation",
  photos: "Photos or videos",
  journeyNotes: "Journey notes",
  claimReference: "Delay Repay claim reference",
  operatorDecision: "Operator decision",
  appeal: "Appeal or review request",
  operatorResponse: "Operator response",
  refundRequest: "Refund request"
};

function requiredEvidence(issues) {
  const set = new Set();
  (issues || []).forEach(issue => (evidenceRules[issue] || []).forEach(item => set.add(item)));
  return Array.from(set);
}

function buildEvidenceStatus(data) {
  const available = new Set(Array.isArray(data.evidence) ? data.evidence : []);
  const required = requiredEvidence(data.journeyIssues);
  return required.map(id => ({
    id,
    label: labels[id] || id,
    status: available.has(id) ? "Available" : "Requested"
  }));
}

module.exports = { evidenceRules, labels, requiredEvidence, buildEvidenceStatus };
