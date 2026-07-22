"use strict";

(function(root, factory) {
  const lookup = factory();
  if (typeof module === "object" && module.exports) module.exports = lookup;
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.lookup = lookup;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function normaliseFlightNumber(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function stableLookupPayload(payload) {
    const source = payload || {};
    const clean = {};
    Object.keys(source).sort().forEach(key => {
      const value = source[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") clean[key] = value;
    });
    return clean;
  }

  function buildLookupPayload(mode, data) {
    const a = data || {};
    return stableLookupPayload({
      mode: mode || a.mode || "exact",
      searchType: mode || a.searchType || "exact",
      flightNumber: normaliseFlightNumber(a.flightNumber || a.lookupFlightNumber),
      date: a.date || a.flightDate || a.lookupFlightDate,
      departureAirport: a.departureAirport,
      arrivalAirport: a.arrivalAirport || a.finalDestination,
      airline: a.airline,
      airlineCode: a.airlineCode
    });
  }

  async function requestFlightLookup(payload, options) {
    const fetcher = (options && options.fetch) || (typeof fetch !== "undefined" ? fetch : null);
    if (!fetcher) throw new Error("Flight lookup requires fetch");
    const endpoint = (options && options.endpoint) || "/api/flight-lookup";
    const response = await fetcher(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stableLookupPayload(payload)) });
    if (!response.ok) throw new Error("Flight lookup failed with status " + response.status);
    return response.json();
  }

  function flightToBuilderAnswers(flight, context) {
    const f = flight || {};
    const c = context || {};
    const dep = f.departureAirport || {};
    const arr = f.arrivalAirport || {};
    return {
      airline: (f.airline && f.airline.name) || c.airline || "",
      operatingAirline: (f.operatingAirline && f.operatingAirline.name) || "",
      flightNumber: f.flightNumber || c.flightNumber || "",
      flightDate: c.date || f.flightDate || (f.scheduledDeparture && String(f.scheduledDeparture.local || "").slice(0, 10)) || "",
      departureAirport: dep.name ? dep.name + (dep.iata ? " (" + dep.iata + ")" : "") : c.departureAirport || "",
      finalDestination: arr.name ? arr.name + (arr.iata ? " (" + arr.iata + ")" : "") : c.arrivalAirport || "",
      scheduledDeparture: (f.scheduledDeparture && (f.scheduledDeparture.local || f.scheduledDeparture.utc)) || "",
      actualDeparture: (f.actualDeparture && (f.actualDeparture.local || f.actualDeparture.utc)) || "",
      scheduledArrival: (f.scheduledArrival && (f.scheduledArrival.local || f.scheduledArrival.utc)) || "",
      actualArrival: (f.actualArrival && (f.actualArrival.local || f.actualArrival.utc)) || ""
    };
  }

  return { normaliseFlightNumber, stableLookupPayload, buildLookupPayload, requestFlightLookup, flightToBuilderAnswers };
});
