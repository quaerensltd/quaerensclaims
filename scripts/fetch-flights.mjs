import fetch from 'node-fetch';
import fs from 'fs';

const AIRPORT_ICAO = 'EHAM'; // Amsterdam Schiphol
const RAPIDAPI_KEY = 'b9f581fa45mshcc8f922b0357e3bp1e979djsn3d1facad7035';

const url = `https://aerodatabox.p.rapidapi.com/airports/icao/${AIRPORT_ICAO}/delays`;

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(data => {
    const longDelays = (data.departures || [])
      .filter(f => f.averageDelay && f.averageDelay > 180);

    const result = {
      generatedAt: new Date().toISOString(),
      airport: AIRPORT_ICAO,
      flights: longDelays
    };

    fs.writeFileSync('flights-today.json', JSON.stringify(result, null, 2));
    console.log(`Saved ${longDelays.length} delayed flights to flights-today.json`);
  })
  .catch(err => {
    console.error('Error fetching flight data:', err);
  });
