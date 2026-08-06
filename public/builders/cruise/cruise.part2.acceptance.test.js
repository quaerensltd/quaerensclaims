"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const config = require("./cruise.config");
const resources = require("./cruise.resources");
const analysis = require("./cruise.analysis");
const documents = require("./cruise.documents");

const page = fs.readFileSync(path.join(__dirname, "../../cruise-compensation-recovery.html"), "utf8");

const landingIndex = page.indexOf('class="cruise-landing"');
const builderIndex = page.indexOf('id="cruise-builder"');
const rightsIndex = page.indexOf('id="cruise-passenger-rights"');
const generalInformationIndex = page.indexOf("What This Cruise Builder Covers");
assert.ok(landingIndex >= 0 && builderIndex > landingIndex, "shared builder follows the approved landing experience");
assert.ok(rightsIndex > builderIndex, "passenger-rights guide follows the shared builder");
assert.ok(generalInformationIndex > rightsIndex, "general Cruise information remains after the rights heading");
assert.strictEqual((page.match(/id="cruise-builder"/g) || []).length, 1, "builder anchor is unique");
assert.strictEqual((page.match(/id="cruise-passenger-rights"/g) || []).length, 1, "passenger-rights anchor is unique");
assert.ok(page.includes('<a href="#cruise-builder" class="pill primary">Build My Cruise Pack</a>'), "header CTA targets the builder");
assert.ok(page.includes('<a href="#cruise-builder" class="cruise-button cruise-button-primary">Go and Build My Free Pack</a>'), "primary landing CTA targets the builder");
assert.ok(page.includes('<a href="#cruise-passenger-rights" class="cruise-button cruise-button-secondary">Learn More About Your Cruise Passenger Rights</a>'), "secondary landing CTA targets passenger rights");
assert.ok(page.includes('id="cruise-rights-title"'), "rights anchor exposes a meaningful heading");
assert.ok(page.includes('#cruise-builder,#cruise-passenger-rights { scroll-margin-top: 104px; }'), "sticky-header anchor offset is retained");
assert.ok(page.includes('html { scroll-padding-top: 104px; }'), "page-level anchor offset protects targets from the sticky header");
assert.ok(page.includes('id="cruise-builder-compat"'), "builder compatibility anchor is retained");
assert.ok(page.includes('id="evidence"'), "historical evidence anchor is retained");
const pageIds = [...page.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.deepStrictEqual(pageIds.filter((id, index) => pageIds.indexOf(id) !== index), [], "Cruise page contains no duplicate IDs");

assert.strictEqual(config.migrationStatus, "Native QCBF builder - production");
assert.strictEqual(config.builderVersion, "1.0");
assert.ok(page.includes('<meta charset="UTF-8">'), "UTF-8 meta missing");
assert.ok(page.includes('<meta name="robots" content="index, follow">'), "Page must remain indexable");
assert.ok(page.includes('rel="canonical" href="https://www.quaerens.co.uk/cruise-compensation-recovery.html"'), "Canonical missing");
assert.ok(page.includes('"@type": "FAQPage"'), "FAQPage schema missing");
assert.ok(page.includes("Cruise Complaint Pack FAQs"), "Visible FAQ missing");
assert.ok(!/implementation in progress|Part 1 Implementation|internal development|SEO note/i.test(page), "Public internal notes found");
assert.ok(!/[âÂ]/.test(page), "Mojibake characters found");

resources.officialSources.forEach((source) => {
  assert.ok(source.label, "Official source label missing");
  assert.ok(source.issuingBody, `${source.label} issuing body missing`);
  assert.ok(source.subject, `${source.label} subject missing`);
  assert.ok(source.officialUrl && /^https:\/\//.test(source.officialUrl), `${source.label} official URL missing`);
  assert.ok(source.lastVerified, `${source.label} last verified missing`);
  assert.ok(source.limitation, `${source.label} limitation missing`);
});

const scenarios = [
  {
    name: "package organiser route",
    data: {
      whatHappened: ["Cruise was cancelled"],
      passengerNames: "Passenger One\nPassenger Two",
      passengerCount: "2",
      bookingType: "Package holiday",
      organiserName: "Example Organiser",
      cruiseLine: "Example Cruises",
      shipName: "Example Ship",
      departureDate: "2026-09-01",
      returnDate: "2026-09-10",
      requestedOutcomes: ["Refund"],
      cruisePricePaid: "2400",
      refundReceived: "200"
    },
    expectRoute: /Package organiser|travel agent/i
  },
  {
    name: "direct cruise route",
    data: {
      whatHappened: ["Port was missed or substituted"],
      passengerNames: "Passenger One",
      bookingType: "Direct with cruise line",
      cruiseLine: "Example Cruises",
      shipName: "Example Ship",
      departureDate: "2026-09-01",
      returnDate: "2026-09-10",
      requestedOutcomes: ["Clear written response"],
      plannedItinerary: "Southampton\nLisbon\nCadiz",
      actualItinerary: "Southampton\nLisbon\nMalaga"
    },
    expectRoute: /Cruise line/i
  },
  {
    name: "future cruise credit separated",
    data: {
      whatHappened: ["Future cruise credit dispute"],
      passengerNames: "Passenger One",
      bookingType: "Direct with cruise line",
      cruiseLine: "Example Cruises",
      shipName: "Example Ship",
      departureDate: "2026-09-01",
      returnDate: "2026-09-10",
      requestedOutcomes: ["Review of future cruise credit"],
      cruisePricePaid: "1800",
      futureCruiseCreditValue: "500"
    },
    expectRoute: /Cruise line/i
  },
  {
    name: "urgent boundary",
    data: {
      whatHappened: ["Urgent legal or court deadline"],
      urgentNotes: "letter before claim",
      passengerNames: "Passenger One",
      bookingType: "Package holiday",
      cruiseLine: "Example Cruises",
      shipName: "Example Ship",
      departureDate: "2026-09-01",
      returnDate: "2026-09-10",
      requestedOutcomes: ["Evidence pack only"]
    },
    expectRoute: /Urgent boundary/i
  },
  {
    name: "unknown responsible party",
    data: {
      whatHappened: ["Refund refused or delayed"],
      passengerNames: "Passenger One",
      bookingType: "Unsure",
      cruiseLine: "",
      shipName: "Example Ship",
      departureDate: "2026-09-01",
      returnDate: "2026-09-10",
      requestedOutcomes: ["Refund"]
    },
    expectRoute: /has not yet been confirmed/i
  }
];

scenarios.forEach(({ name, data, expectRoute }) => {
  const result = analysis.analyse(data);
  const pack = documents.buildAll(data);
  assert.ok(result.routeAnalysis && typeof result.routeAnalysis === "object", `${name}: route analysis should be structured`);
  assert.ok(expectRoute.test(`${result.routeAnalysis.primary} ${result.routeAnalysis.responsiblePartyNote}`), `${name}: route mismatch`);
  assert.ok(pack.text.includes("QUAERENS CONSUMER COMPLAINT FILE"), `${name}: missing complaint file`);
  assert.ok(pack.text.includes("Quaerens Smart Submission"), `${name}: missing Smart Submission`);
  assert.ok(pack.text.includes("Official and Authoritative Resources"), `${name}: missing resources`);
  assert.ok(pack.text.includes("Self-Service Disclaimer"), `${name}: missing disclaimer`);
  assert.ok(!/guaranteed compensation|guaranteed refund|compensation due/i.test(pack.text), `${name}: unsafe guarantee wording`);
  if (/future cruise credit/i.test(name)) {
    assert.ok(result.financial.futureCruiseCredit, `${name}: future cruise credit not separated`);
    assert.ok(pack.text.includes("recorded separately"), `${name}: credit caution missing`);
  }
  if (/direct cruise route/i.test(name)) {
    assert.ok(result.itinerary.deliveryIndicator.label.includes("Recorded Cruise Delivery Indicator"), `${name}: delivery indicator missing`);
    assert.ok(result.itinerary.caution.includes("does not automatically"), `${name}: missed-port caution missing`);
  }
});

console.log(`Cruise Part 2 acceptance tests passed: ${scenarios.length} production scenarios`);
