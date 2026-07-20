"use strict";

const { escapeHtml, fallback } = require("../utilities/text");

function row(label, value) {
  return '<div class="qcbf-flight-row"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(fallback(value, "Not known")) + "</strong></div>";
}

function flightCard(flight) {
  const data = flight || {};
  const badges = (data.badges || []).map((badge) => '<span class="qcbf-badge qcbf-badge-neutral">' + escapeHtml(badge) + "</span>").join("");
  return '<article class="qcbf-card qcbf-flight-card">' +
    '<div class="qcbf-flight-top"><div><small>' + escapeHtml(data.airline || "Airline") + '</small><h3>' + escapeHtml(data.flightNumber || "Flight") + '</h3></div><div class="qcbf-flight-badges">' + badges + "</div></div>" +
    '<div class="qcbf-flight-grid">' +
    row("Operating airline", data.operatingAirline) +
    row("Travel date", data.travelDate) +
    row("Departure", data.departureAirport) +
    row("Arrival", data.arrivalAirport) +
    row("Scheduled departure", data.scheduledDeparture) +
    row("Actual departure", data.actualDeparture) +
    row("Scheduled arrival", data.scheduledArrival) +
    row("Actual arrival", data.actualArrival) +
    row("Arrival delay", data.arrivalDelay) +
    row("Distance", data.distance) +
    row("Distance band", data.distanceBand) +
    row("Possible regulation", data.regulation) +
    row("Per passenger", data.perPassenger) +
    row("Estimated total", data.estimatedTotal) +
    row("Passenger count", data.passengerCount) +
    row("Data confidence", data.dataConfidence) +
    row("Last updated", data.lastUpdated) +
    "</div>" +
    '<p class="small">Estimated only. Subject to airline investigation.</p>' +
    "</article>";
}

module.exports = { flightCard };
