"use strict";

const assert = require("assert");
const config = require("./flight.config");
const questions = require("./flight.questions");
const lookup = require("./flight.lookup");
const analysis = require("./flight.analysis");
const compensation = require("./flight.compensation");
const evidence = require("./flight.evidence");
const expenses = require("./flight.expenses");
const timeline = require("./flight.timeline");
const documents = require("./flight.documents");
const submission = require("./flight.submission");
const resources = require("./flight.resources");
const card = require("./flight.card");
const { registry } = require("../../complaint-builder/registry");

const sample = analysis.normaliseAnswers({
  passengerName: "Jeroen Brussel",
  passengerNames: "Clare Gammie",
  passengerCount: "2",
  airline: "easyJet",
  flightNumber: "EZY8231",
  bookingReference: "ABC123",
  flightDate: "2026-07-18",
  departureAirport: "Edinburgh Airport (EDI)",
  finalDestination: "Corfu International Airport (CFU)",
  countryDeparture: "GB",
  countryDestination: "GR",
  scheduledArrival: "2026-07-18T14:00",
  actualArrival: "2026-07-18T18:10",
  issues: ["late", "expenses"],
  bookingConfirmationHeld: "Yes",
  boardingPassHeld: "Yes",
  airlineReason: "No explanation",
  expenses: [{ date: "2026-07-18", location: "EDI", type: "Meals", expense: "Airport meals", reason: "Delay", amount: "42", currency: "GBP", receipt: "Yes" }]
});

const records = {
  departureAirport: { iata: "EDI", name: "Edinburgh Airport", countryCode: "GB", lat: 55.95, lon: -3.3725 },
  finalDestination: { iata: "CFU", name: "Corfu International Airport", countryCode: "GR", lat: 39.6019, lon: 19.9117 },
  airline: { name: "easyJet", iata: "U2", countryCode: "GB" }
};

const fr578 = analysis.normaliseAnswers({
  passengerName: "Test Passenger",
  passengerCount: "2",
  airline: "Ryanair",
  flightNumber: "FR578",
  flightDate: "2026-07-18",
  departureAirport: "Edinburgh Airport (EDI)",
  finalDestination: "Corfu International Airport (CFU)",
  countryDeparture: "GB",
  countryDestination: "GR",
  scheduledArrival: "2026-07-18T14:00",
  actualArrival: "2026-07-18T18:10",
  issues: ["late"]
});
const fr578Records = { ...records, airline: { name: "Ryanair", iata: "FR", countryCode: "IE" } };

assert.strictEqual(config.id, "flight");
assert.strictEqual(config.storageNamespace, "qcbf-flight");
assert.strictEqual(config.packPrefix, "QF");
assert.ok(config.legacyStorageKeys.includes("quaerensFlightComplaintPackDraftV1"));
assert.ok(questions.multiValueFields.includes("issues"));

assert.deepStrictEqual(lookup.stableLookupPayload({ b: "", a: "EZY8231" }), { a: "EZY8231" });
assert.strictEqual(lookup.normaliseFlightNumber("EZY 8231"), "EZY8231");
assert.strictEqual(analysis.passengerList(sample).length, 2);
assert.strictEqual(sample.delayMinutes, 250);

const distance = compensation.greatCircleKm(records.departureAirport, records.finalDestination);
assert.ok(distance > 2400 && distance < 2700, "Edinburgh to Corfu should calculate from coordinates");
const comp = compensation.analyse(sample, records);
assert.strictEqual(comp.passengers, 2);
assert.strictEqual(comp.perPassenger, 350);
assert.strictEqual(comp.statutoryTotal, 700);
assert.strictEqual(comp.regulation, "UK261");
assert.ok(compensation.totalRequestedText(sample, records).includes("£700"));
assert.strictEqual(lookup.normaliseFlightNumber("FR 578"), "FR578");
assert.strictEqual(compensation.analyse(fr578, fr578Records).statutoryTotal, 700);
assert.ok(documents.buildAll(fr578, { records: fr578Records, packReference: "QF-2026-FR578" }).full.includes("FR578"));
assert.ok(card.renderFlightCard(fr578, { records: fr578Records, flightFound: true }).includes("FR578"));
assert.ok(card.renderFlightCard(fr578, { records: fr578Records, flightFound: true }).includes("Estimated Statutory Compensation"));
assert.ok(card.flightCardStyles().includes(".qcbf-flight-card"));

assert.strictEqual(evidence.evidencePosition(sample).level, "Supported");
assert.ok(expenses.buildExpenseSchedule(sample).includes("Airport meals"));
assert.ok(timeline.buildTimeline(sample).includes("Final destination reached"));

const docs = documents.buildAll(sample, { records, packReference: "QF-2026-ABC123" });
assert.ok(docs.full.includes("QUAERENS CONSUMER COMPLAINT FILE"));
assert.ok(docs.full.includes("PASSENGER AND JOURNEY"));
assert.ok(docs.full.includes("Passenger count: 2"));
assert.ok(docs.full.includes("£700"));
assert.ok(docs.letter.includes("Please consider this complaint"));
assert.ok(submission.buildSubmissionInstructions(sample, records).includes("QUAERENS SMART SUBMISSION"));
assert.ok(resources.buildResources().includes("UK Civil Aviation Authority"));

assert.strictEqual(registry.get("flight").status, "migrated");
assert.strictEqual(registry.get("flight").frameworkVersion, "QCBF 1.2");

console.log("Flight QCBF 1.2 migration tests passed");
