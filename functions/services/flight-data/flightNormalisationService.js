const { calculateArrivalDelay } = require("./delayCalculationService");
const { greatCircleKm } = require("./routeDistanceService");
const { estimateCompensation, possibleRegulation } = require("./compensationEstimateService");

function firstAvailable(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "");
}

function airportFromMovement(movement = {}) {
  const airport = movement.airport || movement;
  const location = airport.location || airport.coordinates || {};
  return {
    name: firstAvailable(airport.name, airport.shortName, airport.municipalityName, airport.municipality),
    iata: firstAvailable(airport.iata, airport.iataCode),
    icao: firstAvailable(airport.icao, airport.icaoCode),
    city: firstAvailable(airport.municipalityName, airport.municipality, airport.city),
    country: firstAvailable(airport.countryName, airport.country),
    countryCode: firstAvailable(airport.countryCode, airport.countryIso2, airport.isoCountry),
    latitude: firstAvailable(location.lat, location.latitude, airport.lat, airport.latitude),
    longitude: firstAvailable(location.lon, location.lng, location.longitude, airport.lon, airport.lng, airport.longitude),
    timezone: firstAvailable(airport.timeZone, airport.timezone, movement.timeZone, movement.timezone)
  };
}

function withAirportFallback(airport = {}, fallback = {}) {
  if (!fallback) return airport;
  return {
    name: firstAvailable(airport.name, fallback.name),
    iata: firstAvailable(airport.iata, fallback.iata),
    icao: firstAvailable(airport.icao, fallback.icao),
    city: firstAvailable(airport.city, fallback.city),
    country: firstAvailable(airport.country, fallback.country),
    countryCode: firstAvailable(airport.countryCode, fallback.countryCode),
    latitude: firstAvailable(airport.latitude, fallback.latitude),
    longitude: firstAvailable(airport.longitude, fallback.longitude),
    timezone: firstAvailable(airport.timezone, fallback.timezone)
  };
}

function timeFromMovement(movement = {}, key) {
  const source = movement[key] || {};
  if (typeof source === "string") return { local: source, utc: source };
  return {
    local: firstAvailable(source.local, source.localTime, source.timeLocal),
    utc: firstAvailable(source.utc, source.utcTime, source.timeUtc)
  };
}

function normaliseFlight(rawFlight = {}, options = {}) {
  const departure = rawFlight.departure || {};
  const arrival = rawFlight.arrival || {};
  const airline = rawFlight.airline || rawFlight.carrier || {};
  const operatingAirline = rawFlight.operatingAirline || rawFlight.operatingCarrier || rawFlight.operator || airline;

  const departureAirport = withAirportFallback(airportFromMovement(departure), options.departureAirportFallback);
  const arrivalAirport = withAirportFallback(airportFromMovement(arrival), options.arrivalAirportFallback);
  const scheduledDeparture = timeFromMovement(departure, "scheduledTime");
  const actualDeparture = timeFromMovement(departure, "actualTime");
  const scheduledArrival = timeFromMovement(arrival, "scheduledTime");
  const actualArrival = timeFromMovement(arrival, "actualTime");
  const arrivalDelay = calculateArrivalDelay({
    scheduledArrivalUtc: scheduledArrival.utc || scheduledArrival.local,
    actualArrivalUtc: actualArrival.utc || actualArrival.local
  });
  const distanceKm = greatCircleKm(departureAirport, arrivalAirport);
  const regulation = possibleRegulation({
    departureAirport,
    arrivalAirport,
    airline: {
      name: firstAvailable(airline.name, airline.alias),
      iata: firstAvailable(airline.iata, airline.iataCode),
      icao: firstAvailable(airline.icao, airline.icaoCode),
      countryCode: firstAvailable(airline.countryCode, airline.countryIso2)
    }
  });
  const compensation = estimateCompensation({
    distanceKm,
    arrivalDelayMinutes: arrivalDelay.delayMinutes,
    passengerCount: options.passengerCount || 1,
    regulation
  });

  return {
    flightNumber: firstAvailable(rawFlight.number, rawFlight.flightNumber, rawFlight.callSign, options.flightNumber),
    airline: {
      name: firstAvailable(airline.name, airline.alias),
      iata: firstAvailable(airline.iata, airline.iataCode),
      icao: firstAvailable(airline.icao, airline.icaoCode),
      countryCode: firstAvailable(airline.countryCode, airline.countryIso2)
    },
    operatingAirline: {
      name: firstAvailable(operatingAirline.name, operatingAirline.alias),
      iata: firstAvailable(operatingAirline.iata, operatingAirline.iataCode),
      icao: firstAvailable(operatingAirline.icao, operatingAirline.icaoCode),
      countryCode: firstAvailable(operatingAirline.countryCode, operatingAirline.countryIso2)
    },
    status: firstAvailable(rawFlight.status, rawFlight.flightStatus),
    departureAirport,
    arrivalAirport,
    scheduledDeparture,
    actualDeparture,
    scheduledArrival,
    actualArrival,
    distanceKm,
    possibleRegulation: regulation,
    compensation,
    delay: arrivalDelay,
    rawProvider: "aerodatabox"
  };
}

function pickFlights(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.flights)) return payload.flights;
  if (Array.isArray(payload?.departures)) return payload.departures;
  if (Array.isArray(payload?.arrivals)) return payload.arrivals;
  if (Array.isArray(payload?.items)) return payload.items;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

module.exports = {
  normaliseFlight,
  pickFlights
};
