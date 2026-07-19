function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRad(value) {
  return value * Math.PI / 180;
}

function coordinatePair(record = {}) {
  const latitude = toNumber(record.latitude ?? record.lat ?? record.location?.lat ?? record.location?.latitude);
  const longitude = toNumber(record.longitude ?? record.lon ?? record.lng ?? record.location?.lon ?? record.location?.longitude);
  if (latitude === null || longitude === null) return null;
  return { latitude, longitude };
}

function greatCircleKm(fromAirport, toAirport) {
  const from = coordinatePair(fromAirport);
  const to = coordinatePair(toAirport);
  if (!from || !to) return null;

  const earthRadiusKm = 6371;
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return Math.round(2 * earthRadiusKm * Math.asin(Math.sqrt(h)));
}

function distanceBand(distanceKm) {
  if (!distanceKm) return "unknown";
  if (distanceKm <= 1500) return "short";
  if (distanceKm <= 3500) return "medium";
  return "long";
}

module.exports = {
  coordinatePair,
  distanceBand,
  greatCircleKm
};
