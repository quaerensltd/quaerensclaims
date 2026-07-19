const crypto = require("crypto");
const admin = require("firebase-admin");
const { normaliseFlight, pickFlights } = require("./flightNormalisationService");

const DEFAULT_BASE_URL = "https://prod.api.market/api/v1/aedbx/aerodatabox";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const AIRPORT_META = {
  STN: { name: "London Stansted Airport", timezone: "Europe/London" },
  LHR: { name: "London Heathrow Airport", timezone: "Europe/London" },
  LGW: { name: "London Gatwick Airport", timezone: "Europe/London" },
  LTN: { name: "London Luton Airport", timezone: "Europe/London" },
  LCY: { name: "London City Airport", timezone: "Europe/London" },
  MAN: { name: "Manchester Airport", timezone: "Europe/London" },
  BHX: { name: "Birmingham Airport", timezone: "Europe/London" },
  EDI: { name: "Edinburgh Airport", timezone: "Europe/London" },
  GLA: { name: "Glasgow Airport", timezone: "Europe/London" },
  RHO: { name: "Rhodes International Airport", timezone: "Europe/Athens" },
  CFU: { name: "Corfu International Airport", timezone: "Europe/Athens" },
  ALC: { name: "Alicante Airport", timezone: "Europe/Madrid" },
  AGP: { name: "Malaga Airport", timezone: "Europe/Madrid" },
  PMI: { name: "Palma de Mallorca Airport", timezone: "Europe/Madrid" }
};

const AIRLINE_ALIASES = {
  FR: { iata: "FR", icao: "RYR", names: ["RYANAIR", "RYANAIR DAC", "RYAN AIR"] },
  U2: { iata: "U2", icao: "EZY", names: ["EASYJET", "EASYJET UK", "EASYJET EUROPE"] },
  BA: { iata: "BA", icao: "BAW", names: ["BRITISH AIRWAYS"] },
  LS: { iata: "LS", icao: "EXS", names: ["JET2", "JET2.COM"] },
  BY: { iata: "BY", icao: "TOM", names: ["TUI", "TUI AIRWAYS"] },
  W9: { iata: "W9", icao: "WUK", names: ["WIZZ AIR UK", "WIZZ AIR"] }
};

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

function cleanAirlineCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
}

function normaliseText(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function cleanSearchType(value) {
  const type = String(value || "exact").trim().toLowerCase();
  if (type === "airlinedeparture" || type === "airline-departure") return "airlineDeparture";
  return ["exact", "route", "nearby"].includes(type) ? type : "exact";
}

function canonicalSearchKey(input) {
  return [
    input.provider || "aerodatabox",
    input.mode || input.searchType || "exact",
    input.flightNumber || "",
    input.date || "",
    input.departureAirport || "",
    input.arrivalAirport || "",
    input.airlineCode || "",
    normaliseText(input.airline || "")
  ].join("|");
}

function cacheKey(input) {
  return crypto.createHash("sha256").update(canonicalSearchKey(input)).digest("hex");
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

function airportTimezone(airport) {
  return AIRPORT_META[cleanCode(airport)]?.timezone || "UTC";
}

function airportName(airport) {
  const code = cleanCode(airport);
  return AIRPORT_META[code]?.name || code || "the selected airport";
}

function providerAirportRequest({ airport, date }) {
  const base = (process.env.AERODATABOX_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const timezone = airportTimezone(airport);
  const windows = [
    { from: `${date}T00:00`, to: `${date}T11:59` },
    { from: `${date}T12:00`, to: `${date}T23:59` }
  ];
  return windows.map(window => ({
    url: `${base}/flights/airports/iata/${encodeURIComponent(airport)}/${encodeURIComponent(window.from)}/${encodeURIComponent(window.to)}?direction=Departure&withLeg=true&withCancelled=true&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=false`,
    window: { timezone, ...window }
  }));
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
  const criteria = airlineCriteria(typeof expected === "object" ? expected : { airline: expected });
  if (!criteria.codes.size && !criteria.names.size) return true;
  const airline = flight.airline || {};
  const operating = flight.operatingAirline || {};
  const codes = [
    airline.iata, airline.icao,
    operating.iata, operating.icao,
    flightCodeParts(flight.flightNumber).airline
  ].map(cleanAirlineCode).filter(Boolean);
  if (codes.some(code => criteria.codes.has(code))) return true;
  const names = [airline.name, airline.alias, operating.name, operating.alias].map(normaliseText).filter(Boolean);
  return names.some(name => criteria.names.has(name) || Array.from(criteria.names).some(wanted => name.includes(wanted) || wanted.includes(name)));
}

function airlineCriteria(input = {}) {
  const codes = new Set();
  const names = new Set();
  [
    input.airlineCode,
    input.airlineIata,
    input.airlineIcao,
    flightCodeParts(input.flightNumber).airline
  ].map(cleanAirlineCode).filter(Boolean).forEach(code => codes.add(code));

  const text = normaliseText(input.airline || input.airlineName);
  if (text) {
    names.add(text);
    const compact = cleanAirlineCode(text);
    if (compact && compact.length <= 3) codes.add(compact);
  }

  Object.values(AIRLINE_ALIASES).forEach(alias => {
    const aliasCodes = [alias.iata, alias.icao].map(cleanAirlineCode);
    const aliasNames = alias.names.map(normaliseText);
    const matched = aliasCodes.some(code => codes.has(code)) || aliasNames.some(name => names.has(name) || (text && (name.includes(text) || text.includes(name))));
    if (matched) {
      aliasCodes.filter(Boolean).forEach(code => codes.add(code));
      aliasNames.filter(Boolean).forEach(name => names.add(name));
    }
  });

  return { codes, names };
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
  return flights
    .map((flight, index) => {
      let score = 0;
      if (wantedNumber && normalisedFlightNumber(flight.flightNumber) === wantedNumber) score += 100;
      if (airportMatches(flight.departureAirport, input.departureAirport)) score += 25;
      if (airportMatches(flight.arrivalAirport, input.arrivalAirport)) score += 25;
      if (airlineMatches(flight, input)) score += 15;
      if (flight.scheduledDeparture?.local || flight.scheduledDeparture?.utc) score += 5;
      if (flight.scheduledArrival?.local || flight.scheduledArrival?.utc) score += 5;
      return { flight, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.flight);
}

function dateCoverage(date) {
  const target = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(target.getTime())) {
    return { ok: false, category: "invalid_date", message: "Enter a valid flight date before searching." };
  }
  const diffDays = Math.round((target.getTime() - Date.now()) / DAY_MS);
  if (diffDays > 330) {
    return { ok: false, category: "date_outside_future", message: "Flight schedule data is not normally available that far ahead. Try a nearer date or enter the journey manually." };
  }
  if (diffDays < -370) {
    return { ok: false, category: "date_outside_history", message: "Historical flight lookup is limited. Enter the journey manually if your travel date is older." };
  }
  return { ok: true };
}

function makeResult({ ok, mode, results, message, cached = false, configured = true, status, failureCategory, diagnostics }) {
  const safeResults = Array.isArray(results) ? results : [];
  return stripUndefined({
    ok,
    success: ok,
    configured,
    provider: "aerodatabox",
    source: "AeroDataBox",
    mode,
    searchType: mode,
    cached,
    status,
    flight: safeResults[0] || null,
    matches: safeResults.slice(0, 12),
    results: safeResults.slice(0, 12),
    message,
    failureCategory,
    diagnostics
  });
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
  const searchType = cleanSearchType(input.mode || input.searchType);
  const flightNumber = cleanFlightNumber(input.flightNumber);
  const date = cleanDate(input.date);
  const passengerCount = Math.max(1, parseInt(input.passengerCount, 10) || 1);
  const departureAirport = cleanCode(input.departureAirport);
  const arrivalAirport = cleanCode(input.arrivalAirport);
  const airline = String(input.airline || "").trim();
  const airlineCode = cleanAirlineCode(input.airlineCode || input.airlineIata);
  const airlineIcao = cleanAirlineCode(input.airlineIcao);
  const lookupInput = { flightNumber, departureAirport, arrivalAirport, airline, airlineCode, airlineIata: airlineCode, airlineIcao };

  if (!date || (searchType === "exact" && !flightNumber)) {
    return makeResult({ ok: false, mode: searchType, results: [], message: "Flight number and flight date are required.", failureCategory: "missing_required_fields" });
  }
  if ((searchType === "route" || searchType === "airlineDeparture") && !departureAirport) {
    return makeResult({ ok: false, mode: searchType, results: [], message: "Departure airport and flight date are required.", failureCategory: "missing_required_fields" });
  }
  if (searchType === "route" && !arrivalAirport) {
    return makeResult({ ok: false, mode: searchType, results: [], message: "Arrival airport is required for route search.", failureCategory: "missing_required_fields" });
  }
  if (searchType === "airlineDeparture" && !airline && !airlineCode && !airlineIcao) {
    return makeResult({ ok: false, mode: searchType, results: [], message: "Airline is required for airline departure search.", failureCategory: "missing_required_fields" });
  }

  const coverage = dateCoverage(date);
  if (!coverage.ok) {
    return makeResult({ ok: false, mode: searchType, results: [], message: coverage.message, failureCategory: coverage.category });
  }

  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    return makeResult({ ok: false, mode: searchType, results: [], configured: false, message: "Flight lookup is not configured yet. You can still enter the journey manually.", failureCategory: "not_configured" });
  }

  const keyInput = { provider: "aerodatabox", mode: searchType, flightNumber, date, passengerCount, departureAirport, arrivalAirport, airline: airline.toUpperCase(), airlineCode, airlineIcao };
  const key = cacheKey(keyInput);
  const cached = await fromCache(db, key);
  if (cached) return { ...cached, cached: true };

  const providerRequests = searchType === "exact" || searchType === "nearby"
    ? [{ url: providerUrl({ flightNumber, date }), window: null }]
    : providerAirportRequest({ airport: departureAirport, date });
  const started = Date.now();
  const payloads = [];
  const providerStatuses = [];

  for (const request of providerRequests) {
    const response = await fetch(request.url, {
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
    providerStatuses.push({ status: response.status, ok: response.ok, window: request.window || undefined });

    await logUsage(db, {
      provider: "aerodatabox",
      searchType,
      mode: searchType,
      flightNumber,
      date,
      departureAirport,
      arrivalAirport,
      airlineCode,
      airlineIcao,
      status: response.status,
      ok: response.ok,
      durationMs: Date.now() - started,
      window: request.window || undefined
    });

    if (!response.ok) {
      return makeResult({
        ok: false,
        mode: searchType,
        results: [],
        status: response.status,
        message: "Flight data provider did not return usable flight details. Please enter the journey manually.",
        failureCategory: "provider_error",
        diagnostics: process.env.FLIGHT_LOOKUP_DEBUG === "true" ? { providerStatuses } : undefined
      });
    }
    payloads.push(payload);
  }

  const providerRecords = payloads.flatMap(payload => pickFlights(payload));
  let flights = providerRecords.map(flight => normaliseFlight(flight, { flightNumber, passengerCount }));
  if (searchType === "route") {
    flights = flights.filter(flight => airportMatches(flight.departureAirport, departureAirport) && airportMatches(flight.arrivalAirport, arrivalAirport));
    if (airline || airlineCode || airlineIcao) flights = flights.filter(flight => airlineMatches(flight, lookupInput));
  }
  if (searchType === "airlineDeparture") {
    flights = flights.filter(flight => airportMatches(flight.departureAirport, departureAirport));
    if (arrivalAirport) flights = flights.filter(flight => airportMatches(flight.arrivalAirport, arrivalAirport));
    if (airline || airlineCode || airlineIcao) flights = flights.filter(flight => airlineMatches(flight, lookupInput));
  }
  flights = dedupeFlights(rankFlights(flights, lookupInput)).slice(0, 12);
  const confidenceLevel = flights.length > 1 ? "Multiple possible matches" : undefined;
  flights = flights.map(flight => addConfidence(flight, lookupInput, confidenceLevel));
  const airlineDisplay = airline || airlineCode || "the selected airline";
  let message = flights.length ? (flights.length > 1 ? "Several possible flights found." : "Flight found.") : "We could not find an exact match. Try another search option or enter the journey manually.";
  if (!flights.length && (searchType === "route" || searchType === "airlineDeparture")) {
    if (providerRecords.length) {
      message = searchType === "airlineDeparture"
        ? `We found departures from ${airportName(departureAirport)} on this date, but none matched ${airlineDisplay}. Try the route search or enter the journey manually.`
        : `We found departures from ${airportName(departureAirport)} on this date, but none matched that route. Try another airport or enter the journey manually.`;
    } else {
      message = `No departure schedule was returned for ${airportName(departureAirport)} on this date. Try a nearby date or enter the journey manually.`;
    }
  }
  const result = makeResult({
    ok: flights.length > 0,
    mode: searchType,
    results: flights,
    cached: false,
    message,
    failureCategory: flights.length ? undefined : "no_match",
    diagnostics: process.env.FLIGHT_LOOKUP_DEBUG === "true" ? {
      providerRecordCount: providerRecords.length,
      filteredRecordCount: flights.length,
      canonicalSearchKey: canonicalSearchKey(keyInput),
      airportWindows: providerRequests.map(request => request.window).filter(Boolean),
      providerStatuses
    } : undefined
  });

  await saveCache(db, key, result);
  return result;
}

module.exports = {
  lookupFlightWithAeroDataBox
};
