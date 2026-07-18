const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "public", "data");

const requiredFiles = [
  "airports.json",
  "airlines.json",
  "countries.json",
  "currencies.json",
  "disruption-reasons.json",
  "complaint-routes.json",
  "official-resources.json"
];

function readJson(file) {
  const fullPath = path.join(dataDir, file);
  if (!fs.existsSync(fullPath)) throw new Error(`${file} is missing`);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`${file} must be a non-empty array`);
  }
  return parsed;
}

const data = Object.fromEntries(requiredFiles.map(file => [file, readJson(file)]));

for (const airport of data["airports.json"]) {
  for (const key of ["iata", "icao", "name", "city", "country", "countryCode"]) {
    if (!airport[key]) throw new Error(`Airport missing ${key}: ${JSON.stringify(airport)}`);
  }
}

for (const airline of data["airlines.json"]) {
  for (const key of ["iata", "icao", "name", "legalName", "country"]) {
    if (!airline[key]) throw new Error(`Airline missing ${key}: ${JSON.stringify(airline)}`);
  }
}

console.log("Builder data validation OK");
console.log(`Airports: ${data["airports.json"].length}`);
console.log(`Airlines: ${data["airlines.json"].length}`);
console.log(`Countries: ${data["countries.json"].length}`);
console.log(`Currencies: ${data["currencies.json"].length}`);
