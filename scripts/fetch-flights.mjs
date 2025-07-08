import fetch from 'node-fetch';
import fs from 'fs';

const RAPIDAPI_KEY = 'b9f581fa45mshcc8f922b0357e3bp1e979djsn3d1facad7035';

const AIRPORTS = [
  { icao: 'EHAM', name: 'Amsterdam Schiphol' },
  { icao: 'EGLL', name: 'London Heathrow' },
  { icao: 'EGKK', name: 'London Gatwick' },
  { icao: 'EGSS', name: 'London Stansted' },
  { icao: 'EGGW', name: 'London Luton' },
  { icao: 'EGLC', name: 'London City' },
  { icao: 'EGMC', name: 'London Southend' },
  { icao: 'EDDB', name: 'Berlin Brandenburg' },
  { icao: 'EBBR', name: 'Brussels Airport' },
  { icao: 'EGCC', name: 'Manchester' },
  { icao: 'EGBB', name: 'Birmingham' },
  { icao: 'EGGP', name: 'Liverpool John Lennon' },
  { icao: 'LFPG', name: 'Paris CDG' },
  { icao: 'EDDF', name: 'Frankfurt' },
  { icao: 'LEMD', name: 'Madrid' },
  { icao: 'LEBL', name: 'Barcelona' },
  { icao: 'LIRF', name: 'Rome Fiumicino' }
];

async function getDelays(airport) {
  const url = `https://aerodatabox.p.rapidapi.com/airports/icao/${airport.icao}/delays`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
    }
  });
  const data = await res.json();
  // Only keep severe delays (over 180 minutes)
  return (data.departures || [])
    .filter(f => f.averageDelay && f.averageDelay > 180)
    .map(f => ({
      airport: airport.name,
      airportIcao: airport.icao,
      type: 'delay',
      flightNumber: f.flightNumber,
      scheduledTimeUtc: f.scheduledTimeUtc,
      averageDelay: f.averageDelay
    }));
}

async function getCancellations(airport) {
  // AeroDataBox does not provide direct 'cancelled' lists per day for free.
  // We'll use the 'schedules' endpoint and look for flights with status 'Cancelled'
  const date = new Date().toISOString().slice(0, 10); // Today's date (YYYY-MM-DD)
  const url = `https://aerodatabox.p.rapidapi.com/airports/icao/${airport.icao}/flights/${date}T00:00/${date}T23:59?withLeg=true&withCancelled=true&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=true`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
    }
  });
  const data = await res.json();
  if (!Array.isArray(data.departures)) return [];
  return data.departures
    .filter(f => f.status && f.status.toLowerCase() === 'cancelled')
    .map(f => ({
      airport: airport.name,
      airportIcao: airport.icao,
      type: 'cancelled',
      flightNumber: f.flight.number,
      scheduledTimeUtc: f.scheduledTimeUtc,
      status: f.status
    }));
}

async function main() {
  let results = [];
  for (const airport of AIRPORTS) {
    // Get major delays
    try {
      const delays = await getDelays(airport);
      results = results.concat(delays);
    } catch (err) {
      console.error(`Error getting delays for ${airport.name}:`, err);
    }
    // Get cancellations
    try {
      const cancelled = await getCancellations(airport);
      results = results.concat(cancelled);
    } catch (err) {
      console.error(`Error getting cancellations for ${airport.name}:`, err);
    }
  }
  const output = {
    generatedAt: new Date().toISOString(),
    flights: results
  };
  fs.writeFileSync('flights-today.json', JSON.stringify(output, null, 2));
  console.log(`Saved ${results.length} delayed/cancelled flights to flights-today.json`);
}

main();
