"use strict";

const assert = require("assert");
const config = require("./cruise.config");
const questions = require("./cruise.questions");
const analysis = require("./cruise.analysis");
const documents = require("./cruise.documents");

const scenarios = [
  ["A cancelled cruise", { whatHappened: ["Cruise was cancelled"], passengerNames: "A One", bookingType: "Package holiday", cruiseLine: "Example Cruises", shipName: "Example Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"], cruisePricePaid: "1500", currency: "GBP" }],
  ["B delayed cruise", { whatHappened: ["Cruise was delayed"], passengerNames: "B One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Clear written response"] }],
  ["C refused embarkation", { whatHappened: ["Boarding or embarkation was refused"], passengerNames: "C One", bookingType: "Direct with cruise line", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Reimbursement of documented costs"] }],
  ["D itinerary changed", { whatHappened: ["Itinerary was changed before departure"], plannedItinerary: "Southampton\nLisbon\nCadiz", actualItinerary: "Southampton\nLisbon", passengerNames: "D One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Partial refund"] }],
  ["E missed port no fixed entitlement", { whatHappened: ["Port was missed or substituted"], plannedItinerary: "Rome\nNaples", actualItinerary: "Rome\nPalermo", passengerNames: "E One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Clear written response"] }],
  ["F cabin downgrade", { whatHappened: ["Cabin was downgraded"], cabinBooked: "Balcony", cabinReceived: "Inside", passengerNames: "F One", bookingType: "Direct with cruise line", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Cabin downgrade review"] }],
  ["G cabin defects", { whatHappened: ["Cabin had defects or was not as described"], cabinIssues: "Leak and broken air con", passengerNames: "G One", bookingType: "Travel agent", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Partial refund"] }],
  ["H facilities missing", { whatHappened: ["Onboard services or facilities were missing"], passengerNames: "H One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Clear written response"] }],
  ["I medical boundary", { whatHappened: ["Illness, injury or medical concern arose"], urgentNotes: "medical incident", passengerNames: "I One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Evidence pack only"] }],
  ["J excursion problem", { whatHappened: ["Shore excursion problem"], excursionBookedBy: "Cruise line", passengerNames: "J One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Reimbursement of documented costs"] }],
  ["K baggage", { whatHappened: ["Baggage or property problem"], propertyCosts: "90", passengerNames: "K One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Reimbursement of documented costs"] }],
  ["L refund refused", { whatHappened: ["Refund refused or delayed"], cruisePricePaid: "2000", refundReceived: "200", passengerNames: "L One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["M future cruise credit", { whatHappened: ["Future cruise credit dispute"], cruisePricePaid: "1800", futureCruiseCreditValue: "500", passengerNames: "M One", bookingType: "Direct with cruise line", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Review of future cruise credit"] }],
  ["N complaint rejected", { whatHappened: ["Complaint unanswered or rejected"], passengerNames: "N One", bookingType: "Travel agent", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Complaint escalation"] }],
  ["O urgent legal", { whatHappened: ["Urgent legal or court deadline"], urgentNotes: "letter before claim", passengerNames: "O One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Evidence pack only"] }],
  ["P card provider route", { whatHappened: ["Refund refused or delayed"], paymentRoute: "credit card", passengerNames: "P One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["Q mixed evidence", { whatHappened: ["Cruise was cancelled"], evidenceHeld: ["Booking confirmation", "Cruise line messages", "Receipts and replacement costs"], passengerNames: "Q One", bookingType: "Direct with cruise line", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["R multiple passengers", { whatHappened: ["Cruise was cancelled"], passengerCount: "4", passengerNames: "R One\nR Two\nR Three\nR Four", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["S package organiser", { whatHappened: ["Cruise was cancelled"], bookingType: "Package holiday", passengerNames: "S One", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["T direct cruise", { whatHappened: ["Cruise was cancelled"], bookingType: "Direct with cruise line", passengerNames: "T One", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["U finance linked", { whatHappened: ["Refund refused or delayed"], paymentRoute: "finance", passengerNames: "U One", bookingType: "Credit card or finance-linked payment", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"] }],
  ["V accessibility", { whatHappened: ["Cabin had defects or was not as described"], cabinIssues: "Accessibility cabin not provided", passengerNames: "V One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Clear written response"] }],
  ["W expenses", { whatHappened: ["Cruise was delayed"], replacementCosts: "120", otherCosts: "30", passengerNames: "W One", bookingType: "Cruise-only booking", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Reimbursement of documented costs"] }],
  ["X missing fields", { whatHappened: ["Cruise was cancelled"] }],
  ["Y no auto submission", { whatHappened: ["Complaint unanswered or rejected"], passengerNames: "Y One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Complaint escalation"] }],
  ["Z document exports", { whatHappened: ["Refund refused or delayed"], passengerNames: "Z One", bookingType: "Package holiday", cruiseLine: "Example", shipName: "Ship", departureDate: "2026-08-01", returnDate: "2026-08-08", requestedOutcomes: ["Refund"], cruisePricePaid: "1000" }]
];

assert.strictEqual(config.id, "cruise");
assert.strictEqual(config.packPrefix, "QC");
assert.strictEqual(questions.firstQuestion, "What happened with your cruise?");

scenarios.forEach(([name, data]) => {
  const result = analysis.analyse(data);
  const pack = documents.buildAll(data);
  assert.ok(result.issueType, name);
  assert.ok(pack.text.includes("QUAERENS CONSUMER COMPLAINT FILE"), name);
  assert.ok(pack.text.includes("Self-Service Disclaimer"), name);
  assert.ok(!/guaranteed compensation|guaranteed refund/i.test(pack.text), name);
  if (/missed port/i.test(name)) assert.ok(result.itinerary.caution.includes("does not automatically"), name);
  if (/urgent/i.test(name)) assert.ok(result.urgent, name);
  if (/future cruise credit/i.test(name)) assert.ok(result.financial.caution.includes("double-count"), name);
});

console.log(`Cruise migration tests passed: ${scenarios.length} fictional scenarios`);

