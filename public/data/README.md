# Quaerens Shared Builder Data

These files support browser-first complaint pack builders.

## Source and licence

The current airport, airline, country, currency, route and resource records are a Quaerens-maintained seed dataset compiled from public factual identifiers, official organisation websites and public passenger-information sources. No commercial travel site, Google, Booking.com, FlightRadar24 or proprietary data source was scraped or copied.

Factual identifiers such as IATA codes, ICAO codes, country codes and currency codes are retained as reference facts. Official complaint and resource links should be reviewed against the relevant organisation's live website before launch or escalation use.

## Import date

Initial seed: 18 July 2026.

## Update process

1. Add or update records in the relevant JSON file.
2. Keep inactive records marked with `"active": false`.
3. Do not guess complaint routes, ADR bodies or verification dates.
4. Run `node scripts/validate-builder-data.js`.
5. Check the affected builder manually on desktop and mobile.
6. Re-check official links before promoting a development builder to the live indexed page.

## Fields retained

Airports: IATA, ICAO, name, city, region, country, country code, time zone, latitude, longitude, aliases, commercial flag and active flag.

Airlines: IATA, ICAO, trading name, legal or operating entity where known, country, official website, official complaint route, customer-service route, ADR information where verified, aliases, active flag and verification date.

## Filtering

Normal search excludes inactive airports and airlines by default. Manual entry remains available if a record is missing or if a shared dataset fails to load.
