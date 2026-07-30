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

assert.equal(config.version, "1.4.0-alpha.1");
assert.equal(config.releaseName, "Case Workspace");
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
assert.ok(cases.every((item) => Array.isArray(item.journey) && item.journey.length === 8));
assert.ok(cases.every((item) => item.summary && item.summary.problem && item.summary.objective));
assert.ok(cases.every((item) => item.todaysTask && item.todaysTask.currentTask));
assert.ok(cases.every((item) => Array.isArray(item.readiness) && item.readiness.length >= 4));
assert.ok(cases.every((item) => Array.isArray(item.evidenceChecklist) && item.evidenceChecklist.length >= 5));
assert.ok(cases.every((item) => item.expectedMilestone && item.expectedMilestone.title));

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
for (const text of ["Complaint Readiness", "Waiting Status", "Case Age"]) {
  assert.ok(register.includes(text), `Register should include ${text}`);
}
assert.ok(!register.includes("Operational Readiness"), "Register should use Release 1.4 complaint readiness language");

const workspace = render.caseWorkspace(cases[0].reference, "overview");
for (const text of [
  "Complaint Journey",
  "Complaint Summary",
  "Today's Task",
  "Start Task",
  "Complaint Readiness",
  "Authority",
  "Evidence Checklist",
  "Operational Timeline",
  "Expected Next Milestone",
  "Workspace Actions",
  "Generate Complaint",
  "Request Evidence",
  "Messages",
  "Internal Notes",
  "Activity"
]) {
  assert.ok(workspace.includes(text), `Workspace should include ${text}`);
}
assert.ok(!workspace.includes("Operational Readiness"), "Workspace should use Release 1.4 complaint readiness language");

for (const fileUrl of filesToGuard) {
  const source = readFileSync(fileUrl, "utf8");
  for (const word of forbidden) {
    assert.ok(!source.includes(word), `${word} must not appear in ${fileUrl}`);
  }
}

console.log("QCMS Operations Case Workspace Release 1.4 tests passed");
