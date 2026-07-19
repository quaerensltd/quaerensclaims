const { distanceBand } = require("./routeDistanceService");

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "CH"
]);

function countryCode(value) {
  return String(value || "").trim().toUpperCase();
}

function possibleRegulation({ departureAirport = {}, arrivalAirport = {}, airline = {} }) {
  const dep = countryCode(departureAirport.countryCode);
  const arr = countryCode(arrivalAirport.countryCode);
  const airlineCountry = countryCode(airline.countryCode);
  const depUk = dep === "GB" || dep === "UK";
  const arrUk = arr === "GB" || arr === "UK";
  const depEu = EU_COUNTRIES.has(dep);
  const arrEu = EU_COUNTRIES.has(arr);
  const airlineUk = airlineCountry === "GB" || airlineCountry === "UK";
  const airlineEu = EU_COUNTRIES.has(airlineCountry);

  const uk = depUk || (arrUk && airlineUk);
  const ec = depEu || (arrEu && airlineEu);
  if (uk && ec) return "Both";
  if (uk) return "UK261";
  if (ec) return "EC261";
  if (!dep && !arr) return "Further review required";
  return "Neither";
}

function estimateCompensation({ distanceKm, arrivalDelayMinutes, passengerCount = 1, regulation }) {
  const passengers = Math.max(1, parseInt(passengerCount, 10) || 1);
  const currency = regulation === "EC261" ? "EUR" : "GBP";
  const bands = currency === "EUR" ? { short: 250, medium: 400, long: 600 } : { short: 220, medium: 350, long: 520 };
  const band = distanceBand(distanceKm);

  if (!distanceKm) {
    return {
      status: "further_review",
      currency,
      perPassenger: 0,
      passengerCount: passengers,
      statutoryTotal: 0,
      note: "Distance could not be calculated because airport coordinates were not available."
    };
  }

  if (!regulation || regulation === "Neither" || regulation === "Further review required") {
    return {
      status: "further_review",
      currency,
      perPassenger: 0,
      passengerCount: passengers,
      statutoryTotal: 0,
      note: "The route or airline information does not clearly show UK261 or EC261 scope."
    };
  }

  if (arrivalDelayMinutes === null || arrivalDelayMinutes === undefined || arrivalDelayMinutes < 180) {
    return {
      status: "below_threshold_or_unknown",
      currency,
      perPassenger: 0,
      passengerCount: passengers,
      statutoryTotal: 0,
      note: "The entered arrival delay does not currently support a three-hour statutory delay estimate."
    };
  }

  const perPassenger = bands[band];
  return {
    status: "estimated",
    currency,
    distanceBand: band,
    perPassenger,
    passengerCount: passengers,
    statutoryTotal: perPassenger * passengers,
    note: "Estimate based on distance, arrival delay and possible UK261 or EC261 scope. Airline cause and journey facts can affect the outcome."
  };
}

module.exports = {
  estimateCompensation,
  possibleRegulation
};
