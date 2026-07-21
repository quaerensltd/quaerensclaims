"use strict";

const assert = require("assert");
const qcbf = require("../index");
const { StateManager } = require("../core/StateManager");
const { ValidationEngine } = require("../core/ValidationEngine");
const { evaluateCondition } = require("../core/ConditionalLogic");
const { StepController } = require("../core/StepController");
const { evidencePosition, readiness, confidence, expenseSchedule, timeline } = require("../core/Engines");
const { statusEngine } = require("../core/StatusEngine");
const { BuilderRegistry } = require("../core/BuilderRegistry");
const { overviewCard } = require("../components/CardComponents");
const { documentModel, heading, paragraph, keyValue, checklist } = require("../documents/DocumentModel");
const { complaintPack } = require("../documents/ComplaintPack");
const { exportComplaintPack } = require("../documents/ExportEngine");
const { renderText } = require("../documents/TextRenderer");
const { renderRtf } = require("../documents/RTFRenderer");
const { SubmissionDirectory } = require("../submission/SubmissionDirectory");
const { BuilderEngine } = require("../core/BuilderEngine");
const { downloadPanel } = require("../components/DownloadPanel");
const { flightCard } = require("../components/FlightCard");
const flightConfig = require("../../builders/flight/flight.config");
const holidayConfig = require("../../builders/holiday/holiday.config");
const flightFixture = require("./fixtures/flight-delayed.json");
const holidayFixture = require("./fixtures/holiday-hotel.json");
const { registry } = require("../registry");

assert.ok(qcbf.BuilderEngine, "framework index exports BuilderEngine");
assert.strictEqual(qcbf.QCBF_VERSION_LABEL, "QCBF 1.1", "framework version label");

function memoryStorage() {
  const data = {};
  return {
    getItem: (key) => data[key] || null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: (key) => { delete data[key]; }
  };
}

const store = memoryStorage();
const flightState = new StateManager(flightConfig, { storage: store, initialState: flightFixture });
const holidayState = new StateManager(holidayConfig, { storage: store, initialState: holidayFixture });

assert.notStrictEqual(flightState.storageKey, holidayState.storageKey, "storage namespaces must not collide");
assert.ok(/^QF-\d{4}-[A-Z0-9]{6}$/.test(flightState.get("meta.packReference")), "flight pack reference format");
flightState.set("passengerName", "Alex Example");
flightState.save();
assert.strictEqual(new StateManager(flightConfig, { storage: store }).restore().passengerName, "Alex Example", "draft restoration");

const validator = new ValidationEngine([
  { field: "airline", required: true },
  { field: "email", type: "email", warning: true }
]);
assert.strictEqual(validator.validate({ airline: "Example Air", email: "bad" }).valid, true, "warnings must not block progress");
assert.strictEqual(validator.validate({ email: "bad" }).valid, false, "required fields must block");

assert.strictEqual(evaluateCondition({ field: "issues", includes: "delay" }, { issues: ["delay"] }), true, "condition includes");

const steps = new StepController(flightConfig.stages);
assert.strictEqual(steps.progress(), 13, "step progress rounded");
steps.next();
assert.strictEqual(steps.current().id, "passengers", "step next");

const engine = new BuilderEngine(flightConfig, { storage: memoryStorage(), initialState: flightFixture });
assert.strictEqual(engine.next().advanced, true, "builder engine can advance valid data");

assert.strictEqual(evidencePosition(flightFixture.evidence).level, "Developing", "evidence level");
assert.strictEqual(readiness(flightConfig, flightFixture).status, "Ready to Submit", "readiness");
assert.ok(confidence([true, true]).label.includes("Moderate"), "confidence");
assert.strictEqual(expenseSchedule(flightFixture.expenses).totals.GBP, 42, "expense total");
assert.strictEqual(timeline([{ date: "2026-02-02" }, { date: "2026-01-01" }])[0].date, "2026-01-01", "timeline sort");

const model = documentModel({ title: "Quaerens Consumer Complaint File", packReference: flightState.get("meta.packReference") }, [
  heading("Complaint Summary", 1),
  paragraph("Example paragraph."),
  keyValue("Flight", [["Airline", "Example Air"]]),
  checklist("Evidence", ["Booking confirmation"])
]);
assert.ok(renderText(model).includes("COMPLAINT SUMMARY"), "text renderer headings");
assert.ok(renderRtf(model).startsWith("{\\rtf1"), "rtf renderer");

const directory = new SubmissionDirectory([{ tradingName: "Example Air", iata: "EX", lastVerified: "2026-07-20", preferredMethod: "Official form" }]);
assert.strictEqual(directory.resolve("Example").status, "matched", "directory match");
assert.strictEqual(directory.resolve("Unknown").status, "not-listed", "directory fallback");

assert.ok(downloadPanel().includes("Download Complete PDF"), "download panel labels");
assert.ok(flightCard({ flightNumber: "EX123", badges: ["Flight Found"] }).includes("EX123"), "flight card renders");

const customRegistry = new BuilderRegistry();
customRegistry.register(flightConfig, { status: "pending migration" });
customRegistry.register(holidayConfig, { status: "migrated" });
assert.strictEqual(customRegistry.get("flight").status, "pending migration", "registry records pending builders");
assert.strictEqual(registry.get("holiday").status, "migrated", "central registry records holiday migration");
assert.ok(registry.migrationStatus().some((entry) => entry.id === "flight"), "central registry exposes migration status");

const status = statusEngine(flightConfig, flightFixture, flightFixture.evidence, [true, true], { status: "matched" });
assert.ok(status.badges.includes("Ready to Submit"), "shared status engine includes readiness");
assert.ok(status.badges.includes("Developing"), "shared status engine includes evidence status");

assert.ok(overviewCard({ title: "Shared component", body: "Reusable card", action: "Open" }).includes("Shared component"), "shared card renders");

const sharedPack = complaintPack({ packPrefix: "QA" }, [heading("Shared complaint pack", 1), paragraph("Reusable document model.")]);
const exported = exportComplaintPack(sharedPack, ["txt", "rtf", "print"]);
assert.ok(exported.txt.includes("SHARED COMPLAINT PACK"), "export engine text output");
assert.ok(exported.rtf.startsWith("{\\rtf1"), "export engine rtf output");
assert.ok(exported.print.includes("qcbf-print-document"), "export engine print output");

console.log("QCBF tests passed");
