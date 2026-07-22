"use strict";

(function(root, factory) {
  const evidence = factory(root.QCBFFlight && root.QCBFFlight.analysis);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.evidence = evidence;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  function evidencePosition(data) {
    const a = analysis.normaliseAnswers(data);
    let score = 0;
    const reasons = [];
    if (a.bookingConfirmationHeld === "Yes" || a.bookingReference) { score++; reasons.push("booking evidence"); }
    if (a.boardingPassHeld === "Yes" || a.ticketNumber) { score++; reasons.push("boarding or ticket evidence"); }
    if (a.actualArrival || a.manualDelayMinutes) { score++; reasons.push("arrival delay evidence"); }
    if (a.airlineReason && a.airlineReason !== "No explanation") { score++; reasons.push("airline explanation"); }
    if (a.expenses.length) { score++; reasons.push("expense records"); }
    const level = score >= 5 ? "Well Supported" : score >= 3 ? "Supported" : score >= 1 ? "Developing" : "Limited";
    return { level, score, reasons: reasons.length ? reasons.join(", ") : "Key evidence still needs adding" };
  }

  function buildEvidenceChecklist(data) {
    const a = analysis.normaliseAnswers(data);
    const parts = ["Flight Evidence Checklist", "", "Required Journey Information", "[ ] passenger name", "[ ] flight number", "[ ] booking reference", "[ ] travel date", "[ ] departure airport", "[ ] final destination", "[ ] airline", "[ ] operating airline, if known", "", "Supporting Documents", "[ ] booking confirmation", "[ ] boarding pass", "[ ] ticket or itinerary", "[ ] airline delay or cancellation messages", "[ ] airport screenshots", "[ ] rerouting details", "[ ] airline correspondence", "[ ] previous complaint response"];
    if (a.expenses.length || analysis.has(a, "expenses")) parts.push("", "Expense Evidence", "[ ] receipts", "[ ] payment confirmations", "[ ] hotel invoices", "[ ] meal receipts", "[ ] replacement transport receipts", "[ ] currency evidence");
    parts.push("", "Optional Evidence", "[ ] photographs of airport displays", "[ ] notes of announcements", "[ ] names of airline staff", "[ ] travel companion statement", "[ ] baggage records", "[ ] disruption screenshots", "", "Only send documents relevant to the complaint. Remove unnecessary personal or payment information where appropriate.");
    return parts.join("\n");
  }

  return { evidencePosition, buildEvidenceChecklist };
});
