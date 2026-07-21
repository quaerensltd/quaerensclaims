"use strict";

const assert = require("assert");
const config = require("./holiday.config");
const questions = require("./holiday.questions");
const documents = require("./holiday.documents");

const sample = {
  holidayType: "Package holiday",
  packageSold: "Yes",
  travelCompany: "Example Travel",
  travelAgent: "Example Agent",
  accommodationProvider: "Example Hotel",
  bookingReference: "ABC123",
  leadPassenger: "Example Passenger",
  additionalTravellers: "One additional traveller",
  travelStart: "2026-07-01",
  travelEnd: "2026-07-08",
  nights: "7",
  destination: "Palma",
  country: "Spain",
  travellers: "2",
  paymentMethod: "Credit card",
  totalPrice: "2500",
  amountPaid: "2500",
  currency: "GBP",
  accommodationName: "Example Resort",
  accommodationType: "Hotel",
  advertisedStarRating: "4",
  roomTypeBooked: "Sea view",
  boardBasis: "All inclusive",
  facilitiesAdvertised: ["Pool", "Air conditioning"],
  promiseSource: ["Website", "Brochure"],
  keyPromises: "Quiet family hotel with working pool.",
  complaintTypes: ["Accommodation not as described"],
  problemDate: "2026-07-02",
  problemEnd: "2026-07-08",
  continuedWholeHoliday: "Yes",
  problemFixed: "No",
  alternativeOffered: "No",
  acceptedAlternative: "No",
  issueDetails: "Pool was closed and room was not as booked.",
  complaintDate: "2026-07-09",
  reportedDuringHoliday: "Yes",
  complaintMethod: "Email",
  complaintReference: "REF456",
  responseReceived: "No",
  remedyOffered: "",
  remedyAccepted: "",
  currentStatus: "Awaiting response",
  timelineNotes: "Reported to reception twice.",
  evidence: ["Photos", "Booking confirmation"],
  missingEvidence: "No missing evidence known.",
  outcomes: ["Refund", "Reimbursement"],
  holidayPriceClaimed: "2500",
  currencyLoss: "GBP",
  refundAlreadyReceived: "0",
  voucherReceived: "No",
  losses: "Extra taxi and replacement meals.",
  requestedOutcomeReason: "The holiday was not as advertised.",
  expenses: [{ description: "Taxi", amount: "40", receipt: "Yes", reason: "Transport to replacement activity" }]
};

assert.strictEqual(config.storageKey, "quaerensHolidayComplaintPackV1");
assert.ok(questions.multiValueFields.includes("complaintTypes"));

const docs = documents.buildAll(sample);
assert.ok(docs.full.includes("Holiday & Package Travel Complaint Pack"));
assert.ok(docs.full.includes("INITIAL HOLIDAY AND PACKAGE TRAVEL COMPLAINT"));
assert.ok(docs.full.includes("HOLIDAY EVIDENCE CHECKLIST"));
assert.ok(docs.full.includes("QUAERENS SMART SUBMISSION"));
assert.ok(docs.full.includes("Example Travel"));
assert.ok(docs.full.includes("Taxi"));

console.log("Holiday QCBF migration tests passed");
