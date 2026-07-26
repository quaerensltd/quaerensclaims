"use strict";

const assert = require("assert");
const config = require("./parking.config");
const questions = require("./parking.questions");
const analysis = require("./parking.analysis");
const documents = require("./parking.documents");
const submission = require("./parking.submission");
const resources = require("./parking.resources");
const { registry } = require("../../complaint-builder/registry");

const scenario = {
  packReference: "QP-2026-TEST01",
  noticeType: "Private parking charge notice",
  currentStage: "Discount period still open",
  jurisdiction: "England",
  issuerName: "ParkingEye",
  issuerCategory: "Private parking operator",
  noticeNumber: "PE123456",
  issueMethod: "Postal notice or ANPR",
  issueDate: "2026-07-20",
  dateReceived: "2026-07-23",
  appealDeadline: "2026-08-10",
  discountDeadline: "2026-08-03",
  amount: "100",
  discountedAmount: "60",
  location: "Example Retail Park",
  eventDate: "2026-07-18",
  vehicleReg: "AB12 CDE",
  role: "Registered keeper",
  whatHappened: ["I paid but the payment was not recognised", "The signage was unclear or not visible"],
  potentialGrounds: ["Payment made or payment system issue"],
  evidence: ["Original PCN, parking charge or notice", "Payment receipt, app screenshot or bank statement", "Your own photographs of signs, bays, machines and entrance"],
  requestedOutcomes: ["Cancel the parking charge or PCN"],
  documentTypes: ["Parking appeal pack", "Private operator appeal"],
  narrative: "Payment was made but the operator appears not to have matched it to the vehicle registration.",
  timelineRows: [{ date: "18/07/2026", event: "Parking event", note: "Payment app used" }]
};

assert.strictEqual(config.id, "parking");
assert.strictEqual(config.packPrefix, "QP");
assert.strictEqual(config.frameworkVersion, "QCBF 1.2");
assert.ok(questions.noticeTypes.includes("Private parking charge notice"));
assert.ok(questions.noticeTypes.includes("County Court claim"));

const result = analysis.analyse(scenario);
assert.strictEqual(result.issuerRoute, "Private parking operator");
assert.ok(result.grounds.some(item => /Payment/.test(item)));
assert.ok(["Developing", "Supported", "Well Supported"].includes(result.evidencePosition.level));
assert.ok(result.completeness.status !== "Not Started");

const smart = submission.smartSubmission(scenario);
assert.ok(/ParkingEye|notice/i.test(smart.preferredMethod + smart.route.name));

const docs = documents.buildAll(scenario, { packReference: "QP-2026-TEST01" });
assert.ok(docs.full.includes("QUAERENS CONSUMER COMPLAINT FILE"));
assert.ok(docs.full.includes("DRAFT PARKING APPEAL"));
assert.ok(docs.full.includes("QP-2026-TEST01"));
assert.ok(!/guaranteed cancellation|beat any ticket|legal representation/i.test(docs.full));

const urgent = analysis.analyse({ noticeType: "County Court claim", currentStage: "Court claim received", jurisdiction: "England" });
assert.strictEqual(urgent.stage.urgent, true);

const registered = registry.list ? registry.list() : registry.items || [];
const parkingEntry = registered.find(item => item.id === "parking" || item.config && item.config.id === "parking");
assert.ok(parkingEntry, "Parking builder should be registered");

console.log("Parking QCBF migration tests passed");
