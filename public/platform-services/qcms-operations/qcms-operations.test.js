const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const config = require("./qcms-operations.config.js");
const model = require("./qcms-operations.model.js");
const render = require("./qcms-operations.render.js");

const filesToGuard = [
  "qcms-operations.config.js",
  "qcms-operations.fixtures.js",
  "qcms-operations.model.js",
  "qcms-operations.render.js",
  "qcms-operations.app.js",
  "qcms-operations.styles.css"
].map((file) => path.join(__dirname, file));

const forbidden = ["Listers", "Closers", "Sales Pipeline", "Campaigns", "Appointments", "firebase", "stripe"];

assert.equal(config.version, "1.3.0-alpha.1");
assert.equal(config.releaseName, "Operations Centre");
assert.ok(config.navigation.some((route) => route[1] === "Operations Centre"));
assert.ok(config.complaintRoutes.includes("Flight Delay"));
assert.ok(config.complaintRoutes.includes("Lost Luggage"));
assert.ok(config.complaintRoutes.includes("Energy Switch"));
assert.ok(config.complaintRoutes.includes("Cruise"));
assert.ok(config.complaintRoutes.includes("Broadband/Mobile"));

const cases = model.allCases();
assert.ok(cases.length >= 20);
assert.ok(cases.every((item) => Number.isInteger(item.caseAgeDays)));
assert.ok(cases.every((item) => item.waitingStatus));
assert.ok(cases.some((item) => item.caseHealth === "Excellent"));
assert.ok(cases.some((item) => item.caseHealth === "Good"));
assert.ok(cases.some((item) => item.caseHealth === "Needs Evidence"));
assert.ok(cases.some((item) => item.caseHealth === "Blocked"));

const mission = model.mission(cases);
assert.ok(mission.completeToday >= 1);
assert.ok(mission.moveForward >= 1);
assert.match(mission.workload, /\d+(h|m)/);
assert.ok(mission.summary.immediateActions >= 1);
assert.ok(mission.summary.newInstructions >= 1);

assert.ok(model.newInstructions(cases).length >= 1);
assert.ok(model.immediateActions(cases).length >= 1);
assert.ok(model.readyToCompleteToday(cases).length >= 1);
assert.ok(model.overdueCases(cases).length >= 1);
assert.ok(model.highestPriorityActionable(cases).reference);
assert.ok(model.activity(cases, 5).length <= 5);

const centre = render.dashboard();
for (const text of [
  "Operations Centre",
  "Today's Mission",
  "START WORKING",
  "New Complaint Instructions",
  "Immediate Action Required",
  "Waiting On Others",
  "Ready To Complete Today",
  "Overdue",
  "Operational Summary",
  "Operational Feed",
  "View Full Activity"
]) {
  assert.ok(centre.includes(text), `Expected Operations Centre output to include ${text}`);
}

for (const text of ["My Priority Actions", "Today I Can Complete", "Recent Activity", "Supported", "Developing", "Limited"]) {
  assert.ok(!centre.includes(text), `Old UI label should not be visible: ${text}`);
}

const register = render.casesRegister({ sort: "caseAgeDays" });
for (const text of ["Operational Readiness", "Waiting Status", "Case Age"]) {
  assert.ok(register.includes(text), `Register should include ${text}`);
}

const workspace = render.caseWorkspace(cases[0].reference, "overview");
for (const text of ["Operational Readiness", "Waiting status", "Case age", "Recommended next action"]) {
  assert.ok(workspace.includes(text), `Workspace should include ${text}`);
}

for (const fileUrl of filesToGuard) {
  const source = readFileSync(fileUrl, "utf8");
  for (const word of forbidden) {
    assert.ok(!source.includes(word), `${word} must not appear in ${fileUrl}`);
  }
}

console.log("QCMS Operations Centre Release 1.3 tests passed");
