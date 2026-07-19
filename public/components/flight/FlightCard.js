(function () {
  function defaultEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char];
    });
  }

  function valueText(value, fallback) {
    return value === 0 || value ? String(value) : (fallback || "Not known");
  }

  function formatMoney(value, currency) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "Further review";
    var symbol = currency === "EUR" ? "\u20ac" : "\u00a3";
    return symbol + Math.round(n).toLocaleString("en-GB");
  }

  function statusBadges(flight) {
    var badges = ["Flight Found"];
    var status = String(flight.status || "").toLowerCase();
    var delay = Number(flight.delay && flight.delay.delayMinutes);
    if (status.indexOf("cancel") !== -1) badges.push("Cancelled");
    else if (Number.isFinite(delay) && delay >= 180) badges.push("Delayed");
    else if (Number.isFinite(delay) && delay < 15) badges.push("On Time");
    else if (!Number.isFinite(delay)) badges.push("Awaiting Data");
    if (flight.compensation && flight.compensation.eligible) badges.push("Compensation Estimate Available");
    badges.push("Complaint Pack Available");
    return badges;
  }

  function render(flight, options) {
    options = options || {};
    var escape = options.escapeHtml || defaultEscape;
    var formatDate = options.formatDate || valueText;
    var airportDisplay = options.airportDisplay || function (airport) {
      if (!airport) return "";
      return [airport.name, airport.iata].filter(Boolean).join(" ");
    };
    var passengerCount = Math.max(1, parseInt(options.passengerCount || "1", 10) || 1);
    var dep = airportDisplay(flight.departureAirport) || "Departure not found";
    var arr = airportDisplay(flight.arrivalAirport) || "Arrival not found";
    var comp = flight.compensation || {};
    var perPassenger = comp.perPassenger ? formatMoney(comp.perPassenger, comp.currency) + " per passenger" : "Further review";
    var total = comp.total || comp.statutoryTotal ? formatMoney(comp.total || comp.statutoryTotal, comp.currency) : "Further review";
    var badgeHtml = statusBadges(flight).map(function (label) {
      var cls = /Found|Available/.test(label) ? " good" : /Delayed|Cancelled/.test(label) ? " warn" : "";
      return '<span class="flight-badge' + cls + '">' + escape(label) + "</span>";
    }).join("");
    var field = function (label, value) {
      return '<div class="flight-card-field"><span>' + escape(label) + "</span><strong>" + escape(valueText(value)) + "</strong></div>";
    };

    return '<article class="flight-card" data-component="FlightCard">' +
      '<div class="flight-card-head"><div><div class="flight-card-kicker">' + escape(valueText(flight.airline && flight.airline.name, "Airline")) + '</div><div class="flight-card-number">' + escape(valueText(flight.flightNumber || options.flightNumber)) + '</div><div class="flight-card-route">' + escape(dep + " \u2192 " + arr) + '</div></div><div class="flight-card-highlight"><span>Estimated statutory compensation</span><strong>' + escape(perPassenger) + '</strong><small>Estimated total: ' + escape(total) + '</small></div></div>' +
      '<div class="flight-card-badges">' + badgeHtml + '</div>' +
      '<div class="flight-card-grid">' +
      field("Operating airline", flight.operatingAirline && flight.operatingAirline.name || flight.airline && flight.airline.name) +
      field("Travel date", options.travelDate) +
      field("Departure airport", dep) +
      field("Arrival airport", arr) +
      field("Scheduled departure", formatDate(flight.scheduledDeparture && (flight.scheduledDeparture.local || flight.scheduledDeparture.utc))) +
      field("Actual departure", formatDate(flight.actualDeparture && (flight.actualDeparture.local || flight.actualDeparture.utc))) +
      field("Scheduled arrival", formatDate(flight.scheduledArrival && (flight.scheduledArrival.local || flight.scheduledArrival.utc))) +
      field("Actual arrival", formatDate(flight.actualArrival && (flight.actualArrival.local || flight.actualArrival.utc))) +
      field("Arrival delay", flight.delay && flight.delay.delayText || "Not calculated") +
      field("Distance", flight.distanceKm ? flight.distanceKm + " km" : "Further review required") +
      field("Distance band", comp.distanceBand || "Further review") +
      field("Flight status", flight.status || "Awaiting data") +
      field("Possible regulation", flight.possibleRegulation || "Further review") +
      field("Passenger count", passengerCount) +
      field("Data confidence", flight.dataConfidence || (flight.rawProvider ? "Provider data found" : "Manual review")) +
      field("Last updated", formatDate(options.lastUpdated || new Date().toISOString())) +
      '</div>' +
      '<p class="flight-card-note">Estimated only. Subject to airline investigation. Preferred complaint method and official submission details are shown later in Smart Submission when the airline is selected.</p>' +
      '<div class="flight-card-actions"><button type="button" class="btn btn-blue" id="useFlightLookupBtn">Build Complaint Pack</button><button type="button" class="btn btn-outline" id="viewJourneyAnalysisBtn">View Journey Analysis</button><button type="button" class="btn btn-outline" id="viewAirlineRouteBtn">View Airline Complaint Route</button><button type="button" class="btn btn-outline" id="ignoreFlightLookupBtn">Search Another Flight</button></div>' +
      '</article>';
  }

  window.QuaerensFlightCard = { render: render };
})();
