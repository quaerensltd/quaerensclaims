const assert = require("node:assert/strict");
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_local_test_placeholder";
const { recordFrameworkAMetric, frameworkAAdminReadMetrics } = require("../functions/index.js");
const rejectsCode = (action, code) => assert.rejects(action, error => error && error.code === code);
(async () => {
  await rejectsCode(() => recordFrameworkAMetric.run({ auth: null, rawRequest: { headers: {} }, data: { builder: "unknown", event: "pack_started", frameworkVersion: "1.4", deviceClass: "desktop" } }), "invalid-argument");
  await rejectsCode(() => recordFrameworkAMetric.run({ auth: null, rawRequest: { headers: {} }, data: { builder: "airbnb", event: "unknown", frameworkVersion: "1.4", deviceClass: "desktop" } }), "invalid-argument");
  await rejectsCode(() => recordFrameworkAMetric.run({ auth: null, rawRequest: { headers: {} }, data: { builder: "airbnb", event: "pack_started", frameworkVersion: "1.4", deviceClass: "desktop", count: 100 } }), "invalid-argument");
  await rejectsCode(() => recordFrameworkAMetric.run({ auth: null, rawRequest: { headers: { "content-length": "3000" } }, data: { builder: "airbnb", event: "pack_started", frameworkVersion: "1.4", deviceClass: "desktop" } }), "invalid-argument");
  await rejectsCode(() => frameworkAAdminReadMetrics.run({ auth: null, data: { from: "2026-08-01", to: "2026-08-05" } }), "permission-denied");
  await rejectsCode(() => frameworkAAdminReadMetrics.run({ auth: { uid: "manager", token: {} }, data: { from: "2026-08-01", to: "2026-08-05" } }), "permission-denied");
  await rejectsCode(() => frameworkAAdminReadMetrics.run({ auth: { uid: "admin", token: { platformAdmin: true } }, data: { from: "bad", to: "2026-08-05" } }), "invalid-argument");
  console.log("Framework A metrics callable rejection and authorization tests passed without writing QA totals.");
})().catch(error => { console.error(error); process.exitCode = 1; });
