"use strict";

(function(root, factory) {
  const timeline = factory(root.QCBFFlight && root.QCBFFlight.analysis);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.timeline = timeline;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  function buildTimeline(data) {
    const a = analysis.normaliseAnswers(data);
    const rows = [
      ["Booking made", "[date]", analysis.fallback(a.bookingAgent, "booking route"), analysis.fallback(a.bookingReference, "booking confirmation")],
      ["Travel date", analysis.fallback(a.flightDate, "[date]"), analysis.routeLine(a), "itinerary / ticket"],
      ["Scheduled departure", analysis.formatDate(a.scheduledDeparture), analysis.fallback(a.departureAirport), "airline schedule"],
      ["Actual departure", analysis.formatDate(a.actualDeparture), analysis.fallback(a.departureAirport), "airport or airline record"]
    ];
    if (analysis.has(a, "cancelled")) rows.push(["Cancellation notified", analysis.fallback(a.cancelNotice, "[date/time]"), analysis.fallback(a.departureAirport), analysis.fallback(a.cancelHow, "airline message")]);
    if (analysis.has(a, "missedConnection")) rows.push(["Connection missed", "[date/time]", analysis.fallback(a.connectingAirport, "connection airport"), analysis.fallback(a.connectionCause, "journey records")]);
    if (analysis.has(a, "rerouted") || analysis.has(a, "cancelled")) rows.push(["Alternative journey or rerouting", "[date/time]", analysis.fallback(a.replacementDepartureAirport || a.departureAirport), analysis.fallback(a.altFlightOffered, "airline rerouting record")]);
    if (analysis.has(a, "care") || analysis.has(a, "expenses") || a.expenses.length) rows.push(["Care, assistance or expenses recorded", "[date/time]", "airport / hotel / transport", a.expenses.length ? "expense schedule" : "receipts and notes"]);
    rows.push(["Final destination reached", analysis.formatDate(a.actualArrival), analysis.fallback(a.finalDestination), "arrival evidence"]);
    if (a.previousComplaint === "Yes") rows.push(["Complaint submitted", "[date]", analysis.fallback(a.airline, "airline"), analysis.fallback(a.complaintReference, "submission proof")]);
    if (a.previousResponse && a.previousResponse !== "Not applicable") rows.push(["Airline response received", "[date]", analysis.fallback(a.airline, "airline"), analysis.fallback(a.previousResponse, "airline response")]);
    rows.push(["Additional event", "[date/time]", "[location]", "[evidence]"]);
    return "Journey and Disruption Timeline\n\nEvent\tDate and Time\tLocation\tEvidence Reference\n" + rows.map(row => row.join("\t")).join("\n");
  }

  return { buildTimeline };
});
