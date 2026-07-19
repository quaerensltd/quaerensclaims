const crypto = require("crypto");
const admin = require("firebase-admin");
const { normaliseFlight, pickFlights } = require("./flightNormalisationService");

const DEFAULT_BASE_URL = "https://prod.api.market/api/v1/aedbx/aerodatabox";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function cleanFlightNumber(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function cleanDate(value) {
  return String(value || "").trim().slice(0, 10);
}

function cleanCode(value) {
  const text = String(value || "").toUpperCase();
  const bracketed = text.match(/\(([A-Z]{3})\)/);
  if (bracketed) return bracketed[1];
  const standalone = text.match(/\b[A-Z]{3}\b/);
  if (standalone) return standalone[0];
  const prefix = text.match(/^[A-Z]{3}/);
  return prefix ? prefix[0] : "";
}

function cleanSearchType(value) {
  const type = String(value || "exact").trim().toLowerCase();
  if (type === "airlinedeparture" || type === "airline-departure") return "airlineDeparture";
  return ["exact", "route", "nearby"].includes(type) ? type : "exact";
}

function cacheKey(input) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

async function fromCache(db, key) {
  const snap = await db.collection("flightLookupCache").doc(key).get();
  if (!snap.exists) return null;
  const data = snap.data();
  const expires = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : 0;
  if (expires < Date.now()) return null;
  return data.payload || null;
}

async function saveCache(db, key, payload) {
  await db.collection("flightLookupCache").doc(key).set({
    payload: stripUndefined(payload),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + CACHE_TTL_MS)
  }, { merge: true });
}

async function logUsage(db, data) {
  await db.collection("flightApiUsage").add({
    ...stripUndefined(data),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefined(entry)])
  );
}

function providerUrl({ flightNumber, date }) {
  const base = (process.env.AERODATABOX_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  return `${base}/flights/number/${encodeURIComponent(flightNumber)}/${encodeURIComponent(date)}?withAircraftImage=false&withLocation=false`;
}

function providerAirportUrl({ airport, date }) {
  const base = (process.env.AERODATABOX_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const from = `${date}T00:00`;
  const to = `${date}T23:59`;
  return `${base}/flights/airports/iata/${encodeURIComponent(airport)}/${encodeURIComponent(from)}/${encodeURIComponent(to)}?direction=Departure&withCancelled=true&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=false`;
}

function flightCodeParts(value) {
  const cleaned = cleanFlightNumber(value);
  const match = cleaned.match(/^([A-Z]{2,3})(\d{1,4}[A-Z]?)$/);
  return match ? { airline: match[1], number: match[2], cleaned } : { airline: "", number: "", cleaned };
}

function normalisedFlightNumber(value) {
  return cleanFlightNumber(value);
}

function airportMatches(value, expected) {
  const code = cleanCode(expected);
  if (!code) return true;
  return cleanCode(value?.iata || value?.icao || value?.name) === code || String(value?.name || "").toUpperCase().includes(code);
}

function airlineMatches(flight, expected) {
  const cleaned = cleanFlightNumber(expected);
  if (!cleaned) return true;
  const airline = flight.airline || {};
  const operating = flight.operatingAirline || {};
  const haystack = [
    airline.name, airline.iata, airline.icao,
    operating.name, operating.iata, operating.icao,
    flight.flightNumber
  ].filter(Boolean).map(v => String(v).toUpperCase()).join(" ");
  return haystack.includes(cleaned) || haystack.includes(String(expected || "").toUpperCase());
}

function addConfidence(flight, input, level) {
  const exactNumber = normalisedFlightNumber(flight.flightNumber) === normalisedFlightNumber(input.flightNumber);
  const exactRoute = airportMatches(flight.departureAirport, input.departureAirport) && airportMatches(flight.arrivalAirport, input.arrivalAirport);
  const hasTimes = !!(flight.scheduledDeparture?.local || flight.scheduledDeparture?.utc) && !!(flight.scheduledArrival?.local || flight.scheduledArrival?.utc);
  let confidence = level || "Manual confirmation required";
  if (exactNumber && exactRoute && hasTimes) confidence = "High confidence";
  else if (exactNumber && hasTimes) confidence = "Likely match";
  else if (exactRoute && hasTimes) confidence = "Multiple possible matches";
  else if (!hasTimes) confidence = "Incomplete data";
  return { ...flight, dataConfidence: confidence, lastUpdated: new Date().toISOString() };
}

function rankFlights(flights, input) {
  const wantedNumber = normalisedFlightNumber(input.flightNumber);
  const wantedAirline = flightCodeParts(input.flightNumber).airline || cleanFlightNumber(input.airline);
  return flights
    .map((flight, index) => {
      let score = 0;
      if (wantedNumber && normalisedFlightNumber(flight.flightNumber) === wantedNumber) score += 100;
      if (airportMatches(flight.departureAirport, input.departureAirport)) score += 25;
      if (airportMatches(flight.arrivalAirport, input.arrivalAirport)) score += 25;
      if (wantedAirline && airlineMatches(flight, wantedAirline)) score += 15;
      if (flight.scheduledDeparture?.local || flight.scheduledDeparture?.utc) score += 5;
      if (flight.scheduledArrival?.local || flight.scheduledArrival?.utc) score += 5;
      return { flight, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.flight);
}

function dedupeFlights(flights) {
  const seen = new Set();
  return flights.filter(flight => {
    const key = [
      normalisedFlightNumber(flight.flightNumber),
      cleanCode(flight.departureAirport?.iata),
      cleanCode(flight.arrivalAirport?.iata),
      flight.scheduledDeparture?.utc || flight.scheduledDeparture?.local || ""
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function lookupFlightWithAeroDataBox(db, input) {
  const searchType = cleanSearchType(input.searchType);
  const flightNumber = cleanFlightNumber(input.flightNumber);
  const date = cleanDate(input.date);
  const passengerCount = Math.max(1, parseInt(input.passengerCount, 10) || 1);
  const departureAirport = cleanCode(input.departureAirport);
  const arrivalAirport = cleanCode(input.arrivalAirport);
  const airline = String(input.airline || "").trim();

  if (!date || (searchType === "exact" && !flightNumber)) {
    return { success: false, configured: true, message: "Flight number and flight date are required." };
  }
  if ((searchType === "route" || searchType === "airlineDeparture") && !departureAirport) {
    return { success: false, configured: true, message: "Departure airport and flight date are required." };
  }

  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      configured: false,
      message: "Flight lookup is not configured yet. You can still enter the journey manually."
    };
  }

  const key = cacheKey({ provider: "aerodatabox", searchType, flightNumber, date, passengerCount, departureAirport, arrivalAirport, airline: airline.toUpperCase() });
  const cached = await fromCache(db, key);
  if (cached) return { ...cached, cached: true };

  const url = searchType === "exact" || searchType === "nearby"
    ? providerUrl({ flightNumber, date })
    : providerAirportUrl({ airport: departureAirport, date });
  const started = Date.now();
  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "x-magicapi-key": apiKey
    }
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    payload = { parseError: true };
  }

  await logUsage(db, {
    provider: "aerodatabox",
    searchType,
    flightNumber,
    date,
    departureAirport,
    arrivalAirport,
    status: response.status,
    ok: response.ok,
    durationMs: Date.now() - started
  });

  if (!response.ok) {
    return {
      success: false,
      configured: true,
      provider: "aerodatabox",
      status: response.status,
      message: "Flight data provider did not return usable flight details. Please enter the journey manually."
    };
  }

  let flights = pickFlights(payload).map(flight => normaliseFlight(flight, { flightNumber, passengerCount }));
  if (searchType === "route") {
    flights = flights.filter(flight => airportMatches(flight.departureAirport, departureAirport) && airportMatches(flight.arrivalAirport, arrivalAirport));
    if (airline) flights = flights.filter(flight => airlineMatches(flight, airline));
  }
  if (searchType === "airlineDeparture") {
    flights = flights.filter(flight => airportMatches(flight.departureAirport, departureAirport));
    if (arrivalAirport) flights = flights.filter(flight => airportMatches(flight.arrivalAirport, arrivalAirport));
    if (airline) flights = flights.filter(flight => airlineMatches(flight, airline));
  }
  flights = dedupeFlights(rankFlights(flights, { flightNumber, departureAirport, arrivalAirport, airline })).slice(0, 12);
  const confidenceLevel = flights.length > 1 ? "Multiple possible matches" : undefined;
  flights = flights.map(flight => addConfidence(flight, { flightNumber, departureAirport, arrivalAirport, airline }, confidenceLevel));
  const result = {
    success: flights.length > 0,
    configured: true,
    provider: "aerodatabox",
    searchType,
    cached: false,
    flight: flights[0] || null,
    matches: flights.slice(0, 12),
    message: flights.length ? (flights.length > 1 ? "Several possible flights found." : "Flight found.") : "We could not find an exact match. Try another search option or enter the journey manually."
  };

  await saveCache(db, key, result);
  return result;
}

module.exports = {
  lookupFlightWithAeroDataBox
};
