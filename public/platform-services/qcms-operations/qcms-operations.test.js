const assert = require("assert");
const fs = require("fs");
const path = require("path");
const config = require("./qcms-operations.config.js");
const fixtures = require("./qcms-operations.fixtures.js");
const model = require("./qcms-operations.model.js");
const render = require("./qcms-operations.render.js");

function assertIncludes(haystack, needle, message) {
  assert.ok(String(haystack).includes(needle), message || `Expected output to include ${needle}`);
}

function run() {
  assert.strictEqual(config.version, "1.2.0-foundation");
  assert.ok(fixtures.cases.length >= 20, "At least 20 mock cases are required");
  assert.strictEqual(fixtures.managers.length, 3, "Three Complaint Managers are required");
  assert.strictEqual(config.serviceLevels.length, 3, "Three QCMS service levels are required");

  [
    "Solar",
    "Spray Foam Insulation",
    "Energy",
    "Caravan/Holiday Park",
    "Section 75",
    "Car Finance",
    "Broadband/Mobile",
    "Travel"
  ].forEach((route) => assert.ok(config.complaintRoutes.includes(route), `${route} route should exist`));

  const stats = model.workload(fixtures.cases);
  assert.ok(stats.active > 0, "Dashboard should have active cases");
  assert.ok(stats.highPriority > 0, "Dashboard should have high priority work");

  const dashboard = render.dashboard();
  [
    "Good morning, Martijn",
    "Active Cases",
    "My Priority Actions",
    "Today I Can Complete",
    "New Instructions",
    "My Cases Summary",
    "Recent Activity"
  ].forEach((text) => assertIncludes(dashboard, text));

  const casesRegister = render.casesRegister({ query: "SK5" });
  [
    "Case Reference",
    "Client",
    "Complaint Type",
    "Service Level",
    "Current Status",
    "Priority",
    "Complaint Manager",
    "Case Health",
    "Next Action",
    "Due Date",
    "Last Activity",
    "#case/QCMS-2026-0001"
  ].forEach((text) => assertIncludes(casesRegister, text));

  const solarCases = model.filterCases(fixtures.cases, { type: "Solar" });
  assert.ok(solarCases.length >= 3, "Solar filter should return mock cases");
  assert.ok(solarCases.every((item) => item.complaintType === "Solar"), "Solar filter should only return Solar cases");

  const criticalCases = model.filterCases(fixtures.cases, { priority: "Critical" });
  assert.ok(criticalCases.length >= 1, "Critical filter should return mock cases");
  assert.ok(criticalCases.every((item) => item.priority === "Critical"), "Critical filter should only return Critical cases");

  const workspace = render.caseWorkspace("QCMS-2026-0001");
  [
    "Case Workspace",
    "Case Overview",
    "Evidence Completeness",
    "Complaint Readiness",
    "Authority Status",
    "Timeline Completeness",
    "Overall Case Health",
    "Recommended next action",
    "Internal Notes",
    "Activity"
  ].forEach((text) => assertIncludes(workspace, text));

  const placeholder = render.placeholder("documents");
  assertIncludes(placeholder, "Foundation Module");
  assertIncludes(placeholder, "No production data or external services are connected");

  const note = model.createActivity(fixtures.cases[0], "Internal note added", "Mock note");
  assert.strictEqual(note.action, "Internal note added");
  assertIncludes(note.detail, "Mock note");

  const files = [
    "qcms-operations.config.js",
    "qcms-operations.fixtures.js",
    "qcms-operations.model.js",
    "qcms-operations.render.js",
    "qcms-operations.app.js",
    "qcms-operations.styles.css"
  ].map((file) => fs.readFileSync(path.join(__dirname, file), "utf8")).join("\n");

  [
    "Listers",
    "Closers",
    "Sales Pipeline",
    "Campaigns",
    "Appointments",
    "firebase",
    "stripe"
  ].forEach((forbidden) => {
    assert.ok(!files.includes(forbidden), `QCMS Operations foundation should not include ${forbidden}`);
  });

  console.log("QCMS Operations foundation tests passed.");
}

run();
