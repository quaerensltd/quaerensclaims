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

async function lookupFlightWithAeroDataBox(db, input) {
  const flightNumber = cleanFlightNumber(input.flightNumber);
  const date = cleanDate(input.date);
  const passengerCount = Math.max(1, parseInt(input.passengerCount, 10) || 1);

  if (!flightNumber || !date) {
    return { success: false, configured: true, message: "Flight number and flight date are required." };
  }

  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      configured: false,
      message: "Flight lookup is not configured yet. You can still enter the journey manually."
    };
  }

  const key = cacheKey({ provider: "aerodatabox", flightNumber, date, passengerCount });
  const cached = await fromCache(db, key);
  if (cached) return { ...cached, cached: true };

  const url = providerUrl({ flightNumber, date });
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
    flightNumber,
    date,
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

  const flights = pickFlights(payload).map(flight => normaliseFlight(flight, { flightNumber, passengerCount }));
  const result = {
    success: flights.length > 0,
    configured: true,
    provider: "aerodatabox",
    cached: false,
    flight: flights[0] || null,
    matches: flights.slice(0, 5),
    message: flights.length ? "Flight found." : "No matching flight was found. Please enter the journey manually."
  };

  await saveCache(db, key, result);
  return result;
}

module.exports = {
  lookupFlightWithAeroDataBox
};
