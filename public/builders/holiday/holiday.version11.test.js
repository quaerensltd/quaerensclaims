"use strict";

const assert = require("assert");
const documents = require("./holiday.documents");

const scenario = {
  packReference: "QH-2026-ABC123",
  holidayType: "Package Holiday",
  packageSold: "Yes",
  bookingDate: "2025-09-15",
  travelStart: "2026-02-01",
  travelEnd: "2026-02-14",
  destination: "Rhodos",
  country: "Greece",
  travellers: "2",
  nights: "14",
  leadPassenger: "Jeroen Martijn Brussel",
  additionalTravellers: "One additional traveller",
  travelCompany: "Jet2 Holidays",
  accommodationName: "Mitsis Palace",
  accommodationType: "Hotel",
  bookingReference: "JET2-TEST",
  paymentMethod: "Card",
  totalPrice: "2400",
  amountPaid: "2400",
  currency: "GBP",
  advertisedStarRating: "5-star",
  roomTypeBooked: "Family room",
  boardBasis: "All inclusive",
  facilitiesAdvertised: ["Pool", "Family facilities", "All-inclusive food"],
  keyPromises: "5-star hotel, open pool, all-inclusive food and family facilities.",
  complaintTypes: ["Hotel not as described", "Dirty or unhygienic accommodation", "Pool closed", "Illness or food-hygiene concern"],
  problemDate: "2026-02-02",
  problemEnd: "2026-02-14",
  continuedWholeHoliday: "Yes",
  problemFixed: "No",
  alternativeOffered: "No",
  acceptedAlternative: "No",
  issueDetails: "Accommodation condition, closed pool and food-hygiene concerns were recorded during the stay.",
  complaintDate: "2026-02-03",
  reportedDuringHoliday: "Yes",
  complaintMethod: "Hotel representative and email",
  complaintReference: "",
  responseReceived: "No",
  remedyOffered: "",
  currentStatus: "Preparing complaint",
  timelineNotes: "Reported to reception and the representative.",
  evidence: ["Booking confirmation", "Invoice", "Receipts", "Payment records", "Medical evidence"],
  missingEvidence: "",
  outcomes: ["Refund"],
  holidayPriceClaimed: "2400",
  currencyLoss: "GBP",
  refundAlreadyReceived: "0",
  voucherReceived: "",
  losses: "Illness, loss of advertised facilities and extra taxi cost to seek medical help.",
  requestedOutcomeReason: "Accommodation and facilities did not match what was booked.",
  expenses: [{ description: "Taxi to doctor", amount: "40", receipt: "Yes", reason: "Travel to doctor" }]
};

const docs = documents.buildAll(scenario);

["cover", "summary", "letter", "evidence", "timeline", "expenses", "submit", "full", "previewHtml"].forEach(key => {
  assert.ok(docs[key], `${key} output should exist`);
});

assert.ok(docs.full.includes("QH-2026-ABC123"));
assert.ok(docs.full.includes("Holiday & Package Travel"));
assert.ok(docs.full.includes("COMPLAINT PACK COMPLETENESS"));
assert.ok(docs.full.includes("EVIDENCE POSITION"));
assert.ok(docs.full.includes("WHAT WAS PROMISED VS WHAT HAPPENED"));
assert.ok(docs.full.includes("MAIN COMPLAINT ISSUES"));
assert.ok(docs.full.includes("FINANCIAL SUMMARY"));
assert.ok(docs.full.includes("REQUESTED OUTCOME"));
assert.ok(docs.full.includes("TRAVEL COMPANY"));
assert.ok(docs.full.includes("QUAERENS SMART SUBMISSION"));
assert.ok(docs.full.includes("Before You Submit"));
assert.ok(docs.full.includes("Taxi to doctor"));
assert.ok(docs.full.includes("The travellers reported becoming unwell"));
assert.ok(docs.full.includes("This reflects the evidence recorded in the pack. It does not predict whether the complaint will succeed."));
assert.ok(!docs.full.includes("[Not provided]"));
assert.ok(!docs.full.includes("Guaranteed compensation"));
assert.ok(!docs.full.includes("Amount owed"));
assert.ok(!docs.full.includes("hotel poisoned"));
assert.ok(!/success probability|winning chance|legal strength score/i.test(docs.full));

assert.ok(docs.previewHtml.includes("preview-card"));
assert.ok(docs.previewHtml.includes("Complaint Pack Completeness"));
assert.ok(docs.previewHtml.includes("Promised"));

console.log("Holiday QCBF v1.1 document tests passed");
